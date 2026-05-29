namespace Restaurant.Application.Features.Menu.Categories;

public sealed class MenuCategoryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsActive { get; init; }
}

public sealed class CreateMenuCategoryRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
}

public sealed class UpdateMenuCategoryRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsActive { get; init; }
}

public sealed class GetMenuCategoriesQuery
{
    public bool IncludeInactive { get; init; }
}
