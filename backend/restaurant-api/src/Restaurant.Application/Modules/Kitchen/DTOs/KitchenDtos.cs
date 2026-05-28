namespace Restaurant.Application.Modules.Kitchen.DTOs;

public record KitchenOrderItemDto(
    Guid Id,
    Guid OrderId,
    string OrderCode,
    string TableNumber,
    string MenuItemName,
    int Quantity,
    string? Note,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? StartedAt,
    DateTimeOffset? ReadyAt);

public record UpdateOrderItemStatusRequest(string Status);

public record UpdateOrderItemStatusResult(bool Success, string? ErrorCode, string? ErrorMessage);
