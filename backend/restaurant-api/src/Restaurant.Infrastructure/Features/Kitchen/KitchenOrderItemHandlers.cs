using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Kitchen;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Kitchen;

public sealed class GetKitchenOrderItemsHandler(RestaurantDbContext dbContext)
{
    private static readonly string[] DefaultStatuses =
    [
        nameof(OrderItemStatus.Pending),
        nameof(OrderItemStatus.Preparing),
        nameof(OrderItemStatus.Ready),
    ];

    public async Task<IReadOnlyCollection<KitchenOrderItemResponse>> HandleAsync(string? status, CancellationToken cancellationToken)
    {
        var statuses = string.IsNullOrWhiteSpace(status)
            ? DefaultStatuses
            : [status.Trim()];

        return await dbContext.OrderItems
            .AsNoTracking()
            .Include(i => i.Order)
                .ThenInclude(o => o.TableSession)
                    .ThenInclude(s => s.Table)
            .Where(i => statuses.Contains(i.Status))
            .OrderBy(i => i.CreatedAt)
            .Select(i => new KitchenOrderItemResponse(
                i.Id,
                i.OrderId,
                i.Order.OrderCode,
                i.Order.TableSessionId,
                i.Order.TableSession.TableId,
                i.Order.TableSession.Table.TableNumber,
                i.MenuItemId,
                i.MenuItemName,
                i.UnitPrice,
                i.Quantity,
                i.Note,
                i.Status,
                i.CreatedAt,
                i.UpdatedAt))
            .ToArrayAsync(cancellationToken);
    }
}

public sealed class UpdateKitchenOrderItemStatusHandler(RestaurantDbContext dbContext, TimeProvider timeProvider)
{
    public async Task<UpdateKitchenOrderItemStatusResult> HandleAsync(
        Guid id,
        UpdateKitchenOrderItemStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderItemStatus>(request.Status, ignoreCase: false, out var nextStatus))
        {
            return UpdateKitchenOrderItemStatusResult.Fail(
                "VALIDATION_ERROR",
                "Trạng thái món không hợp lệ.",
                400);
        }

        var item = await dbContext.OrderItems
            .Include(i => i.Order)
                .ThenInclude(o => o.TableSession)
                    .ThenInclude(s => s.Table)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (item is null)
        {
            return UpdateKitchenOrderItemStatusResult.Fail("NOT_FOUND", "Không tìm thấy món trong bếp.");
        }

        var currentStatus = Enum.Parse<OrderItemStatus>(item.Status);
        if (!CanMove(currentStatus, nextStatus))
        {
            return UpdateKitchenOrderItemStatusResult.Fail(
                "BUSINESS_RULE_VIOLATION",
                $"Không thể chuyển trạng thái từ {currentStatus} sang {nextStatus}.",
                422);
        }

        var now = timeProvider.GetUtcNow();
        item.Status = nextStatus.ToString();
        item.UpdatedAt = now;

        if (nextStatus == OrderItemStatus.Preparing)
        {
            item.StartedAt = now;
            item.Order.Status = OrderStatus.Processing.ToString();
            item.Order.UpdatedAt = now;
        }
        else if (nextStatus == OrderItemStatus.Ready)
        {
            item.ReadyAt = now;
        }
        else if (nextStatus == OrderItemStatus.Served)
        {
            item.ServedAt = now;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new KitchenOrderItemResponse(
            item.Id,
            item.OrderId,
            item.Order.OrderCode,
            item.Order.TableSessionId,
            item.Order.TableSession.TableId,
            item.Order.TableSession.Table.TableNumber,
            item.MenuItemId,
            item.MenuItemName,
            item.UnitPrice,
            item.Quantity,
            item.Note,
            item.Status,
            item.CreatedAt,
            item.UpdatedAt);

        var @event = new OrderItemStatusChangedEvent(item.Id, item.OrderId, item.Status);

        return UpdateKitchenOrderItemStatusResult.Success(response, @event, item.Order.TableSession.SessionToken);
    }

    private static bool CanMove(OrderItemStatus currentStatus, OrderItemStatus nextStatus) =>
        currentStatus == nextStatus ||
        currentStatus == OrderItemStatus.Pending && nextStatus == OrderItemStatus.Preparing ||
        currentStatus == OrderItemStatus.Preparing && nextStatus == OrderItemStatus.Ready ||
        currentStatus == OrderItemStatus.Ready && nextStatus == OrderItemStatus.Served;
}

public sealed record UpdateKitchenOrderItemStatusResult(
    bool IsSuccess,
    KitchenOrderItemResponse? Response,
    OrderItemStatusChangedEvent? Event,
    string? SessionToken,
    int StatusCode,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static UpdateKitchenOrderItemStatusResult Success(
        KitchenOrderItemResponse response,
        OrderItemStatusChangedEvent @event,
        string sessionToken) =>
        new(true, response, @event, sessionToken, 200, null, null);

    public static UpdateKitchenOrderItemStatusResult Fail(
        string code,
        string message,
        int statusCode = 404) =>
        new(false, null, null, null, statusCode, code, message);
}
