using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(IUserService))]
public class UserService(
    IUserRepository repository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IEnvironmentService environmentService) : BaseService<UserDto>(repository), IUserService
{
    public override async Task<UserDto> CreateAsync(UserDto dto)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(dto.Password);
        dto.Password = passwordHasher.Hash(dto.Password);
        var tenant = await environmentService.GetCurrentTenantAsync();

        if (tenant is null)
        {
            throw new InvalidOperationException("No tenant context found. Please set the tenant context before creating a user.");
        }

        dto.TenantId = tenant.Id;
        return await base.CreateAsync(dto);
    }

    public async Task<TokenResponseDto?> LoginAsync(LoginDto loginDto)
    {
        if (!await environmentService.SetCurrentTenantAsync(loginDto.TenantName))
            return null;

        var tenant = await environmentService.GetTenantByNameAsync(loginDto.TenantName);
        if (tenant is null)
            return null;

        var passwordHash = await repository.GetPasswordHashByEmailAsync(loginDto.Email);

        if (passwordHash is null || !passwordHasher.Verify(loginDto.Password, passwordHash))
        {
            return null;
        }

        var user = await repository.GetByEmailAsync(loginDto.Email);

        if (user is null)
        {
            return null;
        }

        return await tokenService.GenerateTokensAsync(user, tenant);
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
