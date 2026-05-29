namespace Restaurant.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid TableSessionId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public TableSession TableSession { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
