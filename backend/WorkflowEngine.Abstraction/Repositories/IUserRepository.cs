using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Repositories;

public interface IUserRepository : IBaseRepository<UserDto>
{
    Task<UserDto?> GetByEmailAsync(string email);
    Task<string?> GetPasswordHashByEmailAsync(string email);
}
