using Microsoft.AspNetCore.Mvc;
using TransactionService.Models;
using TransactionService.Services;

namespace TransactionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransaccionesController : ControllerBase
{
    private readonly ITransaccionService _service;

    public TransaccionesController(ITransaccionService service)
    {
        _service = service;
    }

    // GET api/transacciones?productoId=&tipoTransaccion=&fechaDesde=&fechaHasta=&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<TransaccionResponseDto>>>> Get(
        [FromQuery] int? productoId,
        [FromQuery] string? tipoTransaccion,
        [FromQuery] DateTime? fechaDesde,
        [FromQuery] DateTime? fechaHasta,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var resultado = await _service.ObtenerPaginadoAsync(productoId, tipoTransaccion, fechaDesde, fechaHasta, page, pageSize);
        return Ok(ApiResponse<PagedResult<TransaccionResponseDto>>.Ok(resultado));
    }

    // GET api/transacciones/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<TransaccionResponseDto>>> GetById(int id)
    {
        var transaccion = await _service.ObtenerPorIdAsync(id);
        if (transaccion is null)
            return NotFound(ApiResponse<TransaccionResponseDto>.Fail("Transacción no encontrada"));

        return Ok(ApiResponse<TransaccionResponseDto>.Ok(transaccion));
    }

    // POST api/transacciones
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransaccionResponseDto>>> Create([FromBody] TransaccionCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<TransaccionResponseDto>.Fail("Datos inválidos en el formulario"));

        var (ok, mensaje, data) = await _service.CrearAsync(dto);
        if (!ok)
            return BadRequest(ApiResponse<TransaccionResponseDto>.Fail(mensaje));

        return CreatedAtAction(nameof(GetById), new { id = data!.Id },
            ApiResponse<TransaccionResponseDto>.Ok(data, mensaje));
    }

    // PUT api/transacciones/5  (solo permite editar el detalle/observación)
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<TransaccionResponseDto>>> Update(int id, [FromBody] TransaccionUpdateDto dto)
    {
        var actualizado = await _service.ActualizarDetalleAsync(id, dto);
        if (actualizado is null)
            return NotFound(ApiResponse<TransaccionResponseDto>.Fail("Transacción no encontrada"));

        return Ok(ApiResponse<TransaccionResponseDto>.Ok(actualizado, "Transacción actualizada exitosamente"));
    }

    // DELETE api/transacciones/5
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var eliminado = await _service.EliminarAsync(id);
        if (!eliminado)
            return NotFound(ApiResponse<object>.Fail("Transacción no encontrada"));

        return Ok(ApiResponse<object>.Ok(new { }, "Transacción eliminada exitosamente"));
    }
}
