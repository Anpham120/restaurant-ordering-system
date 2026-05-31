using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Restaurant.Application.Common;
using Restaurant.Application.Features.Menu.Items;
using Restaurant.Infrastructure.Features.Menu.Items;

namespace Restaurant.Api.Modules.Restaurant;

public static class MenuItemsEndpoints
{
    public static IEndpointRouteBuilder MapMenuItemsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/menu/items")
            .WithTags("Menu – Items");

        // GET /api/v1/menu/items  — public, paginated
        group.MapGet("/", async (
            Guid? categoryId,
            bool? isAvailable,
            string? keyword,
            int? page,
            int? pageSize,
            GetMenuItemsHandler handler,
            CancellationToken ct) =>
        {
            var query = new GetMenuItemsQuery
            {
                CategoryId = categoryId,
                IsAvailable = isAvailable,
                Keyword = keyword,
                Page = page is null or <= 0 ? 1 : page.Value,
                PageSize = pageSize is null or <= 0 ? 20 : pageSize.Value,
            };

            var result = await handler.HandleAsync(query, ct);

            return Results.Ok(new
            {
                success = true,
                data = result.Data,
                pagination = new
                {
                    page = result.Page,
                    pageSize = result.PageSize,
                    totalItems = result.TotalItems,
                    totalPages = result.TotalPages,
                }
            });
        })
        .WithName("GetMenuItems")
        .AllowAnonymous();

        // POST /api/v1/menu/items  — Manager
        group.MapPost("/", async (
            CreateMenuItemRequest request,
            CreateMenuItemHandler handler,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = "Tên món không được để trống." }
                });

            if (request.CategoryId == Guid.Empty)
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = "CategoryId không hợp lệ." }
                });

            try
            {
                var result = await handler.HandleAsync(request, ct);
                return Results.Created($"/api/v1/menu/items/{result.Id}",
                    new { success = true, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return Results.UnprocessableEntity(new
                {
                    success = false,
                    error = new { code = "BUSINESS_RULE_VIOLATION", message = ex.Message }
                });
            }
        })
        .WithName("CreateMenuItem")
        .RequireAuthorization("ManagerOnly");

        // PUT /api/v1/menu/items/{id}  — Manager
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateMenuItemRequest request,
            UpdateMenuItemHandler handler,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = "Tên món không được để trống." }
                });

            try
            {
                var result = await handler.HandleAsync(id, request, ct);
                if (result is null)
                    return Results.NotFound(new
                    {
                        success = false,
                        error = new { code = "NOT_FOUND", message = "Không tìm thấy món ăn." }
                    });

                return Results.Ok(new { success = true, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return Results.UnprocessableEntity(new
                {
                    success = false,
                    error = new { code = "BUSINESS_RULE_VIOLATION", message = ex.Message }
                });
            }
        })
        .WithName("UpdateMenuItem")
        .RequireAuthorization("ManagerOnly");

        return app;
    }
}
