namespace Restaurant.Api.Shared.Realtime;

public static class RestaurantRealtimeEvents
{
    public const string NewOrderCreated = nameof(NewOrderCreated);
    public const string OrderItemPreparing = nameof(OrderItemPreparing);
    public const string OrderItemReady = nameof(OrderItemReady);
    public const string OrderItemServed = nameof(OrderItemServed);
    public const string TableStatusChanged = nameof(TableStatusChanged);
    public const string PaymentCompleted = nameof(PaymentCompleted);
    public const string DashboardUpdated = nameof(DashboardUpdated);
}
