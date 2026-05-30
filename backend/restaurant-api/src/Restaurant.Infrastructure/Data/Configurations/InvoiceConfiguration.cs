using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices", t => { t.HasCheckConstraint("ck_invoices_subtotal", "subtotal >= 0"); t.HasCheckConstraint("ck_invoices_discount", "discount >= 0"); t.HasCheckConstraint("ck_invoices_total_amount", "total_amount >= 0"); });
        builder.HasKey(i => i.Id);
        builder.Property(i => i.InvoiceCode).HasMaxLength(50).IsRequired();
        builder.Property(i => i.PaymentMethod).HasMaxLength(50).IsRequired();
        builder.Property(i => i.PaymentStatus).HasMaxLength(50).IsRequired();
        builder.Property(i => i.Subtotal).HasPrecision(18, 2).IsRequired();
        builder.Property(i => i.Discount).HasPrecision(18, 2).IsRequired();
        builder.Property(i => i.TotalAmount).HasPrecision(18, 2).IsRequired();
        builder.HasIndex(i => i.InvoiceCode).IsUnique();
        builder.HasIndex(i => i.TableSessionId).IsUnique();
        builder.HasIndex(i => i.PaymentStatus);
        builder.HasIndex(i => i.PaidAt);
        builder.HasIndex(i => i.CashierId);
        builder.HasOne(i => i.TableSession)
            .WithOne(ts => ts.Invoice)
            .HasForeignKey<Invoice>(i => i.TableSessionId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(i => i.Cashier)
            .WithMany(u => u.ProcessedInvoices)
            .HasForeignKey(i => i.CashierId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
