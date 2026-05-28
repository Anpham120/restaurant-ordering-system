using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Orders;

namespace Restaurant.Api.Modules.Orders;

public static class OrderItemEndpoints
{
    public static IEndpointRouteBuilder MapOrderItemEndpoints(this IEndpointRouteBuilder app)
    {
        var orders = app.MapGroup("/api/v1/order-items").WithTags("OrderItems");

        // POST /api/v1/order-items/{id}/ready
        // Kitchen calls this when a dish is ready to serve.
        // The server broadcasts an OrderItemReady SignalR event to all Staff/Manager clients.
        orders.MapPost("/{id}/ready", async (
            string id,
            [FromBody] MarkOrderItemReadyRequest request,
            IRestaurantHubService hubService,
            CancellationToken ct) =>
        {
            var payload = new OrderItemReadyPayload(
                OrderItemId: id,
                OrderId:     request.OrderId ?? string.Empty,
                Status:      "Ready",
                TableId:     request.TableId,
                TableNumber: request.TableNumber,
                MenuItemName: request.MenuItemName,
                Quantity:    request.Quantity,
                Note:        request.Note,
                ReadyAt:     DateTimeOffset.UtcNow.ToString("o")
            );

            await hubService.SendOrderItemReadyAsync(payload, ct);

            return Results.Ok(new
            {
                success = true,
                message = $"OrderItemReady broadcasted for item {id}",
                data = payload
            });
        })
        .RequireAuthorization(p => p.RequireRole("Kitchen", "Manager"))
        .WithName("MarkOrderItemReady")
        .WithSummary("Đánh dấu món ăn đã sẵn sàng phục vụ — broadcast SignalR tới Staff/Manager");

        return app;
    }
}

/// <summary>
/// Request body for the Mark-Ready endpoint.
/// All fields except <c>OrderId</c> are optional metadata that the frontend
/// uses to display a human-readable notification toast without a follow-up fetch.
/// </summary>
public sealed record MarkOrderItemReadyRequest(
    string? OrderId,
    string? TableId,
    string? TableNumber,
    string? MenuItemName,
    int?    Quantity,
    string? Note
);
