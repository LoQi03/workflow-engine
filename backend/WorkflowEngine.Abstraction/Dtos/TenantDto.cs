namespace WorkflowEngine.Abstraction.Dtos;

public class TenantDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public List<CompanyDto>? Companies { get; set; }
}
