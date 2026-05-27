using Restaurant.Application.Modules.Identity.Interfaces;

namespace Restaurant.Infrastructure.Services;

/// <summary>
/// BCrypt implementation của IPasswordHasher.
/// Infrastructure layer — Application và Domain không phụ thuộc BCrypt.
/// </summary>
public class BcryptPasswordHasher : IPasswordHasher
{
    public bool Verify(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }

    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }
}
