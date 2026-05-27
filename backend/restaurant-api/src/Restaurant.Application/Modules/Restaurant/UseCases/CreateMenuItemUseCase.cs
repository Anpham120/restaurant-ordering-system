using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record CreateMenuItemResult(bool Success, string? ErrorCode, string? ErrorMessage, MenuItemDto? Item);

/// <summary>Tạo món ăn mới. Chỉ Manager.</summary>
public class CreateMenuItemUseCase(IMenuRepository menuRepository)
{
    public async Task<CreateMenuItemResult> ExecuteAsync(CreateMenuItemRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new(false, "VALIDATION_ERROR", "Tên món ăn không được để trống.", null);
        if (request.Price < 0)
            return new(false, "VALIDATION_ERROR", "Giá món phải >= 0.", null);

        var categoryExists = await menuRepository.CategoryExistsAsync(request.CategoryId, ct);
        if (!categoryExists)
            return new(false, "NOT_FOUND", "Danh mục không tồn tại.", null);

        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            Tags = request.Tags != null ? string.Join(",", request.Tags) : null,
            IsAvailable = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await menuRepository.AddMenuItemAsync(item, ct);
        await menuRepository.SaveChangesAsync(ct);

        var tagList = item.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();

        return new(true, null, null, new MenuItemDto(
            item.Id, item.CategoryId, item.Name, item.Description,
            item.Price, item.ImageUrl, tagList, item.IsAvailable));
    }
}
