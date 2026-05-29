namespace Restaurant.Application.Features.Ordering.Orders;

public sealed class CreateOrderRequest
{
    public string SessionToken { get; init; } = string.Empty;
    public string IdempotencyKey { get; init; } = string.Empty;
    public IReadOnlyList<CreateOrderItemRequest> Items { get; init; } = [];
}

public sealed class CreateOrderItemRequest
{
    public Guid MenuItemId { get; init; }
    public int Quantity { get; init; }
    public string? Note { get; init; }
}

public sealed class OrderDto
{
    public Guid Id { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public Guid TableSessionId { get; init; }
    public string Status { get; init; } = string.Empty;
    public IReadOnlyList<OrderItemDto> Items { get; init; } = [];
}

public sealed class OrderItemDto
{
    public Guid Id { get; init; }
    public Guid MenuItemId { get; init; }
    public string MenuItemName { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; }
    public string? Note { get; init; }
    public string Status { get; init; } = string.Empty;
}

public sealed class CreateOrderResult
{
    public required OrderDto Order { get; init; }
    public bool IsDuplicateReplay { get; init; }
}

public sealed record IdempotencyPayloadItem
{
    public Guid MenuItemId { get; init; }
    public int Quantity { get; init; }
    public string? Note { get; init; }
}
