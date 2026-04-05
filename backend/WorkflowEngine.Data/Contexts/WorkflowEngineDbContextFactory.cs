using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace WorkflowEngine.Data.Contexts;

public class WorkflowEngineDbContextFactory : IDesignTimeDbContextFactory<WorkflowEngineDbContext>
{
    public WorkflowEngineDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "..", "WorkflowEngine.Service"))
            .AddJsonFile("appsettings.json")
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<WorkflowEngineDbContext>();
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));

        return new WorkflowEngineDbContext(optionsBuilder.Options);
    }
}
