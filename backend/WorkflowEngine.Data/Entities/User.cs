using WorkflowEngine.Abstraction.Entities;

namespace WorkflowEngine.Data.Entities;

public class User : IBaseEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public ICollection<Company> Companies { get; set; } = [];
}
