using Microsoft.EntityFrameworkCore;
using Npgsql;
using Restaurant.Application.Features.Reservations.CheckIn;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Reservations.CheckIn;

public sealed class ReservationCheckInStore(RestaurantDbContext dbContext) : IReservationCheckInStore
{
    public Task<Restaurant.Domain.Entities.Reservation?> FindReservationAsync(
        Guid reservationId,
        CancellationToken cancellationToken) =>
        dbContext.Reservations
            .Include(reservation => reservation.AssignedTable)
            .SingleOrDefaultAsync(reservation => reservation.Id == reservationId, cancellationToken);

    public Task<bool> HasActiveSessionAsync(Guid tableId, CancellationToken cancellationToken) =>
        dbContext.TableSessions.AnyAsync(
            session => session.TableId == tableId && session.Status == TableSessionStatus.Active.ToString(),
            cancellationToken);

    public void Add(TableSession tableSession) => dbContext.TableSessions.Add(tableSession);

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: "uq_table_sessions_active_table_id"
            })
        {
            throw new ActiveTableSessionConflictException();
        }
    }
}
