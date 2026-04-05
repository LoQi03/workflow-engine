using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(IUserService))]
public class UserService(
    IUserRepository repository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : BaseService<UserDto>(repository), IUserService
{
    public override Task<UserDto> CreateAsync(UserDto dto)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(dto.Password);
        dto.Password = passwordHasher.Hash(dto.Password);
        return base.CreateAsync(dto);
    }

    public async Task<TokenResponseDto?> LoginAsync(LoginDto dto)
    {
        var passwordHash = await repository.GetPasswordHashByEmailAsync(dto.Email);

        if (passwordHash is null || !passwordHasher.Verify(dto.Password, passwordHash))
            return null;

        var user = await repository.GetByEmailAsync(dto.Email);
        if (user is null)
            return null;

        return await tokenService.GenerateTokensAsync(user);
    }

    public async Task<TokenResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        return await tokenService.RefreshTokensAsync(refreshToken);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        await tokenService.RevokeRefreshTokenAsync(refreshToken);
    }
}
