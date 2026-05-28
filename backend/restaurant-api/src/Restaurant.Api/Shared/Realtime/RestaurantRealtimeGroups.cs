using System.Security.Cryptography;
using System.Text;

namespace Restaurant.Api.Shared.Realtime;

public static class RestaurantRealtimeGroups
{
    public static string CustomerSession(string sessionToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionToken);

        var tokenBytes = Encoding.UTF8.GetBytes(sessionToken);
        var tokenHash = Convert.ToHexString(SHA256.HashData(tokenBytes)).ToLowerInvariant();
        return $"customer-session:{tokenHash}";
    }

    public static string Order(Guid orderId) => $"order:{orderId:N}";
}

