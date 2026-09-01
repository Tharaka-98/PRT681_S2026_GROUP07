using Microsoft.Data.Sqlite;

const string ConnectionString = "Data Source=tasks.db";

InitializeDatabase();

while (true)
{
    ClearScreen();
    Console.WriteLine("Task CRUD App");
    Console.WriteLine("-------------");
    Console.WriteLine("1. View all tasks");
    Console.WriteLine("2. Add a task");
    Console.WriteLine("3. Update a task");
    Console.WriteLine("4. Delete a task");
    Console.WriteLine("5. Mark task complete/incomplete");
    Console.WriteLine("0. Exit");
    Console.WriteLine();
    Console.Write("Choose an option: ");

    string? choice = Console.ReadLine();
    Console.WriteLine();

    switch (choice)
    {
        case "1":
            ViewTasks();
            Pause();
            break;
        case "2":
            AddTask();
            Pause();
            break;
        case "3":
            UpdateTask();
            Pause();
            break;
        case "4":
            DeleteTask();
            Pause();
            break;
        case "5":
            ToggleTaskCompletion();
            Pause();
            break;
        case "0":
            return;
        default:
            Console.WriteLine("Invalid option. Try again.");
            Pause();
            break;
    }
}

static void InitializeDatabase()
{
    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText =
        """
        CREATE TABLE IF NOT EXISTS Tasks (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Title TEXT NOT NULL,
            Description TEXT,
            IsComplete INTEGER NOT NULL DEFAULT 0,
            CreatedAt TEXT NOT NULL
        );
        """;

    command.ExecuteNonQuery();
}

static void ViewTasks()
{
    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText =
        """
        SELECT Id, Title, Description, IsComplete, CreatedAt
        FROM Tasks
        ORDER BY Id;
        """;

    using SqliteDataReader reader = command.ExecuteReader();

    if (!reader.HasRows)
    {
        Console.WriteLine("No tasks found.");
        return;
    }

    while (reader.Read())
    {
        int id = reader.GetInt32(0);
        string title = reader.GetString(1);
        string description = reader.IsDBNull(2) ? "" : reader.GetString(2);
        bool isComplete = reader.GetInt32(3) == 1;
        string createdAt = reader.GetString(4);

        Console.WriteLine($"[{id}] {title}");
        Console.WriteLine($"    Description: {(string.IsNullOrWhiteSpace(description) ? "(none)" : description)}");
        Console.WriteLine($"    Status: {(isComplete ? "Complete" : "Incomplete")}");
        Console.WriteLine($"    Created: {createdAt}");
        Console.WriteLine();
    }
}

static void AddTask()
{
    string title = ReadRequiredText("Task title: ");
    Console.Write("Description: ");
    string? description = Console.ReadLine();

    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText =
        """
        INSERT INTO Tasks (Title, Description, CreatedAt)
        VALUES ($title, $description, $createdAt);
        """;
    command.Parameters.AddWithValue("$title", title);
    command.Parameters.AddWithValue("$description", string.IsNullOrWhiteSpace(description) ? DBNull.Value : description);
    command.Parameters.AddWithValue("$createdAt", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

    command.ExecuteNonQuery();
    Console.WriteLine("Task added.");
}

static void UpdateTask()
{
    int id = ReadTaskId();

    if (!TaskExists(id))
    {
        Console.WriteLine("Task not found.");
        return;
    }

    string title = ReadRequiredText("New title: ");
    Console.Write("New description: ");
    string? description = Console.ReadLine();

    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText =
        """
        UPDATE Tasks
        SET Title = $title,
            Description = $description
        WHERE Id = $id;
        """;
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$title", title);
    command.Parameters.AddWithValue("$description", string.IsNullOrWhiteSpace(description) ? DBNull.Value : description);

    command.ExecuteNonQuery();
    Console.WriteLine("Task updated.");
}

static void DeleteTask()
{
    int id = ReadTaskId();

    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText = "DELETE FROM Tasks WHERE Id = $id;";
    command.Parameters.AddWithValue("$id", id);

    int rowsAffected = command.ExecuteNonQuery();
    Console.WriteLine(rowsAffected == 0 ? "Task not found." : "Task deleted.");
}

static void ToggleTaskCompletion()
{
    int id = ReadTaskId();

    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText =
        """
        UPDATE Tasks
        SET IsComplete = CASE IsComplete WHEN 1 THEN 0 ELSE 1 END
        WHERE Id = $id;
        """;
    command.Parameters.AddWithValue("$id", id);

    int rowsAffected = command.ExecuteNonQuery();
    Console.WriteLine(rowsAffected == 0 ? "Task not found." : "Task completion status changed.");
}

static bool TaskExists(int id)
{
    using SqliteConnection connection = new(ConnectionString);
    connection.Open();

    SqliteCommand command = connection.CreateCommand();
    command.CommandText = "SELECT COUNT(*) FROM Tasks WHERE Id = $id;";
    command.Parameters.AddWithValue("$id", id);

    long count = (long)command.ExecuteScalar()!;
    return count > 0;
}

static int ReadTaskId()
{
    while (true)
    {
        Console.Write("Task ID: ");
        string? input = Console.ReadLine();

        if (int.TryParse(input, out int id) && id > 0)
        {
            return id;
        }

        Console.WriteLine("Please enter a valid positive number.");
    }
}

static string ReadRequiredText(string prompt)
{
    while (true)
    {
        Console.Write(prompt);
        string? value = Console.ReadLine();

        if (!string.IsNullOrWhiteSpace(value))
        {
            return value.Trim();
        }

        Console.WriteLine("This field is required.");
    }
}

static void Pause()
{
    Console.WriteLine();
    Console.Write("Press Enter to continue...");
    Console.ReadLine();
}

static void ClearScreen()
{
    if (!Console.IsOutputRedirected)
    {
        Console.Clear();
    }
}
