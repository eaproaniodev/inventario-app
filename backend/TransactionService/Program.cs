using Microsoft.EntityFrameworkCore;
using TransactionService.Clients;
using TransactionService.Data;
using TransactionService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Transaction Service API",
        Version = "v1",
        Description = "Microservicio de Gestión de Transacciones de Inventario"
    });
});

// EF Core - SQL Server
builder.Services.AddDbContext<TransactionDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpClient tipado hacia ProductService (comunicación síncrona entre microservicios)
builder.Services.AddHttpClient<IProductServiceClient, ProductServiceClient>(client =>
{
    var baseUrl = builder.Configuration["Services:ProductServiceUrl"] ?? "http://localhost:5001/";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddScoped<ITransaccionService, TransaccionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
