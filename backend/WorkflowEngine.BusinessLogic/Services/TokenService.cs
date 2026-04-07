using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WorkflowEngine.Abstraction.Attributes;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;
using WorkflowEngine.Abstraction.Settings;

namespace WorkflowEngine.BusinessLogic.Services;

[RegisterDI(typeof(ITokenService))]
public class TokenService(
    JwtSettings jwtSettings,
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    IEnvironmentService environmentService) : ITokenService
{
    public async Task<TokenResponseDto> GenerateTokensAsync(UserDto userDto, TenantDto tenantDto)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(jwtSettings.AccessTokenExpirationMinutes);
        var accessToken = GenerateAccessToken(userDto, tenantDto.Id, expiresAt);
        var refreshToken = GenerateRefreshToken();

        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenExpirationDays);
        await refreshTokenRepository.SaveAsync(userDto.Id, tenantDto.Id, refreshToken, refreshTokenExpiresAt);

        return new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };
    }

    public async Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken)
    {
        var tokenData = await refreshTokenRepository.GetByTokenAsync(refreshToken);

        if (tokenData is null || tokenData.Value.IsRevoked || tokenData.Value.ExpiresAt <= DateTime.UtcNow)
            return null;

        await refreshTokenRepository.RevokeAsync(refreshToken);

        if (!await environmentService.SetCurrentTenantByIdAsync(tokenData.Value.TenantId))
            return null;

        var user = await userRepository.GetByIdAsync(tokenData.Value.UserId);
        if (user is null)
            return null;

        var tenant = await environmentService.GetTenantByIdAsync(tokenData.Value.TenantId);
        if (tenant is null)
            return null;

        return await GenerateTokensAsync(user, tenant);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        await refreshTokenRepository.RevokeAsync(refreshToken);
    }

    private string GenerateAccessToken(UserDto user, int tenantId, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("tenant_id", tenantId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
