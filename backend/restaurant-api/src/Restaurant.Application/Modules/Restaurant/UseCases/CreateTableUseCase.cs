using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record CreateTableResult(bool Success, string? ErrorCode, string? ErrorMessage, TableDto? Table);

/// <summary>Tạo bàn ăn mới. Chỉ Manager.</summary>
public class CreateTableUseCase(ITableRepository tableRepository)
{
    public async Task<CreateTableResult> ExecuteAsync(CreateTableRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.TableNumber))
            return new(false, "VALIDATION_ERROR", "Mã bàn không được để trống.", null);
        if (request.Capacity <= 0)
            return new(false, "VALIDATION_ERROR", "Sức chứa phải lớn hơn 0.", null);

        var areaExists = await tableRepository.AreaExistsAsync(request.AreaId, ct);
        if (!areaExists)
            return new(false, "NOT_FOUND", "Khu vực không tồn tại.", null);

        var numberConflict = await tableRepository.TableNumberExistsInAreaAsync(
            request.AreaId, request.TableNumber.Trim(), null, ct);
        if (numberConflict)
            return new(false, "CONFLICT", "Mã bàn đã tồn tại trong khu vực này.", null);

        var table = new Table
        {
            Id = Guid.NewGuid(),
            AreaId = request.AreaId,
            TableNumber = request.TableNumber.Trim(),
            Capacity = request.Capacity,
            Status = TableStatus.Available.ToString(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await tableRepository.AddTableAsync(table, ct);
        await tableRepository.SaveChangesAsync(ct);

        return new(true, null, null, new TableDto(
            table.Id, table.AreaId, string.Empty, table.TableNumber, table.Capacity, table.Status.ToString()));
    }
}
