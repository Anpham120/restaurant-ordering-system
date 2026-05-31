using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Orders;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Orders;

public sealed class GetOrderByIdHandler(RestaurantDbContext dbContext)
{
    public async Task<OrderResponse?> HandleAsync(Guid orderId, string sessionToken, CancellationToken cancellationToken)
    {
        var normalizedToken = sessionToken.Trim();

        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.TableSession)
                .ThenInclude(s => s.Table)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        // Return null for both "missing" and "wrong session" so we don't leak which orders exist.
        if (order is null || order.TableSession.SessionToken != normalizedToken)
        {
            return null;
        }

        return new OrderResponse(
            order.Id,
            order.OrderCode,
            order.TableSessionId,
            order.TableSession.Table.TableNumber,
            order.Status,
            order.CreatedAt,
            order.OrderItems
                .OrderBy(i => i.CreatedAt)
                .Select(i => new OrderItemResponse(i.Id, i.MenuItemId, i.MenuItemName, i.UnitPrice, i.Quantity, i.Note, i.Status))
                .ToArray());
    }
}
