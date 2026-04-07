using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Abstraction.Services;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Contexts;

public class TenantDbContext(ITenantProvider tenantProvider) : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Company> Companies => Set<Company>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var connectionString = tenantProvider.ConnectionString
            ?? throw new InvalidOperationException("Tenant has not been set for the current request.");
        optionsBuilder.UseSqlServer(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.TenantId).HasDefaultValue(0);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasMany(u => u.Companies)
                  .WithMany(c => c.Users);
        });
    }
}
