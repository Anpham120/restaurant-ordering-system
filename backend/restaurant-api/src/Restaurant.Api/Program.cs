using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Restaurant.Api.Modules.Identity;
using Restaurant.Api.Modules.Reservation;
using Restaurant.Api.Modules.Restaurant;
using Restaurant.Application;
using Restaurant.Application.Modules.Identity.Interfaces;
using Restaurant.Application.Modules.Identity.UseCases;
using Restaurant.Application.Modules.Reservation.Interfaces;
using Restaurant.Application.Modules.Reservation.UseCases;
using Restaurant.Application.Modules.Restaurant.Interfaces;
using Restaurant.Application.Modules.Restaurant.UseCases;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure;
using Restaurant.Infrastructure.Data;
using Restaurant.Infrastructure.Repositories;
using Restaurant.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ── OpenAPI ──────────────────────────────────────────────────────────────────
builder.Services.AddOpenApi();

// ── Health Check ─────────────────────────────────────────────────────────────
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

// ── Database (EF Core + PostgreSQL) ──────────────────────────────────────────
builder.Services.AddDbContext<RestaurantDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Identity DI ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<LoginUseCase>();

// ── Restaurant Module DI ─────────────────────────────────────────────────────
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<GetCategoriesUseCase>();
builder.Services.AddScoped<CreateCategoryUseCase>();
builder.Services.AddScoped<UpdateCategoryUseCase>();
builder.Services.AddScoped<GetMenuItemsUseCase>();
builder.Services.AddScoped<CreateMenuItemUseCase>();
builder.Services.AddScoped<UpdateMenuItemUseCase>();

builder.Services.AddScoped<ITableRepository, TableRepository>();
builder.Services.AddScoped<GetAreasUseCase>();
builder.Services.AddScoped<GetTablesUseCase>();
builder.Services.AddScoped<CreateTableUseCase>();
builder.Services.AddScoped<UpdateTableUseCase>();
builder.Services.AddScoped<UpdateTableStatusUseCase>();

