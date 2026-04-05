namespace WorkflowEngine.Abstraction.Repositories;

public interface IRefreshTokenRepository
{
    Task SaveAsync(int userId, string token, DateTime expiresAt);
    Task<(int UserId, DateTime ExpiresAt, bool IsRevoked)?> GetByTokenAsync(string token);
    Task RevokeAsync(string token);
}
