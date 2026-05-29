namespace Restaurant.Application.Features.Reservations;

public class GetTableSessionByIdUseCase(IReservationRepository reservationRepository)
{
    public async Task<TableSessionDto?> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var s = await reservationRepository.GetTableSessionByIdAsync(id, ct);
        if (s is null) return null;
        return new TableSessionDto(s.Id, s.TableId, s.ReservationId, s.SessionToken, s.Status, s.OpenedAt, s.ClosedAt);
    }
}

public class GetTableSessionByTokenUseCase(IReservationRepository reservationRepository)
{
    public async Task<TableSessionDto?> ExecuteAsync(string token, CancellationToken ct = default)
    {
        var s = await reservationRepository.GetTableSessionByTokenAsync(token, ct);
        if (s is null) return null;
        return new TableSessionDto(s.Id, s.TableId, s.ReservationId, s.SessionToken, s.Status, s.OpenedAt, s.ClosedAt);
    }
}
