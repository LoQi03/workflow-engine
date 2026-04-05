using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkflowEngine.Abstraction.Dtos;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.Endpoint.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CompanyController(ICompanyService companyService) : ControllerBase
{
    [HttpGet(Name = $"{nameof(CompanyController)}.{nameof(GetAll)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetAll()
    {
        var companies = await companyService.GetAllAsync();
        return Ok(companies);
    }

    [HttpGet("{id}", Name = $"{nameof(CompanyController)}.{nameof(GetById)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyDto>> GetById(int id)
    {
        var company = await companyService.GetByIdAsync(id);
        return company is null ? NotFound() : Ok(company);
    }

    [HttpPost(Name = $"{nameof(CompanyController)}.{nameof(Create)}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<CompanyDto>> Create([FromBody] CompanyDto dto)
    {
        var created = await companyService.CreateAsync(dto);
        return CreatedAtRoute($"{nameof(CompanyController)}.{nameof(GetById)}", new { id = created.Id }, created);
    }

    [HttpPut("{id}", Name = $"{nameof(CompanyController)}.{nameof(Update)}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyDto>> Update(int id, [FromBody] CompanyDto dto)
    {
        var updated = await companyService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}", Name = $"{nameof(CompanyController)}.{nameof(Delete)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await companyService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
