using Restaurant.Application.Modules.Kitchen.DTOs;
using Restaurant.Application.Modules.Kitchen.Interfaces;
using Restaurant.Domain.Enums;

namespace Restaurant.Application.Modules.Kitchen.UseCases;

public class UpdateOrderItemStatusUseCase(IKitchenRepository kitchenRepository)
{
    public async Task<UpdateOrderItemStatusResult> ExecuteAsync(Guid id, string newStatus, CancellationToken ct = default)
    {
        var item = await kitchenRepository.GetOrderItemByIdAsync(id, ct);
        if (item is null)
        {
            return new UpdateOrderItemStatusResult(false, "NOT_FOUND", "Không tìm thấy món trong order.");
        }

        if (!Enum.TryParse<OrderItemStatus>(newStatus, out var targetStatus))
        {
            return new UpdateOrderItemStatusResult(false, "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
        }

        if (!Enum.TryParse<OrderItemStatus>(item.Status, out var currentStatus))
        {
            return new UpdateOrderItemStatusResult(false, "INTERNAL_ERROR", "Trạng thái hiện tại không hợp lệ.");
        }

        // Rule: Pending -> Preparing -> Ready -> Served
        // Cancelled is terminal, we don't handle transitions TO Cancelled here (usually handled by cancel flow) or from Cancelled.
        var isValidTransition = (currentStatus, targetStatus) switch
        {
            (OrderItemStatus.Pending, OrderItemStatus.Preparing) => true,
            (OrderItemStatus.Preparing, OrderItemStatus.Ready) => true,
            (OrderItemStatus.Ready, OrderItemStatus.Served) => true,
            _ => false
        };

        if (!isValidTransition)
        {
            return new UpdateOrderItemStatusResult(false, "BUSINESS_RULE_VIOLATION", $"Không thể chuyển từ {currentStatus} sang {targetStatus}.");
        }

        item.Status = targetStatus.ToString();
        var now = DateTimeOffset.UtcNow;
        item.UpdatedAt = now;

        switch (targetStatus)
        {
            case OrderItemStatus.Preparing:
                item.StartedAt = now;
                break;
            case OrderItemStatus.Ready:
                item.ReadyAt = now;
                break;
            case OrderItemStatus.Served:
                item.ServedAt = now;
                break;
        }

        await kitchenRepository.SaveChangesAsync(ct);

        // TODO: Phát SignalR event (OrderItemPreparing, OrderItemReady, OrderItemServed) ở đây

        return new UpdateOrderItemStatusResult(true, null, null);
    }
}
