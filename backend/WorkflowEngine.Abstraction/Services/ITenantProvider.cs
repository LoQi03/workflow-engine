namespace WorkflowEngine.Abstraction.Services;

public interface ITenantProvider
{
    int? TenantId { get; }
    string? ConnectionString { get; }
    void SetTenant(int tenantId, string connectionString);
}
