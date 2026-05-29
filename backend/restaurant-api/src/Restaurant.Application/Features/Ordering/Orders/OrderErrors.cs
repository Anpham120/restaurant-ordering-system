namespace Restaurant.Application.Features.Ordering.Orders;

public sealed class OrderingValidationException(string message) : Exception(message);

public sealed class OrderingNotFoundException(string message) : Exception(message);

public sealed class OrderingBusinessRuleException(string message) : Exception(message);

public sealed class IdempotencyConflictException(string message) : Exception(message);

