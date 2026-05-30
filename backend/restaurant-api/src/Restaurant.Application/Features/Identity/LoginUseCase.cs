namespace Restaurant.Application.Features.Identity;

public record LoginResult(bool Success, string? ErrorCode, string? ErrorMessage, LoginResponse? Response);

public class LoginUseCase(IIdentityRepository repository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtGenerator)
{
    public async Task<LoginResult> ExecuteAsync(LoginRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return new(false, "VALIDATION_ERROR", "Email và mật khẩu không được để trống.", null);

        var user = await repository.FindByEmailAsync(request.Email.Trim().ToLower(), ct);
        if (user is null || !user.IsActive)
            return new(false, "UNAUTHORIZED", "Email hoặc mật khẩu không đúng.", null);

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            return new(false, "UNAUTHORIZED", "Email hoặc mật khẩu không đúng.", null);

        var (token, expiresAt) = jwtGenerator.Generate(user);
        return new(true, null, null, new LoginResponse(
            token, expiresAt, new UserInfo(user.Id, user.FullName, user.Email, user.Role)));
    }
}
