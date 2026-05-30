using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Kitchen;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Kitchen;

public class KitchenRepository(RestaurantDbContext dbContext) : IKitchenRepository
{
    public async Task<List<KitchenOrderItemDto>> GetOrderItemsAsync(string? status, CancellationToken ct = default)
    {
        var query = dbContext.OrderItems
            .Include(oi => oi.Order)
                .ThenInclude(o => o.TableSession)
                    .ThenInclude(ts => ts.Table)
            .AsNoTracking();

        query = string.IsNullOrWhiteSpace(status)
            ? query.Where(oi => oi.Status == "Pending" || oi.Status == "Preparing" || oi.Status == "Ready")
            : query.Where(oi => oi.Status == status);

        return await query
            .OrderBy(oi => oi.CreatedAt)
            .Select(oi => new KitchenOrderItemDto(
                oi.Id, oi.OrderId, oi.Order.OrderCode,
                oi.Order.TableSession.Table.TableNumber,
                oi.MenuItemName, oi.Quantity, oi.Note, oi.Status,
                oi.CreatedAt, oi.StartedAt, oi.ReadyAt))
            .ToListAsync(ct);
    }

    public async Task<OrderItem?> GetOrderItemByIdAsync(Guid id, CancellationToken ct = default)
        => await dbContext.OrderItems
            .Include(oi => oi.Order)
                .ThenInclude(o => o.TableSession)
                    .ThenInclude(ts => ts.Table)
            .FirstOrDefaultAsync(oi => oi.Id == id, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await dbContext.SaveChangesAsync(ct);
}
