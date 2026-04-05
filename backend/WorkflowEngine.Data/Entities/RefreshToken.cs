using WorkflowEngine.Abstraction.Entities;

namespace WorkflowEngine.Data.Entities;

public class RefreshToken : IBaseEntity
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public User User { get; set; } = null!;
}
