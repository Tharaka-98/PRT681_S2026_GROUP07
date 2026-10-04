using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

// ---------- Task DTOs ----------

public class TaskCreateDto
{
    [Required(ErrorMessage = "Title is required")]
    [MinLength(3, ErrorMessage = "Title must be at least 3 characters")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    [MaxLength(120)]
    public string AssignedTo { get; set; } = string.Empty;

    [Range(0, 1000, ErrorMessage = "Estimated hours must be between 0 and 1000")]
    public double EstimatedHours { get; set; }

    public int? ProjectId { get; set; }
}

public class TaskUpdateDto : TaskCreateDto
{
    public bool IsCompleted { get; set; }
}

/// <summary>Flattened shape the grids bind to - avoids circular nav properties.</summary>
public class TaskReadDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public TaskPriority Priority { get; set; }
    public string PriorityName { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
    public double EstimatedHours { get; set; }
    public int? ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public bool IsOverdue { get; set; }
}

// ---------- Project DTOs ----------

public class ProjectWriteDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Code is required")]
    [RegularExpression("^[A-Z]{2,6}-[0-9]{2,4}$",
        ErrorMessage = "Code must look like ABC-123")]
    public string Code { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Owner { get; set; } = string.Empty;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}

public class ProjectReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public bool IsActive { get; set; }
    public int TaskCount { get; set; }
    public int OpenTaskCount { get; set; }
}

// ---------- Lookup / analytics ----------

public class LookupDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class TaskFactDto
{
    public string ProjectName { get; set; } = string.Empty;
    public string AssignedTo { get; set; } = string.Empty;
    public string PriorityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public double EstimatedHours { get; set; }
    public int TaskCount { get; set; } = 1;
}

public class DashboardSummaryDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OpenTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int ActiveProjects { get; set; }
    public double TotalEstimatedHours { get; set; }
    public double CompletionRate { get; set; }
    public List<SeriesPointDto> TasksByPriority { get; set; } = new();
    public List<SeriesPointDto> TasksByProject { get; set; } = new();
}

public class SeriesPointDto
{
    public string Label { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class SchedulerEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public bool IsAllDay { get; set; } = true;
    public int PriorityId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
}
