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

        if (!await db.MenuCategories.AnyAsync())
        {
            var now = DateTimeOffset.UtcNow;

            var khaiVi = new MenuCategory { Id = Guid.NewGuid(), Name = "Khai vị", Description = "Món khai vị", DisplayOrder = 1, IsActive = true, CreatedAt = now, UpdatedAt = now };
            var monChinh = new MenuCategory { Id = Guid.NewGuid(), Name = "Món chính", Description = "Món chính", DisplayOrder = 2, IsActive = true, CreatedAt = now, UpdatedAt = now };
            var doUong = new MenuCategory { Id = Guid.NewGuid(), Name = "Đồ uống", Description = "Thức uống", DisplayOrder = 3, IsActive = true, CreatedAt = now, UpdatedAt = now };

            db.MenuCategories.AddRange(khaiVi, monChinh, doUong);

            db.MenuItems.AddRange(
                new MenuItem { Id = Guid.NewGuid(), CategoryId = khaiVi.Id, Name = "Gỏi cuốn tôm thịt", Description = "2 cuốn kèm nước chấm", Price = 45000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = khaiVi.Id, Name = "Chả giò chiên giòn", Description = "Khẩu phần 4 cuốn", Price = 50000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = monChinh.Id, Name = "Phở bò tái", Description = "Phở bò truyền thống", Price = 65000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = monChinh.Id, Name = "Cơm gà xối mỡ", Description = "Cơm gà giòn da", Price = 60000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = monChinh.Id, Name = "Bún chả Hà Nội", Description = "Bún chả nướng than hoa", Price = 55000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = doUong.Id, Name = "Trà đào cam sả", Description = "Mát lạnh sảng khoái", Price = 35000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now },
                new MenuItem { Id = Guid.NewGuid(), CategoryId = doUong.Id, Name = "Cà phê sữa đá", Description = "Cà phê phin truyền thống", Price = 30000m, IsAvailable = true, CreatedAt = now, UpdatedAt = now }
            );

            await db.SaveChangesAsync();
        }
    }
}
