namespace Restaurant.Application.Features.Orders;

/// <summary>
/// Abstraction for pushing realtime notifications to connected SignalR clients.
/// Implemented in Restaurant.Api using ASP.NET Core SignalR IHubContext.
/// </summary>
public interface IRestaurantHubService
{
    /// <summary>
    /// Broadcasts an OrderItemReady event to all Staff/Manager clients.
    /// </summary>
    Task SendOrderItemReadyAsync(OrderItemReadyPayload payload, CancellationToken ct = default);
}
