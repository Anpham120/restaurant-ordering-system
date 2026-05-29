namespace Restaurant.Application.Features.Ordering.Orders;

public static class IdempotencyPayloadComparer
{
    public static bool HasSamePayload(
        IEnumerable<IdempotencyPayloadItem> existingItems,
        IEnumerable<IdempotencyPayloadItem> requestedItems)
    {
        var existing = Normalize(existingItems);
        var requested = Normalize(requestedItems);

        if (existing.Count != requested.Count)
            return false;

        for (var i = 0; i < existing.Count; i++)
        {
            if (existing[i] != requested[i])
                return false;
        }

        return true;
    }

    public static List<IdempotencyPayloadItem> Normalize(IEnumerable<IdempotencyPayloadItem> items)
    {
        return items
            .Select(item => new IdempotencyPayloadItem
            {
                MenuItemId = item.MenuItemId,
                Quantity = item.Quantity,
                Note = NormalizeNote(item.Note),
            })
            .OrderBy(item => item.MenuItemId)
            .ThenBy(item => item.Note, StringComparer.Ordinal)
            .ThenBy(item => item.Quantity)
            .ToList();
    }

    public static string? NormalizeNote(string? note)
    {
        var trimmed = note?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}

