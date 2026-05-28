using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Tables;

public interface ITableRepository
{
    Task<List<Area>> GetAreasAsync(CancellationToken ct = default);
    Task<List<Table>> GetTablesAsync(Guid? areaId, TableStatus? status, CancellationToken ct = default);
    Task<Table?> GetTableByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> AreaExistsAsync(Guid areaId, CancellationToken ct = default);
    Task<bool> TableNumberExistsInAreaAsync(Guid areaId, string tableNumber, Guid? excludeId = null, CancellationToken ct = default);
    Task AddTableAsync(Table table, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
