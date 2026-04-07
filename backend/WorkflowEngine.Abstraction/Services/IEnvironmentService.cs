using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Services;

public interface IEnvironmentService
{
    Task<TenantDto?> GetTenantByNameAsync(string tenantName);
    Task<TenantDto?> GetTenantByIdAsync(int tenantId);
    Task<TenantDto?> GetCurrentTenantAsync();
    Task<bool> SetCurrentTenantAsync(string tenantName);
    Task<bool> SetCurrentTenantByIdAsync(int tenantId);
}
