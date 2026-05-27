namespace Restaurant.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; }
    public Guid TableSessionId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTimeOffset? PaidAt { get; set; }
    public Guid CashierId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public TableSession TableSession { get; set; } = null!;
    public User Cashier { get; set; } = null!;
}
