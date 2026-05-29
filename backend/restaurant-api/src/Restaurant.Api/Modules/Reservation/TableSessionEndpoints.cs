using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Reservations;

namespace Restaurant.Api.Modules.Reservation;

public static class TableSessionEndpoints
{
    public static IEndpointRouteBuilder MapTableSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/table-sessions").WithTags("TableSession");

        // POST / — Staff, Manager
        group.MapPost("/", async (
            [FromBody] CreateTableSessionRequest request,
            ClaimsPrincipal principal,
            CreateTableSessionUseCase useCase, CancellationToken ct) =>
        {
            if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var staffUserId))
                return Results.Unauthorized();

            var result = await useCase.ExecuteAsync(request, staffUserId, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Session }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("CreateTableSession");

        // GET /by-token/{sessionToken} — public
        group.MapGet("/by-token/{sessionToken}", async (
            string sessionToken,
            GetTableSessionByTokenUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(sessionToken, ct);
            if (result is null)
                return Results.NotFound(new { success = false, error = new { code = "NOT_FOUND", message = "Phiên bàn không tồn tại." } });
            return Results.Ok(new { success = true, data = result });
        })
        .AllowAnonymous()
        .WithName("GetTableSessionByToken");

        // GET /{id} — Staff, Manager, Cashier
        group.MapGet("/{id:guid}", async (
            Guid id,
            GetTableSessionByIdUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, ct);
            if (result is null)
                return Results.NotFound(new { success = false, error = new { code = "NOT_FOUND", message = "Phiên bàn không tồn tại." } });
            return Results.Ok(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithName("GetTableSessionById");

        // PATCH /{id}/close — Cashier, Manager
        group.MapPatch("/{id:guid}/close", async (
            Guid id,
            CloseTableSessionUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Ok(new { success = true, data = result.Session });
        })
        .RequireAuthorization(p => p.RequireRole("Cashier", "Manager"))
        .WithName("CloseTableSession");

        return app;
    }
}
