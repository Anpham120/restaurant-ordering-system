using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Api.Shared.Realtime;
using Restaurant.Application;
using Restaurant.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddSignalR();

var signalRAllowedOrigins = builder.Configuration
    .GetSection("Cors:SignalR:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(RestaurantRealtimeCors.PolicyName, policy =>
    {
        if (signalRAllowedOrigins.Length > 0)
        {
            policy.WithOrigins(signalRAllowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Authorization – "ManagerOnly" policy placeholder (JWT wired in Issue #11)
builder.Services.AddAuthentication();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ManagerOnly", policy =>
        policy.RequireAuthenticatedUser());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseWhen(ctx => !ctx.Request.Path.StartsWithSegments("/health"), appBuilder =>
{
    appBuilder.UseHttpsRedirection();
});

app.UseCors(RestaurantRealtimeCors.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

// Menu module
app.MapMenuCategoriesEndpoints();
app.MapMenuItemsEndpoints();

// Reservation module
app.MapReservationCheckInEndpoints();

// Realtime
app.MapRestaurantRealtimeHub();

app.Run();
