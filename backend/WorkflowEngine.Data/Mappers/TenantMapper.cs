using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.BusinessLogic.Mappers;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Mappers;

[RegisterDI(typeof(IMapper<TenantDto, Tenant>))]
public class TenantMapper : BaseMapper<TenantDto, Tenant>
{
    public override TenantDto MapToDto(Tenant entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        CompanyId = entity.CompanyId
    };

    public override Tenant MapToEntity(TenantDto dto) => new()
    {
        Id = dto.Id,
        Name = dto.Name ?? string.Empty,
        CompanyId = dto.CompanyId ?? 0
    };
}
