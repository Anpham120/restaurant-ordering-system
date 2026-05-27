using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.UseCases;

namespace Restaurant.Api.Modules.Restaurant;

/// <summary>
/// Endpoints cho Area và Table Module.
/// GET   /api/v1/areas                  — Staff, Manager, Cashier
/// GET   /api/v1/tables                 — Staff, Manager, Cashier
/// POST  /api/v1/tables                 — Manager
/// PUT   /api/v1/tables/{id}            — Manager
/// PATCH /api/v1/tables/{id}/status     — Staff, Manager
/// Theo docs/api-contract.md mục 8.
/// </summary>
public static class TableEndpoints
{
    public static IEndpointRouteBuilder MapTableEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /api/v1/areas
        app.MapGet("/api/v1/areas", async (
            GetAreasUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(ct);
            return Results.Json(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithTags("Tables")
        .WithName("GetAreas")
        .WithSummary("Lấy danh sách khu vực bàn (Staff, Manager, Cashier)");

        var tables = app.MapGroup("/api/v1/tables").WithTags("Tables");

        // GET /api/v1/tables
        tables.MapGet("/", async (
            [FromQuery] Guid? areaId,
            [FromQuery] string? status,
            GetTablesUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(areaId, status, ct);
            return Results.Json(new { success = true, data = result });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager", "Cashier"))
        .WithName("GetTables")
        .WithSummary("Lấy danh sách bàn ăn (Staff, Manager, Cashier)");

        // POST /api/v1/tables
        tables.MapPost("/", async (
            [FromBody] CreateTableRequest request,
            CreateTableUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "CONFLICT" => 409, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Table }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("CreateTable")
        .WithSummary("Tạo bàn ăn mới (Manager)");

        // PUT /api/v1/tables/{id}
        tables.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateTableRequest request,
            UpdateTableUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode switch
                {
                    "NOT_FOUND" => 404, "CONFLICT" => 409, _ => 400
                };
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Table });
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("UpdateTable")
        .WithSummary("Cập nhật thông tin bàn ăn (Manager)");

        // PATCH /api/v1/tables/{id}/status
        tables.MapPatch("/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateTableStatusRequest request,
            UpdateTableStatusUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode == "NOT_FOUND" ? 404 : 400;
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Table });
        })
        .RequireAuthorization(p => p.RequireRole("Staff", "Manager"))
        .WithName("UpdateTableStatus")
        .WithSummary("Cập nhật trạng thái bàn (Staff, Manager)");

        return app;
    }
}
