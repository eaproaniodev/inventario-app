using Microsoft.AspNetCore.Mvc;
using ProductService.Models;
using ProductService.Services;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _service;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(IProductoService service, ILogger<ProductosController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // GET api/productos?nombre=&categoria=&precioMin=&precioMax=&stockMin=&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductoResponseDto>>>> Get(
        [FromQuery] string? nombre,
        [FromQuery] string? categoria,
        [FromQuery] decimal? precioMin,
        [FromQuery] decimal? precioMax,
        [FromQuery] int? stockMin,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var resultado = await _service.ObtenerPaginadoAsync(nombre, categoria, precioMin, precioMax, stockMin, page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductoResponseDto>>.Ok(resultado));
    }

    // GET api/productos/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductoResponseDto>>> GetById(int id)
    {
        var producto = await _service.ObtenerPorIdAsync(id);
        if (producto is null)
            return NotFound(ApiResponse<ProductoResponseDto>.Fail("Producto no encontrado"));

        return Ok(ApiResponse<ProductoResponseDto>.Ok(producto));
    }

    // POST api/productos
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductoResponseDto>>> Create([FromBody] ProductoCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<ProductoResponseDto>.Fail("Datos inválidos en el formulario"));

        var creado = await _service.CrearAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = creado.Id },
            ApiResponse<ProductoResponseDto>.Ok(creado, "Producto creado exitosamente"));
    }

    // PUT api/productos/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductoResponseDto>>> Update(int id, [FromBody] ProductoUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<ProductoResponseDto>.Fail("Datos inválidos en el formulario"));

        var actualizado = await _service.ActualizarAsync(id, dto);
        if (actualizado is null)
            return NotFound(ApiResponse<ProductoResponseDto>.Fail("Producto no encontrado"));

        return Ok(ApiResponse<ProductoResponseDto>.Ok(actualizado, "Producto actualizado exitosamente"));
    }

    // DELETE api/productos/5
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var eliminado = await _service.EliminarAsync(id);
        if (!eliminado)
            return NotFound(ApiResponse<object>.Fail("Producto no encontrado"));

        return Ok(ApiResponse<object>.Ok(new { }, "Producto eliminado exitosamente"));
    }

    // PATCH api/productos/5/stock  -> usado internamente por TransactionService
    [HttpPatch("{id:int}/stock")]
    public async Task<ActionResult<ApiResponse<object>>> AjustarStock(int id, [FromBody] AjusteStockDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<object>.Fail("Datos inválidos"));

        var (ok, mensaje, stockActual) = await _service.AjustarStockAsync(id, dto);
        if (!ok)
            return BadRequest(ApiResponse<object>.Fail(mensaje));

        return Ok(ApiResponse<object>.Ok(new { stockActual }, mensaje));
    }
}
