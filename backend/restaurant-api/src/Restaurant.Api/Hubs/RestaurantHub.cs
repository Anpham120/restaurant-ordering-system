using Microsoft.AspNetCore.SignalR;
using Restaurant.Application.Features.Orders;

namespace Restaurant.Api.Hubs;

/// <summary>
/// SignalR hub for real-time restaurant events.
/// Endpoint: /hubs/restaurant
/// </summary>
/// <remarks>
/// Client groups:
/// - "staff"   — Staff + Manager clients (receives OrderItemReady)
/// - "kitchen" — Kitchen clients (future: receives new orders)
/// </remarks>
public sealed class RestaurantHub : Hub
{
    private const string StaffGroup = "staff";

    public override async Task OnConnectedAsync()
    {
        // Determine role from HTTP context claims (JWT or query-string token)
        var role = Context.User?.FindFirst(
            System.Security.Claims.ClaimTypes.Role)?.Value
            ?? Context.GetHttpContext()?.Request.Query["role"].ToString()
            ?? string.Empty;

        // Add to appropriate group so server can broadcast to subsets
        var group = role.ToLowerInvariant() switch
        {
            "staff" or "manager" => StaffGroup,
            "kitchen"            => "kitchen",
            "cashier"            => "cashier",
            _                    => StaffGroup   // default: treat as staff for safety
        };

        await Groups.AddToGroupAsync(Context.ConnectionId, group);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
