using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Services;

public interface IProductoService
{
    Task<PagedResult<ProductoResponseDto>> ObtenerPaginadoAsync(
        string? nombre, string? categoria, decimal? precioMin, decimal? precioMax,
        int? stockMin, int page, int pageSize);
    Task<ProductoResponseDto?> ObtenerPorIdAsync(int id);
    Task<ProductoResponseDto> CrearAsync(ProductoCreateDto dto);
    Task<ProductoResponseDto?> ActualizarAsync(int id, ProductoUpdateDto dto);
    Task<bool> EliminarAsync(int id);
    Task<(bool ok, string mensaje, int stockActual)> AjustarStockAsync(int id, AjusteStockDto dto);
}

public class ProductoService : IProductoService
{
    private readonly ProductDbContext _context;

    public ProductoService(ProductDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductoResponseDto>> ObtenerPaginadoAsync(
        string? nombre, string? categoria, decimal? precioMin, decimal? precioMax,
        int? stockMin, int page, int pageSize)
    {
        var query = _context.Productos.Where(p => p.Activo).AsQueryable();

        // Filtros dinámicos: cada uno se aplica solo si viene informado
        if (!string.IsNullOrWhiteSpace(nombre))
            query = query.Where(p => p.Nombre.Contains(nombre));

        if (!string.IsNullOrWhiteSpace(categoria))
            query = query.Where(p => p.Categoria == categoria);

        if (precioMin.HasValue)
            query = query.Where(p => p.Precio >= precioMin.Value);

        if (precioMax.HasValue)
            query = query.Where(p => p.Precio <= precioMax.Value);

        if (stockMin.HasValue)
            query = query.Where(p => p.Stock >= stockMin.Value);

        var totalItems = await query.CountAsync();

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var items = await query
            .OrderByDescending(p => p.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return new PagedResult<ProductoResponseDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductoResponseDto?> ObtenerPorIdAsync(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        return producto is null || !producto.Activo ? null : MapToDto(producto);
    }

    public async Task<ProductoResponseDto> CrearAsync(ProductoCreateDto dto)
    {
        var producto = new Producto
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Categoria = dto.Categoria,
            ImagenUrl = dto.ImagenUrl,
            Precio = dto.Precio,
            Stock = dto.Stock,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();
        return MapToDto(producto);
    }

    public async Task<ProductoResponseDto?> ActualizarAsync(int id, ProductoUpdateDto dto)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto is null || !producto.Activo) return null;

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Categoria = dto.Categoria;
        producto.ImagenUrl = dto.ImagenUrl;
        producto.Precio = dto.Precio;
        producto.Stock = dto.Stock;

        await _context.SaveChangesAsync();
        return MapToDto(producto);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto is null || !producto.Activo) return false;

        // Eliminación lógica para preservar integridad del historial de transacciones
        producto.Activo = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<(bool ok, string mensaje, int stockActual)> AjustarStockAsync(int id, AjusteStockDto dto)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto is null || !producto.Activo)
            return (false, "Producto no encontrado", 0);

        if (dto.TipoTransaccion == "Venta")
        {
            if (producto.Stock < dto.Cantidad)
                return (false, $"Stock insuficiente. Disponible: {producto.Stock}", producto.Stock);

            producto.Stock -= dto.Cantidad;
        }
        else if (dto.TipoTransaccion == "Compra")
        {
            producto.Stock += dto.Cantidad;
        }
        else
        {
            return (false, "Tipo de transacción inválido", producto.Stock);
        }

        await _context.SaveChangesAsync();
        return (true, "Stock actualizado correctamente", producto.Stock);
    }

    private static ProductoResponseDto MapToDto(Producto p) => new()
    {
        Id = p.Id,
        Nombre = p.Nombre,
        Descripcion = p.Descripcion,
        Categoria = p.Categoria,
        ImagenUrl = p.ImagenUrl,
        Precio = p.Precio,
        Stock = p.Stock,
        FechaCreacion = p.FechaCreacion,
        Activo = p.Activo
    };
}
