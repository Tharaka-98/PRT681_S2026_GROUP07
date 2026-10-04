using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using TaskManagerAPI.Services;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TaskQueryService _queries;
    private readonly ILogger<TasksController> _logger;

    public TasksController(AppDbContext context, TaskQueryService queries, ILogger<TasksController> logger)
    {
        _context = context;
        _queries = queries;
        _logger = logger;
    }

    /// <summary>
    /// Server-side paged / sorted / filtered list. This is what both the
    /// KendoReact Grid and the DevExtreme DataGrid bind to.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TaskReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TaskReadDto>>> GetPage([FromQuery] GridQuery query, CancellationToken ct)
        => Ok(await _queries.GetPageAsync(query, ct));

    /// <summary>Unpaged list, kept so the Week 3 React frontend still works.</summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<TaskReadDto>>> GetAll(CancellationToken ct)
    {
        var rows = await _context.Tasks
            .Include(t => t.Project)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync(ct);

        return Ok(rows.Select(TaskQueryService.Map));
    }

    /// <summary>Distinct assignees, for the grid filter dropdown.</summary>
    [HttpGet("assignees")]
    public async Task<ActionResult<IEnumerable<string>>> GetAssignees(CancellationToken ct)
        => Ok(await _context.Tasks
            .Where(t => t.AssignedTo != "")
            .Select(t => t.AssignedTo)
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync(ct));

    /// <summary>Tasks with a due date, shaped for the Scheduler component.</summary>
    [HttpGet("schedule")]
    public async Task<ActionResult<IEnumerable<SchedulerEventDto>>> GetSchedule(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var start = from ?? DateTime.UtcNow.AddDays(-45);
        var end = to ?? DateTime.UtcNow.AddDays(45);

        var rows = await _context.Tasks
            .Include(t => t.Project)
            .Where(t => t.DueDate != null && t.DueDate >= start && t.DueDate <= end)
            .AsNoTracking()
            .ToListAsync(ct);

        return Ok(rows.Select(t => new SchedulerEventDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Start = t.DueDate!.Value.Date.AddHours(9),
            End = t.DueDate!.Value.Date.AddHours(9).AddHours(Math.Max(1, Math.Min(8, t.EstimatedHours))),
            IsAllDay = false,
            PriorityId = (int)t.Priority,
            ProjectName = t.Project != null ? t.Project.Name : "Unassigned"
        }));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskReadDto>> GetById(int id, CancellationToken ct)
    {
        var task = await _context.Tasks.Include(t => t.Project)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        if (task == null) return NotFound(new { message = $"Task {id} not found" });
        return Ok(TaskQueryService.Map(task));
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskReadDto>> Create([FromBody] TaskCreateDto dto, CancellationToken ct)
    {
        if (dto.ProjectId.HasValue && !await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId, ct))
            ModelState.AddModelError(nameof(dto.ProjectId), "Project does not exist");

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            AssignedTo = dto.AssignedTo.Trim(),
            EstimatedHours = dto.EstimatedHours,
            ProjectId = dto.ProjectId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(ct);
        await _context.Entry(task).Reference(t => t.Project).LoadAsync(ct);

        _logger.LogInformation("Task created: {TaskId} '{Title}' priority={Priority}", task.Id, task.Title, task.Priority);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, TaskQueryService.Map(task));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskReadDto>> Update(int id, [FromBody] TaskUpdateDto dto, CancellationToken ct)
    {
        var task = await _context.Tasks.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task == null) return NotFound(new { message = $"Task {id} not found" });

        if (dto.ProjectId.HasValue && !await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId, ct))
            ModelState.AddModelError(nameof(dto.ProjectId), "Project does not exist");

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        task.Title = dto.Title.Trim();
        task.Description = dto.Description.Trim();
        task.IsCompleted = dto.IsCompleted;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.AssignedTo = dto.AssignedTo.Trim();
        task.EstimatedHours = dto.EstimatedHours;
        task.ProjectId = dto.ProjectId;

        await _context.SaveChangesAsync(ct);
        await _context.Entry(task).Reference(t => t.Project).LoadAsync(ct);

        _logger.LogInformation("Task updated: {TaskId}", id);
        return Ok(TaskQueryService.Map(task));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var task = await _context.Tasks.FindAsync(new object[] { id }, ct);
        if (task == null) return NotFound(new { message = $"Task {id} not found" });

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(ct);

        _logger.LogWarning("Task deleted: {TaskId}", id);
        return NoContent();
    }

    [HttpPatch("{id:int}/toggle")]
    public async Task<ActionResult<TaskReadDto>> ToggleCompletion(int id, CancellationToken ct)
    {
        var task = await _context.Tasks.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task == null) return NotFound(new { message = $"Task {id} not found" });

        task.IsCompleted = !task.IsCompleted;
        await _context.SaveChangesAsync(ct);

        return Ok(TaskQueryService.Map(task));
    }

    /// <summary>Bulk complete / delete - driven by the grid's multi-select toolbar.</summary>
    [HttpPost("bulk")]
    public async Task<IActionResult> Bulk([FromBody] BulkActionDto dto, CancellationToken ct)
    {
        if (dto.Ids.Count == 0) return BadRequest(new { message = "No ids supplied" });

        var tasks = await _context.Tasks.Where(t => dto.Ids.Contains(t.Id)).ToListAsync(ct);

        switch (dto.Action?.ToLowerInvariant())
        {
            case "complete":
                tasks.ForEach(t => t.IsCompleted = true);
                break;
            case "reopen":
                tasks.ForEach(t => t.IsCompleted = false);
                break;
            case "delete":
                _context.Tasks.RemoveRange(tasks);
                break;
            default:
                return BadRequest(new { message = "Action must be complete, reopen or delete" });
        }

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Bulk {Action} applied to {Count} tasks", dto.Action, tasks.Count);
        return Ok(new { affected = tasks.Count });
    }
}

public class BulkActionDto
{
    public string? Action { get; set; }
    public List<int> Ids { get; set; } = new();
}
