using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Action).HasMaxLength(255).IsRequired();
        builder.Property(l => l.EntityName).HasMaxLength(255).IsRequired();
        builder.HasIndex(l => l.UserId);
        builder.HasIndex(l => new { l.EntityName, l.EntityId });
        builder.HasIndex(l => l.CreatedAt);
        builder.HasOne(l => l.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(l => l.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
