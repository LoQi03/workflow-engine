using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.Endpoint.Controllers;

[Route("api/[controller]")]
[ApiController]
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

    [HttpPost(Name = $"{nameof(UserController)}.{nameof(Create)}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<UserDto>> Create([FromBody] UserDto dto)
    {
        var created = await userService.CreateAsync(dto);
        return CreatedAtRoute($"{nameof(UserController)}.{nameof(GetById)}", new { id = created.Id }, created);
    }

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
}
