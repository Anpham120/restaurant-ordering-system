using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Shared.Realtime;
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
        IRestaurantRealtimePublisher publisher,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, request, cancellationToken);
        if (!result.IsSuccess)
        {
            return Error(result.StatusCode, result.ErrorCode!, result.ErrorMessage!, httpContext.TraceIdentifier);
        }

        var ev = result.Event!;
        var payload = new OrderItemStatusRealtimePayload(ev.OrderItemId, ev.OrderId, ev.Status);

        var publish = ev.Status switch
        {
            "Preparing" => publisher.PublishOrderItemPreparingAsync(payload, result.SessionToken, cancellationToken),
            "Ready" => publisher.PublishOrderItemReadyAsync(payload, result.SessionToken, cancellationToken),
            "Served" => publisher.PublishOrderItemServedAsync(payload, result.SessionToken, cancellationToken),
            _ => Task.CompletedTask,
        };
        await publish;

        return TypedResults.Ok(new ApiResponse<KitchenOrderItemResponse>(true, result.Response!));
    }

    private static IResult Error(int statusCode, string code, string message, string traceId) =>
        TypedResults.Json(
            new ApiErrorResponse(false, new ApiError(code, message, [], traceId)),
            statusCode: statusCode);
}
