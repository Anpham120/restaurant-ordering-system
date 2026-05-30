using Restaurant.Domain.Entities;

namespace Restaurant.Application.Features.Reservations.CheckIn;

public interface IReservationCheckInStore
{
    Task<Restaurant.Domain.Entities.Reservation?> FindReservationAsync(
        Guid reservationId,
        CancellationToken cancellationToken);

    Task<bool> HasActiveSessionAsync(Guid tableId, CancellationToken cancellationToken);

    void Add(TableSession tableSession);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public sealed class ActiveTableSessionConflictException : Exception
{
}
