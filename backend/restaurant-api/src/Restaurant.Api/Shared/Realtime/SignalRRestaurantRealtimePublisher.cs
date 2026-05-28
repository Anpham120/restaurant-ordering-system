using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Shared.Realtime;

public sealed class SignalRRestaurantRealtimePublisher(
    IHubContext<RestaurantHub> hubContext) : IRestaurantRealtimePublisher
{
    public Task PublishNewOrderCreatedAsync(
        NewOrderCreatedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.NewOrderCreated, payload, payload.OrderId, sessionToken, cancellationToken);

    public Task PublishOrderItemPreparingAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemPreparing, payload, payload.OrderId, sessionToken, cancellationToken);

    public Task PublishOrderItemReadyAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemReady, payload, payload.OrderId, sessionToken, cancellationToken);

    public Task PublishOrderItemServedAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemServed, payload, payload.OrderId, sessionToken, cancellationToken);

    public Task PublishTableStatusChangedAsync(
        TableStatusChangedRealtimePayload payload,
        CancellationToken cancellationToken = default) =>
        hubContext.Clients.All.SendAsync(RestaurantRealtimeEvents.TableStatusChanged, payload, cancellationToken);

    public Task PublishPaymentCompletedAsync(
        PaymentCompletedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return hubContext.Clients.All.SendAsync(RestaurantRealtimeEvents.PaymentCompleted, payload, cancellationToken);
        }

        return hubContext.Clients
            .Group(RestaurantRealtimeGroups.CustomerSession(sessionToken))
            .SendAsync(RestaurantRealtimeEvents.PaymentCompleted, payload, cancellationToken);
    }

    public Task PublishDashboardUpdatedAsync(
        DashboardUpdatedRealtimePayload payload,
        CancellationToken cancellationToken = default) =>
        hubContext.Clients.All.SendAsync(RestaurantRealtimeEvents.DashboardUpdated, payload, cancellationToken);

    private Task SendOrderEventAsync(
        string eventName,
        object payload,
        Guid orderId,
        string? sessionToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return hubContext.Clients
                .Group(RestaurantRealtimeGroups.Order(orderId))
                .SendAsync(eventName, payload, cancellationToken);
        }

        return hubContext.Clients
            .Groups(RestaurantRealtimeGroups.Order(orderId), RestaurantRealtimeGroups.CustomerSession(sessionToken))
            .SendAsync(eventName, payload, cancellationToken);
    }
}

