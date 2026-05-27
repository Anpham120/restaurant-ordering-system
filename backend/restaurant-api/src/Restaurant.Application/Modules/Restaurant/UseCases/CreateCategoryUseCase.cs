using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Domain.Entities;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record CreateCategoryResult(bool Success, string? ErrorCode, string? ErrorMessage, MenuCategoryDto? Category);

/// <summary>Tạo danh mục menu mới. Chỉ Manager.</summary>
public class CreateCategoryUseCase(IMenuRepository menuRepository)
{
    public async Task<CreateCategoryResult> ExecuteAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new(false, "VALIDATION_ERROR", "Tên danh mục không được để trống.", null);

        var exists = await menuRepository.CategoryNameExistsAsync(request.Name, null, ct);
        if (exists)
            return new(false, "CONFLICT", "Danh mục với tên này đã tồn tại.", null);

        var category = new MenuCategory
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await menuRepository.AddCategoryAsync(category, ct);
        await menuRepository.SaveChangesAsync(ct);

        return new(true, null, null, new MenuCategoryDto(
            category.Id, category.Name, category.Description, category.DisplayOrder, category.IsActive));
    }
}
