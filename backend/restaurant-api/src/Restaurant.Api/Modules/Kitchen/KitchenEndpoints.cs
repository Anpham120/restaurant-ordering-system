using Microsoft.AspNetCore.SignalR;
using Restaurant.Api.Hubs;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Application.Features.Kitchen;
using Restaurant.Infrastructure.Features.Kitchen;

namespace Restaurant.Api.Modules.Kitchen;

public static class KitchenEndpoints
{
    public static IEndpointRouteBuilder MapKitchenEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/v1/kitchen/order-items")
            .WithTags("Kitchen");

        group.MapGet("/", async (
            string? status,
            GetKitchenOrderItemsHandler handler,
            CancellationToken cancellationToken) =>
        {
            var data = await handler.HandleAsync(status, cancellationToken);
            return TypedResults.Ok(new ApiResponse<IReadOnlyCollection<KitchenOrderItemResponse>>(true, data));
        })
        .WithName("GetKitchenOrderItems");

        group.MapPatch("/{id:guid}/status", UpdateStatusAsync)
            .WithName("UpdateKitchenOrderItemStatus");

        return endpoints;
    }

    private static async Task<IResult> UpdateStatusAsync(
        Guid id,
        UpdateKitchenOrderItemStatusRequest request,
        UpdateKitchenOrderItemStatusHandler handler,
        IHubContext<RestaurantHub> hubContext,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, request, cancellationToken);
        if (!result.IsSuccess)
        {
            return Error(result.StatusCode, result.ErrorCode!, result.ErrorMessage!, httpContext.TraceIdentifier);
        }

        var eventName = result.Event!.Status switch
        {
            "Preparing" => "OrderItemPreparing",
            "Ready" => "OrderItemReady",
            "Served" => "OrderItemServed",
            _ => null,
        };

        if (eventName is not null)
        {
            await hubContext.Clients.All.SendAsync(eventName, result.Event, cancellationToken);
        }

        return TypedResults.Ok(new ApiResponse<KitchenOrderItemResponse>(true, result.Response!));
    }

    private static IResult Error(int statusCode, string code, string message, string traceId) =>
        TypedResults.Json(
            new ApiErrorResponse(false, new ApiError(code, message, [], traceId)),
            statusCode: statusCode);
}
