using WorkflowEngine.Abstraction.Entities;

namespace WorkflowEngine.Data.Entities;

public class Tenant : IBaseEntity, IRecordHistory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public int CreatedUserId { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedUserId { get; set; }

    public ICollection<User> Users { get; set; } = [];
    public ICollection<Company> Companies { get; set; } = [];
}
