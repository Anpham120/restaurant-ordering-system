using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Restaurant.Application.Features.Identity;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var env = services.GetRequiredService<IHostEnvironment>();
        if (!env.IsDevelopment()) return;

        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync())
        {
            var now = DateTimeOffset.UtcNow;
            db.Users.AddRange(
                new User { Id = Guid.NewGuid(), FullName = "Admin Manager", Email = "manager@restaurant.com", PasswordHash = hasher.Hash("manager123"), Role = "Manager", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new User { Id = Guid.NewGuid(), FullName = "Staff 1", Email = "staff@restaurant.com", PasswordHash = hasher.Hash("staff123"), Role = "Staff", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new User { Id = Guid.NewGuid(), FullName = "Kitchen 1", Email = "kitchen@restaurant.com", PasswordHash = hasher.Hash("kitchen123"), Role = "Kitchen", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new User { Id = Guid.NewGuid(), FullName = "Cashier 1", Email = "cashier@restaurant.com", PasswordHash = hasher.Hash("cashier123"), Role = "Cashier", IsActive = true, CreatedAt = now, UpdatedAt = now }
            );
            await db.SaveChangesAsync();
        }
    }
}
