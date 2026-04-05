using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.Endpoint.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet(Name = $"{nameof(UserController)}.{nameof(GetAll)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}", Name = $"{nameof(UserController)}.{nameof(GetById)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

#if DEBUG

    [AllowAnonymous]
    [HttpPost(Name = $"{nameof(UserController)}.{nameof(Create)}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<UserDto>> Create([FromBody] UserDto dto)
    {
        var created = await userService.CreateAsync(dto);
        return CreatedAtRoute($"{nameof(UserController)}.{nameof(GetById)}", new { id = created.Id }, created);
    }

#endif

    [HttpPut("{id}", Name = $"{nameof(UserController)}.{nameof(Update)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UserDto dto)
    {
        var updated = await userService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}", Name = $"{nameof(UserController)}.{nameof(Delete)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await userService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [AllowAnonymous]
    [HttpPost("login", Name = $"{nameof(UserController)}.{nameof(Login)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto dto)
    {
        var tokens = await userService.LoginAsync(dto);
        return tokens is null ? Unauthorized() : Ok(tokens);
    }

    [AllowAnonymous]
    [HttpPost("refresh", Name = $"{nameof(UserController)}.{nameof(Refresh)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TokenResponseDto>> Refresh([FromBody] RefreshTokenRequestDto dto)
    {
        var tokens = await userService.RefreshTokenAsync(dto.RefreshToken);
        return tokens is null ? Unauthorized() : Ok(tokens);
    }

    [HttpPost("revoke", Name = $"{nameof(UserController)}.{nameof(Revoke)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequestDto dto)
    {
        await userService.RevokeTokenAsync(dto.RefreshToken);
        return NoContent();
    }
}
