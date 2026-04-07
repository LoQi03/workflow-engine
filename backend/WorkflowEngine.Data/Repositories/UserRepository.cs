using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Data.Contexts;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Repositories;

[RegisterDI(typeof(IUserRepository))]
public class UserRepository(
    TenantDbContext context,
    IMapper<UserDto, User> mapper) : BaseRepository<User, UserDto>(context, mapper), IUserRepository
{
    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
        return entity is null ? null : _mapper.MapToDto(entity);
    }

    public async Task<string?> GetPasswordHashByEmailAsync(string email)
    {
        return await _dbSet.AsNoTracking()
            .Where(u => u.Email == email)
            .Select(u => u.PasswordHash)
            .FirstOrDefaultAsync();
    }
}
