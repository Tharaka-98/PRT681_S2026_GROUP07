using Microsoft.Data.Sqlite;

namespace TaskManagerApp;

public class TaskRepository
{
    private readonly string _connectionString;

    public TaskRepository(string databasePath)
    {
        _connectionString = $"Data Source={databasePath}";
        InitializeDatabase();
    }

    private void InitializeDatabase()
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = @"
            CREATE TABLE IF NOT EXISTS Tasks (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Description TEXT NOT NULL DEFAULT '',
                IsCompleted INTEGER NOT NULL DEFAULT 0,
                CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
            )";
        command.ExecuteNonQuery();
    }

    // CREATE
    public int AddTask(string title, string description)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = @"
            INSERT INTO Tasks (Title, Description)
            VALUES (@title, @description);
            SELECT last_insert_rowid();";
        command.Parameters.AddWithValue("@title", title);
        command.Parameters.AddWithValue("@description", description);

        return Convert.ToInt32(command.ExecuteScalar());
    }

    // READ - Get all tasks
    public List<TaskItem> GetAllTasks()
    {
        var tasks = new List<TaskItem>();

        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Title, Description, IsCompleted, CreatedAt FROM Tasks ORDER BY Id";

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            tasks.Add(new TaskItem
            {
                Id = reader.GetInt32(0),
                Title = reader.GetString(1),
                Description = reader.GetString(2),
                IsCompleted = reader.GetInt32(3) == 1,
                CreatedAt = DateTime.Parse(reader.GetString(4))
            });
        }

        return tasks;
    }

    // READ - Get task by ID
    public TaskItem? GetTaskById(int id)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Title, Description, IsCompleted, CreatedAt FROM Tasks WHERE Id = @id";
        command.Parameters.AddWithValue("@id", id);

        using var reader = command.ExecuteReader();
        if (reader.Read())
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

        return null;
    }

    // UPDATE
    public bool UpdateTask(int id, string title, string description, bool isCompleted)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = @"
            UPDATE Tasks
            SET Title = @title, Description = @description, IsCompleted = @isCompleted
            WHERE Id = @id";
        command.Parameters.AddWithValue("@title", title);
        command.Parameters.AddWithValue("@description", description);
        command.Parameters.AddWithValue("@isCompleted", isCompleted ? 1 : 0);
        command.Parameters.AddWithValue("@id", id);

        return command.ExecuteNonQuery() > 0;
    }

    // DELETE
    public bool DeleteTask(int id)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Tasks WHERE Id = @id";
        command.Parameters.AddWithValue("@id", id);

        return command.ExecuteNonQuery() > 0;
    }

    // Toggle completion status
    public bool ToggleTaskCompletion(int id)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = @"
            UPDATE Tasks
            SET IsCompleted = CASE WHEN IsCompleted = 0 THEN 1 ELSE 0 END
            WHERE Id = @id";
        command.Parameters.AddWithValue("@id", id);

        return command.ExecuteNonQuery() > 0;
    }
}
