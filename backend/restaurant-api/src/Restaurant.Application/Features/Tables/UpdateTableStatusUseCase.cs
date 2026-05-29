using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Tables;

public record UpdateTableStatusResult(bool Success, string? ErrorCode, string? ErrorMessage, TableDto? Table);

public class UpdateTableStatusUseCase(ITableRepository tableRepository)
{
    public async Task<UpdateTableStatusResult> ExecuteAsync(Guid id, UpdateTableStatusRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<TableStatus>(request.Status, true, out var status))
            return new(false, "VALIDATION_ERROR", $"Trạng thái '{request.Status}' không hợp lệ.", null);

        var table = await tableRepository.GetTableByIdAsync(id, ct);
        if (table is null)
            return new(false, "NOT_FOUND", "Bàn không tồn tại.", null);

        table.Status = status.ToString();
        table.UpdatedAt = DateTimeOffset.UtcNow;
        await tableRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableDto(
            table.Id, table.AreaId, table.Area?.Name ?? string.Empty,
            table.TableNumber, table.Capacity, table.Status));
    }
}
