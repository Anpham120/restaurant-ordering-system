using Restaurant.Application.Modules.Identity.DTOs;
using Restaurant.Application.Modules.Identity.Interfaces;

namespace Restaurant.Application.Modules.Identity.UseCases;

/// <summary>
/// Use case đăng nhập nội bộ.
/// Xác thực email/password, trả về JWT token.
/// </summary>
public class LoginUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginUseCase(
        IUserRepository userRepository,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse?> ExecuteAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        // Tìm user theo email
        var user = await _userRepository.FindByEmailAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive)
            return null;

        // Xác thực password qua interface (BCrypt ở Infrastructure)
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return null;

        // Sinh JWT token
        var token = _tokenService.GenerateToken(user);
        var expiry = _tokenService.GetExpiry();

        return new LoginResponse(
            AccessToken: token,
            ExpiresAt: expiry,
            User: new UserDto(
                Id: user.Id.ToString(),
                FullName: user.FullName,
                Email: user.Email,
                Role: user.Role.ToString()
            )
        );
    }
}
