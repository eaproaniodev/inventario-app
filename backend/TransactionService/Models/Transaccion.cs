namespace TransactionService.Models;

public enum TipoTransaccion
{
    Compra,
    Venta
}

public class Transaccion
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public string TipoTransaccion { get; set; } = string.Empty; // "Compra" | "Venta"
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal PrecioTotal { get; set; }
    public string? Detalle { get; set; }
}
