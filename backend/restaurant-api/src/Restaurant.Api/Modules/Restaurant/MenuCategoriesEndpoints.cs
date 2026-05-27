using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Restaurant.Application.Features.Menu.Categories;
using Restaurant.Infrastructure.Features.Menu.Categories;

namespace Restaurant.Api.Modules.Restaurant;

public static class MenuCategoriesEndpoints
{
    public static IEndpointRouteBuilder MapMenuCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/menu/categories")
            .WithTags("Menu – Categories");

        // GET /api/v1/menu/categories  — public; includeInactive chỉ dùng cho Manager
        group.MapGet("/", async (
            bool? includeInactive,
            ClaimsPrincipal user,
            GetMenuCategoriesHandler handler,
            CancellationToken ct) =>
        {
            if (includeInactive == true)
            {
                if (user.Identity?.IsAuthenticated != true)
                    return Results.Unauthorized();
                if (!user.IsInRole("Manager"))
                    return Results.Forbid();
            }

            var query = new GetMenuCategoriesQuery
            {
                IncludeInactive = includeInactive ?? false,
            };
            var result = await handler.HandleAsync(query, ct);
            return Results.Ok(new { success = true, data = result });
        })
        .WithName("GetMenuCategories")
        .AllowAnonymous();

        // POST /api/v1/menu/categories  — Manager
        group.MapPost("/", async (
            CreateMenuCategoryRequest request,
            CreateMenuCategoryHandler handler,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = "Tên danh mục không được để trống." }
                });

            try
            {
                var result = await handler.HandleAsync(request, ct);
                return Results.Created($"/api/v1/menu/categories/{result.Id}",
                    new { success = true, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new
                {
                    success = false,
                    error = new { code = "CONFLICT", message = ex.Message }
                });
            }
        })
        .WithName("CreateMenuCategory")
        .RequireAuthorization("ManagerOnly");

        // PUT /api/v1/menu/categories/{id}  — Manager
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateMenuCategoryRequest request,
            UpdateMenuCategoryHandler handler,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new
                {
                    success = false,
                    error = new { code = "VALIDATION_ERROR", message = "Tên danh mục không được để trống." }
                });

            try
            {
                var result = await handler.HandleAsync(id, request, ct);
                if (result is null)
                    return Results.NotFound(new
                    {
                        success = false,
                        error = new { code = "NOT_FOUND", message = "Không tìm thấy danh mục." }
                    });

                return Results.Ok(new { success = true, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new
                {
                    success = false,
                    error = new { code = "CONFLICT", message = ex.Message }
                });
            }
        })
        .WithName("UpdateMenuCategory")
        .RequireAuthorization("ManagerOnly");

        return app;
    }
}
