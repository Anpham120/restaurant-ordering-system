using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Repositories;

/// <summary>
/// Triển khai ITableRepository sử dụng EF Core + PostgreSQL.
/// </summary>
public class TableRepository(RestaurantDbContext db) : ITableRepository
{
    public async Task<List<Area>> GetAreasAsync(CancellationToken ct = default)
        => await db.Areas.OrderBy(a => a.Name).ToListAsync(ct);

    public async Task<List<Table>> GetTablesAsync(Guid? areaId, TableStatus? status, CancellationToken ct = default)
    {
        var query = db.Tables.Include(t => t.Area).AsQueryable();

        if (areaId.HasValue)
            query = query.Where(t => t.AreaId == areaId.Value);

        if (status.HasValue)
        {
            var statusStr = status.Value.ToString();
            query = query.Where(t => t.Status == statusStr);
        }

        return await query.OrderBy(t => t.Area!.Name).ThenBy(t => t.TableNumber).ToListAsync(ct);
    }

    public async Task<Table?> GetTableByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Tables.Include(t => t.Area).FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<bool> AreaExistsAsync(Guid areaId, CancellationToken ct = default)
        => await db.Areas.AnyAsync(a => a.Id == areaId, ct);

    public async Task<bool> TableNumberExistsInAreaAsync(Guid areaId, string tableNumber, Guid? excludeId = null, CancellationToken ct = default)
    {
        var query = db.Tables.Where(t => t.AreaId == areaId && t.TableNumber == tableNumber);
        if (excludeId.HasValue)
            query = query.Where(t => t.Id != excludeId.Value);
        return await query.AnyAsync(ct);
    }

    public async Task AddTableAsync(Table table, CancellationToken ct = default)
        => await db.Tables.AddAsync(table, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await db.SaveChangesAsync(ct);
}
