using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Data.Contexts;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Repositories;

[RegisterDI(typeof(ICompanyRepository))]
public class CompanyRepository(
    TenantDbContext context,
    IMapper<CompanyDto, Company> mapper) : BaseRepository<Company, CompanyDto>(context, mapper), ICompanyRepository
{
}
