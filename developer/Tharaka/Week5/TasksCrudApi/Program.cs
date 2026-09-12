using TasksCrudApi;
using TasksCrudApi.Dtos;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TaskRepository>();
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

var app = builder.Build();

app.UseCors("ReactApp");

app.MapGet("/", () => Results.Redirect("/api/tasks"));

app.MapGet("/api/tasks", (TaskRepository repository) =>
{
    return Results.Ok(repository.GetAll());
});

app.MapGet("/api/tasks/{id:int}", (int id, TaskRepository repository) =>
{
    var task = repository.GetById(id);
    return task is null ? Results.NotFound() : Results.Ok(task);
});

app.MapPost("/api/tasks", (CreateTaskRequest request, TaskRepository repository) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Task title is required.");
    }

    var id = repository.Create(
        request.Title.Trim(),
        request.Description?.Trim() ?? string.Empty);

    var task = repository.GetById(id);
    return Results.Created($"/api/tasks/{id}", task);
});

app.MapPut("/api/tasks/{id:int}", (int id, UpdateTaskRequest request, TaskRepository repository) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Task title is required.");
    }

    var updated = repository.Update(
        id,
        request.Title.Trim(),
        request.Description?.Trim() ?? string.Empty,
        request.IsCompleted);

    return updated ? Results.Ok(repository.GetById(id)) : Results.NotFound();
});

app.MapDelete("/api/tasks/{id:int}", (int id, TaskRepository repository) =>
{
    return repository.Delete(id) ? Results.NoContent() : Results.NotFound();
});

app.Run();
