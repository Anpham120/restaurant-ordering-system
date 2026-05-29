using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Shared.Realtime;

public static class RestaurantRealtimeHubEndpointExtensions
{
    public const string HubPath = "/hubs/restaurant";

    public static HubEndpointConventionBuilder MapRestaurantRealtimeHub(this IEndpointRouteBuilder endpoints) =>
        endpoints.MapHub<RestaurantRealtimeHub>(HubPath)
            .WithDisplayName("Restaurant realtime hub");
}
