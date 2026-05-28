namespace Restaurant.Application.Features.Tables;

public class GetAreasUseCase(ITableRepository tableRepository)
{
    public async Task<List<AreaDto>> ExecuteAsync(CancellationToken ct = default)
    {
        var areas = await tableRepository.GetAreasAsync(ct);
        return areas.Select(a => new AreaDto(a.Id, a.Name, a.Description)).ToList();
    }
}
