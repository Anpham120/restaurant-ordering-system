namespace Restaurant.Api.Shared.Realtime;

public interface IRestaurantRealtimePublisher
{
    Task PublishNewOrderCreatedAsync(
        NewOrderCreatedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default);

    Task PublishOrderItemPreparingAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default);

    Task PublishOrderItemReadyAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default);

    Task PublishOrderItemServedAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default);

    Task PublishTableStatusChangedAsync(
        TableStatusChangedRealtimePayload payload,
        CancellationToken cancellationToken = default);

    Task PublishPaymentCompletedAsync(
        PaymentCompletedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default);

    Task PublishDashboardUpdatedAsync(
        DashboardUpdatedRealtimePayload payload,
        CancellationToken cancellationToken = default);
}

