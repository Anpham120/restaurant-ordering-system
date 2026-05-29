namespace Restaurant.Application.Features.Billing;

public sealed record CreateInvoiceRequest(
    Guid TableSessionId,
    decimal Discount,
    string PaymentMethod);

public sealed record InvoicePreviewDto(
    Guid TableSessionId,
    decimal Subtotal,
    decimal Discount,
    decimal TotalAmount,
    IReadOnlyList<InvoiceItemDto> Items);

public sealed record InvoiceItemDto(
    Guid OrderItemId,
    string MenuItemName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);

public sealed record InvoiceDto(
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
