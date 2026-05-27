namespace Restaurant.Application.Modules.Identity.DTOs;

/// <summary>
/// Phản hồi sau đăng nhập thành công.
/// Theo POST /api/v1/auth/login trong docs/api-contract.md.
/// </summary>
public record LoginResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    UserDto User
);

/// <summary>
/// Thông tin user trả về trong response.
/// </summary>
public record UserDto(
    string Id,
    string FullName,
    string Email,
    string Role
);
