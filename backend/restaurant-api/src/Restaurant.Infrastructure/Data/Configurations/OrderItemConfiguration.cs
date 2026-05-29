using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items", t => { t.HasCheckConstraint("ck_order_items_quantity", "quantity > 0"); t.HasCheckConstraint("ck_order_items_unit_price", "unit_price >= 0"); });
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.MenuItemName).HasMaxLength(255).IsRequired();
        builder.Property(oi => oi.UnitPrice).HasPrecision(18, 2).IsRequired();
        builder.Property(oi => oi.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(oi => oi.OrderId);
        builder.HasIndex(oi => oi.MenuItemId);
        builder.HasIndex(oi => oi.Status);
        builder.HasIndex(oi => oi.CreatedAt);
        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(oi => oi.MenuItem)
            .WithMany(mi => mi.OrderItems)
            .HasForeignKey(oi => oi.MenuItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
