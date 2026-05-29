using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Restaurant.Application.Features.Identity;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Features.Identity;

public class JwtTokenGenerator(IConfiguration configuration) : IJwtTokenGenerator
{
    public (string Token, DateTimeOffset ExpiresAt) Generate(User user)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("Jwt:Secret not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "restaurant-api";
        var audience = configuration["Jwt:Audience"] ?? "restaurant-app";
        var expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var m) ? m : 480;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("fullName", user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
