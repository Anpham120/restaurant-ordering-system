namespace Restaurant.Application.Modules.Restaurant.DTOs;

// ── Response DTOs ──────────────────────────────────────────────────────────────

public record MenuCategoryDto(
    Guid Id,
    string Name,
    string? Description,
    int DisplayOrder,
    bool IsActive);

public record MenuItemDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    List<string> Tags,
    bool IsAvailable);

public record PaginatedResult<T>(
    List<T> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);

// ── Category Request DTOs ──────────────────────────────────────────────────────

public record CreateCategoryRequest(
    string Name,
    string? Description,
    int DisplayOrder);

public record UpdateCategoryRequest(
    string Name,
    string? Description,
    int DisplayOrder,
    bool IsActive);

// ── Menu Item Request DTOs ─────────────────────────────────────────────────────

public record CreateMenuItemRequest(
    Guid CategoryId,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    List<string>? Tags);

public record UpdateMenuItemRequest(
    Guid CategoryId,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    List<string>? Tags,
    bool IsAvailable);
