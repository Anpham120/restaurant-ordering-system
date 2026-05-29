namespace Restaurant.Domain.Entities;

public class Table
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Area Area { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = [];
    public ICollection<TableSession> TableSessions { get; set; } = [];
}
