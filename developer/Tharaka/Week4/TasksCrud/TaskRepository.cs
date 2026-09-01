using Microsoft.Data.Sqlite;

namespace TasksCrud;

/// <summary>
/// Data access layer — handles all SQLite read/write operations.
/// UI code should call this class instead of writing SQL directly.
/// </summary>
public class TaskRepository
{
    private readonly string _connectionString;

    public TaskRepository(string databasePath = "tasks.db")
    {
        _connectionString = $"Data Source={databasePath}";
        InitializeDatabase(); // Ensure table exists on first run
    }

    /// <summary>
    /// Creates the Tasks table if it does not already exist.
    /// </summary>
    private void InitializeDatabase()
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS Tasks (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Description TEXT NOT NULL,
                IsCompleted INTEGER NOT NULL DEFAULT 0,
                CreatedAt TEXT NOT NULL
            );
            """;
        command.ExecuteNonQuery();
    }

    /// <summary>
    /// Inserts a new task and returns the generated Id.
    /// </summary>
    public int Create(string title, string description)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO Tasks (Title, Description, IsCompleted, CreatedAt)
            VALUES ($title, $description, 0, $createdAt);
            SELECT last_insert_rowid();
            """;
        // Parameterized values — safer than string concatenation (prevents SQL injection)
        command.Parameters.AddWithValue("$title", title);
        command.Parameters.AddWithValue("$description", description);
        command.Parameters.AddWithValue("$createdAt", DateTime.UtcNow.ToString("O"));

        return Convert.ToInt32(command.ExecuteScalar());
    }

    /// <summary>
    /// Returns all tasks ordered by Id.
    /// </summary>
    public List<TaskItem> GetAll()
    {
        var tasks = new List<TaskItem>();

        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = """
            SELECT Id, Title, Description, IsCompleted, CreatedAt
            FROM Tasks
            ORDER BY Id;
            """;

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            tasks.Add(MapTask(reader)); // Convert each DB row to a TaskItem object
        }

        return tasks;
    }

    /// <summary>
    /// Finds a single task by Id. Returns null if not found.
    /// </summary>
    public TaskItem? GetById(int id)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = """
            SELECT Id, Title, Description, IsCompleted, CreatedAt
            FROM Tasks
            WHERE Id = $id;
            """;
        command.Parameters.AddWithValue("$id", id);

        using var reader = command.ExecuteReader();
        return reader.Read() ? MapTask(reader) : null;
    }

    /// <summary>
    /// Updates an existing task. Returns true if a row was changed.
    /// </summary>
    public bool Update(int id, string title, string description, bool isCompleted)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE Tasks
            SET Title = $title,
                Description = $description,
                IsCompleted = $isCompleted
            WHERE Id = $id;
            """;
        command.Parameters.AddWithValue("$id", id);
        command.Parameters.AddWithValue("$title", title);
        command.Parameters.AddWithValue("$description", description);
        command.Parameters.AddWithValue("$isCompleted", isCompleted ? 1 : 0); // SQLite stores bool as 0/1

        return command.ExecuteNonQuery() > 0;
    }

    /// <summary>
    /// Deletes a task by Id. Returns true if a row was removed.
    /// </summary>
    public bool Delete(int id)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Tasks WHERE Id = $id;";
        command.Parameters.AddWithValue("$id", id);

        return command.ExecuteNonQuery() > 0;
    }

    /// <summary>
    /// Maps a database row (SqliteDataReader) to a TaskItem object.
    /// </summary>
    private static TaskItem MapTask(SqliteDataReader reader)
    {
        return new TaskItem
        {
            Id = reader.GetInt32(0),
            Title = reader.GetString(1),
            Description = reader.GetString(2),
            IsCompleted = reader.GetInt32(3) == 1,
            CreatedAt = DateTime.Parse(reader.GetString(4))
        };
    }
}
