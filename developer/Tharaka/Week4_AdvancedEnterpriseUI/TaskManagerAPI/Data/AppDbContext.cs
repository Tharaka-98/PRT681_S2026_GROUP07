using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.SetNull);

        // Priority is stored as its underlying int on purpose: ORDER BY Priority
        // then sorts Low -> Critical. Storing the name would sort alphabetically
        // (Critical, High, Low, Medium), which is not what the grid header means.
        modelBuilder.Entity<TaskItem>()
            .Property(t => t.Priority)
            .HasConversion<int>();

        base.OnModelCreating(modelBuilder);
    }
}
