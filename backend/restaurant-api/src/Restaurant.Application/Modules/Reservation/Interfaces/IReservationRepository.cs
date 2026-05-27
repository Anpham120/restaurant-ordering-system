using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Reservation.Interfaces;

/// <summary>
/// Interface thao tác với Reservation và TableSession.
/// Theo docs/api-contract.md mục 9 và 10.
/// </summary>
public interface IReservationRepository
{
    // Reservations
    Task<Domain.Entities.Reservation?> GetReservationByIdAsync(Guid id, CancellationToken ct = default);
    Task<Domain.Entities.Reservation?> GetReservationByCodeAsync(string code, CancellationToken ct = default);
    Task<List<Domain.Entities.Reservation>> GetReservationsAsync(ReservationStatus? status, DateOnly? date, CancellationToken ct = default);
    Task<bool> ReservationCodeExistsAsync(string code, CancellationToken ct = default);
    Task AddReservationAsync(Domain.Entities.Reservation reservation, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);

    // Table Sessions
    Task<TableSession?> GetTableSessionByIdAsync(Guid id, CancellationToken ct = default);
    Task<TableSession?> GetTableSessionByTokenAsync(string token, CancellationToken ct = default);
    Task<bool> HasActiveSessionForTableAsync(Guid tableId, CancellationToken ct = default);
    Task AddTableSessionAsync(TableSession session, CancellationToken ct = default);
}
