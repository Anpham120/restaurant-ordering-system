using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Reservations;

namespace Restaurant.Api.Modules.Reservation;

public static class ReservationEndpoints
{
    public static IEndpointRouteBuilder MapReservationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/reservations").WithTags("Reservation");

        // POST — public
        group.MapPost("/", async (
            [FromBody] CreateReservationRequest request,
            CreateReservationUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
                return Results.BadRequest(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } });

            return Results.Json(new
            {
                success = true,
                data = new { result.Reservation!.Id, result.Reservation.ReservationCode, result.Reservation.Status }
            }, statusCode: 201);
        })
        .AllowAnonymous()
        .WithName("CreateReservation");

        // GET /{reservationCode} — public
        group.MapGet("/{reservationCode}", async (
            string reservationCode,
            GetReservationByCodeUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(reservationCode, ct);
            if (result is null)
                return Results.NotFound(new { success = false, error = new { code = "NOT_FOUND", message = "Đặt bàn không tồn tại." } });
            return Results.Ok(new { success = true, data = result });
        })
        .AllowAnonymous()
        .WithName("GetReservationByCode");

        // GET / — Staff, Manager
        group.MapGet("/", async (
            [FromQuery] string? status,
            [FromQuery] string? date,
            GetReservationsUseCase useCase, CancellationToken ct) =>
        {
            DateOnly? dateOnly = null;
            if (!string.IsNullOrWhiteSpace(date) && DateOnly.TryParse(date, out var d))
                dateOnly = d;
            var result = await useCase.ExecuteAsync(status, dateOnly, ct);
            return Results.Ok(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("GetReservations");

        // PATCH /{id}/confirm — Staff, Manager
        group.MapPatch("/{id:guid}/confirm", async (
            Guid id,
            [FromBody] ConfirmReservationRequest request,
            ConfirmReservationUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Ok(new { success = true, data = result.Reservation });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("ConfirmReservation");

        // PATCH /{id}/cancel — Staff, Manager
        group.MapPatch("/{id:guid}/cancel", async (
            Guid id,
            CancelReservationUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "BUSINESS_RULE_VIOLATION" => 422, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Ok(new { success = true, message = "Đã hủy đặt bàn thành công." });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("CancelReservation");

        return app;
    }
}
