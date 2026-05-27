using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;

namespace Restaurant.Application.Modules.Reservation.UseCases;

/// <summary>Lấy phiên bàn theo ID. Staff, Manager, Cashier.</summary>
public class GetTableSessionByIdUseCase(IReservationRepository reservationRepository)
{
    public async Task<TableSessionDto?> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var session = await reservationRepository.GetTableSessionByIdAsync(id, ct);
        if (session is null) return null;

        return new TableSessionDto(
            session.Id, session.TableId, session.ReservationId,
            session.SessionToken, session.Status.ToString(),
            session.OpenedAt, session.ClosedAt);
    }
}

/// <summary>Lấy phiên bàn theo session token. Public — dành cho Customer QR flow.</summary>
public class GetTableSessionByTokenUseCase(IReservationRepository reservationRepository)
{
    public async Task<TableSessionDto?> ExecuteAsync(string token, CancellationToken ct = default)
    {
        var session = await reservationRepository.GetTableSessionByTokenAsync(token, ct);
        if (session is null) return null;

        return new TableSessionDto(
            session.Id, session.TableId, session.ReservationId,
            session.SessionToken, session.Status.ToString(),
            session.OpenedAt, session.ClosedAt);
    }
}
