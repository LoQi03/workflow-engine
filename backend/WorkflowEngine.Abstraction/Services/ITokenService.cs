using WorkflowEngine.Abstraction.Dtos;

namespace WorkflowEngine.Abstraction.Services;

public interface ITokenService
{
    Task<TokenResponseDto> GenerateTokensAsync(UserDto user, TenantDto tenantDto);
    Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}
