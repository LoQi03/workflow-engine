using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Data.Contexts;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Repositories;

[RegisterDI(typeof(ITenantRepository))]
public class TenantRepository(
    WorkflowEngineDbContext context,
    IMapper<TenantDto, Tenant> mapper) : BaseRepository<Tenant, TenantDto>(context, mapper), ITenantRepository
{
}
