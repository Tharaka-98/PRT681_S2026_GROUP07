namespace TasksCrudApi;

/// <summary>
/// Domain model — represents one task record in the application.
/// Maps to the Tasks table in SQLite.
/// </summary>
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
}
