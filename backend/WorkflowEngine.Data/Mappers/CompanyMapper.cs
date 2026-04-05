using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.BusinessLogic.Mappers;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Mappers;

[RegisterDI(typeof(IMapper<CompanyDto, Company>))]
public class CompanyMapper : BaseMapper<CompanyDto, Company>
{
    public override CompanyDto MapToDto(Company entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name
    };

    public override Company MapToEntity(CompanyDto dto) => new()
    {
        Id = dto.Id,
        Name = dto.Name ?? string.Empty
    };
}
