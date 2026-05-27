using System.Text.Json;

namespace Restaurant.Application.Features.Menu.Items;

public sealed class MenuItemDto
{
    public Guid Id { get; init; }
    public Guid CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<string> Tags { get; init; } = [];
    public bool IsAvailable { get; init; }
}

public sealed class CreateMenuItemRequest
{
    public Guid CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<string>? Tags { get; init; }
}

public sealed class UpdateMenuItemRequest
{
    public Guid CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<string>? Tags { get; init; }
    public bool IsAvailable { get; init; }
}

public sealed class GetMenuItemsQuery
{
    public Guid? CategoryId { get; init; }
    public bool? IsAvailable { get; init; }
    public string? Keyword { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public static class TagsHelper
{
    private static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };

    public static string? Serialize(IReadOnlyList<string>? tags) =>
        tags is { Count: > 0 } ? JsonSerializer.Serialize(tags, Opts) : null;

    public static IReadOnlyList<string> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json, Opts) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
