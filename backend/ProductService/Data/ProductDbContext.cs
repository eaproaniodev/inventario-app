using Microsoft.EntityFrameworkCore;
using ProductService.Models;

namespace ProductService.Data;

public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("Productos");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(p => p.Descripcion).HasMaxLength(500);
            entity.Property(p => p.Categoria).IsRequired().HasMaxLength(100);
            entity.Property(p => p.ImagenUrl).HasMaxLength(500);
            entity.Property(p => p.Precio).HasColumnType("decimal(18,2)");
        });
    }
}
