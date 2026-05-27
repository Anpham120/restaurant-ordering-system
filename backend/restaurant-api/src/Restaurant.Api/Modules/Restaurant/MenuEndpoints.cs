using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Modules.Restaurant.DTOs;
using Restaurant.Application.Modules.Restaurant.UseCases;

namespace Restaurant.Api.Modules.Restaurant;

/// <summary>
/// Endpoints cho Menu Module.
/// GET  /api/v1/menu/categories  — public
/// POST /api/v1/menu/categories  — Manager
/// PUT  /api/v1/menu/categories/{id} — Manager
/// GET  /api/v1/menu/items       — public
/// POST /api/v1/menu/items       — Manager
/// PUT  /api/v1/menu/items/{id}  — Manager
/// Theo docs/api-contract.md mục 7.
/// </summary>
public static class MenuEndpoints
{
    public static IEndpointRouteBuilder MapMenuEndpoints(this IEndpointRouteBuilder app)
    {
        var menu = app.MapGroup("/api/v1/menu").WithTags("Menu");

        // GET /api/v1/menu/categories
        menu.MapGet("/categories", async (
            [FromQuery] bool? includeInactive,
            GetCategoriesUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(includeInactive ?? false, ct);
            return Results.Json(new { success = true, data = result });
        })
        .AllowAnonymous()
        .WithName("GetMenuCategories")
        .WithSummary("Lấy danh sách danh mục menu (public)");

        // POST /api/v1/menu/categories
        menu.MapPost("/categories", async (
            [FromBody] CreateCategoryRequest request,
            CreateCategoryUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: result.ErrorCode == "CONFLICT" ? 409 : 400);

            return Results.Json(new { success = true, data = result.Category }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("CreateMenuCategory")
        .WithSummary("Tạo danh mục menu (Manager)");

        // PUT /api/v1/menu/categories/{id}
        menu.MapPut("/categories/{id:guid}", async (
            Guid id,
            [FromBody] UpdateCategoryRequest request,
            UpdateCategoryUseCase useCase,
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
            return Results.Json(new { success = true, data = result.Category });
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("UpdateMenuCategory")
        .WithSummary("Cập nhật danh mục menu (Manager)");

        // GET /api/v1/menu/items
        menu.MapGet("/items", async (
            [FromQuery] Guid? categoryId,
            [FromQuery] bool? isAvailable,
            [FromQuery] string? keyword,
            [FromQuery] int page,
            [FromQuery] int pageSize,
            GetMenuItemsUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(categoryId, isAvailable, keyword,
                page <= 0 ? 1 : page, pageSize <= 0 ? 20 : pageSize, ct);
            return Results.Json(new
            {
                success = true,
                data = result.Items,
                pagination = new
                {
                    page = result.Page,
                    pageSize = result.PageSize,
                    totalItems = result.TotalItems,
                    totalPages = result.TotalPages
                }
            });
        })
        .AllowAnonymous()
        .WithName("GetMenuItems")
        .WithSummary("Lấy danh sách món ăn (public)");

        // POST /api/v1/menu/items
        menu.MapPost("/items", async (
            [FromBody] CreateMenuItemRequest request,
            CreateMenuItemUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode == "NOT_FOUND" ? 404 : 400;
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Item }, statusCode: 201);
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("CreateMenuItem")
        .WithSummary("Tạo món ăn mới (Manager)");

        // PUT /api/v1/menu/items/{id}
        menu.MapPut("/items/{id:guid}", async (
            Guid id,
            [FromBody] UpdateMenuItemRequest request,
            UpdateMenuItemUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(id, request, ct);
            if (!result.Success)
            {
                var statusCode = result.ErrorCode == "NOT_FOUND" ? 404 : 400;
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } },
                    statusCode: statusCode);
            }
            return Results.Json(new { success = true, data = result.Item });
        })
        .RequireAuthorization(p => p.RequireRole("Manager"))
        .WithName("UpdateMenuItem")
        .WithSummary("Cập nhật món ăn (Manager)");

        return app;
    }
}
