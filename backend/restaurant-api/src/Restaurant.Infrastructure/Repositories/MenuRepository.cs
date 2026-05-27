using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Repositories;

/// <summary>
/// Triển khai IMenuRepository sử dụng EF Core + PostgreSQL.
/// </summary>
public class MenuRepository(RestaurantDbContext db) : IMenuRepository
{
    public async Task<List<MenuCategory>> GetCategoriesAsync(bool includeInactive, CancellationToken ct = default)
    {
        var query = db.MenuCategories.AsQueryable();
        if (!includeInactive)
            query = query.Where(c => c.IsActive);
        return await query.OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync(ct);
    }

    public async Task<MenuCategory?> GetCategoryByIdAsync(Guid id, CancellationToken ct = default)
        => await db.MenuCategories.FindAsync([id], ct);

    public async Task<bool> CategoryNameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default)
    {
        var query = db.MenuCategories.Where(c => c.Name == name);
        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);
        return await query.AnyAsync(ct);
    }

    public async Task AddCategoryAsync(MenuCategory category, CancellationToken ct = default)
        => await db.MenuCategories.AddAsync(category, ct);

    public async Task<(List<MenuItem> Items, int TotalCount)> GetMenuItemsAsync(
        Guid? categoryId, bool? isAvailable, string? keyword,
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.MenuItems.AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(m => m.CategoryId == categoryId.Value);

        if (isAvailable.HasValue)
            query = query.Where(m => m.IsAvailable == isAvailable.Value);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(m => m.Name.Contains(keyword));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<MenuItem?> GetMenuItemByIdAsync(Guid id, CancellationToken ct = default)
        => await db.MenuItems.FindAsync([id], ct);

    public async Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken ct = default)
        => await db.MenuCategories.AnyAsync(c => c.Id == categoryId, ct);

    public async Task AddMenuItemAsync(MenuItem menuItem, CancellationToken ct = default)
        => await db.MenuItems.AddAsync(menuItem, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await db.SaveChangesAsync(ct);
}
