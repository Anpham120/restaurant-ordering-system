using Restaurant.Api.Hubs;
using Restaurant.Api.Modules.Kitchen;
using Restaurant.Api.Modules.Ordering;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Application;
using Restaurant.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
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

app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapHub<RestaurantHub>("/hubs/restaurant");

// Menu module
app.MapMenuCategoriesEndpoints();
app.MapMenuItemsEndpoints();

// Reservation module
app.MapReservationCheckInEndpoints();

// Ordering and Kitchen modules
app.MapOrdersEndpoints();
app.MapKitchenEndpoints();

app.Run();
