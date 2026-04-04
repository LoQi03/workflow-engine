using Microsoft.EntityFrameworkCore;

namespace WorkflowEngine.Data.Contexts;

public class WorkflowEngineDbContext(DbContextOptions<WorkflowEngineDbContext> options)
    : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
