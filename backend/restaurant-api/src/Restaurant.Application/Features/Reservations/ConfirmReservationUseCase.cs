using Restaurant.Application.Features.Tables;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Reservations;

public record ConfirmReservationResult(bool Success, string? ErrorCode, string? ErrorMessage, ReservationDto? Reservation);

public class ConfirmReservationUseCase(IReservationRepository reservationRepository, ITableRepository tableRepository)
{
    public async Task<ConfirmReservationResult> ExecuteAsync(Guid id, ConfirmReservationRequest request, CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetReservationByIdAsync(id, ct);
        if (reservation is null)
            return new(false, "NOT_FOUND", "Đặt bàn không tồn tại.", null);

        if (reservation.Status != ReservationStatus.Pending.ToString())
            return new(false, "BUSINESS_RULE_VIOLATION", "Chỉ có thể xác nhận đặt bàn ở trạng thái Pending.", null);

        if (request.AssignedTableId.HasValue)
        {
            var table = await tableRepository.GetTableByIdAsync(request.AssignedTableId.Value, ct);
            if (table is null)
                return new(false, "NOT_FOUND", "Bàn không tồn tại.", null);
            if (table.Status != TableStatus.Available.ToString())
                return new(false, "BUSINESS_RULE_VIOLATION", "Bàn hiện không ở trạng thái Available.", null);

            table.Status = TableStatus.Reserved.ToString();
            table.UpdatedAt = DateTimeOffset.UtcNow;
            await tableRepository.SaveChangesAsync(ct);
        }

        reservation.Status = ReservationStatus.Confirmed.ToString();
        reservation.AssignedTableId = request.AssignedTableId;
        reservation.UpdatedAt = DateTimeOffset.UtcNow;
        await reservationRepository.SaveChangesAsync(ct);

        return new(true, null, null, new ReservationDto(
            reservation.Id, reservation.ReservationCode, reservation.CustomerName,
            reservation.Phone, reservation.GuestCount, reservation.ReservationTime,
            reservation.Note, reservation.Status, reservation.AssignedTableId));
    }
}
