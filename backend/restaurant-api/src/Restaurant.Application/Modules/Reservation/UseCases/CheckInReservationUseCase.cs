using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Reservation.UseCases;

public record CheckInResult(bool Success, string? ErrorCode, string? ErrorMessage, TableSessionDto? Session);

/// <summary>
/// Check-in khách và tạo phiên bàn.
/// Thực hiện trong một transaction logic:
///   1. Đánh dấu reservation → CheckedIn
///   2. Tạo TableSession → Active
///   3. Cập nhật Table → Occupied
/// Staff hoặc Manager.
/// </summary>
public class CheckInReservationUseCase(
    IReservationRepository reservationRepository,
    ITableRepository tableRepository)
{
    public async Task<CheckInResult> ExecuteAsync(Guid reservationId, Guid staffUserId, CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetReservationByIdAsync(reservationId, ct);
        if (reservation is null)
            return new(false, "NOT_FOUND", "Đặt bàn không tồn tại.", null);

        if (reservation.Status != ReservationStatus.Confirmed.ToString())
            return new(false, "BUSINESS_RULE_VIOLATION", "Chỉ có thể check-in đặt bàn ở trạng thái Confirmed.", null);

        if (!reservation.AssignedTableId.HasValue)
            return new(false, "BUSINESS_RULE_VIOLATION", "Đặt bàn chưa được gán bàn.", null);

        var table = await tableRepository.GetTableByIdAsync(reservation.AssignedTableId.Value, ct);
        if (table is null)
            return new(false, "NOT_FOUND", "Bàn được gán không còn tồn tại.", null);

        var alreadyActive = await reservationRepository.HasActiveSessionForTableAsync(table.Id, ct);
        if (alreadyActive)
            return new(false, "BUSINESS_RULE_VIOLATION", "Bàn này đã có phiên đang hoạt động.", null);

        // Sinh session token ngẫu nhiên khó đoán
        var sessionToken = $"{Guid.NewGuid():N}{Guid.NewGuid():N}";

        // 1. Check-in reservation
        reservation.Status = ReservationStatus.CheckedIn.ToString();
        reservation.UpdatedAt = DateTimeOffset.UtcNow;

        // 2. Tạo table session
        var session = new TableSession
        {
            Id = Guid.NewGuid(),
            TableId = table.Id,
            ReservationId = reservationId,
            SessionToken = sessionToken,
            Status = TableSessionStatus.Active.ToString(),
            OpenedAt = DateTimeOffset.UtcNow,
            CreatedBy = staffUserId
        };
        await reservationRepository.AddTableSessionAsync(session, ct);

        // 3. Cập nhật trạng thái bàn → Occupied
        table.Status = TableStatus.Occupied.ToString();
        table.UpdatedAt = DateTimeOffset.UtcNow;
        await tableRepository.SaveChangesAsync(ct);
        await reservationRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableSessionDto(
            session.Id, session.TableId, session.ReservationId,
            session.SessionToken, session.Status.ToString(),
            session.OpenedAt, session.ClosedAt));
    }
}
