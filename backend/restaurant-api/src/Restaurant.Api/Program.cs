using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Application;
using Restaurant.Infrastructure;
using Restaurant.Api.Modules.Ordering;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
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

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

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

app.Run();
