using Restaurant.Api.Modules.Kitchen;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Application;
using Restaurant.Application.Modules.Kitchen.Interfaces;
using Restaurant.Application.Modules.Kitchen.UseCases;
using Restaurant.Infrastructure;
using Restaurant.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Kitchen Module DI
builder.Services.AddScoped<IKitchenRepository, KitchenRepository>();
builder.Services.AddScoped<GetKitchenOrderItemsUseCase>();
builder.Services.AddScoped<UpdateOrderItemStatusUseCase>();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

// Menu module
app.MapMenuCategoriesEndpoints();
app.MapMenuItemsEndpoints();

// Reservation module
app.MapReservationCheckInEndpoints();

// Kitchen module
app.MapKitchenEndpoints();

app.Run();
