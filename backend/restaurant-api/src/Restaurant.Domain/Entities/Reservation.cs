namespace Restaurant.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; }
    public string ReservationCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public DateTimeOffset ReservationTime { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedTableId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Table? AssignedTable { get; set; }
    public TableSession? TableSession { get; set; }
}
