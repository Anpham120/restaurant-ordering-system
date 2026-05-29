namespace Restaurant.Domain.Entities;

public class AiChatLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? Sources { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User? User { get; set; }
}
