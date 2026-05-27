using Restaurant.Domain.Entities;

namespace Restaurant.Application.Modules.Restaurant.Interfaces;

/// <summary>
/// Interface thao tác với MenuCategory và MenuItem.
/// Theo docs/api-contract.md mục 7.
/// </summary>
public interface IMenuRepository
{
    // Categories
    Task<List<MenuCategory>> GetCategoriesAsync(bool includeInactive, CancellationToken ct = default);
    Task<MenuCategory?> GetCategoryByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> CategoryNameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default);
    Task AddCategoryAsync(MenuCategory category, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);

    // Menu Items
    Task<(List<MenuItem> Items, int TotalCount)> GetMenuItemsAsync(
        Guid? categoryId, bool? isAvailable, string? keyword,
        int page, int pageSize, CancellationToken ct = default);
    Task<MenuItem?> GetMenuItemByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken ct = default);
    Task AddMenuItemAsync(MenuItem menuItem, CancellationToken ct = default);
}
