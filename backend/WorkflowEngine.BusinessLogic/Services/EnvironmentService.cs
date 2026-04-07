using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(IEnvironmentService))]
public class EnvironmentService(ITenantService tenantService, ITenantProvider tenantProvider) : IEnvironmentService
{
    public async Task<TenantDto?> GetTenantByNameAsync(string tenantName)
    {
        return await tenantService.GetByNameAsync(tenantName);
    }

    public async Task<TenantDto?> GetTenantByIdAsync(int tenantId)
    {
        return await tenantService.GetByIdAsync(tenantId);
    }

    public async Task<TenantDto?> GetCurrentTenantAsync()
    {
        if (tenantProvider.TenantId is not { } tenantId)
            return null;

        return await tenantService.GetByIdAsync(tenantId);
    }

    public async Task<bool> SetCurrentTenantAsync(string tenantName)
    {
        var tenant = await tenantService.GetByNameAsync(tenantName);
        if (tenant is null || string.IsNullOrEmpty(tenant.ConnectionString))
            return false;

        tenantProvider.SetTenant(tenant.Id, tenant.ConnectionString);
        return true;
    }

    public async Task<bool> SetCurrentTenantByIdAsync(int tenantId)
    {
        var tenant = await tenantService.GetByIdAsync(tenantId);
        if (tenant is null || string.IsNullOrEmpty(tenant.ConnectionString))
            return false;

        tenantProvider.SetTenant(tenant.Id, tenant.ConnectionString);
        return true;
    }
}
