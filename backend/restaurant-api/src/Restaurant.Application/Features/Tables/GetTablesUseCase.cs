using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Tables;

public class GetTablesUseCase(ITableRepository tableRepository)
{
    public async Task<List<TableDto>> ExecuteAsync(Guid? areaId, string? status, CancellationToken ct = default)
    {
        TableStatus? tableStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TableStatus>(status, true, out var parsed))
            tableStatus = parsed;

        var tables = await tableRepository.GetTablesAsync(areaId, tableStatus, ct);
        return tables.Select(t => new TableDto(
            t.Id, t.AreaId, t.Area?.Name ?? string.Empty,
            t.TableNumber, t.Capacity, t.Status)).ToList();
    }
}
