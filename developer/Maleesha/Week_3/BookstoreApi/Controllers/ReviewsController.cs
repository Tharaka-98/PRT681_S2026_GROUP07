using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookstoreApi.Data;
using BookstoreApi.Models;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;
    public ReviewsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Review>>> GetAll() =>
        await _context.Reviews.OrderBy(r => r.Id).ToListAsync();

    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetByBook(int bookId) =>
        await _context.Reviews.Where(r => r.BookId == bookId).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Review>> GetById(int id)
    {
        var item = await _context.Reviews.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Review>> Create(Review review)
    {
        if (string.IsNullOrWhiteSpace(review.ReviewerName)) return BadRequest("Reviewer name is required.");
        if (review.Rating < 1 || review.Rating > 5) return BadRequest("Rating must be between 1 and 5.");
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = review.Id }, review);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Review updated)
    {
        var item = await _context.Reviews.FindAsync(id);
        if (item == null) return NotFound();
        item.BookId = updated.BookId;
        item.ReviewerName = updated.ReviewerName;
        item.Rating = updated.Rating;
        item.Comment = updated.Comment;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Reviews.FindAsync(id);
        if (item == null) return NotFound();
        _context.Reviews.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}