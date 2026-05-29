namespace Restaurant.Application.Features.Identity;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string AccessToken, DateTimeOffset ExpiresAt, UserInfo User);

public record UserInfo(Guid Id, string FullName, string Email, string Role);
