using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Features.Identity;

namespace Restaurant.Api.Modules.Identity;

public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        // POST /api/v1/auth/login
        group.MapPost("/login", async (
            [FromBody] LoginRequest request,
            LoginUseCase useCase,
            CancellationToken ct) =>
        {
            var result = await useCase.ExecuteAsync(request, ct);
            if (!result.Success)
            {
                var status = result.ErrorCode == "VALIDATION_ERROR" ? 400 : 401;
                return Results.Json(new { success = false, error = new { code = result.ErrorCode, message = result.ErrorMessage } }, statusCode: status);
            }
            return Results.Ok(new { success = true, data = result.Response });
        })
        .AllowAnonymous()
        .WithName("Login");

        // GET /api/v1/auth/me
        group.MapGet("/me", (ClaimsPrincipal principal) =>
        {
            var id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = principal.FindFirstValue(ClaimTypes.Email);
            var role = principal.FindFirstValue(ClaimTypes.Role);
            var fullName = principal.FindFirstValue("fullName");
            return Results.Ok(new { success = true, data = new { id, fullName, email, role } });
        })
        .RequireAuthorization()
        .WithName("GetMe");

        return app;
    }
}
