using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Repositories;

/// <summary>
/// Triển khai IReservationRepository sử dụng EF Core + PostgreSQL.
/// </summary>
public class ReservationRepository(RestaurantDbContext db) : IReservationRepository
{
    public async Task<Domain.Entities.Reservation?> GetReservationByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Reservations.Include(r => r.AssignedTable).FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<Domain.Entities.Reservation?> GetReservationByCodeAsync(string code, CancellationToken ct = default)
        => await db.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == code, ct);

    public async Task<List<Domain.Entities.Reservation>> GetReservationsAsync(
        ReservationStatus? status, DateOnly? date, CancellationToken ct = default)
    {
        var query = db.Reservations.AsQueryable();

        if (status.HasValue)
        {
            var statusStr = status.Value.ToString();
            query = query.Where(r => r.Status == statusStr);
        }

        if (date.HasValue)
            query = query.Where(r => r.ReservationTime.Date == date.Value.ToDateTime(TimeOnly.MinValue).Date);

        return await query.OrderBy(r => r.ReservationTime).ToListAsync(ct);
    }

    public async Task<bool> ReservationCodeExistsAsync(string code, CancellationToken ct = default)
        => await db.Reservations.AnyAsync(r => r.ReservationCode == code, ct);

    public async Task AddReservationAsync(Domain.Entities.Reservation reservation, CancellationToken ct = default)
        => await db.Reservations.AddAsync(reservation, ct);

    // ── Table Sessions ────────────────────────────────────────────────────────

    public async Task<TableSession?> GetTableSessionByIdAsync(Guid id, CancellationToken ct = default)
        => await db.TableSessions.Include(s => s.Table).FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<TableSession?> GetTableSessionByTokenAsync(string token, CancellationToken ct = default)
        => await db.TableSessions.Include(s => s.Table).FirstOrDefaultAsync(s => s.SessionToken == token, ct);

    public async Task<bool> HasActiveSessionForTableAsync(Guid tableId, CancellationToken ct = default)
    {
        var activeStatusStr = TableSessionStatus.Active.ToString();
        return await db.TableSessions.AnyAsync(s => s.TableId == tableId && s.Status == activeStatusStr, ct);
    }

    public async Task AddTableSessionAsync(TableSession session, CancellationToken ct = default)
        => await db.TableSessions.AddAsync(session, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await db.SaveChangesAsync(ct);
}
