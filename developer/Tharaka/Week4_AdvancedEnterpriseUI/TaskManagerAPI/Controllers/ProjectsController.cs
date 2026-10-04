using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(AppDbContext context, ILogger<ProjectsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectReadDto>>> GetPage(
        [FromQuery] GridQuery query, CancellationToken ct)
    {
        var q = _context.Projects.Include(p => p.Tasks).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(p => EF.Functions.Like(p.Name, $"%{term}%")
                          || EF.Functions.Like(p.Code, $"%{term}%")
                          || EF.Functions.Like(p.Owner, $"%{term}%"));
        }

        var total = await q.CountAsync(ct);

        q = (query.SortBy ?? "name").ToLowerInvariant() switch
        {
            "code"      => query.Descending ? q.OrderByDescending(p => p.Code)      : q.OrderBy(p => p.Code),
            "owner"     => query.Descending ? q.OrderByDescending(p => p.Owner)     : q.OrderBy(p => p.Owner),
            "startdate" => query.Descending ? q.OrderByDescending(p => p.StartDate) : q.OrderBy(p => p.StartDate),
            _           => query.Descending ? q.OrderByDescending(p => p.Name)      : q.OrderBy(p => p.Name)
        };

        var rows = await q.Skip(query.EffectiveSkip).Take(query.EffectiveTake).AsNoTracking().ToListAsync(ct);

        return Ok(new PagedResult<ProjectReadDto>
        {
            Items = rows.Select(Map),
            Total = total,
            Page = query.Page,
            PageSize = query.EffectiveTake
        });
    }

    /// <summary>Id + label pairs for the ComboBox / SelectBox on the task form.</summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<IEnumerable<LookupDto>>> Lookup(CancellationToken ct)
        => Ok(await _context.Projects
            .OrderBy(p => p.Name)
            .Select(p => new LookupDto { Id = p.Id, Label = p.Code + " - " + p.Name })
            .ToListAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectReadDto>> GetById(int id, CancellationToken ct)
    {
        var project = await _context.Projects.Include(p => p.Tasks)
            .AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);

        if (project == null) return NotFound(new { message = $"Project {id} not found" });
        return Ok(Map(project));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectReadDto>> Create([FromBody] ProjectWriteDto dto, CancellationToken ct)
    {
        if (await _context.Projects.AnyAsync(p => p.Code == dto.Code, ct))
            ModelState.AddModelError(nameof(dto.Code), "That project code is already in use");

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var project = new Project
        {
            Name = dto.Name.Trim(),
            Code = dto.Code.Trim().ToUpperInvariant(),
            Owner = dto.Owner.Trim(),
            StartDate = dto.StartDate,
            IsActive = dto.IsActive
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Project created: {Code}", project.Code);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, Map(project));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectReadDto>> Update(int id, [FromBody] ProjectWriteDto dto, CancellationToken ct)
    {
        var project = await _context.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id, ct);
        if (project == null) return NotFound(new { message = $"Project {id} not found" });

        if (await _context.Projects.AnyAsync(p => p.Code == dto.Code && p.Id != id, ct))
            ModelState.AddModelError(nameof(dto.Code), "That project code is already in use");

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        project.Name = dto.Name.Trim();
        project.Code = dto.Code.Trim().ToUpperInvariant();
        project.Owner = dto.Owner.Trim();
        project.StartDate = dto.StartDate;
        project.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(ct);
        return Ok(Map(project));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var project = await _context.Projects.FindAsync(new object[] { id }, ct);
        if (project == null) return NotFound(new { message = $"Project {id} not found" });

        _context.Projects.Remove(project);   // tasks are detached, not deleted (SetNull)
        await _context.SaveChangesAsync(ct);

        _logger.LogWarning("Project deleted: {ProjectId}", id);
        return NoContent();
    }

    private static ProjectReadDto Map(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Code = p.Code,
        Owner = p.Owner,
        StartDate = p.StartDate,
        IsActive = p.IsActive,
        TaskCount = p.Tasks.Count,
        OpenTaskCount = p.Tasks.Count(t => !t.IsCompleted)
    };
}
