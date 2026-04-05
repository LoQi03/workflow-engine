using Microsoft.EntityFrameworkCore;
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
    public override async Task<IEnumerable<TenantDto>> GetAllAsync()
    {
        var entities = await _dbSet.AsNoTracking().Include(t => t.Companies).ToListAsync();
        return _mapper.MapToDtos(entities);
    }

    public override async Task<TenantDto?> GetByIdAsync(int id)
    {
        var entity = await _dbSet.AsNoTracking().Include(t => t.Companies).FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : _mapper.MapToDto(entity);
    }
}
