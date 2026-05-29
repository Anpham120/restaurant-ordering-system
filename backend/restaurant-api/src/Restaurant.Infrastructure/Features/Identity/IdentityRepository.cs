using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Features.Identity;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Identity;

public class IdentityRepository(RestaurantDbContext db) : IIdentityRepository
{
    public async Task<User?> FindByEmailAsync(string email, CancellationToken ct = default)
        => await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email, ct);
}
