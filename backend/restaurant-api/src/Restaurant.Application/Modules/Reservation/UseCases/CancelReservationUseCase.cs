using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Reservation.UseCases;

public record CancelReservationResult(bool Success, string? ErrorCode, string? ErrorMessage);

/// <summary>Hủy đặt bàn. Staff hoặc Manager.</summary>
public class CancelReservationUseCase(IReservationRepository reservationRepository, ITableRepository tableRepository)
{
    public async Task<CancelReservationResult> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetReservationByIdAsync(id, ct);
        if (reservation is null)
            return new(false, "NOT_FOUND", "Đặt bàn không tồn tại.");

        if (reservation.Status == ReservationStatus.CheckedIn.ToString() || reservation.Status == ReservationStatus.Cancelled.ToString())
            return new(false, "BUSINESS_RULE_VIOLATION", "Không thể hủy đặt bàn ở trạng thái hiện tại.");

        // Giải phóng bàn đã gán nếu có
        if (reservation.AssignedTableId.HasValue)
        {
            var table = await tableRepository.GetTableByIdAsync(reservation.AssignedTableId.Value, ct);
            if (table is not null && table.Status == TableStatus.Reserved.ToString())
            {
                table.Status = TableStatus.Available.ToString();
                table.UpdatedAt = DateTimeOffset.UtcNow;
                await tableRepository.SaveChangesAsync(ct);
            }
        }

        reservation.Status = ReservationStatus.Cancelled.ToString();
        reservation.UpdatedAt = DateTimeOffset.UtcNow;
        await reservationRepository.SaveChangesAsync(ct);

        return new(true, null, null);
    }
}
