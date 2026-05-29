namespace Restaurant.Domain.Entities;

public class TableSession
{
    public Guid Id { get; set; }
    public Guid TableId { get; set; }
    public Guid? ReservationId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset OpenedAt { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }
    public Guid CreatedBy { get; set; }

    public Table Table { get; set; } = null!;
    public Reservation? Reservation { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = [];
    public Invoice? Invoice { get; set; }
}
