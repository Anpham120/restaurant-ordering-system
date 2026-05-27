namespace Restaurant.Application.Modules.Identity.DTOs;

/// <summary>
/// Yêu cầu đăng nhập.
/// Theo POST /api/v1/auth/login trong docs/api-contract.md.
/// </summary>
public record LoginRequest(string Email, string Password);
