using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Shared.Realtime;

public sealed class RestaurantHub : Hub
{
    public async Task SubscribeToOrderStatus(string sessionToken, Guid? orderId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionToken);

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            RestaurantRealtimeGroups.CustomerSession(sessionToken),
            Context.ConnectionAborted);

        if (orderId.HasValue && orderId.Value != Guid.Empty)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                RestaurantRealtimeGroups.Order(orderId.Value),
                Context.ConnectionAborted);
        }
    }

    public async Task UnsubscribeFromOrderStatus(string sessionToken, Guid? orderId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionToken);

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            RestaurantRealtimeGroups.CustomerSession(sessionToken),
            Context.ConnectionAborted);

        if (orderId.HasValue && orderId.Value != Guid.Empty)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                RestaurantRealtimeGroups.Order(orderId.Value),
                Context.ConnectionAborted);
        }
    }
}

