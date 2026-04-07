using Microsoft.AspNetCore.Http;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.Endpoint.Middleware;

public class TenantMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IEnvironmentService environmentService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantIdClaim = context.User.FindFirst("tenant_id");
            if (tenantIdClaim is not null && int.TryParse(tenantIdClaim.Value, out var tenantId))
            {
                await environmentService.SetCurrentTenantByIdAsync(tenantId);
            }
        }

        await next(context);
    }
}
