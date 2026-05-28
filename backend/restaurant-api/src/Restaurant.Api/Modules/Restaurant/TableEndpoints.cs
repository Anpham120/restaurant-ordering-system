using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Tables;

namespace Restaurant.Api.Modules.Restaurant;

public static class TableEndpoints
{
    public static IEndpointRouteBuilder MapTableEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/areas", async (
            GetAreasUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(ct);
            return Results.Ok(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithTags("Tables")
        .WithName("GetAreas");

        var tables = app.MapGroup("/api/v1/tables").WithTags("Tables");

        tables.MapGet("/", async (
            [FromQuery] Guid? areaId,
            [FromQuery] string? status,
            GetTablesUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(areaId, status, ct);
            return Results.Ok(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithName("GetTables");

        tables.MapPost("/", async (
            [FromBody] CreateTableRequest request,
            CreateTableUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "CONFLICT" => 409, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Table }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("CreateTable");

        tables.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateTableRequest request,
            UpdateTableUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, "CONFLICT" => 409, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Ok(new { success = true, data = result.Table });
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("UpdateTable");

        tables.MapPatch("/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateTableStatusRequest request,
            UpdateTableStatusUseCase useCase, CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch { "NOT_FOUND" => 404, _ => 400 };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: statusCode);
            }
            return Results.Ok(new { success = true, data = result.Table });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("UpdateTableStatus");

        return app;
    }
}
