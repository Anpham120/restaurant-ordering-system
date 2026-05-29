namespace Restaurant.Application.Features.Billing;

public class BillingException : Exception
{
    public BillingException(string message) : base(message) { }
}

public sealed class BillingValidationException : BillingException
{
    public string Field { get; }

    public BillingValidationException(string field, string message) : base(message)
    {
        Field = field;
    }
}

public sealed class BillingNotFoundException : BillingException
{
    public BillingNotFoundException(string message) : base(message) { }
}

public sealed class BillingConflictException : BillingException
{
    public BillingConflictException(string message) : base(message) { }
}

public sealed class BillingBusinessRuleException : BillingException
{
    public BillingBusinessRuleException(string message) : base(message) { }
}
