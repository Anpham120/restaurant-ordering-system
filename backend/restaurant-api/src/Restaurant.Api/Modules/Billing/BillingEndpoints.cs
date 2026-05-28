using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Api.Modules.Billing;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/table-sessions/{id:guid}/invoice-preview", GetInvoicePreviewAsync)
            .WithTags("Billing")
            .WithName("GetInvoicePreview")
            .RequireAuthorization("CashierOrManager");

        var invoices = app.MapGroup("/api/v1/invoices")
            .WithTags("Billing")
            .RequireAuthorization("CashierOrManager");

        invoices.MapPost("/", CreateInvoiceAsync)
            .WithName("CreateInvoice");

        invoices.MapGet("/{id:guid}", GetInvoiceAsync)
            .WithName("GetInvoice");

        return app;
    }

    private static async Task<IResult> GetInvoicePreviewAsync(
        Guid id,
        RestaurantDbContext db,
        CancellationToken ct)
    {
        var session = await LoadSessionForBilling(db, id, asTracking: false, ct);
        if (session is null)
        {
            return NotFound("Khong tim thay phien ban.");
        }

        var preview = BuildPreview(session);
        return Results.Ok(new { success = true, data = preview });
    }

    private static async Task<IResult> CreateInvoiceAsync(
        CreateInvoiceRequest request,
        ClaimsPrincipal user,
        RestaurantDbContext db,
        CancellationToken ct)
    {
        if (request.TableSessionId == Guid.Empty)
        {
            return ValidationError("tableSessionId", "TableSessionId khong hop le.");
        }

        if (request.Discount < 0)
        {
            return ValidationError("discount", "Giam gia khong duoc am.");
        }

        if (!IsSupportedPaymentMethod(request.PaymentMethod))
        {
            return ValidationError("paymentMethod", "Phuong thuc thanh toan khong hop le.");
        }

        var cashierId = GetCurrentUserId(user);
        if (cashierId is null)
        {
            return Results.Unauthorized();
        }

        var session = await LoadSessionForBilling(db, request.TableSessionId, asTracking: true, ct);
        if (session is null)
        {
            return NotFound("Khong tim thay phien ban.");
        }

        if (!string.Equals(session.Status, nameof(TableSessionStatus.Active), StringComparison.Ordinal))
        {
            return BusinessRule("Chi co the thanh toan phien ban dang hoat dong.");
        }

        var hasExistingInvoice = await db.Invoices
            .AnyAsync(invoice => invoice.TableSessionId == request.TableSessionId, ct);
        if (hasExistingInvoice)
        {
            return Conflict("Phien ban da co hoa don.");
        }

        var billableItems = GetBillableOrderItems(session).ToList();
        if (billableItems.Count == 0)
        {
            return BusinessRule("Khong co mon nao de thanh toan.");
        }

        var hasUnservedItems = billableItems.Any(item =>
            !string.Equals(item.Status, nameof(OrderItemStatus.Served), StringComparison.Ordinal));
        if (hasUnservedItems)
        {
            return BusinessRule("Chi co the thanh toan khi tat ca mon da phuc vu.");
        }

        var subtotal = billableItems.Sum(item => item.UnitPrice * item.Quantity);
        if (request.Discount > subtotal)
        {
            return ValidationError("discount", "Giam gia khong duoc lon hon tam tinh.");
        }

        var now = DateTimeOffset.UtcNow;
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            TableSessionId = session.Id,
            InvoiceCode = await GenerateInvoiceCodeAsync(db, now, ct),
            Subtotal = subtotal,
            Discount = request.Discount,
            TotalAmount = subtotal - request.Discount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = nameof(PaymentStatus.Paid),
            PaidAt = now,
            CashierId = cashierId.Value,
            CreatedAt = now,
        };

        session.Status = nameof(TableSessionStatus.Closed);
        session.ClosedAt = now;
        session.Table.Status = nameof(TableStatus.Cleaning);
        session.Table.UpdatedAt = now;

        db.Invoices.Add(invoice);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/v1/invoices/{invoice.Id}", new
        {
            success = true,
            data = ToInvoiceDto(invoice, BuildPreview(session).Items),
        });
    }

    private static async Task<IResult> GetInvoiceAsync(
        Guid id,
        RestaurantDbContext db,
        CancellationToken ct)
    {
        var invoice = await db.Invoices
            .AsNoTracking()
            .Include(i => i.TableSession)
                .ThenInclude(ts => ts.Orders)
                    .ThenInclude(o => o.OrderItems)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice is null)
        {
            return NotFound("Khong tim thay hoa don.");
        }

        var items = GetBillableOrderItems(invoice.TableSession)
            .Select(ToInvoiceItemDto)
            .ToList();

        return Results.Ok(new
        {
            success = true,
            data = ToInvoiceDto(invoice, items),
        });
    }

    private static async Task<TableSession?> LoadSessionForBilling(
        RestaurantDbContext db,
        Guid id,
        bool asTracking,
        CancellationToken ct)
    {
        var query = db.TableSessions
            .Include(ts => ts.Table)
            .Include(ts => ts.Orders)
                .ThenInclude(o => o.OrderItems)
            .AsQueryable();

        if (!asTracking)
        {
            query = query.AsNoTracking();
        }

        return await query.FirstOrDefaultAsync(ts => ts.Id == id, ct);
    }

    private static InvoicePreviewDto BuildPreview(TableSession session)
    {
        var items = GetBillableOrderItems(session)
            .Select(ToInvoiceItemDto)
            .ToList();
        var subtotal = items.Sum(item => item.LineTotal);

        return new InvoicePreviewDto(
            session.Id,
            subtotal,
            Discount: 0,
            TotalAmount: subtotal,
            items);
    }

    private static IEnumerable<OrderItem> GetBillableOrderItems(TableSession session) =>
        session.Orders
            .Where(order => !string.Equals(order.Status, nameof(OrderStatus.Cancelled), StringComparison.Ordinal))
            .SelectMany(order => order.OrderItems)
            .Where(item => !string.Equals(item.Status, nameof(OrderItemStatus.Cancelled), StringComparison.Ordinal));

    private static InvoiceItemDto ToInvoiceItemDto(OrderItem item) =>
        new(
            item.Id,
            item.MenuItemName,
            item.UnitPrice,
            item.Quantity,
            item.UnitPrice * item.Quantity);

    private static InvoiceDto ToInvoiceDto(Invoice invoice, IReadOnlyList<InvoiceItemDto> items) =>
        new(
            invoice.Id,
            invoice.TableSessionId,
            invoice.InvoiceCode,
            invoice.Subtotal,
            invoice.Discount,
            invoice.TotalAmount,
            invoice.PaymentMethod,
            invoice.PaymentStatus,
            invoice.PaidAt,
            items);

    private static async Task<string> GenerateInvoiceCodeAsync(
        RestaurantDbContext db,
        DateTimeOffset now,
        CancellationToken ct)
    {
        var prefix = $"INV-{now:yyyyMMdd}";
        var countToday = await db.Invoices.CountAsync(i => i.InvoiceCode.StartsWith(prefix), ct);
        return $"{prefix}-{countToday + 1:0000}";
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var rawUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private static bool IsSupportedPaymentMethod(string paymentMethod) =>
        string.Equals(paymentMethod, nameof(PaymentMethod.Cash), StringComparison.Ordinal)
        || string.Equals(paymentMethod, nameof(PaymentMethod.BankTransfer), StringComparison.Ordinal);

    private static IResult ValidationError(string field, string message) =>
        Results.BadRequest(new
        {
            success = false,
            error = new
            {
                code = "VALIDATION_ERROR",
                message = "Du lieu khong hop le.",
                details = new[] { new { field, message } },
            },
        });

    private static IResult NotFound(string message) =>
        Results.NotFound(new
        {
            success = false,
            error = new { code = "NOT_FOUND", message },
        });

    private static IResult Conflict(string message) =>
        Results.Conflict(new
        {
            success = false,
            error = new { code = "CONFLICT", message },
        });

    private static IResult BusinessRule(string message) =>
        Results.UnprocessableEntity(new
        {
            success = false,
            error = new { code = "BUSINESS_RULE_VIOLATION", message },
        });

    private sealed record CreateInvoiceRequest(
        Guid TableSessionId,
        decimal Discount,
        string PaymentMethod);

    private sealed record InvoicePreviewDto(
        Guid TableSessionId,
        decimal Subtotal,
        decimal Discount,
        decimal TotalAmount,
        IReadOnlyList<InvoiceItemDto> Items);

    private sealed record InvoiceItemDto(
        Guid OrderItemId,
        string MenuItemName,
        decimal UnitPrice,
        int Quantity,
        decimal LineTotal);

    private sealed record InvoiceDto(
        Guid Id,
        Guid TableSessionId,
        string InvoiceCode,
        decimal Subtotal,
        decimal Discount,
        decimal TotalAmount,
        string PaymentMethod,
        string PaymentStatus,
        DateTimeOffset? PaidAt,
        IReadOnlyList<InvoiceItemDto> Items);
}
