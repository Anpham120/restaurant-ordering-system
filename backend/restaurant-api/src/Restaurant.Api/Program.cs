using Restaurant.Api.Hubs;
using Restaurant.Api.Modules.Kitchen;
using Restaurant.Application.Features.Kitchen;
using Restaurant.Infrastructure.Features.Kitchen;
using Restaurant.Api.Modules.Billing;
using Restaurant.Api.Modules.Ordering;
using Restaurant.Api.Modules.Orders;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Api.Services;
using Restaurant.Application;
using Restaurant.Application.Features.Orders;
using Restaurant.Infrastructure;
using IRealtimePublisher = Restaurant.Api.Shared.Realtime.IRestaurantRealtimePublisher;
using RealtimePublisher = Restaurant.Api.Shared.Realtime.SignalRRestaurantRealtimePublisher;

var builder = WebApplication.CreateBuilder(args);

// ── Core services ─────────────────────────────────────────────────────────────
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton<IRealtimePublisher, RealtimePublisher>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// ── SignalR ───────────────────────────────────────────────────────────────────
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});
builder.Services.AddScoped<IRestaurantHubService, RestaurantHubService>();

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:5173", "http://localhost:4173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminWebPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// Kitchen module DI
builder.Services.AddScoped<IKitchenRepository, KitchenRepository>();
builder.Services.AddScoped<GetKitchenOrderItemsUseCase>();
builder.Services.AddScoped<UpdateOrderItemStatusUseCase>();

// ── Authorization ─────────────────────────────────────────────────────────────
builder.Services.AddAuthentication();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ManagerOnly", policy =>
        policy.RequireAuthenticatedUser());
    options.AddPolicy("CashierOrManager", policy =>
        policy.RequireRole("Cashier", "Manager"));
});

var app = builder.Build();

// ── HTTP pipeline ─────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseWhen(ctx => !ctx.Request.Path.StartsWithSegments("/health"), appBuilder =>
{
    appBuilder.UseHttpsRedirection();
});

// CORS must come before Authentication/Authorization and before MapHub
app.UseCors("AdminWebPolicy");

app.UseAuthentication();
app.UseAuthorization();

// ── Health check ──────────────────────────────────────────────────────────────
app.MapHealthChecks("/health");
app.MapHub<RestaurantHub>("/hubs/restaurant")
   .RequireCors("AdminWebPolicy");

// ── REST Endpoints ────────────────────────────────────────────────────────────
// Menu module
app.MapMenuCategoriesEndpoints();
app.MapMenuItemsEndpoints();
app.MapOrdersEndpoints();

// Table module
app.MapTableEndpoints();

// Reservation module
app.MapReservationCheckInEndpoints();
app.MapReservationEndpoints();
app.MapTableSessionEndpoints();

// Billing module
app.MapBillingEndpoints();

// Kitchen module
app.MapKitchenEndpoints();

// Order module
app.MapOrderItemEndpoints();

app.Run();
