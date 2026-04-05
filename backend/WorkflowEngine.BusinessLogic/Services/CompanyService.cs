using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(ICompanyService))]
public class CompanyService(
    ICompanyRepository repository) : BaseService<CompanyDto>(repository), ICompanyService
{
}
