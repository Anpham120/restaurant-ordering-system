namespace Restaurant.Application.Features.Reservations;

public class GetReservationByCodeUseCase(IReservationRepository reservationRepository)
{
    public async Task<ReservationDto?> ExecuteAsync(string code, CancellationToken ct = default)
    {
        var r = await reservationRepository.GetReservationByCodeAsync(code, ct);
        if (r is null) return null;
        return new ReservationDto(r.Id, r.ReservationCode, r.CustomerName, r.Phone,
            r.GuestCount, r.ReservationTime, r.Note, r.Status, r.AssignedTableId);
    }
}
