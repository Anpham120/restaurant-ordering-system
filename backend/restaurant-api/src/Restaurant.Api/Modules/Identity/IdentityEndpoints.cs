using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Application.Modules.Identity.DTOs;
using Restaurant.Application.Modules.Identity.UseCases;

namespace Restaurant.Api.Modules.Identity;

/// <summary>
/// Endpoints cho Identity Module.
/// POST /api/v1/auth/login — public
/// GET  /api/v1/auth/me   — yêu cầu JWT Bearer
/// Theo docs/api-contract.md mục 6.
/// </summary>
public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        // POST /api/v1/auth/login
        group.MapPost("/login", async (
            [FromBody] LoginRequest request,
            LoginUseCase loginUseCase,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.Json(new
                {
                    success = false,
                    error = new
                    {
                        code = "VALIDATION_ERROR",
                        message = "Email và mật khẩu không được để trống."
                    }
                }, statusCode: 400);
            }

            var result = await loginUseCase.ExecuteAsync(request, cancellationToken);

            if (result is null)
            {
                return Results.Json(new
                {
                    success = false,
                    error = new
                    {
                        code = "UNAUTHORIZED",
                        message = "Email hoặc mật khẩu không đúng."
                    }
                }, statusCode: 401);
            }

            return Results.Json(new
            {
                success = true,
                data = new
                {
                    accessToken = result.AccessToken,
                    expiresAt = result.ExpiresAt,
                    user = new
                    {
                        id = result.User.Id,
                        fullName = result.User.FullName,
                        email = result.User.Email,
                        role = result.User.Role
                    }
                }
            }, statusCode: 200);
        })
        .AllowAnonymous()
        .WithName("Login")
        .WithSummary("Đăng nhập nội bộ (Manager, Staff, Kitchen, Cashier)");

        // GET /api/v1/auth/me
        group.MapGet("/me", (ClaimsPrincipal principal) =>
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            var email = principal.FindFirstValue(ClaimTypes.Email)
                     ?? principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email);
            var fullName = principal.FindFirstValue(ClaimTypes.Name);
            var role = principal.FindFirstValue(ClaimTypes.Role);

            return Results.Json(new
            {
                success = true,
                data = new
                {
                    id = userId,
                    fullName,
                    email,
                    role
                }
            });
        })
        .RequireAuthorization()
        .WithName("GetMe")
        .WithSummary("Lấy thông tin user hiện tại (yêu cầu JWT)");

        return app;
    }
}
