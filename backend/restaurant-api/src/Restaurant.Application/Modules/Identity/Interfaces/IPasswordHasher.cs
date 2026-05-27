namespace Restaurant.Application.Modules.Identity.Interfaces;

/// <summary>
/// Port để xác thực password — Infrastructure implement (BCrypt), Application dùng.
/// Domain không phụ thuộc BCrypt.
/// </summary>
public interface IPasswordHasher
{
    bool Verify(string password, string passwordHash);
    string Hash(string password);
}
