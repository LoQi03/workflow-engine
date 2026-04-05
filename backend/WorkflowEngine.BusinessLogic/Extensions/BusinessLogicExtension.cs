using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkflowEngine.Abstraction.Extensions;
using WorkflowEngine.Abstraction.Settings;

namespace WorkflowEngine.BusinessLogic.Extensions
{
    public static class BusinessLogicExtension
    {
        public static void AddWorkflowBusinessLogic(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtSettings = configuration.GetSection(nameof(JwtSettings)).Get<JwtSettings>()
                ?? throw new InvalidOperationException("JwtSettings configuration section is missing.");
            services.AddSingleton(jwtSettings);

            services.AddRegisteredServices(Assembly.GetExecutingAssembly());
        }
    }
}
