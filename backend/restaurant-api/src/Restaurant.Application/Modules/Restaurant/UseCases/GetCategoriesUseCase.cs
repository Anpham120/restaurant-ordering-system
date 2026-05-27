using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

/// <summary>
/// Lấy danh sách danh mục menu.
/// Manager có thể xem cả danh mục ẩn bằng includeInactive=true.
/// </summary>
public class GetCategoriesUseCase(IMenuRepository menuRepository)
{
    public async Task<List<MenuCategoryDto>> ExecuteAsync(bool includeInactive, CancellationToken ct = default)
    {
        var categories = await menuRepository.GetCategoriesAsync(includeInactive, ct);
        return categories.Select(c => new MenuCategoryDto(
            c.Id, c.Name, c.Description, c.DisplayOrder, c.IsActive)).ToList();
    }
}
