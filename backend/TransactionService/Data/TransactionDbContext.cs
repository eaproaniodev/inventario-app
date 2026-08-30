using Microsoft.EntityFrameworkCore;
using TransactionService.Models;

namespace TransactionService.Data;

public class TransactionDbContext : DbContext
{
    public TransactionDbContext(DbContextOptions<TransactionDbContext> options) : base(options) { }

    public DbSet<Transaccion> Transacciones => Set<Transaccion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaccion>(entity =>
        {
            entity.ToTable("Transacciones");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.TipoTransaccion).IsRequired().HasMaxLength(20);
            entity.Property(t => t.PrecioUnitario).HasColumnType("decimal(18,2)");
            entity.Property(t => t.PrecioTotal).HasColumnType("decimal(18,2)");
            entity.Property(t => t.Detalle).HasMaxLength(500);
        });
    }
}
