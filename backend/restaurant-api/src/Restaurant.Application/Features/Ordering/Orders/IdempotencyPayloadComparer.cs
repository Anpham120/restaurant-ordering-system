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
            .GroupBy(item => new { item.MenuItemId, item.Note })
            .Select(group => new IdempotencyPayloadItem
            {
                MenuItemId = group.Key.MenuItemId,
                Note = group.Key.Note,
                Quantity = group.Sum(item => item.Quantity),
            })
            .OrderBy(item => item.MenuItemId)
            .ThenBy(item => item.Note, StringComparer.Ordinal)
            .ToList();
    }

    public static string? NormalizeNote(string? note)
    {
        var trimmed = note?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}

