using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Orders;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Orders;

public sealed class CreateOrderHandler(RestaurantDbContext dbContext, TimeProvider timeProvider)
{
    public async Task<CreateOrderResult> HandleAsync(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var normalizedToken = request.SessionToken.Trim();
        var normalizedIdempotencyKey = request.IdempotencyKey.Trim();

        var session = await dbContext.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Orders)
                .ThenInclude(o => o.OrderItems)
            .FirstOrDefaultAsync(s => s.SessionToken == normalizedToken, cancellationToken);

        if (session is null || session.Status != TableSessionStatus.Active.ToString())
        {
            return CreateOrderResult.Fail("NOT_FOUND", "Không tìm thấy phiên bàn đang hoạt động.");
        }

        var existingOrder = session.Orders.FirstOrDefault(o => o.IdempotencyKey == normalizedIdempotencyKey);
        if (existingOrder is not null)
        {
            return IsSamePayload(existingOrder, request.Items)
                ? CreateOrderResult.Success(ToResponse(existingOrder), ToEvent(existingOrder, session.Table.TableNumber))
                : CreateOrderResult.Fail("IDEMPOTENCY_CONFLICT", "Idempotency key đã được dùng cho payload khác.", 409);
        }

        var menuItemIds = request.Items.Select(i => i.MenuItemId).Distinct().ToArray();
        var menuItems = await dbContext.MenuItems
            .Where(i => menuItemIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, cancellationToken);

        var missingOrUnavailableItem = request.Items
            .FirstOrDefault(i => !menuItems.TryGetValue(i.MenuItemId, out var menuItem) || !menuItem.IsAvailable);

        if (missingOrUnavailableItem is not null)
        {
            return CreateOrderResult.Fail("BUSINESS_RULE_VIOLATION", "Món không tồn tại hoặc đang ngừng bán.", 422);
        }

        var now = timeProvider.GetUtcNow();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TableSessionId = session.Id,
            OrderCode = $"ORD-{now:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..25],
            IdempotencyKey = normalizedIdempotencyKey,
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
                MenuItemId = menuItem.Id,
                MenuItemName = menuItem.Name,
                UnitPrice = menuItem.Price,
                Quantity = requestItem.Quantity,
                Note = string.IsNullOrWhiteSpace(requestItem.Note) ? null : requestItem.Note.Trim(),
                Status = OrderItemStatus.Pending.ToString(),
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreateOrderResult.Success(ToResponse(order), ToEvent(order, session.Table.TableNumber), 201);
    }

    private static bool IsSamePayload(Order order, IReadOnlyCollection<CreateOrderItemRequest> requestItems)
    {
        var existing = order.OrderItems
            .Select(i => new PayloadItem(i.MenuItemId, i.Quantity, NormalizeNote(i.Note)))
            .OrderBy(i => i.MenuItemId)
            .ThenBy(i => i.Quantity)
            .ThenBy(i => i.Note)
            .ToArray();

        var requested = requestItems
            .Select(i => new PayloadItem(i.MenuItemId, i.Quantity, NormalizeNote(i.Note)))
            .OrderBy(i => i.MenuItemId)
            .ThenBy(i => i.Quantity)
            .ThenBy(i => i.Note)
            .ToArray();

        return existing.SequenceEqual(requested);
    }

    private static string NormalizeNote(string? note) => string.IsNullOrWhiteSpace(note) ? string.Empty : note.Trim();

    private static OrderResponse ToResponse(Order order) =>
        new(
            order.Id,
            order.OrderCode,
            order.TableSessionId,
            order.Status,
            order.OrderItems
                .OrderBy(i => i.CreatedAt)
                .Select(i => new OrderItemResponse(i.Id, i.MenuItemId, i.MenuItemName, i.UnitPrice, i.Quantity, i.Note, i.Status))
                .ToArray());

    private static NewOrderCreatedEvent ToEvent(Order order, string tableNumber) =>
        new(order.Id, order.OrderCode, order.TableSessionId, tableNumber, order.CreatedAt);

    private sealed record PayloadItem(Guid MenuItemId, int Quantity, string Note);
}

public sealed record CreateOrderResult(
    bool IsSuccess,
    OrderResponse? Response,
    NewOrderCreatedEvent? Event,
    int StatusCode,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static CreateOrderResult Success(
        OrderResponse response,
        NewOrderCreatedEvent @event,
        int statusCode = 200) =>
        new(true, response, @event, statusCode, null, null);

    public static CreateOrderResult Fail(
        string code,
        string message,
        int statusCode = 404) =>
        new(false, null, null, statusCode, code, message);
}
