using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(IUserService))]
public class UserService(
    IUserRepository repository) : BaseService<UserDto>(repository), IUserService
{
}
