namespace Restaurant.Application.Features.Kitchen;

public sealed record KitchenOrderItemResponse(
    Guid Id,
    Guid OrderId,
    string OrderCode,
    Guid TableSessionId,
    Guid TableId,
    string TableNumber,
    Guid MenuItemId,
    string MenuItemName,
    decimal UnitPrice,
    int Quantity,
    string? Note,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record UpdateKitchenOrderItemStatusRequest(string Status);

public sealed record OrderItemStatusChangedEvent(
    Guid OrderItemId,
    Guid OrderId,
    string Status);
