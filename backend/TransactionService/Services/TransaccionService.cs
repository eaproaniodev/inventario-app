using Microsoft.EntityFrameworkCore;
using TransactionService.Clients;
using TransactionService.Data;
using TransactionService.Models;

namespace TransactionService.Services;

public interface ITransaccionService
{
    Task<PagedResult<TransaccionResponseDto>> ObtenerPaginadoAsync(
        int? productoId, string? tipoTransaccion, DateTime? fechaDesde, DateTime? fechaHasta,
        int page, int pageSize);
    Task<TransaccionResponseDto?> ObtenerPorIdAsync(int id);
    Task<(bool ok, string mensaje, TransaccionResponseDto? data)> CrearAsync(TransaccionCreateDto dto);
    Task<TransaccionResponseDto?> ActualizarDetalleAsync(int id, TransaccionUpdateDto dto);
    Task<bool> EliminarAsync(int id);
}

public class TransaccionService : ITransaccionService
{
    private readonly TransactionDbContext _context;
    private readonly IProductServiceClient _productClient;
    private readonly ILogger<TransaccionService> _logger;

    public TransaccionService(TransactionDbContext context, IProductServiceClient productClient, ILogger<TransaccionService> logger)
    {
        _context = context;
        _productClient = productClient;
        _logger = logger;
    }

    public async Task<PagedResult<TransaccionResponseDto>> ObtenerPaginadoAsync(
        int? productoId, string? tipoTransaccion, DateTime? fechaDesde, DateTime? fechaHasta,
        int page, int pageSize)
    {
        var query = _context.Transacciones.AsQueryable();

        // Se establecen los filtros dinámicos
        if (productoId.HasValue)
            query = query.Where(t => t.ProductoId == productoId.Value);

        if (!string.IsNullOrWhiteSpace(tipoTransaccion))
            query = query.Where(t => t.TipoTransaccion == tipoTransaccion);

        if (fechaDesde.HasValue)
            query = query.Where(t => t.Fecha >= fechaDesde.Value);

        if (fechaHasta.HasValue)
            query = query.Where(t => t.Fecha <= fechaHasta.Value);

        var totalItems = await query.CountAsync();

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var transacciones = await query
            .OrderByDescending(t => t.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Enriquecer con nombre/stock del producto (llamada síncrona a ProductService)
        var items = new List<TransaccionResponseDto>();
        foreach (var t in transacciones)
        {
            items.Add(await MapToDtoAsync(t));
        }

        return new PagedResult<TransaccionResponseDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TransaccionResponseDto?> ObtenerPorIdAsync(int id)
    {
        var transaccion = await _context.Transacciones.FindAsync(id);
        return transaccion is null ? null : await MapToDtoAsync(transaccion);
    }

    public async Task<(bool ok, string mensaje, TransaccionResponseDto? data)> CrearAsync(TransaccionCreateDto dto)
    {
        // 1. Se verifica que el producto exista
        var producto = await _productClient.ObtenerProductoAsync(dto.ProductoId);
        if (producto is null)
            return (false, "El producto indicado no existe", null);

        // 2. Si el tipo de transacción es venta, validar stock disponible antes de persistir la transacción
        if (dto.TipoTransaccion == "Venta" && producto.Stock < dto.Cantidad)
            return (false, $"Stock insuficiente. Disponible: {producto.Stock}, solicitado: {dto.Cantidad}", null);

        // 3. Se ajusta el stock en ProductService
        var (ok, mensaje, _) = await _productClient.AjustarStockAsync(dto.ProductoId, dto.TipoTransaccion, dto.Cantidad);
        if (!ok)
            return (false, mensaje, null);

        // 4. Se persiste la transacción
        var transaccion = new Transaccion
        {
            Fecha = DateTime.UtcNow,
            TipoTransaccion = dto.TipoTransaccion,
            ProductoId = dto.ProductoId,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            PrecioTotal = Math.Round(dto.PrecioUnitario * dto.Cantidad, 2),
            Detalle = dto.Detalle
        };

        _context.Transacciones.Add(transaccion);
        await _context.SaveChangesAsync();

        var response = await MapToDtoAsync(transaccion);
        return (true, "Transacción registrada exitosamente", response);
    }

    public async Task<TransaccionResponseDto?> ActualizarDetalleAsync(int id, TransaccionUpdateDto dto)
    {
        // Solo se permite editar el detalle/observación: cantidad, tipo y producto
        // son inmutables porque ya afectaron el stock y se vitan inconsistencias.
        var transaccion = await _context.Transacciones.FindAsync(id);
        if (transaccion is null) return null;

        transaccion.Detalle = dto.Detalle;
        await _context.SaveChangesAsync();

        return await MapToDtoAsync(transaccion);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var transaccion = await _context.Transacciones.FindAsync(id);
        if (transaccion is null) return false;

        // Se revierte el efecto de la transacción sobre el stock antes de eliminarla
        var tipoReverso = transaccion.TipoTransaccion == "Venta" ? "Compra" : "Venta";
        await _productClient.AjustarStockAsync(transaccion.ProductoId, tipoReverso, transaccion.Cantidad);

        _context.Transacciones.Remove(transaccion);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<TransaccionResponseDto> MapToDtoAsync(Transaccion t)
    {
        var producto = await _productClient.ObtenerProductoAsync(t.ProductoId);

        return new TransaccionResponseDto
        {
            Id = t.Id,
            Fecha = t.Fecha,
            TipoTransaccion = t.TipoTransaccion,
            ProductoId = t.ProductoId,
            ProductoNombre = producto?.Nombre ?? "(producto no disponible)",
            ProductoStockActual = producto?.Stock,
            Cantidad = t.Cantidad,
            PrecioUnitario = t.PrecioUnitario,
            PrecioTotal = t.PrecioTotal,
            Detalle = t.Detalle
        };
    }
}
