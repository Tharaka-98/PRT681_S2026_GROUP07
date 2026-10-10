using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context) => _context = context;

    /// <summary>Used by the Docker HEALTHCHECK and by the portal's status badge.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var dbUp = await _context.Database.CanConnectAsync(ct);
        var payload = new
        {
            status = dbUp ? "healthy" : "degraded",
            database = dbUp ? "up" : "down",
            utc = DateTime.UtcNow,
            version = "week4"
        };

        return dbUp ? Ok(payload) : StatusCode(StatusCodes.Status503ServiceUnavailable, payload);
    }
}