// ── Reservation Module DI ─────────────────────────────────────────────────────
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<CreateReservationUseCase>();
builder.Services.AddScoped<GetReservationByCodeUseCase>();
builder.Services.AddScoped<GetReservationsUseCase>();
builder.Services.AddScoped<ConfirmReservationUseCase>();
builder.Services.AddScoped<CancelReservationUseCase>();
builder.Services.AddScoped<CheckInReservationUseCase>();
builder.Services.AddScoped<CreateTableSessionUseCase>();
builder.Services.AddScoped<GetTableSessionByIdUseCase>();
builder.Services.AddScoped<GetTableSessionByTokenUseCase>();
builder.Services.AddScoped<CloseTableSessionUseCase>();

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Seed dữ liệu dev-only
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    await db.Database.MigrateAsync();

    // Seed users
    if (!await db.Users.AnyAsync())
    {
        db.Users.AddRange(
            new User { Id = Guid.NewGuid(), FullName = "Quản Lý Demo", Email = "manager@restaurant.local", PasswordHash = passwordHasher.Hash("Manager@123"), Role = UserRole.Manager.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new User { Id = Guid.NewGuid(), FullName = "Nhân Viên Demo", Email = "staff@restaurant.local", PasswordHash = passwordHasher.Hash("Staff@123"), Role = UserRole.Staff.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new User { Id = Guid.NewGuid(), FullName = "Bếp Demo", Email = "kitchen@restaurant.local", PasswordHash = passwordHasher.Hash("Kitchen@123"), Role = UserRole.Kitchen.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new User { Id = Guid.NewGuid(), FullName = "Thu Ngân Demo", Email = "cashier@restaurant.local", PasswordHash = passwordHasher.Hash("Cashier@123"), Role = UserRole.Cashier.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow }
        );
        await db.SaveChangesAsync();
    }

    // Seed areas
    if (!await db.Areas.AnyAsync())
    {
        var tang1 = new Area { Id = Guid.NewGuid(), Name = "Tầng 1", Description = "Khu vực tầng trệt", CreatedAt = DateTimeOffset.UtcNow };
        var tang2 = new Area { Id = Guid.NewGuid(), Name = "Tầng 2", Description = "Khu vực tầng lầu", CreatedAt = DateTimeOffset.UtcNow };
        db.Areas.AddRange(tang1, tang2);
        await db.SaveChangesAsync();

        // Seed tables
        db.Tables.AddRange(
            new Table { Id = Guid.NewGuid(), AreaId = tang1.Id, TableNumber = "A01", Capacity = 4, Status = TableStatus.Available.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new Table { Id = Guid.NewGuid(), AreaId = tang1.Id, TableNumber = "A02", Capacity = 4, Status = TableStatus.Available.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new Table { Id = Guid.NewGuid(), AreaId = tang1.Id, TableNumber = "A03", Capacity = 6, Status = TableStatus.Available.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new Table { Id = Guid.NewGuid(), AreaId = tang2.Id, TableNumber = "B01", Capacity = 4, Status = TableStatus.Available.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new Table { Id = Guid.NewGuid(), AreaId = tang2.Id, TableNumber = "B02", Capacity = 8, Status = TableStatus.Available.ToString(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow }
        );
        await db.SaveChangesAsync();
    }

    // Seed menu categories
    if (!await db.MenuCategories.AnyAsync())
    {
        var khaivi = new MenuCategory { Id = Guid.NewGuid(), Name = "Khai vị", Description = "Các món khai vị", DisplayOrder = 1, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        var monChinh = new MenuCategory { Id = Guid.NewGuid(), Name = "Món chính", Description = "Các món chính", DisplayOrder = 2, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        var lau = new MenuCategory { Id = Guid.NewGuid(), Name = "Lẩu", Description = "Các món lẩu", DisplayOrder = 3, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        var douong = new MenuCategory { Id = Guid.NewGuid(), Name = "Đồ uống", Description = "Đồ uống các loại", DisplayOrder = 4, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        db.MenuCategories.AddRange(khaivi, monChinh, lau, douong);
        await db.SaveChangesAsync();

        // Seed menu items
        db.MenuItems.AddRange(
            new MenuItem { Id = Guid.NewGuid(), CategoryId = lau.Id, Name = "Lẩu Thái hải sản", Description = "Lẩu chua cay đặc trưng", Price = 299000m, Tags = "spicy,seafood", IsAvailable = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new MenuItem { Id = Guid.NewGuid(), CategoryId = lau.Id, Name = "Lẩu nấm chay", Description = "Lẩu nấm thanh đạm", Price = 199000m, Tags = "vegetarian", IsAvailable = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new MenuItem { Id = Guid.NewGuid(), CategoryId = monChinh.Id, Name = "Cơm gà xối mỡ", Description = "Cơm gà giòn da", Price = 75000m, Tags = "", IsAvailable = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
            new MenuItem { Id = Guid.NewGuid(), CategoryId = douong.Id, Name = "Nước cam tươi", Description = "Cam vắt tươi nguyên chất", Price = 35000m, Tags = "cold", IsAvailable = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow }
        );
        await db.SaveChangesAsync();
    }
}

app.UseWhen(ctx => !ctx.Request.Path.StartsWithSegments("/health"), appBuilder =>
{
    appBuilder.UseHttpsRedirection();
});

app.UseAuthentication();
app.UseAuthorization();

// ── Endpoints ─────────────────────────────────────────────────────────────────
app.MapHealthChecks("/health");

// Identity Module
app.MapIdentityEndpoints();

// Restaurant Module
app.MapMenuEndpoints();
app.MapTableEndpoints();

// Reservation Module
app.MapReservationEndpoints();
app.MapTableSessionEndpoints();

// Menu module (develop's Vertical Slice handlers)
app.MapMenuCategoriesEndpoints();
app.MapMenuItemsEndpoints();

app.Run();
