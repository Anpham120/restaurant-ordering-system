using Restaurant.Domain.Entities;

namespace Restaurant.Application.Modules.Identity.Interfaces;

/// <summary>
/// Port để tìm kiếm User — Infrastructure implement, Application dùng.
/// </summary>
public interface IUserRepository
{
    Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
}
