using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderCode).HasMaxLength(50).IsRequired();
        builder.Property(o => o.IdempotencyKey).HasMaxLength(255).IsRequired();
        builder.Property(o => o.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(o => o.OrderCode).IsUnique();
        builder.HasIndex(o => new { o.TableSessionId, o.IdempotencyKey }).IsUnique();
        builder.HasIndex(o => o.TableSessionId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);
        builder.HasOne(o => o.TableSession)
            .WithMany(ts => ts.Orders)
            .HasForeignKey(o => o.TableSessionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
