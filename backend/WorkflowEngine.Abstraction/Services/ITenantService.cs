using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Services;

public interface ITenantService : IBaseService<TenantDto>
{
    Task<TenantDto?> GetByNameAsync(string tenantName);
}
