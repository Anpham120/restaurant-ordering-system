using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record UpdateMenuItemResult(bool Success, string? ErrorCode, string? ErrorMessage, MenuItemDto? Item);

/// <summary>Cập nhật món ăn. Chỉ Manager.</summary>
public class UpdateMenuItemUseCase(IMenuRepository menuRepository)
{
    public async Task<UpdateMenuItemResult> ExecuteAsync(Guid id, UpdateMenuItemRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new(false, "VALIDATION_ERROR", "Tên món ăn không được để trống.", null);
        if (request.Price < 0)
            return new(false, "VALIDATION_ERROR", "Giá món phải >= 0.", null);

        var item = await menuRepository.GetMenuItemByIdAsync(id, ct);
        if (item is null)
            return new(false, "NOT_FOUND", "Món ăn không tồn tại.", null);

        var categoryExists = await menuRepository.CategoryExistsAsync(request.CategoryId, ct);
        if (!categoryExists)
            return new(false, "NOT_FOUND", "Danh mục không tồn tại.", null);

        item.CategoryId = request.CategoryId;
        item.Name = request.Name.Trim();
        item.Description = request.Description?.Trim();
        item.Price = request.Price;
        item.ImageUrl = request.ImageUrl;
        item.Tags = request.Tags != null ? string.Join(",", request.Tags) : null;
        item.IsAvailable = request.IsAvailable;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await menuRepository.SaveChangesAsync(ct);

        var tagList = item.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();

        return new(true, null, null, new MenuItemDto(
            item.Id, item.CategoryId, item.Name, item.Description,
            item.Price, item.ImageUrl, tagList, item.IsAvailable));
    }
}
