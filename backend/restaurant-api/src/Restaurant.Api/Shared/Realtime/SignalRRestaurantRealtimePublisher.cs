using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Shared.Realtime;

public sealed class SignalRRestaurantRealtimePublisher(
    IHubContext<RestaurantHub> hubContext) : IRestaurantRealtimePublisher
{
    private static readonly string[] OrderProcessingGroups =
    [
        RestaurantRealtimeGroups.Kitchen,
        RestaurantRealtimeGroups.Managers,
    ];

    private static readonly string[] OrderStatusGroups =
    [
        RestaurantRealtimeGroups.Staff,
        RestaurantRealtimeGroups.Kitchen,
        RestaurantRealtimeGroups.Managers,
    ];

    private static readonly string[] TableStatusGroups =
    [
        RestaurantRealtimeGroups.Staff,
        RestaurantRealtimeGroups.Cashiers,
        RestaurantRealtimeGroups.Managers,
    ];

    private static readonly string[] PaymentGroups =
    [
        RestaurantRealtimeGroups.Staff,
        RestaurantRealtimeGroups.Cashiers,
        RestaurantRealtimeGroups.Managers,
    ];

    public Task PublishNewOrderCreatedAsync(
        NewOrderCreatedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.NewOrderCreated, payload, payload.OrderId, OrderProcessingGroups, sessionToken, cancellationToken);

    public Task PublishOrderItemPreparingAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemPreparing, payload, payload.OrderId, OrderStatusGroups, sessionToken, cancellationToken);

    public Task PublishOrderItemReadyAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemReady, payload, payload.OrderId, OrderStatusGroups, sessionToken, cancellationToken);

    public Task PublishOrderItemServedAsync(
        OrderItemStatusRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default) =>
        SendOrderEventAsync(RestaurantRealtimeEvents.OrderItemServed, payload, payload.OrderId, OrderStatusGroups, sessionToken, cancellationToken);

    public Task PublishTableStatusChangedAsync(
        TableStatusChangedRealtimePayload payload,
        CancellationToken cancellationToken = default) =>
        hubContext.Clients.Groups(TableStatusGroups)
            .SendAsync(RestaurantRealtimeEvents.TableStatusChanged, payload, cancellationToken);

    public Task PublishPaymentCompletedAsync(
        PaymentCompletedRealtimePayload payload,
        string? sessionToken = null,
        CancellationToken cancellationToken = default)
    {
        var internalSend = hubContext.Clients.Groups(PaymentGroups)
            .SendAsync(RestaurantRealtimeEvents.PaymentCompleted, payload, cancellationToken);

        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return internalSend;
        }

        var customerSend = hubContext.Clients
            .Group(RestaurantRealtimeGroups.CustomerSession(sessionToken))
            .SendAsync(RestaurantRealtimeEvents.PaymentCompleted, payload, cancellationToken);

        return Task.WhenAll(internalSend, customerSend);
    }

    public Task PublishDashboardUpdatedAsync(
        DashboardUpdatedRealtimePayload payload,
        CancellationToken cancellationToken = default) =>
        hubContext.Clients.Group(RestaurantRealtimeGroups.Managers)
            .SendAsync(RestaurantRealtimeEvents.DashboardUpdated, payload, cancellationToken);

    private Task SendOrderEventAsync(
        string eventName,
        object payload,
        Guid orderId,
        IReadOnlyList<string> internalGroups,
        string? sessionToken,
        CancellationToken cancellationToken)
    {
        var targetGroups = new List<string>(internalGroups.Count + 2)
        {
            RestaurantRealtimeGroups.Order(orderId),
        };

        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            targetGroups.AddRange(internalGroups);
        }
        else
        {
            targetGroups.Add(RestaurantRealtimeGroups.CustomerSession(sessionToken));
            targetGroups.AddRange(internalGroups);
        }

        return hubContext.Clients
            .Groups(targetGroups)
            .SendAsync(eventName, payload, cancellationToken);
    }
}
