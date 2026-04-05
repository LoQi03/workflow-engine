using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Data.Entities;

namespace WorkflowEngine.Data.Contexts;

public class WorkflowEngineDbContext(DbContextOptions<WorkflowEngineDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(r => r.Token).IsUnique();
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasMany(t => t.Companies)
                .WithOne(c => c.Tenant)
                .HasForeignKey(c => c.TenantId);
        });
    }
}
