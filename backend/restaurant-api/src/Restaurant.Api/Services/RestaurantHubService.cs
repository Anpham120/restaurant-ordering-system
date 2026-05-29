using Microsoft.AspNetCore.SignalR;
using Restaurant.Api.Hubs;
using Restaurant.Application.Features.Orders;

namespace Restaurant.Api.Services;

/// <summary>
/// Concrete implementation of <see cref="IRestaurantHubService"/> that uses
/// ASP.NET Core SignalR <see cref="IHubContext{THub}"/> to push events to clients.
/// Registered as a Scoped service in DI.
/// </summary>
internal sealed class RestaurantHubService(IHubContext<RestaurantHub> hubContext)
    : IRestaurantHubService
{
    private const string StaffGroup = "staff";

    public async Task SendOrderItemReadyAsync(OrderItemReadyPayload payload, CancellationToken ct = default)
    {
        // Broadcast only to the "staff" group (Staff + Manager role)
        await hubContext.Clients
            .Group(StaffGroup)
            .SendAsync("OrderItemReady", payload, ct);
    }
}
