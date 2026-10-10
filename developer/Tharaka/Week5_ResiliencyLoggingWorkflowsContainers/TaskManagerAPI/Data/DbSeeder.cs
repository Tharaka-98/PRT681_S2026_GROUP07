using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Data;

/// <summary>
/// Seeds enough rows that server-side paging, the pivot table and the
/// scheduler all have something meaningful to show on first run.
/// </summary>
public static class DbSeeder
{
    private static readonly string[] People =
        { "Tharaka", "Avishka", "Nimal", "Sanduni", "Kasun", "Dilini" };

    private static readonly (string Name, string Code, string Owner)[] Seeds =
    {
        ("Customer Portal Rebuild", "CPR-100", "Tharaka"),
        ("Warehouse Scanner Rollout", "WSR-210", "Avishka"),
        ("Billing Engine Migration", "BEM-315", "Nimal"),
        ("Field Service Mobile App", "FSM-420", "Sanduni")
    };

    public static void Seed(AppDbContext db)
    {
        db.Database.EnsureCreated();

        if (!db.Projects.Any())
        {
            var start = DateTime.UtcNow.AddMonths(-6);
            db.Projects.AddRange(Seeds.Select((s, i) => new Project
            {
                Name = s.Name,
                Code = s.Code,
                Owner = s.Owner,
                StartDate = start.AddDays(i * 21),
                IsActive = i != 3
            }));
            db.SaveChanges();
        }

        if (db.Tasks.Any()) return;

        var projects = db.Projects.OrderBy(p => p.Id).ToList();
        var rng = new Random(681);           // fixed seed -> repeatable demo data
        var priorities = Enum.GetValues<TaskPriority>();
        var verbs = new[] { "Design", "Implement", "Refactor", "Document", "Test", "Review", "Deploy", "Harden" };
        var nouns = new[] { "login flow", "task grid", "pivot report", "scheduler view", "CRUD form", "API contract",
                            "Docker image", "nginx proxy", "validation rules", "audit log", "health check", "CI pipeline" };

        var tasks = new List<TaskItem>();
        for (var i = 0; i < 64; i++)
        {
            var created = DateTime.UtcNow.AddDays(-rng.Next(0, 150));
            var project = projects[rng.Next(projects.Count)];
            var completed = rng.NextDouble() < 0.42;

            tasks.Add(new TaskItem
            {
                Title = $"{verbs[rng.Next(verbs.Length)]} the {nouns[rng.Next(nouns.Length)]}",
                Description = "Seeded sample row used to demonstrate server-side paging and filtering.",
                IsCompleted = completed,
                CreatedAt = created,
                Priority = priorities[rng.Next(priorities.Length)],
                DueDate = created.AddDays(rng.Next(-10, 40)),
                AssignedTo = People[rng.Next(People.Length)],
                EstimatedHours = Math.Round(rng.NextDouble() * 24 + 1, 1),
                ProjectId = project.Id
            });
        }

        db.Tasks.AddRange(tasks);
        db.SaveChanges();
    }
}
