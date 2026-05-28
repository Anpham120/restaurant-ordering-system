namespace Restaurant.Application.Features.Orders;

/// <summary>
/// Payload broadcast to Staff/Manager clients when a kitchen item becomes Ready.
/// Property names must stay camelCase to match the TypeScript <c>OrderItemReadyEvent</c> interface.
/// </summary>
public sealed record OrderItemReadyPayload(
    string OrderItemId,
    string OrderId,
    string Status,
    string? TableId,
    string? TableNumber,
    string? MenuItemName,
    int? Quantity,
    string? Note,
    string? ReadyAt
);
