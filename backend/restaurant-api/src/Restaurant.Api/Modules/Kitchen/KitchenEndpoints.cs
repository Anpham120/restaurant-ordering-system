using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Kitchen;

namespace Restaurant.Api.Modules.Kitchen;

/// <summary>
/// Endpoints cho Kitchen Module.
/// GET   /api/v1/kitchen/order-items                — Kitchen, Manager
/// PATCH /api/v1/kitchen/order-items/{id}/status    — Kitchen, Manager
/// Theo docs/api-contract.md mục 12.
/// </summary>
public static class KitchenEndpoints
{
    public static IEndpointRouteBuilder MapKitchenEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/kitchen").WithTags("Kitchen");

        // GET /api/v1/kitchen/order-items
        group.MapGet("/order-items", async (
            [FromQuery] string? status,
            GetKitchenOrderItemsUseCase useCase,
            CancellationToken ct) =>
        {
            var items = await useCase.ExecuteAsync(status, ct);
            return Results.Json(new { success = true, data = items });
        })
        .RequireAuthorization(p => p.RequireRole("Kitchen", "Manager"))
        .WithName("GetKitchenOrderItems")
        .WithSummary("Danh sách món cho Kitchen Display (Kitchen, Manager)");

        // PATCH /api/v1/kitchen/order-items/{id}/status
        group.MapPatch("/order-items/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateOrderItemStatusRequest request,
            UpdateOrderItemStatusUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request.Status, ct);

            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404,
                    "VALIDATION_ERROR" => 400,
                    "BUSINESS_RULE_VIOLATION" => 422,
                    _ => 500
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }

            return Results.Json(new { success = true, message = "Cập nhật trạng thái thành công" });
        })
        .RequireAuthorization(p => p.RequireRole("Kitchen", "Manager"))
        .WithName("UpdateOrderItemStatus")
        .WithSummary("Cập nhật trạng thái món (Kitchen, Manager)");

        return app;
    }
}
