using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkflowEngine.Abstraction.Extensions;
using WorkflowEngine.Data.Contexts;

namespace WorkflowEngine.Data.Extensions
{
    public static class DataExtension
    {
        public static void AddWorkflowData(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<WorkflowEngineDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddRegisteredServices(Assembly.GetExecutingAssembly());
        }
    }
}
