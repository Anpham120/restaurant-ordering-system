using Restaurant.Application.Modules.Kitchen.DTOs;
using Restaurant.Application.Modules.Kitchen.Interfaces;

namespace Restaurant.Application.Modules.Kitchen.UseCases;

public class GetKitchenOrderItemsUseCase(IKitchenRepository kitchenRepository)
{
    public async Task<List<KitchenOrderItemDto>> ExecuteAsync(string? status, CancellationToken ct = default)
    {
        return await kitchenRepository.GetOrderItemsAsync(status, ct);
    }
}
