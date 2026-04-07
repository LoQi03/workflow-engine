using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Services;

public interface IUserService : IBaseService<UserDto>
{
    Task<TokenResponseDto?> LoginAsync(LoginDto loginDto);
    Task<TokenResponseDto?> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
}
