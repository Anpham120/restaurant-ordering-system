using Restaurant.Application.Features.Ordering.Orders;

namespace Restaurant.UnitTests.Ordering;

public class IdempotencyPayloadComparerTests
{
    [Fact]
    public void HasSamePayload_ReturnsTrue_WhenItemsMatchIgnoringOrderAndBlankNotes()
    {
        var firstId = Guid.NewGuid();
        var secondId = Guid.NewGuid();

        var existing = new[]
        {
            new IdempotencyPayloadItem { MenuItemId = firstId, Quantity = 1, Note = null },
            new IdempotencyPayloadItem { MenuItemId = secondId, Quantity = 2, Note = "it cay" },
        };

        var requested = new[]
        {
            new IdempotencyPayloadItem { MenuItemId = secondId, Quantity = 2, Note = " it cay " },
            new IdempotencyPayloadItem { MenuItemId = firstId, Quantity = 1, Note = " " },
        };

        Assert.True(IdempotencyPayloadComparer.HasSamePayload(existing, requested));
    }

    [Fact]
    public void HasSamePayload_ReturnsFalse_WhenQuantityDiffers()
    {
        var menuItemId = Guid.NewGuid();

        var existing = new[]
        {
            new IdempotencyPayloadItem { MenuItemId = menuItemId, Quantity = 1, Note = null },
        };

        var requested = new[]
        {
            new IdempotencyPayloadItem { MenuItemId = menuItemId, Quantity = 2, Note = null },
        };

        Assert.False(IdempotencyPayloadComparer.HasSamePayload(existing, requested));
    }
}

