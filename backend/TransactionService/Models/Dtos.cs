using System.ComponentModel.DataAnnotations;

namespace TransactionService.Models;

public class TransaccionCreateDto
{
    [Required(ErrorMessage = "El tipo de transacción es obligatorio")]
    [RegularExpression("^(Compra|Venta)$", ErrorMessage = "El tipo debe ser Compra o Venta")]
    public string TipoTransaccion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El producto es obligatorio")]
    public int ProductoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
    public int Cantidad { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0")]
    public decimal PrecioUnitario { get; set; }

    [StringLength(500)]
    public string? Detalle { get; set; }
}

public class TransaccionUpdateDto
{
    [StringLength(500)]
    public string? Detalle { get; set; }
}

public class TransaccionResponseDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string TipoTransaccion { get; set; } = string.Empty;
    public int ProductoId { get; set; }
    public string? ProductoNombre { get; set; }
    public int? ProductoStockActual { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal PrecioTotal { get; set; }
    public string? Detalle { get; set; }
}

// Espejo del DTO expuesto por ProductService (respuesta HTTP)
public class ProductoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string? ImagenUrl { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; set; }
}

public class AjusteStockRequestDto
{
    public string TipoTransaccion { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalItems / (double)PageSize);
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operación exitosa")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message)
        => new() { Success = false, Message = message, Data = default };
}
