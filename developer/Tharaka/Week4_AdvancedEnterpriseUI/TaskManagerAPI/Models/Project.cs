using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

/// <summary>
/// A project groups tasks. Added in Week 4 so the enterprise grids,
/// pivot table and scheduler have a second dimension to slice by.
/// </summary>
public class Project
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Owner { get; set; } = string.Empty;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public List<TaskItem> Tasks { get; set; } = new();
}
