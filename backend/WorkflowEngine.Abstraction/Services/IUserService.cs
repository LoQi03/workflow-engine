using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Services;

public interface IUserService : IBaseService<UserDto>
{
    Task<TokenResponseDto?> LoginAsync(LoginDto dto);
    Task<TokenResponseDto?> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
}
