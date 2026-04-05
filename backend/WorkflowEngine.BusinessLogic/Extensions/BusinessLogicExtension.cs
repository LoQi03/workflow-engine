using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using WorkflowEngine.Abstraction.Extensions;

namespace WorkflowEngine.BusinessLogic.Extensions
{
    public static class BusinessLogicExtension
    {
        public static void AddWorkflowBusinessLogic(this IServiceCollection services)
        {
            services.AddRegisteredServices(Assembly.GetExecutingAssembly());
        }
    }
}
