using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.UseCases;

namespace Restaurant.Api.Modules.Reservation;

/// <summary>
/// Endpoints cho TableSession Module.
/// POST  /api/v1/table-sessions                        — Staff, Manager
/// GET   /api/v1/table-sessions/{id}                   — Staff, Manager, Cashier
/// GET   /api/v1/table-sessions/by-token/{sessionToken} — public (Customer QR)
/// PATCH /api/v1/table-sessions/{id}/close             — Cashier, Manager
/// Theo docs/api-contract.md mục 10.
/// </summary>
public static class TableSessionEndpoints
{
    public static IEndpointRouteBuilder MapTableSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/table-sessions").WithTags("TableSession");

        // POST /api/v1/table-sessions — Staff, Manager
        group.MapPost("/", async (
            [FromBody] CreateTableSessionRequest request,
            ClaimsPrincipal principal,
            CreateTableSessionUseCase useCase,
            CancellationToken ct) =>
        {
            var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

            if (!Guid.TryParse(userIdStr, out var staffUserId))
                return Results.Json(new { success = false, error = new { code = "UNAUTHORIZED", message = "Không xác định được người dùng." } },
                    statusCode: 401);

            var result = await useCase.ExecuteAsync(request, staffUserId, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }

            return Results.Json(new { success = true, data = result.Session }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("CreateTableSession")
        .WithSummary("Mở phiên bàn không qua đặt bàn (Staff, Manager)");

        // GET /api/v1/table-sessions/by-token/{sessionToken} — public
        group.MapGet("/by-token/{sessionToken}", async (
            string sessionToken,
            GetTableSessionByTokenUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(sessionToken, ct);
            if (result is null)
                return Results.Json(new { success = false, error = new { code = "NOT_FOUND", message = "Phiên bàn không tồn tại." } },
                    statusCode: 404);

            return Results.Json(new { success = true, data = result });
        })
        .AllowAnonymous()
        .WithName("GetTableSessionByToken")
        .WithSummary("Lấy thông tin phiên bàn theo token (Customer QR flow)");

        // GET /api/v1/table-sessions/{id} — Staff, Manager, Cashier
        group.MapGet("/{id:guid}", async (
            Guid id,
            GetTableSessionByIdUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, ct);
            if (result is null)
                return Results.Json(new { success = false, error = new { code = "NOT_FOUND", message = "Phiên bàn không tồn tại." } },
                    statusCode: 404);

            return Results.Json(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithName("GetTableSessionById")
        .WithSummary("Lấy thông tin phiên bàn theo ID (Staff, Manager, Cashier)");

        // PATCH /api/v1/table-sessions/{id}/close — Cashier, Manager
        group.MapPatch("/{id:guid}/close", async (
            Guid id,
            CloseTableSessionUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Session });
        })
        .RequireAuthorization(p => p.RequireRole("Cashier", "Manager"))
        .WithName("CloseTableSession")
        .WithSummary("Đóng phiên bàn sau thanh toán (Cashier, Manager)");

        return app;
    }
}
