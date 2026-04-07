namespace WorkflowEngine.Abstraction.Repositories;

public interface IRefreshTokenRepository
{
    Task SaveAsync(int userId, int tenantId, string token, DateTime expiresAt);
    Task<(int UserId, int TenantId, DateTime ExpiresAt, bool IsRevoked)?> GetByTokenAsync(string token);
    Task RevokeAsync(string token);
}
