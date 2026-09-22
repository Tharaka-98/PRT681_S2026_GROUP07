using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookstoreApi.Data;
using BookstoreApi.Models;
using Temporalio.Client;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReviewsController> _logger;
    private readonly IConfiguration _configuration;

    public ReviewsController(AppDbContext context, ILogger<ReviewsController> logger, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Review>>> GetAll()
    {
        _logger.LogInformation("Fetching all reviews");
        var reviews = await _context.Reviews.OrderBy(r => r.Id).ToListAsync();
        _logger.LogInformation("Returned {Count} reviews", reviews.Count);
        return reviews;
    }

    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetByBook(int bookId)
    {
        _logger.LogInformation("Fetching reviews for book {BookId}", bookId);
        var reviews = await _context.Reviews.Where(r => r.BookId == bookId).ToListAsync();
        _logger.LogInformation("Returned {Count} reviews for book {BookId}", reviews.Count, bookId);
        return reviews;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Review>> GetById(int id)
    {
        _logger.LogInformation("Fetching review {ReviewId}", id);
        var item = await _context.Reviews.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Review {ReviewId} not found", id);
            return NotFound();
        }
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Review>> Create(Review review)
    {
        if (string.IsNullOrWhiteSpace(review.ReviewerName))
        {
            _logger.LogWarning("Rejected review creation: reviewer name missing");
            return BadRequest("Reviewer name is required.");
        }
        if (review.Rating < 1 || review.Rating > 5)
        {
            _logger.LogWarning("Rejected review creation: invalid rating {Rating}", review.Rating);
            return BadRequest("Rating must be between 1 and 5.");
        }

        _logger.LogInformation("Creating review for book {BookId} by {ReviewerName}", review.BookId, review.ReviewerName);

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} created successfully", review.Id);

        var book = await _context.Books.FindAsync(review.BookId);
        if (book != null)
        {
            try
            {
                var temporalHost = _configuration["Temporal:Host"] ?? "localhost:7233";
                var client = await TemporalClient.ConnectAsync(new TemporalClientConnectOptions
                {
                    TargetHost = temporalHost,
                });

                await client.StartWorkflowAsync(
                    (BookstoreWorkflows.ReviewNotificationWorkflow wf) =>
                        wf.RunAsync("reviewer@example.com", book.Title),
                    // new WorkflowOptions("bookstore-task-queue", $"review-{review.Id}"));
                    new WorkflowOptions($"review-{review.Id}", "bookstore-task-queue")
                );

                _logger.LogInformation("Started review notification workflow for review {ReviewId}", review.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to start notification workflow for review {ReviewId}", review.Id);
            }
        }

        return CreatedAtAction(nameof(GetById), new { id = review.Id }, review);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Review updated)
    {
        _logger.LogInformation("Updating review {ReviewId}", id);
        var item = await _context.Reviews.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Review {ReviewId} not found for update", id);
            return NotFound();
        }

        item.BookId = updated.BookId;
        item.ReviewerName = updated.ReviewerName;
        item.Rating = updated.Rating;
        item.Comment = updated.Comment;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} updated successfully", id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        _logger.LogInformation("Deleting review {ReviewId}", id);
        var item = await _context.Reviews.FindAsync(id);
        if (item == null)
        {
            _logger.LogWarning("Review {ReviewId} not found for delete", id);
            return NotFound();
        }

        _context.Reviews.Remove(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} deleted successfully", id);
        return NoContent();
    }
}