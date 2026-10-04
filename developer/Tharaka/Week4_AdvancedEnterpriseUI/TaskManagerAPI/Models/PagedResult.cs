namespace TaskManagerAPI.Models;

/// <summary>
/// Envelope every grid-facing endpoint returns. KendoReact Grid reads
/// { data, total } and DevExtreme DataGrid reads { data, totalCount },
/// so both aliases are serialised to keep the two suites happy.
/// </summary>
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(Total / (double)PageSize) : 0;

    // Aliases for the component libraries
    public IEnumerable<T> Data => Items;
    public int TotalCount => Total;
}
