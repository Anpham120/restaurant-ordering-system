using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using Restaurant.Application.Features.Billing;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using Restaurant.Infrastructure.Data;

namespace Restaurant.Infrastructure.Features.Billing;

public sealed class GetInvoicePreviewHandler(RestaurantDbContext db)
{
    public async Task<InvoicePreviewDto> HandleAsync(Guid tableSessionId, CancellationToken ct = default)
    {
        var session = await BillingHelpers.LoadSessionForBilling(db, tableSessionId, asTracking: false, ct);
        if (session is null)
        {
            throw new BillingNotFoundException("Khong tim thay phien ban.");
        }

        return BillingHelpers.BuildPreview(session);
    }
}

public sealed class GetInvoiceHandler(RestaurantDbContext db)
{
    public async Task<InvoiceDto> HandleAsync(Guid invoiceId, CancellationToken ct = default)
    {
        var invoice = await db.Invoices
            .AsNoTracking()
            .Include(i => i.TableSession)
                .ThenInclude(ts => ts.Orders)
                    .ThenInclude(o => o.OrderItems)
            .FirstOrDefaultAsync(i => i.Id == invoiceId, ct);

        if (invoice is null)
        {
            throw new BillingNotFoundException("Khong tim thay hoa don.");
        }

        var items = BillingHelpers.GetBillableOrderItems(invoice.TableSession)
            .Select(BillingHelpers.ToInvoiceItemDto)
            .ToList();

        return BillingHelpers.ToInvoiceDto(invoice, items);
    }
}

public sealed class CreateInvoiceHandler(
    RestaurantDbContext db,
    TimeProvider timeProvider,
    ILogger<CreateInvoiceHandler> logger)
{
    public async Task<InvoiceDto> HandleAsync(
        CreateInvoiceRequest request,
        Guid cashierId,
        CancellationToken ct = default)
    {
        ValidateRequest(request);

        var session = await BillingHelpers.LoadSessionForBilling(db, request.TableSessionId, asTracking: true, ct);
        if (session is null)
        {
            logger.LogWarning("Khong tim thay phien ban {SessionId} de thanh toan.", request.TableSessionId);
            throw new BillingNotFoundException("Khong tim thay phien ban.");
        }

        if (!string.Equals(session.Status, nameof(TableSessionStatus.Active), StringComparison.Ordinal))
        {
            logger.LogWarning("Phien ban {SessionId} da dong hoac khong hoat dong.", request.TableSessionId);
            throw new BillingBusinessRuleException("Chi co the thanh toan phien ban dang hoat dong.");
        }

        var hasExistingInvoice = await db.Invoices
            .AnyAsync(invoice => invoice.TableSessionId == request.TableSessionId, ct);
        if (hasExistingInvoice)
        {
            logger.LogWarning("Phien ban {SessionId} da duoc thanh toan truoc do.", request.TableSessionId);
            throw new BillingConflictException("Phien ban da co hoa don.");
        }

        var billableItems = BillingHelpers.GetBillableOrderItems(session).ToList();
        if (billableItems.Count == 0)
        {
            throw new BillingBusinessRuleException("Khong co mon nao de thanh toan.");
        }

        var hasUnservedItems = billableItems.Any(item =>
            !string.Equals(item.Status, nameof(OrderItemStatus.Served), StringComparison.Ordinal));
        if (hasUnservedItems)
        {
            throw new BillingBusinessRuleException("Chi co the thanh toan khi tat ca mon da phuc vu.");
        }

        var subtotal = billableItems.Sum(item => item.UnitPrice * item.Quantity);
        if (request.Discount > subtotal)
        {
            throw new BillingValidationException("discount", "Giam gia khong duoc lon hon tam tinh.");
        }

        var now = timeProvider.GetUtcNow();
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            TableSessionId = session.Id,
            InvoiceCode = BillingHelpers.GenerateInvoiceCode(now),
            Subtotal = subtotal,
            Discount = request.Discount,
            TotalAmount = subtotal - request.Discount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = nameof(PaymentStatus.Paid),
            PaidAt = now,
            CashierId = cashierId,
            CreatedAt = now,
        };

        session.Status = nameof(TableSessionStatus.Closed);
        session.ClosedAt = now;
        session.Table.Status = nameof(TableStatus.Cleaning);
        session.Table.UpdatedAt = now;

        db.Invoices.Add(invoice);

        try
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Thanh toan thanh cong cho phien {SessionId}. Hoa don: {InvoiceCode}", session.Id, invoice.InvoiceCode);
        }
        catch (DbUpdateException ex) when (BillingHelpers.IsUniqueConstraint(ex, "ix_invoices_table_session_id"))
        {
            logger.LogWarning(ex, "Phien ban {SessionId} da co hoa don khi luu thanh toan.", request.TableSessionId);
            throw new BillingConflictException("Phien ban da co hoa don.");
        }

        return BillingHelpers.ToInvoiceDto(invoice, BillingHelpers.BuildPreview(session).Items);
    }

    private static void ValidateRequest(CreateInvoiceRequest request)
    {
        if (request.TableSessionId == Guid.Empty)
        {
            throw new BillingValidationException("tableSessionId", "TableSessionId khong hop le.");
        }

        if (request.Discount < 0)
        {
            throw new BillingValidationException("discount", "Giam gia khong duoc am.");
        }

        if (!BillingHelpers.IsSupportedPaymentMethod(request.PaymentMethod))
        {
            throw new BillingValidationException("paymentMethod", "Phuong thuc thanh toan khong hop le.");
        }
    }
}

internal static class BillingHelpers
{
    public static async Task<TableSession?> LoadSessionForBilling(
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

    public static InvoicePreviewDto BuildPreview(TableSession session)
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

    public static IEnumerable<OrderItem> GetBillableOrderItems(TableSession session) =>
        session.Orders
            .Where(order => !string.Equals(order.Status, nameof(OrderStatus.Cancelled), StringComparison.Ordinal))
            .SelectMany(order => order.OrderItems)
            .Where(item => !string.Equals(item.Status, nameof(OrderItemStatus.Cancelled), StringComparison.Ordinal));

    public static InvoiceItemDto ToInvoiceItemDto(OrderItem item) =>
        new(
            item.Id,
            item.MenuItemName,
            item.UnitPrice,
            item.Quantity,
            item.UnitPrice * item.Quantity);

    public static InvoiceDto ToInvoiceDto(Invoice invoice, IReadOnlyList<InvoiceItemDto> items) =>
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

    public static string GenerateInvoiceCode(DateTimeOffset now) =>
        $"INV-{now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

    public static bool IsSupportedPaymentMethod(string paymentMethod) =>
        string.Equals(paymentMethod, nameof(PaymentMethod.Cash), StringComparison.Ordinal)
        || string.Equals(paymentMethod, nameof(PaymentMethod.BankTransfer), StringComparison.Ordinal);

    public static bool IsUniqueConstraint(DbUpdateException exception, string constraintName) =>
        exception.InnerException is PostgresException postgresException
        && postgresException.SqlState == PostgresErrorCodes.UniqueViolation
        && string.Equals(postgresException.ConstraintName, constraintName, StringComparison.Ordinal);
}
