using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Common;
using Restaurant.Application.Features.Menu.Categories;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Menu.Categories;

// ─── Get ────────────────────────────────────────────────────────────────────

public sealed class GetMenuCategoriesHandler(RestaurantDbContext db)
{
    public async Task<IReadOnlyList<MenuCategoryDto>> HandleAsync(
        GetMenuCategoriesQuery query,
        CancellationToken ct = default)
    {
        var q = db.MenuCategories.AsNoTracking();

        if (!query.IncludeInactive)
            q = q.Where(c => c.IsActive);

        var list = await q
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new MenuCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
            })
            .ToListAsync(ct);

        return list;
    }
}

// ─── Create ─────────────────────────────────────────────────────────────────

public sealed class CreateMenuCategoryHandler(RestaurantDbContext db)
{
    public async Task<MenuCategoryDto> HandleAsync(
        CreateMenuCategoryRequest request,
        CancellationToken ct = default)
    {
        var isDuplicate = await db.MenuCategories
            .AnyAsync(c => c.Name == request.Name, ct);

        if (isDuplicate)
            throw new InvalidOperationException($"Danh mục '{request.Name}' đã tồn tại.");

        var now = DateTimeOffset.UtcNow;
        var category = new MenuCategory
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.MenuCategories.Add(category);
        await db.SaveChangesAsync(ct);

        return new MenuCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
        };
    }
}

// ─── Update ─────────────────────────────────────────────────────────────────

public sealed class UpdateMenuCategoryHandler(RestaurantDbContext db)
{
    public async Task<MenuCategoryDto?> HandleAsync(
        Guid id,
        UpdateMenuCategoryRequest request,
        CancellationToken ct = default)
    {
        var category = await db.MenuCategories.FindAsync([id], ct);
        if (category is null) return null;

        var isDuplicate = await db.MenuCategories
            .AnyAsync(c => c.Name == request.Name && c.Id != id, ct);

        if (isDuplicate)
            throw new InvalidOperationException($"Danh mục '{request.Name}' đã tồn tại.");

        category.Name = request.Name;
        category.Description = request.Description;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);

        return new MenuCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
        };
    }
}
