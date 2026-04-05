using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.Endpoint.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TenantController(ITenantService tenantService) : ControllerBase
{
    [HttpGet(Name = $"{nameof(TenantController)}.{nameof(GetAll)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TenantDto>>> GetAll()
    {
        var tenants = await tenantService.GetAllAsync();
        return Ok(tenants);
    }

    [HttpGet("{id}", Name = $"{nameof(TenantController)}.{nameof(GetById)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantDto>> GetById(int id)
    {
        var tenant = await tenantService.GetByIdAsync(id);
        return tenant is null ? NotFound() : Ok(tenant);
    }

    [HttpPost(Name = $"{nameof(TenantController)}.{nameof(Create)}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<TenantDto>> Create([FromBody] TenantDto dto)
    {
        var created = await tenantService.CreateAsync(dto);
        return CreatedAtRoute($"{nameof(TenantController)}.{nameof(GetById)}", new { id = created.Id }, created);
    }

    [HttpPut("{id}", Name = $"{nameof(TenantController)}.{nameof(Update)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantDto>> Update(int id, [FromBody] TenantDto dto)
    {
        var updated = await tenantService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}", Name = $"{nameof(TenantController)}.{nameof(Delete)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await tenantService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
