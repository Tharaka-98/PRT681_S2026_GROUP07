using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Services;

/// <summary>
/// All grid querying lives here so the controller stays thin and the
/// same filter/sort rules are reused by the grid, pivot and scheduler.
/// </summary>
public class TaskQueryService
{
    private readonly AppDbContext _db;
    private readonly ILogger<TaskQueryService> _logger;

    public TaskQueryService(AppDbContext db, ILogger<TaskQueryService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public IQueryable<TaskItem> Build(GridQuery q)
    {
        var today = DateTime.UtcNow.Date;
        var query = _db.Tasks.Include(t => t.Project).AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim();
            query = query.Where(t =>
                EF.Functions.Like(t.Title, $"%{term}%") ||
                EF.Functions.Like(t.Description, $"%{term}%") ||
                EF.Functions.Like(t.AssignedTo, $"%{term}%"));
        }

        query = (q.Status ?? "all").ToLowerInvariant() switch
        {
            "open"      => query.Where(t => !t.IsCompleted),
            "completed" => query.Where(t => t.IsCompleted),
            "overdue"   => query.Where(t => !t.IsCompleted && t.DueDate != null && t.DueDate < today),
            _           => query
        };

        if (q.Priority.HasValue)
            query = query.Where(t => t.Priority == q.Priority.Value);

        if (q.ProjectId.HasValue)
            query = query.Where(t => t.ProjectId == q.ProjectId.Value);

        if (!string.IsNullOrWhiteSpace(q.AssignedTo))
            query = query.Where(t => t.AssignedTo == q.AssignedTo);

        return query;
    }

    /// <summary>
    /// Whitelisted sorting. A switch beats building an expression from a raw
    /// string: unknown columns can never reach the database.
    /// </summary>
    public IQueryable<TaskItem> ApplySort(IQueryable<TaskItem> query, GridQuery q)
    {
        var field = (q.SortBy ?? "createdAt").Trim();
        var desc = q.Descending;

        return field.ToLowerInvariant() switch
        {
            "title"          => desc ? query.OrderByDescending(t => t.Title)          : query.OrderBy(t => t.Title),
            "priority"       => desc ? query.OrderByDescending(t => t.Priority)       : query.OrderBy(t => t.Priority),
            "duedate"        => desc ? query.OrderByDescending(t => t.DueDate)        : query.OrderBy(t => t.DueDate),
            "assignedto"     => desc ? query.OrderByDescending(t => t.AssignedTo)     : query.OrderBy(t => t.AssignedTo),
            "estimatedhours" => desc ? query.OrderByDescending(t => t.EstimatedHours) : query.OrderBy(t => t.EstimatedHours),
            "iscompleted"    => desc ? query.OrderByDescending(t => t.IsCompleted)    : query.OrderBy(t => t.IsCompleted),
            "projectname"    => desc ? query.OrderByDescending(t => t.Project!.Name)  : query.OrderBy(t => t.Project!.Name),
            _                => desc ? query.OrderByDescending(t => t.CreatedAt)      : query.OrderBy(t => t.CreatedAt)
        };
    }

    public async Task<PagedResult<TaskReadDto>> GetPageAsync(GridQuery q, CancellationToken ct = default)
    {
        var filtered = Build(q);
        var total = await filtered.CountAsync(ct);

        // Materialise the page first, then project in memory: EF Core cannot
        // translate a call to our own Map() helper into SQL.
        var entities = await ApplySort(filtered, q)
            .Skip(q.EffectiveSkip)
            .Take(q.EffectiveTake)
            .AsNoTracking()
            .ToListAsync(ct);

        var rows = entities.Select(Map).ToList();

        _logger.LogInformation(
            "Task grid query: status={Status} search={Search} sort={SortBy}/{SortDir} skip={Skip} take={Take} matched={Total}",
            q.Status ?? "all", q.Search ?? "-", q.SortBy ?? "createdAt", q.SortDir ?? "desc",
            q.EffectiveSkip, q.EffectiveTake, total);

        return new PagedResult<TaskReadDto>
        {
            Items = rows,
            Total = total,
            Page = q.EffectiveTake > 0 ? q.EffectiveSkip / q.EffectiveTake + 1 : 1,
            PageSize = q.EffectiveTake
        };
    }

    public static TaskReadDto Map(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        IsCompleted = t.IsCompleted,
        CreatedAt = t.CreatedAt,
        Priority = t.Priority,
        PriorityName = t.Priority.ToString(),
        DueDate = t.DueDate,
        AssignedTo = t.AssignedTo,
        EstimatedHours = t.EstimatedHours,
        ProjectId = t.ProjectId,
        ProjectName = t.Project != null ? t.Project.Name : "Unassigned",
        IsOverdue = !t.IsCompleted && t.DueDate != null && t.DueDate.Value.Date < DateTime.UtcNow.Date
    };
}
