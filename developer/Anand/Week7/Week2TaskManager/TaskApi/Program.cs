using Microsoft.EntityFrameworkCore;
using TaskApi.Data;
using TaskApi.Dtos;
using TaskApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<TasksDbContext>(options =>
{
    string connectionString = builder.Configuration.GetConnectionString("TasksDatabase")
        ?? "Data Source=tasks-api.db";

    options.UseSqlite(connectionString);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (IServiceScope scope = app.Services.CreateScope())
{
    TasksDbContext database = scope.ServiceProvider.GetRequiredService<TasksDbContext>();
    database.Database.EnsureCreated();
}

app.UseCors("ReactApp");

app.MapGet("/", () => Results.Redirect("/api/tasks"));

app.MapGet("/api/tasks", async (TasksDbContext database) =>
{
    List<TaskItem> tasks = await database.Tasks
        .OrderBy(task => task.IsComplete)
        .ThenByDescending(task => task.CreatedAt)
        .ToListAsync();

    return Results.Ok(tasks);
});

app.MapGet("/api/tasks/{id:int}", async (int id, TasksDbContext database) =>
{
    TaskItem? task = await database.Tasks.FindAsync(id);
    return task is null ? Results.NotFound() : Results.Ok(task);
});

app.MapPost("/api/tasks", async (CreateTaskRequest request, TasksDbContext database) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Task title is required.");
    }

    TaskItem task = new()
    {
        Title = request.Title.Trim(),
        Description = request.Description?.Trim(),
        IsComplete = false,
        CreatedAt = DateTime.UtcNow
    };

    database.Tasks.Add(task);
    await database.SaveChangesAsync();

    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapPut("/api/tasks/{id:int}", async (int id, UpdateTaskRequest request, TasksDbContext database) =>
{
    TaskItem? task = await database.Tasks.FindAsync(id);

    if (task is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Task title is required.");
    }

    task.Title = request.Title.Trim();
    task.Description = request.Description?.Trim();
    task.IsComplete = request.IsComplete;

    await database.SaveChangesAsync();

    return Results.Ok(task);
});

app.MapDelete("/api/tasks/{id:int}", async (int id, TasksDbContext database) =>
{
    TaskItem? task = await database.Tasks.FindAsync(id);

    if (task is null)
    {
        return Results.NotFound();
    }

    database.Tasks.Remove(task);
    await database.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
