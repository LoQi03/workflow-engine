using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.BusinessLogic.Mappers;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Mappers;

[RegisterDI(typeof(IMapper<UserDto, User>))]
public class UserMapper : BaseMapper<UserDto, User>
{
    public override UserDto MapToDto(User entity) => new()
    {
        Id = entity.Id,
        FirstName = entity.FirstName,
        LastName = entity.LastName,
        Email = entity.Email,
        TenantId = entity.TenantId
    };

    public override User MapToEntity(UserDto dto) => new()
    {
        Id = dto.Id,
        FirstName = dto.FirstName ?? string.Empty,
        LastName = dto.LastName ?? string.Empty,
        Email = dto.Email ?? string.Empty,
        TenantId = dto.TenantId ?? 0
    };
}
