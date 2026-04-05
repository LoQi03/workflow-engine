using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Data.Contexts;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Repositories;

[RegisterDI(typeof(IRefreshTokenRepository))]
public class RefreshTokenRepository(WorkflowEngineDbContext context) : IRefreshTokenRepository
{
    public async Task SaveAsync(int userId, string token, DateTime expiresAt)
    {
        var entity = new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        context.RefreshTokens.Add(entity);
        await context.SaveChangesAsync();
    }

    public async Task<(int UserId, DateTime ExpiresAt, bool IsRevoked)?> GetByTokenAsync(string token)
    {
        var entity = await context.RefreshTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Token == token);

        if (entity is null)
            return null;

        return (entity.UserId, entity.ExpiresAt, entity.RevokedAt is not null);
    }

    public async Task RevokeAsync(string token)
    {
        var entity = await context.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == token);

        if (entity is not null)
        {
            entity.RevokedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }
    }
}
