namespace Restaurant.Application.Features.Tables;

public record AreaDto(Guid Id, string Name, string? Description);

public record TableDto(Guid Id, Guid AreaId, string AreaName, string TableNumber, int Capacity, string Status);

public record CreateTableRequest(Guid AreaId, string TableNumber, int Capacity);

public record UpdateTableRequest(Guid AreaId, string TableNumber, int Capacity);

public record UpdateTableStatusRequest(string Status);
