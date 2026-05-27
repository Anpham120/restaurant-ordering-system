namespace Restaurant.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<TableSession> CreatedSessions { get; set; } = [];
    public ICollection<Invoice> ProcessedInvoices { get; set; } = [];
    public ICollection<AiChatLog> AiChatLogs { get; set; } = [];
    public ICollection<AuditLog> AuditLogs { get; set; } = [];
}
