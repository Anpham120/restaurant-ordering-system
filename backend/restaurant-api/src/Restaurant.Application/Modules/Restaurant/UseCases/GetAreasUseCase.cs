using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.Interfaces;

namespace Restaurant.Application.Modules.Restaurant.UseCases;

/// <summary>Lấy danh sách khu vực bàn ăn.</summary>
public class GetAreasUseCase(ITableRepository tableRepository)
{
    public async Task<List<AreaDto>> ExecuteAsync(CancellationToken ct = default)
    {
        var areas = await tableRepository.GetAreasAsync(ct);
        return areas.Select(a => new AreaDto(a.Id, a.Name, a.Description)).ToList();
    }
}
