using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Reservation.UseCases;

public record CreateTableSessionResult(bool Success, string? ErrorCode, string? ErrorMessage, TableSessionDto? Session);

/// <summary>Mở phiên bàn không qua đặt bàn trước. Staff hoặc Manager.</summary>
public class CreateTableSessionUseCase(IReservationRepository reservationRepository, ITableRepository tableRepository)
{
    public async Task<CreateTableSessionResult> ExecuteAsync(CreateTableSessionRequest request, Guid staffUserId, CancellationToken ct = default)
    {
        var table = await tableRepository.GetTableByIdAsync(request.TableId, ct);
        if (table is null)
            return new(false, "NOT_FOUND", "Bàn không tồn tại.", null);

        if (table.Status != TableStatus.Available.ToString())
            return new(false, "BUSINESS_RULE_VIOLATION", "Bàn hiện không ở trạng thái Available.", null);

        var alreadyActive = await reservationRepository.HasActiveSessionForTableAsync(table.Id, ct);
        if (alreadyActive)
            return new(false, "BUSINESS_RULE_VIOLATION", "Bàn này đã có phiên đang hoạt động.", null);

        var sessionToken = $"{Guid.NewGuid():N}{Guid.NewGuid():N}";
        var session = new TableSession
        {
            Id = Guid.NewGuid(),
            TableId = table.Id,
            ReservationId = null,
            SessionToken = sessionToken,
            Status = TableSessionStatus.Active.ToString(),
            OpenedAt = DateTimeOffset.UtcNow,
            CreatedBy = staffUserId
        };
        await reservationRepository.AddTableSessionAsync(session, ct);

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
