using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Modules.Identity.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation của IUserRepository.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly RestaurantDbContext _context;

    public UserRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<User?> FindByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
}
