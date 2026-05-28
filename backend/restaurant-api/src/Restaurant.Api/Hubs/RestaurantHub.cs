using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Hubs;

public sealed class RestaurantHub : Hub
{
    public const string KitchenDisplayGroup = "kitchen-display";

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, KitchenDisplayGroup);
        await base.OnConnectedAsync();
    }
}
