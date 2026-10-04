using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagerAPI.Models;

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ---- Week 4 additions ----

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    /// <summary>Drives the Scheduler view and the "overdue" filter.</summary>
    public DateTime? DueDate { get; set; }

    [MaxLength(120)]
    public string AssignedTo { get; set; } = string.Empty;

    /// <summary>Estimated effort in hours - the PivotGrid aggregates this.</summary>
    public double EstimatedHours { get; set; }

    public int? ProjectId { get; set; }

    public Project? Project { get; set; }

    [NotMapped]
    public bool IsOverdue =>
        !IsCompleted && DueDate.HasValue && DueDate.Value.Date < DateTime.UtcNow.Date;
}
