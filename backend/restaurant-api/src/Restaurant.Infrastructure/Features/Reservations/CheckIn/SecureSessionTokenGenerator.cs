using System.Security.Cryptography;
using Restaurant.Application.Features.Reservations.CheckIn;

namespace Restaurant.Infrastructure.Features.Reservations.CheckIn;

public sealed class SecureSessionTokenGenerator : ISessionTokenGenerator
{
    public string Create() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
}
