namespace Restaurant.Application.Features.Tables;

public record UpdateTableResult(bool Success, string? ErrorCode, string? ErrorMessage, TableDto? Table);

public class UpdateTableUseCase(ITableRepository tableRepository)
{
    public async Task<UpdateTableResult> ExecuteAsync(Guid id, UpdateTableRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.TableNumber))
            return new(false, "VALIDATION_ERROR", "Mã bàn không được để trống.", null);
        if (request.Capacity <= 0)
            return new(false, "VALIDATION_ERROR", "Sức chứa phải lớn hơn 0.", null);

        var table = await tableRepository.GetTableByIdAsync(id, ct);
        if (table is null)
            return new(false, "NOT_FOUND", "Bàn không tồn tại.", null);

        if (!await tableRepository.AreaExistsAsync(request.AreaId, ct))
            return new(false, "NOT_FOUND", "Khu vực không tồn tại.", null);

        if (await tableRepository.TableNumberExistsInAreaAsync(request.AreaId, request.TableNumber.Trim(), id, ct))
            return new(false, "CONFLICT", "Mã bàn đã tồn tại trong khu vực này.", null);

        table.AreaId = request.AreaId;
        table.TableNumber = request.TableNumber.Trim();
        table.Capacity = request.Capacity;
        table.UpdatedAt = DateTimeOffset.UtcNow;
        await tableRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableDto(
            table.Id, table.AreaId, table.Area?.Name ?? string.Empty,
            table.TableNumber, table.Capacity, table.Status));
    }
}
