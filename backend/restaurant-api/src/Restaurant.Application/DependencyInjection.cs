using Microsoft.Extensions.DependencyInjection;
using Restaurant.Application.Features.Reservations.CheckIn;

namespace Restaurant.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CheckInReservationService>();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
