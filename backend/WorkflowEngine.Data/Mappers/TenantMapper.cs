using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.BusinessLogic.Mappers;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Mappers;

[RegisterDI(typeof(IMapper<TenantDto, Tenant>))]
public class TenantMapper(
    IMapper<CompanyDto, Company> companyMapper) : BaseMapper<TenantDto, Tenant>
{
    public override TenantDto MapToDto(Tenant entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Companies = entity.Companies?.Select(companyMapper.MapToDto).ToList()
    };

    public override Tenant MapToEntity(TenantDto dto) => new()
    {
        Id = dto.Id,
        Name = dto.Name ?? string.Empty,
        Companies = dto.Companies?.Select(companyMapper.MapToEntity).ToList() ?? []
    };
}
