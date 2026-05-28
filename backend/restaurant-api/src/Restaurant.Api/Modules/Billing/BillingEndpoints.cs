using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Restaurant.Application.Features.Billing;
using Restaurant.Infrastructure.Features.Billing;

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
        GetInvoicePreviewHandler handler,
        HttpContext httpContext,
        CancellationToken ct)
    {
        try
        {
            var preview = await handler.HandleAsync(id, ct);
            return Results.Ok(new ApiResponse<InvoicePreviewDto>(true, preview));
        }
        catch (BillingNotFoundException ex)
        {
            return Error(StatusCodes.Status404NotFound, "NOT_FOUND", ex.Message, httpContext.TraceIdentifier);
        }
    }

    private static async Task<IResult> CreateInvoiceAsync(
        CreateInvoiceRequest request,
        ClaimsPrincipal user,
        CreateInvoiceHandler handler,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var cashierId = GetCurrentUserId(user);
        if (cashierId is null)
        {
            return Error(StatusCodes.Status401Unauthorized, "UNAUTHORIZED", "Authentication is required.", httpContext.TraceIdentifier);
        }

        try
        {
            var result = await handler.HandleAsync(request, cashierId.Value, ct);
            return Results.Created($"/api/v1/invoices/{result.Id}", new ApiResponse<InvoiceDto>(true, result));
        }
        catch (BillingValidationException ex)
        {
            return Results.BadRequest(new ApiErrorResponse(false, new ApiError(
                "VALIDATION_ERROR",
                "Du lieu khong hop le.",
                [new { field = ex.Field, message = ex.Message }],
                httpContext.TraceIdentifier)));
        }
        catch (BillingNotFoundException ex)
        {
            return Error(StatusCodes.Status404NotFound, "NOT_FOUND", ex.Message, httpContext.TraceIdentifier);
        }
        catch (BillingConflictException ex)
        {
            return Error(StatusCodes.Status409Conflict, "CONFLICT", ex.Message, httpContext.TraceIdentifier);
        }
        catch (BillingBusinessRuleException ex)
        {
            return Error(StatusCodes.Status422UnprocessableEntity, "BUSINESS_RULE_VIOLATION", ex.Message, httpContext.TraceIdentifier);
        }
    }

    private static async Task<IResult> GetInvoiceAsync(
        Guid id,
        GetInvoiceHandler handler,
        HttpContext httpContext,
        CancellationToken ct)
    {
        try
        {
            var invoice = await handler.HandleAsync(id, ct);
            return Results.Ok(new ApiResponse<InvoiceDto>(true, invoice));
        }
        catch (BillingNotFoundException ex)
        {
            return Error(StatusCodes.Status404NotFound, "NOT_FOUND", ex.Message, httpContext.TraceIdentifier);
        }
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var rawUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private static IResult Error(int statusCode, string code, string message, string traceId) =>
        Results.Json(
            new ApiErrorResponse(false, new ApiError(code, message, [], traceId)),
            statusCode: statusCode);
}

public sealed record ApiResponse<T>(bool Success, T Data);
public sealed record ApiErrorResponse(bool Success, ApiError Error);
public sealed record ApiError(string Code, string Message, object[] Details, string TraceId);
