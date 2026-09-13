using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiApi.Data;
using MultiApi.Models;

namespace MultiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;
    public BooksController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetAll() =>
        await _context.Books.OrderBy(b => b.Id).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetById(int id)
    {
        var item = await _context.Books.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Book>> Create(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Book updated)
    {
        var item = await _context.Books.FindAsync(id);
        if (item == null) return NotFound();
        item.Title = updated.Title;
        item.Author = updated.Author;
        item.Genre = updated.Genre;
        item.PublishedYear = updated.PublishedYear;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Books.FindAsync(id);
        if (item == null) return NotFound();
        _context.Books.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}