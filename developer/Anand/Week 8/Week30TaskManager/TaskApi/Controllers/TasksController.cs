using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskApi.Data;
using TaskApi.Models;

namespace TaskApi.Controllers;

public class TasksController(TasksDbContext database) : Controller
{
    public async Task<IActionResult> Index()
    {
        List<TaskItem> tasks = await database.Tasks
            .OrderBy(task => task.IsComplete)
            .ThenByDescending(task => task.CreatedAt)
            .ToListAsync();

        return View(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string title, string? description)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return RedirectToAction(nameof(Index));
        }

        database.Tasks.Add(new TaskItem
        {
            Title = title.Trim(),
            Description = description?.Trim(),
            CreatedAt = DateTime.UtcNow
        });

        await database.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Toggle(int id)
    {
        TaskItem? task = await database.Tasks.FindAsync(id);
        if (task is null)
        {
            return NotFound();
        }

        task.IsComplete = !task.IsComplete;
        await database.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        TaskItem? task = await database.Tasks.FindAsync(id);
        if (task is null)
        {
            return NotFound();
        }

        database.Tasks.Remove(task);
        await database.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }
}
