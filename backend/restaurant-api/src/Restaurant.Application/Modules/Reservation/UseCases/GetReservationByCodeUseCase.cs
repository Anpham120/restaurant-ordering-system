using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;

namespace Restaurant.Application.Modules.Reservation.UseCases;

/// <summary>Tra cứu đặt bàn bằng mã. Public — không cần đăng nhập.</summary>
public class GetReservationByCodeUseCase(IReservationRepository reservationRepository)
{
    public async Task<ReservationDto?> ExecuteAsync(string code, CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetReservationByCodeAsync(code, ct);
        if (reservation is null) return null;

        return new ReservationDto(
            reservation.Id, reservation.ReservationCode, reservation.CustomerName,
            reservation.Phone, reservation.GuestCount, reservation.ReservationTime,
            reservation.Note, reservation.Status.ToString(), reservation.AssignedTableId);
    }
}
