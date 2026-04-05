using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Contexts;

public class WorkflowEngineDbContext(DbContextOptions<WorkflowEngineDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Company> Companies => Set<Company>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
