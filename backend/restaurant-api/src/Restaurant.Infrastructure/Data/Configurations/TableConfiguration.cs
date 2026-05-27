using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.ToTable("tables", t => t.HasCheckConstraint("ck_tables_capacity", "capacity > 0"));
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TableNumber).HasMaxLength(50).IsRequired();
        builder.Property(t => t.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(t => new { t.AreaId, t.TableNumber }).IsUnique();
        builder.HasIndex(t => t.AreaId);
        builder.HasIndex(t => t.Status);
        builder.HasOne(t => t.Area)
            .WithMany(a => a.Tables)
            .HasForeignKey(t => t.AreaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
