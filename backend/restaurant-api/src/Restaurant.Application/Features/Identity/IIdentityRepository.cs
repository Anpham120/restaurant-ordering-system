using Restaurant.Domain.Entities;

namespace Restaurant.Application.Features.Identity;

public interface IIdentityRepository
{
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
}
