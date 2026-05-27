using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

public record UpdateCategoryResult(bool Success, string? ErrorCode, string? ErrorMessage, MenuCategoryDto? Category);

/// <summary>Cập nhật danh mục menu. Chỉ Manager.</summary>
public class UpdateCategoryUseCase(IMenuRepository menuRepository)
{
    public async Task<UpdateCategoryResult> ExecuteAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new(false, "VALIDATION_ERROR", "Tên danh mục không được để trống.", null);

        var category = await menuRepository.GetCategoryByIdAsync(id, ct);
        if (category is null)
            return new(false, "NOT_FOUND", "Danh mục không tồn tại.", null);

        var nameConflict = await menuRepository.CategoryNameExistsAsync(request.Name, id, ct);
        if (nameConflict)
            return new(false, "CONFLICT", "Danh mục với tên này đã tồn tại.", null);

        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTimeOffset.UtcNow;
        await menuRepository.SaveChangesAsync(ct);

        return new(true, null, null, new MenuCategoryDto(
            category.Id, category.Name, category.Description, category.DisplayOrder, category.IsActive));
    }
}
