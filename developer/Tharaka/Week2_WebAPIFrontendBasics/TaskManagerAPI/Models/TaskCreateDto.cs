using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

public class TaskCreateDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}
