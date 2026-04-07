using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(ITenantService))]
public class TenantService(
    ITenantRepository repository) : BaseService<TenantDto>(repository), ITenantService
{
    public async Task<TenantDto?> GetByNameAsync(string tenantName)
    {
        var results = await QueryAsync(t => t.Name == tenantName);
        return results.FirstOrDefault();
    }
}
