using Microsoft.AspNetCore.SignalR;
using Restaurant.Api.Hubs;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Application.Features.Orders;
using Restaurant.Infrastructure.Features.Orders;

namespace Restaurant.Api.Modules.Ordering;

public static class OrdersEndpoints
{
    public static IEndpointRouteBuilder MapOrdersEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/v1/orders")
            .WithTags("Orders");

        group.MapPost("/", CreateOrderAsync)
            .WithName("CreateOrder")
            .AllowAnonymous();

        return endpoints;
    }

    private static async Task<IResult> CreateOrderAsync(
        CreateOrderRequest request,
        CreateOrderHandler handler,
        IHubContext<RestaurantHub> hubContext,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SessionToken) ||
            string.IsNullOrWhiteSpace(request.IdempotencyKey) ||
            request.Items.Count == 0 ||
            request.Items.Any(i => i.MenuItemId == Guid.Empty || i.Quantity <= 0))
        {
            return Error(
                StatusCodes.Status400BadRequest,
                "VALIDATION_ERROR",
                "SessionToken, idempotencyKey và danh sách món hợp lệ là bắt buộc.",
                httpContext.TraceIdentifier);
        }

        var result = await handler.HandleAsync(request, cancellationToken);
        if (!result.IsSuccess)
            return Error(result.StatusCode, result.ErrorCode!, result.ErrorMessage!, httpContext.TraceIdentifier);

        await hubContext.Clients.Group(RestaurantHub.KitchenDisplayGroup)
            .SendAsync("NewOrderCreated", result.Event, cancellationToken);

        return result.StatusCode == StatusCodes.Status201Created
            ? TypedResults.Created($"/api/v1/orders/{result.Response!.Id}", new ApiResponse<OrderResponse>(true, result.Response))
            : TypedResults.Ok(new ApiResponse<OrderResponse>(true, result.Response!));
    }

    private static IResult Error(int statusCode, string code, string message, string traceId) =>
        TypedResults.Json(
            new ApiErrorResponse(false, new ApiError(code, message, [], traceId)),
            statusCode: statusCode);
}
