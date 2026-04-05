using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Data.Contexts;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Repositories;

[RegisterDI(typeof(IUserRepository))]
public class UserRepository(
    WorkflowEngineDbContext context,
    IMapper<UserDto, User> mapper) : BaseRepository<User, UserDto>(context, mapper), IUserRepository
{
}
