using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Modules.Reservation.DTOs;
using Restaurant.Application.Modules.Reservation.UseCases;

namespace Restaurant.Api.Modules.Reservation;

/// <summary>
/// Endpoints cho Reservation Module.
/// POST  /api/v1/reservations                      — public
/// GET   /api/v1/reservations/{reservationCode}    — public
/// GET   /api/v1/reservations                      — Staff, Manager
/// PATCH /api/v1/reservations/{id}/confirm         — Staff, Manager
/// PATCH /api/v1/reservations/{id}/cancel          — Staff, Manager
/// POST  /api/v1/reservations/{id}/check-in        — Staff, Manager
/// Theo docs/api-contract.md mục 9.
/// </summary>
public static class ReservationEndpoints
{
    public static IEndpointRouteBuilder MapReservationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/reservations").WithTags("Reservation");

        // POST /api/v1/reservations — public
        group.MapPost("/", async (
            [FromBody] CreateReservationRequest request,
            CreateReservationUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: 400);

            return Results.Json(new
            {
                success = true,
                data = new
                {
                    id = result.Reservation!.Id,
                    reservationCode = result.Reservation.ReservationCode,
                    status = result.Reservation.Status
                }
            }, statusCode: 201);
        })
        .AllowAnonymous()
        .WithName("CreateReservation")
        .WithSummary("Khách đặt bàn (public)");

        // GET /api/v1/reservations/{reservationCode} — public
        group.MapGet("/{reservationCode}", async (
            string reservationCode,
            GetReservationByCodeUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(reservationCode, ct);
            if (result is null)
                return Results.Json(new { success = false, error = new { code = "NOT_FOUND", message = "Đặt bàn không tồn tại." } },
                    statusCode: 404);

            return Results.Json(new { success = true, data = result });
        })
        .AllowAnonymous()
        .WithName("GetReservationByCode")
        .WithSummary("Tra cứu đặt bàn theo mã (public)");

        // GET /api/v1/reservations — Staff, Manager
        group.MapGet("/", async (
            [FromQuery] string? status,
            [FromQuery] string? date,
            GetReservationsUseCase useCase,
            CancellationToken ct) =>
        {
            DateOnly? dateOnly = null;
            if (!string.IsNullOrWhiteSpace(date) && DateOnly.TryParse(date, out var parsedDate))
                dateOnly = parsedDate;

            var result = await useCase.ExecuteAsync(status, dateOnly, ct);
            return Results.Json(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("GetReservations")
        .WithSummary("Danh sách đặt bàn (Staff, Manager)");

        // PATCH /api/v1/reservations/{id}/confirm — Staff, Manager
        group.MapPatch("/{id:guid}/confirm", async (
            Guid id,
            [FromBody] ConfirmReservationRequest request,
            ConfirmReservationUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Reservation });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("ConfirmReservation")
        .WithSummary("Xác nhận và gán bàn (Staff, Manager)");

        // PATCH /api/v1/reservations/{id}/cancel — Staff, Manager
        group.MapPatch("/{id:guid}/cancel", async (
            Guid id,
            CancelReservationUseCase useCase,
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
            return Results.Json(new { success = true, message = "Đã hủy đặt bàn thành công." });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("CancelReservation")
        .WithSummary("Hủy đặt bàn (Staff, Manager)");

        // POST /api/v1/reservations/{id}/check-in — Staff, Manager
        group.MapPost("/{id:guid}/check-in", async (
            Guid id,
            ClaimsPrincipal principal,
            CheckInReservationUseCase useCase,
            CancellationToken ct) =>
        {
            var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

            if (!Guid.TryParse(userIdStr, out var staffUserId))
                return Results.Json(new { success = false, error = new { code = "UNAUTHORIZED", message = "Không xác định được người dùng." } },
                    statusCode: 401);

            var result = await useCase.ExecuteAsync(id, staffUserId, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }

            return Results.Json(new
            {
                success = true,
                data = new
                {
                    tableSessionId = result.Session!.Id,
                    sessionToken = result.Session.SessionToken,
                    tableId = result.Session.TableId,
                    status = result.Session.Status
                }
            }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("CheckInReservation")
        .WithSummary("Check-in khách, tạo phiên bàn (Staff, Manager)");

        return app;
    }
}
