namespace Restaurant.Application.Features.Orders;

public sealed record CreateOrderRequest(
    string SessionToken,
    string IdempotencyKey,
    IReadOnlyCollection<CreateOrderItemRequest> Items);

public sealed record CreateOrderItemRequest(
    Guid MenuItemId,
    int Quantity,
    string? Note);

public sealed record OrderResponse(
    Guid Id,
    string OrderCode,
    Guid TableSessionId,
    string TableNumber,
    string Status,
    DateTimeOffset CreatedAt,
    IReadOnlyCollection<OrderItemResponse> Items);

public sealed record OrderItemResponse(
    Guid Id,
    Guid MenuItemId,
    string MenuItemName,
    decimal UnitPrice,
    int Quantity,
    string? Note,
    string Status);

public sealed record NewOrderCreatedEvent(
    Guid OrderId,
    string OrderCode,
    Guid TableSessionId,
    string TableNumber,
    DateTimeOffset CreatedAt);
