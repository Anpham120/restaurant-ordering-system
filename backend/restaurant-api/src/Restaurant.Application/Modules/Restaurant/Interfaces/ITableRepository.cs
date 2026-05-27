using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Restaurant.Interfaces;

/// <summary>
/// Interface thao tác với Area và Table.
/// Theo docs/api-contract.md mục 8.
/// </summary>
public interface ITableRepository
{
    // Areas
    Task<List<Area>> GetAreasAsync(CancellationToken ct = default);

    // Tables
    Task<List<Table>> GetTablesAsync(Guid? areaId, TableStatus? status, CancellationToken ct = default);
    Task<Table?> GetTableByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> AreaExistsAsync(Guid areaId, CancellationToken ct = default);
    Task<bool> TableNumberExistsInAreaAsync(Guid areaId, string tableNumber, Guid? excludeId = null, CancellationToken ct = default);
    Task AddTableAsync(Table table, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
