using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("reservations", t => t.HasCheckConstraint("ck_reservations_guest_count", "guest_count > 0"));
        builder.HasKey(r => r.Id);
        builder.Property(r => r.ReservationCode).HasMaxLength(50).IsRequired();
        builder.Property(r => r.CustomerName).HasMaxLength(255).IsRequired();
        builder.Property(r => r.Phone).HasMaxLength(20).IsRequired();
        builder.Property(r => r.Status).HasMaxLength(50).IsRequired();
        builder.HasIndex(r => r.ReservationCode).IsUnique();
        builder.HasIndex(r => r.Phone);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.ReservationTime);
        builder.HasIndex(r => r.AssignedTableId);
        builder.HasOne(r => r.AssignedTable)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.AssignedTableId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
