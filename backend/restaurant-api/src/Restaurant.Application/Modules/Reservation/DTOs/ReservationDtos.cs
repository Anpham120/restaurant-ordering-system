namespace Restaurant.Application.Modules.Reservation.DTOs;

// ── Response DTOs ──────────────────────────────────────────────────────────────

public record ReservationDto(
    Guid Id,
    string ReservationCode,
    string CustomerName,
    string Phone,
    int GuestCount,
    DateTimeOffset ReservationTime,
    string? Note,
    string Status,
    Guid? AssignedTableId);

public record TableSessionDto(
    Guid Id,
    Guid TableId,
    Guid? ReservationId,
    string SessionToken,
    string Status,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt);

// ── Request DTOs ───────────────────────────────────────────────────────────────

public record CreateReservationRequest(
    string CustomerName,
    string Phone,
    int GuestCount,
    DateTimeOffset ReservationTime,
    string? Note);

public record ConfirmReservationRequest(
    Guid? AssignedTableId);

public record CreateTableSessionRequest(
    Guid TableId);
