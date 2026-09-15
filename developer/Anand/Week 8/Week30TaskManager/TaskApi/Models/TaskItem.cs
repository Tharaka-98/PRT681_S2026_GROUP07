using System.ComponentModel.DataAnnotations;

namespace TaskApi.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = "";

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsComplete { get; set; }

    public DateTime CreatedAt { get; set; }
}
