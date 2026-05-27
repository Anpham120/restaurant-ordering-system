using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class TableSessionConfiguration : IEntityTypeConfiguration<TableSession>
{
    public void Configure(EntityTypeBuilder<TableSession> builder)
    {
        builder.ToTable("table_sessions");
        builder.HasKey(ts => ts.Id);
        builder.Property(ts => ts.SessionToken).HasMaxLength(255).IsRequired();
        builder.Property(ts => ts.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(ts => ts.SessionToken).IsUnique();
        builder.HasIndex(ts => ts.TableId).HasDatabaseName("ix_table_sessions_table_id");
        builder.HasIndex(ts => ts.ReservationId);
        builder.HasIndex(ts => ts.Status);
        builder.HasIndex(ts => ts.CreatedBy);
        builder.HasIndex(ts => ts.TableId)
            .IsUnique()
            .HasFilter("status = 'Active'")
            .HasDatabaseName("uq_table_sessions_active_table_id");
        builder.HasOne(ts => ts.Table)
            .WithMany(t => t.TableSessions)
            .HasForeignKey(ts => ts.TableId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(ts => ts.Reservation)
            .WithOne(r => r.TableSession)
            .HasForeignKey<TableSession>(ts => ts.ReservationId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(ts => ts.CreatedByUser)
            .WithMany(u => u.CreatedSessions)
            .HasForeignKey(ts => ts.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
