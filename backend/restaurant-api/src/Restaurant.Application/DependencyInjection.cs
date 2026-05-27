using Microsoft.Extensions.DependencyInjection;

namespace Restaurant.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Handlers are registered in Restaurant.Infrastructure.DependencyInjection
        // This method is kept for future Application-only services (validators, etc.)
        return services;
    }
}
