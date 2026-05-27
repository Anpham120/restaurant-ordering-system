using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Restaurant.Application.Modules.Identity.Interfaces;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Services;

/// <summary>
/// JWT implementation của ITokenService.
/// Đọc cấu hình từ JwtSettings trong appsettings.json.
/// Secret key production phải dùng biến môi trường, không hardcode.
/// </summary>
public class JwtTokenService : ITokenService
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        var section = configuration.GetSection("JwtSettings");
        _secretKey = section["SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured.");
        _issuer = section["Issuer"] ?? "RestaurantApi";
        _audience = section["Audience"] ?? "RestaurantApp";
        _expiryMinutes = int.TryParse(section["ExpiryMinutes"], out var minutes) ? minutes : 480;
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTimeOffset GetExpiry()
    {
        return DateTimeOffset.UtcNow.AddMinutes(_expiryMinutes);
    }
}
