using System.Security.Claims;
using Restaurant.Application.Features.Reservations.CheckIn;

namespace Restaurant.Api.Modules.Reservation;

public static class ReservationCheckInEndpoints
{
    public static IEndpointRouteBuilder MapReservationCheckInEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/v1/reservations/{id:guid}/check-in", CheckInAsync)
            .WithTags("Reservations")
            .WithName("CheckInReservation")
            .WithSummary("Check-in a confirmed reservation and open a table session.")
            .Produces<ApiResponse<CheckInReservationResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status403Forbidden)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity);

        return endpoints;
    }

    private static async Task<IResult> CheckInAsync(
        Guid id,
        ClaimsPrincipal user,
        CheckInReservationService service,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        if (user.Identity?.IsAuthenticated != true ||
            !Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var createdBy))
        {
            return Error(
                StatusCodes.Status401Unauthorized,
                "UNAUTHORIZED",
                "Authentication is required.",
                httpContext.TraceIdentifier);
        }

        if (!user.IsInRole("Staff") && !user.IsInRole("Manager"))
        {
            return Error(
                StatusCodes.Status403Forbidden,
                "FORBIDDEN",
                "Only Staff or Manager can check in reservations.",
                httpContext.TraceIdentifier);
        }

        var result = await service.ExecuteAsync(id, createdBy, cancellationToken);
        if (result.IsSuccess)
        {
            return TypedResults.Created(
                $"/api/v1/table-sessions/{result.Response!.TableSessionId}",
                new ApiResponse<CheckInReservationResponse>(true, result.Response));
        }

        var statusCode = result.FailureType switch
        {
            CheckInFailureType.NotFound => StatusCodes.Status404NotFound,
            CheckInFailureType.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status422UnprocessableEntity
        };

        return Error(statusCode, result.ErrorCode!, result.ErrorMessage!, httpContext.TraceIdentifier);
    }

    private static IResult Error(int statusCode, string code, string message, string traceId) =>
        TypedResults.Json(
            new ApiErrorResponse(false, new ApiError(code, message, [], traceId)),
            statusCode: statusCode);
}

public sealed record ApiResponse<T>(bool Success, T Data);

public sealed record ApiErrorResponse(bool Success, ApiError Error);

public sealed record ApiError(string Code, string Message, object[] Details, string TraceId);
