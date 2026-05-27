using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

/// <summary>
/// Lấy danh sách món ăn với tìm kiếm, lọc và phân trang.
/// Public — không cần đăng nhập.
/// </summary>
public class GetMenuItemsUseCase(IMenuRepository menuRepository)
{
    public async Task<PaginatedResult<MenuItemDto>> ExecuteAsync(
        Guid? categoryId, bool? isAvailable, string? keyword,
        int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await menuRepository.GetMenuItemsAsync(
            categoryId, isAvailable, keyword, page, pageSize, ct);

        var dtos = items.Select(m => {
            var tagList = m.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
            return new MenuItemDto(
                m.Id, m.CategoryId, m.Name, m.Description,
                m.Price, m.ImageUrl, tagList, m.IsAvailable);
        }).ToList();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return new PaginatedResult<MenuItemDto>(dtos, page, pageSize, total, totalPages);
    }
}
