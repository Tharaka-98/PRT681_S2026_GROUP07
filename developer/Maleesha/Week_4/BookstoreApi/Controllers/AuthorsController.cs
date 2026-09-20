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
    public AuthorsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Author>>> GetAll() =>
        await _context.Authors.OrderBy(a => a.Id).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Author>> GetById(int id)
    {
        var item = await _context.Authors.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Author>> Create(Author author)
    {
        if (string.IsNullOrWhiteSpace(author.Name))
            return BadRequest("Name is required.");
        _context.Authors.Add(author);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = author.Id }, author);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Author updated)
    {
        var item = await _context.Authors.FindAsync(id);
        if (item == null) return NotFound();
        item.Name = updated.Name;
        item.Bio = updated.Bio;
        item.Country = updated.Country;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Authors.FindAsync(id);
        if (item == null) return NotFound();
        _context.Authors.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}