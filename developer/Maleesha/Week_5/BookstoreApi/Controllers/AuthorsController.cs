using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookstoreApi.Data;
using BookstoreApi.Models;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuthorsController> _logger;

    public AuthorsController(AppDbContext context, ILogger<AuthorsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Author>>> GetAll()
    {
        _logger.LogInformation("Fetching all authors");
        var authors = await _context.Authors.OrderBy(a => a.Id).ToListAsync();
        _logger.LogInformation("Returned {Count} authors", authors.Count);
        return authors;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Author>> GetById(int id)
    {
        _logger.LogInformation("Fetching author {AuthorId}", id);
        var item = await _context.Authors.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Author {AuthorId} not found", id);
            return NotFound();
        }
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Author>> Create(Author author)
    {
        if (string.IsNullOrWhiteSpace(author.Name))
        {
            _logger.LogWarning("Rejected author creation: name missing");
            return BadRequest("Name is required.");
        }

        _logger.LogInformation("Creating author {Name}", author.Name);
        _context.Authors.Add(author);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Author {AuthorId} created successfully", author.Id);
        return CreatedAtAction(nameof(GetById), new { id = author.Id }, author);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Author updated)
    {
        _logger.LogInformation("Updating author {AuthorId}", id);
        var item = await _context.Authors.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Author {AuthorId} not found for update", id);
            return NotFound();
        }

        item.Name = updated.Name;
        item.Bio = updated.Bio;
        item.Country = updated.Country;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Author {AuthorId} updated successfully", id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        _logger.LogInformation("Deleting author {AuthorId}", id);
        var item = await _context.Authors.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Author {AuthorId} not found for delete", id);
            return NotFound();
        }

        _context.Authors.Remove(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Author {AuthorId} deleted successfully", id);
        return NoContent();
    }
}