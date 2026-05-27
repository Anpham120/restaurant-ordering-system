using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data.Configurations;

public class AiChatLogConfiguration : IEntityTypeConfiguration<AiChatLog>
{
    public void Configure(EntityTypeBuilder<AiChatLog> builder)
    {
        builder.ToTable("ai_chat_logs");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.SessionId).HasMaxLength(255);
        builder.HasIndex(l => l.UserId);
        builder.HasIndex(l => l.SessionId);
        builder.HasIndex(l => l.CreatedAt);
        builder.HasOne(l => l.User)
            .WithMany(u => u.AiChatLogs)
            .HasForeignKey(l => l.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
