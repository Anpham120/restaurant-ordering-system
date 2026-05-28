using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Ordering.Orders;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Ordering.Orders;

public sealed class CreateOrderHandler(RestaurantDbContext db)
{
    public async Task<CreateOrderResult> HandleAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        ValidateRequest(request);

        var sessionToken = request.SessionToken.Trim();
        var tableSession = await db.TableSessions
            .AsNoTracking()
            .SingleOrDefaultAsync(
                session => session.SessionToken == sessionToken,
                ct);

        if (tableSession is null)
            throw new OrderingNotFoundException("Khong tim thay phien ban.");

        if (!string.Equals(tableSession.Status, TableSessionStatus.Active.ToString(), StringComparison.Ordinal))
            throw new OrderingBusinessRuleException("Phien ban khong con hoat dong.");

        var existingOrder = await FindExistingOrderAsync(tableSession.Id, request.IdempotencyKey, ct);
        if (existingOrder is not null)
            return BuildReplayResult(existingOrder, request);

        var menuItemIds = request.Items.Select(item => item.MenuItemId).Distinct().ToList();
        var menuItems = await db.MenuItems
            .AsNoTracking()
            .Where(item => menuItemIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, ct);

        if (menuItems.Count != menuItemIds.Count)
            throw new OrderingBusinessRuleException("Mot hoac nhieu mon khong ton tai.");

        if (menuItems.Values.Any(item => !item.IsAvailable))
            throw new OrderingBusinessRuleException("Mot hoac nhieu mon khong con ban.");

        var now = DateTimeOffset.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TableSessionId = tableSession.Id,
            OrderCode = GenerateOrderCode(now),
            IdempotencyKey = request.IdempotencyKey.Trim(),
            Status = OrderStatus.Pending.ToString(),
            CreatedAt = now,
            UpdatedAt = now,
        };

        foreach (var requestItem in request.Items)
        {
            var menuItem = menuItems[requestItem.MenuItemId];
            order.OrderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                MenuItemId = requestItem.MenuItemId,
                MenuItemName = menuItem.Name,
                UnitPrice = menuItem.Price,
                Quantity = requestItem.Quantity,
                Note = IdempotencyPayloadComparer.NormalizeNote(requestItem.Note),
                Status = OrderItemStatus.Pending.ToString(),
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        db.Orders.Add(order);

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            db.ChangeTracker.Clear();

            var conflictingOrder = await FindExistingOrderAsync(tableSession.Id, request.IdempotencyKey, ct);
            if (conflictingOrder is not null)
                return BuildReplayResult(conflictingOrder, request);

            throw;
        }

        return new CreateOrderResult
        {
            Order = ToDto(order),
            IsDuplicateReplay = false,
        };
    }

    private static void ValidateRequest(CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SessionToken))
            throw new OrderingValidationException("SessionToken khong duoc de trong.");

        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            throw new OrderingValidationException("IdempotencyKey khong duoc de trong.");

        if (request.Items.Count == 0)
            throw new OrderingValidationException("Order phai co it nhat mot mon.");

        if (request.Items.Any(item => item.MenuItemId == Guid.Empty))
            throw new OrderingValidationException("MenuItemId khong hop le.");

        if (request.Items.Any(item => item.Quantity <= 0))
            throw new OrderingValidationException("So luong mon phai lon hon 0.");
    }

    private async Task<Order?> FindExistingOrderAsync(
        Guid tableSessionId,
        string idempotencyKey,
        CancellationToken ct)
    {
        var normalizedKey = idempotencyKey.Trim();

        return await db.Orders
            .Include(order => order.OrderItems.OrderBy(item => item.CreatedAt))
            .SingleOrDefaultAsync(
                order => order.TableSessionId == tableSessionId
                    && order.IdempotencyKey == normalizedKey,
                ct);
    }

    private static CreateOrderResult BuildReplayResult(Order existingOrder, CreateOrderRequest request)
    {
        var existingPayload = existingOrder.OrderItems.Select(item => new IdempotencyPayloadItem
        {
            MenuItemId = item.MenuItemId,
            Quantity = item.Quantity,
            Note = item.Note,
        });

        var requestedPayload = request.Items.Select(item => new IdempotencyPayloadItem
        {
            MenuItemId = item.MenuItemId,
            Quantity = item.Quantity,
            Note = item.Note,
        });

        if (!IdempotencyPayloadComparer.HasSamePayload(existingPayload, requestedPayload))
            throw new IdempotencyConflictException("IdempotencyKey da duoc su dung voi payload khac.");

        return new CreateOrderResult
        {
            Order = ToDto(existingOrder),
            IsDuplicateReplay = true,
        };
    }

    private static OrderDto ToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            TableSessionId = order.TableSessionId,
            Status = order.Status,
            Items = order.OrderItems
                .OrderBy(item => item.CreatedAt)
                .Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    MenuItemId = item.MenuItemId,
                    MenuItemName = item.MenuItemName,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    Note = item.Note,
                    Status = item.Status,
                })
                .ToList(),
        };
    }

    private static string GenerateOrderCode(DateTimeOffset now)
    {
        return $"ORD-{now:yyyyMMddHHmmssfff}-{Random.Shared.Next(1000, 10000)}";
    }
}
