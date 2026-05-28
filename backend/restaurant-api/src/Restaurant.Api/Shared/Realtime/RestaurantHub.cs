using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Shared.Realtime;

public sealed class RestaurantHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User?.IsInRole("Cashier") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Cashiers, Context.ConnectionAborted);
        }

        if (Context.User?.IsInRole("Kitchen") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Kitchen, Context.ConnectionAborted);
        }

        if (Context.User?.IsInRole("Manager") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Managers, Context.ConnectionAborted);
        }

        if (Context.User?.IsInRole("Staff") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Staff, Context.ConnectionAborted);
        }

        await base.OnConnectedAsync();
    }

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
