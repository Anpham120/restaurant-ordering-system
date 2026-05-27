namespace Restaurant.Domain.Entities;

public sealed class MenuItem
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Tags { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public MenuCategory Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
