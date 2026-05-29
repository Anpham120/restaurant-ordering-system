using Restaurant.Domain.Entities;

namespace Restaurant.Application.Features.Identity;

public interface IJwtTokenGenerator
{
    (string Token, DateTimeOffset ExpiresAt) Generate(User user);
}
