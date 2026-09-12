namespace TasksCrudApi.Dtos;

public record UpdateTaskRequest(string Title, string? Description, bool IsCompleted);
