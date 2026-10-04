using Microsoft.AspNetCore.Mvc;

namespace TaskManagerAPI.Models;

/// <summary>
/// Query-string contract for server-side paging / sorting / filtering.
/// Example: /api/tasks?page=2&amp;pageSize=20&amp;sortBy=dueDate&amp;sortDir=asc&amp;search=api&amp;status=open
/// </summary>
public class GridQuery
{
    private int _pageSize = 10;
    private int _page = 1;

    [FromQuery(Name = "page")]
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    [FromQuery(Name = "pageSize")]
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value is < 1 or > 200 ? 10 : value;
    }

    /// <summary>Alternative to page/pageSize - DevExtreme sends skip/take.</summary>
    [FromQuery(Name = "skip")]
    public int? Skip { get; set; }

    [FromQuery(Name = "take")]
    public int? Take { get; set; }

    [FromQuery(Name = "sortBy")]
    public string? SortBy { get; set; }

    [FromQuery(Name = "sortDir")]
    public string? SortDir { get; set; }

    [FromQuery(Name = "search")]
    public string? Search { get; set; }

    /// <summary>all | open | completed | overdue</summary>
    [FromQuery(Name = "status")]
    public string? Status { get; set; }

    [FromQuery(Name = "priority")]
    public TaskPriority? Priority { get; set; }

    [FromQuery(Name = "projectId")]
    public int? ProjectId { get; set; }

    [FromQuery(Name = "assignedTo")]
    public string? AssignedTo { get; set; }

    public bool Descending =>
        string.Equals(SortDir, "desc", StringComparison.OrdinalIgnoreCase);

    public int EffectiveSkip => Skip ?? (Page - 1) * PageSize;

    public int EffectiveTake => Take is > 0 and <= 200 ? Take!.Value : PageSize;
}
