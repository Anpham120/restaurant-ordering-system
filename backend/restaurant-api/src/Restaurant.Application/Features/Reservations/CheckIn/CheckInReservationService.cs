using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Reservations.CheckIn;

public sealed class CheckInReservationService(
    IReservationCheckInStore store,
    ISessionTokenGenerator tokenGenerator,
    TimeProvider timeProvider)
{
    public async Task<CheckInReservationResult> ExecuteAsync(
        Guid reservationId,
        Guid createdBy,
        CancellationToken cancellationToken)
    {
        var reservation = await store.FindReservationAsync(reservationId, cancellationToken);
        if (reservation is null)
        {
            return CheckInReservationResult.Failure(
                "NOT_FOUND",
                "Reservation was not found.",
                CheckInFailureType.NotFound);
        }

        if (reservation.Status != nameof(ReservationStatus.Confirmed))
        {
            return CheckInReservationResult.Failure(
                "BUSINESS_RULE_VIOLATION",
                "Only confirmed reservations can be checked in.",
                CheckInFailureType.BusinessRuleViolation);
        }

        if (reservation.AssignedTable is null)
        {
            return CheckInReservationResult.Failure(
                "BUSINESS_RULE_VIOLATION",
                "Reservation must have an assigned table before check-in.",
                CheckInFailureType.BusinessRuleViolation);
        }

        if (await store.HasActiveSessionAsync(reservation.AssignedTable.Id, cancellationToken))
        {
            return CheckInReservationResult.Failure(
                "CONFLICT",
                "The assigned table already has an active session.",
                CheckInFailureType.Conflict);
        }

        if (reservation.AssignedTable.Status is nameof(TableStatus.Occupied) or
            nameof(TableStatus.Cleaning) or
            nameof(TableStatus.Inactive))
        {
            return CheckInReservationResult.Failure(
                "BUSINESS_RULE_VIOLATION",
                $"Table cannot be occupied while its status is {reservation.AssignedTable.Status}.",
                CheckInFailureType.BusinessRuleViolation);
        }

        var openedAt = timeProvider.GetUtcNow();
        var tableSession = new TableSession
        {
            Id = Guid.NewGuid(),
            TableId = reservation.AssignedTable.Id,
            ReservationId = reservation.Id,
            SessionToken = tokenGenerator.Create(),
            Status = TableSessionStatus.Active.ToString(),
            OpenedAt = openedAt,
            CreatedBy = createdBy
        };

        reservation.Status = nameof(ReservationStatus.CheckedIn);
        reservation.UpdatedAt = openedAt;
        reservation.AssignedTable.Status = nameof(TableStatus.Occupied);
        reservation.AssignedTable.UpdatedAt = openedAt;

        store.Add(tableSession);
        try
        {
            await store.SaveChangesAsync(cancellationToken);
        }
        catch (ActiveTableSessionConflictException)
        {
            return CheckInReservationResult.Failure(
                "CONFLICT",
                "The assigned table already has an active session.",
                CheckInFailureType.Conflict);
        }

        return CheckInReservationResult.Success(new CheckInReservationResponse(
            tableSession.Id,
            tableSession.SessionToken,
            tableSession.TableId,
            tableSession.Status));
    }
}

public sealed record CheckInReservationResponse(
    Guid TableSessionId,
    string SessionToken,
    Guid TableId,
    string Status);

public enum CheckInFailureType
{
    NotFound,
    Conflict,
    BusinessRuleViolation
}

public sealed record CheckInReservationResult(
    CheckInReservationResponse? Response,
    string? ErrorCode,
    string? ErrorMessage,
    CheckInFailureType? FailureType)
{
    public bool IsSuccess => Response is not null;

    public static CheckInReservationResult Success(CheckInReservationResponse response) =>
        new(response, null, null, null);

    public static CheckInReservationResult Failure(
        string errorCode,
        string errorMessage,
        CheckInFailureType failureType) =>
        new(null, errorCode, errorMessage, failureType);
}
