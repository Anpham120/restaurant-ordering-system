using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Hubs;

public sealed class RestaurantHub : Hub
{
    public const string KitchenDisplayGroup = "kitchen";
    private const string StaffGroup = "staff";

    public override async Task OnConnectedAsync()
    {
        var role = Context.User?.FindFirst(
            System.Security.Claims.ClaimTypes.Role)?.Value
            ?? Context.GetHttpContext()?.Request.Query["role"].ToString()
            ?? string.Empty;

        var group = role.ToLowerInvariant() switch
        {
            "staff" or "manager" => StaffGroup,
            "kitchen"            => KitchenDisplayGroup,
            "cashier"            => "cashier",
            _                    => StaffGroup
        };

        await Groups.AddToGroupAsync(Context.ConnectionId, group);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
