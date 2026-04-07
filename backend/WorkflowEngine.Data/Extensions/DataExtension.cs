using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkflowEngine.Abstraction.Extensions;
using WorkflowEngine.Abstraction.Services;
using WorkflowEngine.Data.Contexts;

namespace WorkflowEngine.Data.Extensions
{
    public static class DataExtension
    {
        public static void AddWorkflowData(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<WorkflowEngineDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<ITenantProvider, TenantProvider>();
            services.AddScoped<TenantDbContext>();

            services.AddRegisteredServices(Assembly.GetExecutingAssembly());
        }
    }

    internal class TenantProvider : ITenantProvider
    {
        public int? TenantId { get; private set; }
        public string? ConnectionString { get; private set; }

        public void SetTenant(int tenantId, string connectionString)
        {
            TenantId = tenantId;
            ConnectionString = connectionString;
        }
    }
}
