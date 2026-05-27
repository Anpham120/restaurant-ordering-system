using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record UpdateTableResult(bool Success, string? ErrorCode, string? ErrorMessage, TableDto? Table);

/// <summary>Cập nhật thông tin bàn ăn. Chỉ Manager.</summary>
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

        var areaExists = await tableRepository.AreaExistsAsync(request.AreaId, ct);
        if (!areaExists)
            return new(false, "NOT_FOUND", "Khu vực không tồn tại.", null);

        var numberConflict = await tableRepository.TableNumberExistsInAreaAsync(
            request.AreaId, request.TableNumber.Trim(), id, ct);
        if (numberConflict)
            return new(false, "CONFLICT", "Mã bàn đã tồn tại trong khu vực này.", null);

        table.AreaId = request.AreaId;
        table.TableNumber = request.TableNumber.Trim();
        table.Capacity = request.Capacity;
        table.UpdatedAt = DateTimeOffset.UtcNow;
        await tableRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableDto(
            table.Id, table.AreaId, table.Area?.Name ?? string.Empty,
            table.TableNumber, table.Capacity, table.Status.ToString()));
    }
}
