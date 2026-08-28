using System.Net.Http.Json;
using TransactionService.Models;

namespace TransactionService.Clients;

public interface IProductServiceClient
{
    Task<ProductoDto?> ObtenerProductoAsync(int productoId);
    Task<(bool ok, string mensaje, int stockActual)> AjustarStockAsync(int productoId, string tipoTransaccion, int cantidad);
}

/// <summary>
/// Cliente REST que consume la API de ProductService (comunicación síncrona
/// entre microservicios vía HttpClient, tal como lo requiere el proyecto).
/// </summary>
public class ProductServiceClient : IProductServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ProductServiceClient> _logger;

    public ProductServiceClient(HttpClient httpClient, ILogger<ProductServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<ProductoDto?> ObtenerProductoAsync(int productoId)
    {
        var response = await _httpClient.GetAsync($"api/productos/{productoId}");
        if (!response.IsSuccessStatusCode) return null;

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<ProductoDto>>();
        return apiResponse?.Data;
    }

    public async Task<(bool ok, string mensaje, int stockActual)> AjustarStockAsync(
        int productoId, string tipoTransaccion, int cantidad)
    {
        var payload = new AjusteStockRequestDto { TipoTransaccion = tipoTransaccion, Cantidad = cantidad };
        var response = await _httpClient.PatchAsJsonAsync($"api/productos/{productoId}/stock", payload);

        var content = await response.Content.ReadFromJsonAsync<ApiResponse<Dictionary<string, int>>>();

        if (!response.IsSuccessStatusCode)
            return (false, content?.Message ?? "Error al ajustar el stock del producto", 0);

        var stockActual = content?.Data != null && content.Data.TryGetValue("stockActual", out var s) ? s : 0;
        return (true, content?.Message ?? "Stock actualizado", stockActual);
    }
}
