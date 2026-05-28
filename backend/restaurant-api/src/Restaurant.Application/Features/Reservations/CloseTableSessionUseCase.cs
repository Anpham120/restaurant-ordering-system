using Restaurant.Application.Features.Tables;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Reservations;

public record CloseTableSessionResult(bool Success, string? ErrorCode, string? ErrorMessage, TableSessionDto? Session);

public class CloseTableSessionUseCase(IReservationRepository reservationRepository, ITableRepository tableRepository)
{
    public async Task<CloseTableSessionResult> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var session = await reservationRepository.GetTableSessionByIdAsync(id, ct);
        if (session is null)
            return new(false, "NOT_FOUND", "Phiên bàn không tồn tại.", null);

        if (session.Status != TableSessionStatus.Active.ToString())
            return new(false, "BUSINESS_RULE_VIOLATION", "Phiên bàn không ở trạng thái Active.", null);

        session.Status = TableSessionStatus.Closed.ToString();
        session.ClosedAt = DateTimeOffset.UtcNow;

        var table = await tableRepository.GetTableByIdAsync(session.TableId, ct);
        if (table is not null)
        {
            table.Status = TableStatus.Cleaning.ToString();
            table.UpdatedAt = DateTimeOffset.UtcNow;
            await tableRepository.SaveChangesAsync(ct);
        }

        await reservationRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableSessionDto(
            session.Id, session.TableId, session.ReservationId,
            session.SessionToken, session.Status, session.OpenedAt, session.ClosedAt));
    }
}
