using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Restaurant.Application.Features.Ordering.Orders;
using Restaurant.Infrastructure.Features.Ordering.Orders;

namespace Restaurant.Api.Modules.Ordering;

public static class OrdersEndpoints
{
    public static IEndpointRouteBuilder MapOrdersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/orders")
            .WithTags("Orders");

        group.MapPost("/", async (
            CreateOrderRequest request,
            CreateOrderHandler handler,
            CancellationToken ct) =>
        {
            try
            {
                var result = await handler.HandleAsync(request, ct);
                var body = new { success = true, data = result.Order };

                return result.IsDuplicateReplay
                    ? Results.Ok(body)
                    : Results.Created($"/api/v1/orders/{result.Order.Id}", body);
            }
            catch (OrderingValidationException ex)
            {
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = ex.Message }
                });
            }
            catch (OrderingNotFoundException ex)
            {
                return Results.NotFound(new
                {
                    success = false,
                    error = new { code = "NOT_FOUND", message = ex.Message }
                });
            }
            catch (IdempotencyConflictException ex)
            {
                return Results.Conflict(new
                {
                    success = false,
                    error = new { code = "IDEMPOTENCY_CONFLICT", message = ex.Message }
                });
            }
            catch (OrderingBusinessRuleException ex)
            {
                return Results.UnprocessableEntity(new
                {
                    success = false,
                    error = new { code = "BUSINESS_RULE_VIOLATION", message = ex.Message }
                });
            }
        })
        .WithName("CreateOrder")
        .AllowAnonymous();

        return app;
    }
}

