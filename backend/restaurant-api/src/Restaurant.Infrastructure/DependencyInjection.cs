using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Restaurant.Application.Features.Identity;
using Restaurant.Application.Features.Reservations;
using Restaurant.Application.Features.Reservations.CheckIn;
using Restaurant.Application.Features.Tables;
using Restaurant.Infrastructure.Data;
using Restaurant.Infrastructure.Features.Identity;
using Restaurant.Infrastructure.Features.Menu.Categories;
using Restaurant.Infrastructure.Features.Menu.Items;
using Restaurant.Infrastructure.Features.Billing;
using Restaurant.Infrastructure.Features.Kitchen;
using Restaurant.Infrastructure.Features.Orders;
using Restaurant.Infrastructure.Features.Reservations;
using Restaurant.Infrastructure.Features.Reservations.CheckIn;
using Restaurant.Infrastructure.Features.Tables;

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
        services.AddSingleton(TimeProvider.System);

        // Menu Category handlers
        // Identity
        services.AddScoped<IIdentityRepository, IdentityRepository>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<LoginUseCase>();

        services.AddScoped<GetMenuCategoriesHandler>();
        services.AddScoped<CreateMenuCategoryHandler>();
        services.AddScoped<UpdateMenuCategoryHandler>();

        // Menu Item handlers
        services.AddScoped<GetMenuItemsHandler>();
        services.AddScoped<CreateMenuItemHandler>();
        services.AddScoped<UpdateMenuItemHandler>();

        services.AddScoped<IReservationCheckInStore, ReservationCheckInStore>();
        services.AddSingleton<ISessionTokenGenerator, SecureSessionTokenGenerator>();

        // Ordering + Kitchen handlers
        services.AddScoped<CreateOrderHandler>();
        services.AddScoped<GetOrderByIdHandler>();
        services.AddScoped<GetKitchenOrderItemsHandler>();
        services.AddScoped<UpdateKitchenOrderItemStatusHandler>();

        // Table repositories and use cases
        services.AddScoped<ITableRepository, TableRepository>();
        services.AddScoped<GetAreasUseCase>();
        services.AddScoped<GetTablesUseCase>();
        services.AddScoped<CreateTableUseCase>();
        services.AddScoped<UpdateTableUseCase>();
        services.AddScoped<UpdateTableStatusUseCase>();

        // Reservation repositories and use cases
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<CreateReservationUseCase>();
        services.AddScoped<GetReservationsUseCase>();
        services.AddScoped<GetReservationByCodeUseCase>();
        services.AddScoped<ConfirmReservationUseCase>();
        services.AddScoped<CancelReservationUseCase>();
        services.AddScoped<CreateTableSessionUseCase>();
        services.AddScoped<GetTableSessionByIdUseCase>();
        services.AddScoped<GetTableSessionByTokenUseCase>();
        services.AddScoped<CloseTableSessionUseCase>();

        // Billing handlers
        services.AddScoped<GetInvoicePreviewHandler>();
        services.AddScoped<CreateInvoiceHandler>();
        services.AddScoped<GetInvoiceHandler>();

        return services;
    }
}
