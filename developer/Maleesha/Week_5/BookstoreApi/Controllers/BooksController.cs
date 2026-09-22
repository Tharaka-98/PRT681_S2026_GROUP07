using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookstoreApi.Data;
using BookstoreApi.Models;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<BooksController> _logger;

    public BooksController(AppDbContext context, ILogger<BooksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetAll()
    {
        _logger.LogInformation("Fetching all books");
        var books = await _context.Books.OrderBy(b => b.Id).ToListAsync();
        _logger.LogInformation("Returned {Count} books", books.Count);
        return books;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetById(int id)
    {
        _logger.LogInformation("Fetching book {BookId}", id);
        var item = await _context.Books.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Book {BookId} not found", id);
            return NotFound();
        }
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Book>> Create(Book book)
    {
        _logger.LogInformation("Creating book {Title} by author {AuthorId}", book.Title, book.AuthorId);
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Book {BookId} created successfully", book.Id);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Book updated)
    {
        _logger.LogInformation("Updating book {BookId}", id);
        var item = await _context.Books.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Book {BookId} not found for update", id);
            return NotFound();
        }

        item.Title = updated.Title;
        item.AuthorId = updated.AuthorId;
        item.Genre = updated.Genre;
        item.Price = updated.Price;
        item.Stock = updated.Stock;
        item.CoverColor = updated.CoverColor;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Book {BookId} updated successfully", id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        _logger.LogInformation("Deleting book {BookId}", id);
        var item = await _context.Books.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Book {BookId} not found for delete", id);
            return NotFound();
        }

        _context.Books.Remove(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Book {BookId} deleted successfully", id);
        return NoContent();
    }

    [HttpGet("test-error")]
    public IActionResult TestError()
    {
        throw new InvalidOperationException("This is a deliberately triggered test exception for Week 5 evidence.");
    }
}