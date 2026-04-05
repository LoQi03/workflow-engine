using Microsoft.Extensions.DependencyInjection;

namespace WorkflowEngine.Abstraction.Attributes;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public class RegisterDIAttribute : Attribute
{
    public Type ServiceType { get; }
    public ServiceLifetime Lifetime { get; }

    public RegisterDIAttribute(Type serviceType, ServiceLifetime lifetime = ServiceLifetime.Scoped)
    {
        ServiceType = serviceType;
        Lifetime = lifetime;
    }
}
