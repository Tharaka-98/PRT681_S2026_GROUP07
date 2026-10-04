using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers;

/// <summary>
/// Read-only endpoints that feed the dashboard KPI tiles and the
/// DevExtreme PivotGrid.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context) => _context = context;

    [HttpGet("summary")]
    [ResponseCache(Duration = 15)]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var tasks = await _context.Tasks.Include(t => t.Project).AsNoTracking().ToListAsync(ct);

        var total = tasks.Count;
        var completed = tasks.Count(t => t.IsCompleted);

        return Ok(new DashboardSummaryDto
        {
            TotalTasks = total,
            CompletedTasks = completed,
            OpenTasks = total - completed,
            OverdueTasks = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value.Date < today),
            ActiveProjects = await _context.Projects.CountAsync(p => p.IsActive, ct),
            TotalEstimatedHours = Math.Round(tasks.Sum(t => t.EstimatedHours), 1),
            CompletionRate = total == 0 ? 0 : Math.Round(completed * 100.0 / total, 1),
            TasksByPriority = tasks
                .GroupBy(t => t.Priority)
                .OrderBy(g => g.Key)
                .Select(g => new SeriesPointDto { Label = g.Key.ToString(), Value = g.Count() })
                .ToList(),
            TasksByProject = tasks
                .GroupBy(t => t.Project != null ? t.Project.Name : "Unassigned")
                .OrderByDescending(g => g.Count())
                .Select(g => new SeriesPointDto { Label = g.Key, Value = g.Count() })
                .ToList()
        });
    }

    /// <summary>
    /// Flat fact rows. A pivot table wants denormalised data and does its own
    /// grouping client-side, so no aggregation happens here.
    /// </summary>
    [HttpGet("task-facts")]
    public async Task<ActionResult<IEnumerable<TaskFactDto>>> TaskFacts(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var tasks = await _context.Tasks.Include(t => t.Project).AsNoTracking().ToListAsync(ct);

        return Ok(tasks.Select(t => new TaskFactDto
        {
            ProjectName = t.Project != null ? t.Project.Name : "Unassigned",
            AssignedTo = string.IsNullOrWhiteSpace(t.AssignedTo) ? "Unassigned" : t.AssignedTo,
            PriorityName = t.Priority.ToString(),
            Status = t.IsCompleted
                ? "Completed"
                : t.DueDate.HasValue && t.DueDate.Value.Date < today ? "Overdue" : "Open",
            Year = t.CreatedAt.Year,
            Month = t.CreatedAt.Month,
            MonthName = System.Globalization.CultureInfo.InvariantCulture
                .DateTimeFormat.GetAbbreviatedMonthName(t.CreatedAt.Month),
            EstimatedHours = t.EstimatedHours,
            TaskCount = 1
        }));
    }
}
