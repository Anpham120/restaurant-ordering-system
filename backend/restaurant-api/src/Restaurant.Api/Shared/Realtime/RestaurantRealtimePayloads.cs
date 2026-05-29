namespace Restaurant.Api.Shared.Realtime;

public sealed record NewOrderCreatedRealtimePayload(
    Guid OrderId,
    string OrderCode,
    Guid TableSessionId,
    string TableNumber,
    DateTimeOffset CreatedAt);

public sealed record OrderItemStatusRealtimePayload(
    Guid OrderItemId,
    Guid OrderId,
    string Status);

public sealed record TableStatusChangedRealtimePayload(
    Guid TableId,
    string TableNumber,
    string Status);

public sealed record PaymentCompletedRealtimePayload(
    Guid InvoiceId,
    Guid TableSessionId,
    decimal TotalAmount,
    DateTimeOffset PaidAt);

public sealed record DashboardUpdatedRealtimePayload(
    DateOnly Date,
    decimal Revenue,
    int OrderCount);

