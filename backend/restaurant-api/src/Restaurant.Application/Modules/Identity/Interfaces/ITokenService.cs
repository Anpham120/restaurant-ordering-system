using Restaurant.Domain.Entities;

namespace Restaurant.Application.Modules.Identity.Interfaces;

/// <summary>
/// Port để sinh JWT token — Infrastructure implement, Application dùng.
/// </summary>
public interface ITokenService
{
    string GenerateToken(User user);
    DateTimeOffset GetExpiry();
}
