using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Restaurant.Api.Shared.Realtime;

[Authorize(Roles = "Kitchen,Manager")]
public sealed class RestaurantRealtimeHub(ILogger<RestaurantRealtimeHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "N/A";
        logger.LogInformation(
            "Realtime client connected. ConnectionId: {ConnectionId}, UserId: {UserId}",
            Context.ConnectionId, userId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        logger.LogInformation(
            "Realtime client disconnected. ConnectionId: {ConnectionId}, Error: {Error}",
            Context.ConnectionId, exception?.Message ?? "None");

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinKitchenDisplayAsync()
    {
        logger.LogInformation(
            "Connection {ConnectionId} joined group {GroupName}.",
            Context.ConnectionId,
            RestaurantRealtimeGroups.Kitchen);

        await Groups.AddToGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Kitchen);
    }

    public async Task LeaveKitchenDisplayAsync()
    {
        logger.LogInformation(
            "Connection {ConnectionId} left group {GroupName}.",
            Context.ConnectionId,
            RestaurantRealtimeGroups.Kitchen);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, RestaurantRealtimeGroups.Kitchen);
    }
}
