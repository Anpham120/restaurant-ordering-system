using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Common;
using Restaurant.Application.Features.Menu.Items;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Menu.Items;

// ─── Get (paginated) ────────────────────────────────────────────────────────

public sealed class GetMenuItemsHandler(RestaurantDbContext db)
{
    public async Task<PagedResult<MenuItemDto>> HandleAsync(
        GetMenuItemsQuery query,
        CancellationToken ct = default)
    {
        var q = db.MenuItems.AsNoTracking();

        if (query.CategoryId.HasValue)
            q = q.Where(i => i.CategoryId == query.CategoryId.Value);

        if (query.IsAvailable.HasValue)
            q = q.Where(i => i.IsAvailable == query.IsAvailable.Value);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
            q = q.Where(i => EF.Functions.ILike(i.Name, $"%{query.Keyword}%"));

        var totalItems = await q.CountAsync(ct);

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var items = await q
            .OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new MenuItemDto
            {
                Id = i.Id,
                CategoryId = i.CategoryId,
                Name = i.Name,
                Description = i.Description,
                Price = i.Price,
                ImageUrl = i.ImageUrl,
                Tags = TagsHelper.Deserialize(i.Tags),
                IsAvailable = i.IsAvailable,
            })
            .ToListAsync(ct);

        return new PagedResult<MenuItemDto>
        {
            Data = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
        };
    }
}

// ─── Create ─────────────────────────────────────────────────────────────────

public sealed class CreateMenuItemHandler(RestaurantDbContext db)
{
    public async Task<MenuItemDto> HandleAsync(
        CreateMenuItemRequest request,
        CancellationToken ct = default)
    {
        var categoryExists = await db.MenuCategories
            .AnyAsync(c => c.Id == request.CategoryId && c.IsActive, ct);

        if (!categoryExists)
            throw new InvalidOperationException("Danh mục không tồn tại hoặc không còn hoạt động.");

        if (request.Price < 0)
            throw new InvalidOperationException("Giá món không được âm.");

        var now = DateTimeOffset.UtcNow;
        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            Tags = TagsHelper.Serialize(request.Tags),
            IsAvailable = true,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.MenuItems.Add(item);
        await db.SaveChangesAsync(ct);

        return new MenuItemDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            Description = item.Description,
            Price = item.Price,
            ImageUrl = item.ImageUrl,
            Tags = TagsHelper.Deserialize(item.Tags),
            IsAvailable = item.IsAvailable,
        };
    }
}

// ─── Update ─────────────────────────────────────────────────────────────────

public sealed class UpdateMenuItemHandler(RestaurantDbContext db)
{
    public async Task<MenuItemDto?> HandleAsync(
        Guid id,
        UpdateMenuItemRequest request,
        CancellationToken ct = default)
    {
        var item = await db.MenuItems.FindAsync([id], ct);
        if (item is null) return null;

        var categoryExists = await db.MenuCategories
            .AnyAsync(c => c.Id == request.CategoryId && c.IsActive, ct);

        if (!categoryExists)
            throw new InvalidOperationException("Danh mục không tồn tại hoặc không còn hoạt động.");

        if (request.Price < 0)
            throw new InvalidOperationException("Giá món không được âm.");

        item.CategoryId = request.CategoryId;
        item.Name = request.Name;
        item.Description = request.Description;
        item.Price = request.Price;
        item.ImageUrl = request.ImageUrl;
        item.Tags = TagsHelper.Serialize(request.Tags);
        item.IsAvailable = request.IsAvailable;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);

        return new MenuItemDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            Description = item.Description,
            Price = item.Price,
            ImageUrl = item.ImageUrl,
            Tags = TagsHelper.Deserialize(item.Tags),
            IsAvailable = item.IsAvailable,
        };
    }
}
