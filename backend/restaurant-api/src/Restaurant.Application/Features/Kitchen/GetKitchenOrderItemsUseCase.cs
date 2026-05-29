namespace Restaurant.Application.Features.Kitchen;

public class GetKitchenOrderItemsUseCase(IKitchenRepository kitchenRepository)
{
    public async Task<List<KitchenOrderItemDto>> ExecuteAsync(string? status, CancellationToken ct = default)
        => await kitchenRepository.GetOrderItemsAsync(status, ct);
}
