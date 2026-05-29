using Restaurant.Domain.Entities;

namespace Restaurant.Application.Features.Kitchen;

public interface IKitchenRepository
{
    Task<List<KitchenOrderItemDto>> GetOrderItemsAsync(string? status, CancellationToken ct = default);
    Task<OrderItem?> GetOrderItemByIdAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
