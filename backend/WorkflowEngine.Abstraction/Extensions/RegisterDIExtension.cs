using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using WorkflowEngine.Abstraction.Attributes;

namespace WorkflowEngine.Abstraction.Extensions;

public static class RegisterDIExtension
{
    public static IServiceCollection AddRegisteredServices(this IServiceCollection services, params Assembly[] assemblies)
    {
        foreach (var assembly in assemblies)
        {
            var types = assembly.GetTypes()
                .Where(t => t is { IsClass: true, IsAbstract: false })
                .Select(t => new
                {
                    Implementation = t,
                    Attributes = t.GetCustomAttributes<RegisterDIAttribute>()
                })
                .Where(x => x.Attributes.Any());

            foreach (var type in types)
            {
                foreach (var attr in type.Attributes)
                {
                    services.Add(new ServiceDescriptor(attr.ServiceType, type.Implementation, attr.Lifetime));
                }
            }
        }

        return services;
    }
}
