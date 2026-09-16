namespace TaskManagerApp;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }

    public override string ToString()
    {
        string status = IsCompleted ? "Done" : "Pending";
        return $"[{Id}] {Title} - {status} (Created: {CreatedAt:yyyy-MM-dd HH:mm})";
    }
}
