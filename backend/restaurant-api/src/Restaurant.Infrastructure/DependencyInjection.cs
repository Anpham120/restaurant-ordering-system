using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Restaurant.Application.Features.Reservations.CheckIn;
using Restaurant.Infrastructure.Data;
using Restaurant.Infrastructure.Features.Menu.Categories;
using Restaurant.Infrastructure.Features.Menu.Items;
using Restaurant.Infrastructure.Features.Ordering.Orders;
using Restaurant.Infrastructure.Features.Reservations.CheckIn;

namespace Restaurant.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
        }

        services.AddDbContext<RestaurantDbContext>(options =>
            options
                .UseNpgsql(
                    connectionString,
                    npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(RestaurantDbContext).Assembly.FullName))
                .UseSnakeCaseNamingConvention());

        // Menu Category handlers
        services.AddScoped<GetMenuCategoriesHandler>();
        services.AddScoped<CreateMenuCategoryHandler>();
        services.AddScoped<UpdateMenuCategoryHandler>();

        // Menu Item handlers
        services.AddScoped<GetMenuItemsHandler>();
        services.AddScoped<CreateMenuItemHandler>();
        services.AddScoped<UpdateMenuItemHandler>();

        // Ordering handlers
        services.AddScoped<CreateOrderHandler>();

        services.AddScoped<IReservationCheckInStore, ReservationCheckInStore>();
        services.AddSingleton<ISessionTokenGenerator, SecureSessionTokenGenerator>();

        return services;
    }
}
