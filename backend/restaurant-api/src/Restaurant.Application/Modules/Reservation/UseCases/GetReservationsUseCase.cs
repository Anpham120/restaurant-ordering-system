using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Reservation.UseCases;

/// <summary>Lấy danh sách đặt bàn cho Staff và Manager, lọc theo trạng thái và ngày.</summary>
public class GetReservationsUseCase(IReservationRepository reservationRepository)
{
    public async Task<List<ReservationDto>> ExecuteAsync(string? status, DateOnly? date, CancellationToken ct = default)
    {
        ReservationStatus? reservationStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReservationStatus>(status, true, out var parsed))
            reservationStatus = parsed;

        var reservations = await reservationRepository.GetReservationsAsync(reservationStatus, date, ct);
        return reservations.Select(r => new ReservationDto(
            r.Id, r.ReservationCode, r.CustomerName, r.Phone, r.GuestCount,
            r.ReservationTime, r.Note, r.Status.ToString(), r.AssignedTableId)).ToList();
    }
}
