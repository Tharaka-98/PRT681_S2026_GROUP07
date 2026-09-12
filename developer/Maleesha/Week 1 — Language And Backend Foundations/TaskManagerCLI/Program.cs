using Microsoft.Data.SqlClient;

class Program
{
    private const string ConnectionString =
    "Server=(localdb)\\MSSQLLocalDB;Database=TaskManagerDb;Trusted_Connection=True;TrustServerCertificate=True;";

    static void Main(string[] args)
    {
        bool running = true;
        while (running)
        {
            Console.WriteLine("\n--- Task Manager ---");
            Console.WriteLine("1. View all tasks");
            Console.WriteLine("2. Add a task");
            Console.WriteLine("3. Update a task");
            Console.WriteLine("4. Delete a task");
            Console.WriteLine("5. Exit");
            Console.Write("Choose an option: ");

            switch (Console.ReadLine())
            {
                case "1": ViewTasks(); break;
                case "2": AddTask(); break;
                case "3": UpdateTask(); break;
                case "4": DeleteTask(); break;
                case "5": running = false; break;
                default: Console.WriteLine("Invalid option."); break;
            }
        }
    }

    // CREATE
    static void AddTask()
    {
        Console.Write("Enter task title: ");
        string? title = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(title))
        {
            Console.WriteLine("Title cannot be empty.");
            return;
        }

        using var connection = new SqlConnection(ConnectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = @"
            INSERT INTO Tasks (Title, IsComplete, CreatedAt)
            VALUES (@title, 0, SYSUTCDATETIME());";
        command.Parameters.AddWithValue("@title", title);

        command.ExecuteNonQuery();
        Console.WriteLine("Task added.");
    }

    // READ
    static void ViewTasks()
    {
        using var connection = new SqlConnection(ConnectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Title, IsComplete, CreatedAt FROM Tasks ORDER BY Id;";

        using var reader = command.ExecuteReader();

        if (!reader.HasRows)
        {
            Console.WriteLine("No tasks found.");
            return;
        }

        Console.WriteLine("\nID | Title | Done | Created At");
        while (reader.Read())
        {
            int id = reader.GetInt32(0);
            string title = reader.GetString(1);
            bool isComplete = reader.GetBoolean(2);
            DateTime createdAt = reader.GetDateTime(3);

            Console.WriteLine($"{id} | {title} | {(isComplete ? "Yes" : "No")} | {createdAt}");
        }
    }

    // UPDATE
    static void UpdateTask()
    {
        Console.Write("Enter task ID to update: ");
        if (!int.TryParse(Console.ReadLine(), out int id))
        {
            Console.WriteLine("Invalid ID.");
            return;
        }

        Console.Write("New title (leave blank to keep current): ");
        string? newTitle = Console.ReadLine();

        Console.Write("Mark as complete? (y/n): ");
        string? completeInput = Console.ReadLine();
        bool isComplete = completeInput?.Trim().ToLower() == "y";

        using var connection = new SqlConnection(ConnectionString);
        connection.Open();

        var command = connection.CreateCommand();

        if (string.IsNullOrWhiteSpace(newTitle))
        {
            command.CommandText = "UPDATE Tasks SET IsComplete = @isComplete WHERE Id = @id;";
        }
        else
        {
            command.CommandText = "UPDATE Tasks SET Title = @title, IsComplete = @isComplete WHERE Id = @id;";
            command.Parameters.AddWithValue("@title", newTitle);
        }

        command.Parameters.AddWithValue("@isComplete", isComplete);
        command.Parameters.AddWithValue("@id", id);

        int rows = command.ExecuteNonQuery();
        Console.WriteLine(rows > 0 ? "Task updated." : "No task found with that ID.");
    }

    // DELETE
    static void DeleteTask()
    {
        Console.Write("Enter task ID to delete: ");
        if (!int.TryParse(Console.ReadLine(), out int id))
        {
            Console.WriteLine("Invalid ID.");
            return;
        }

        using var connection = new SqlConnection(ConnectionString);
        connection.Open();

        var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Tasks WHERE Id = @id;";
        command.Parameters.AddWithValue("@id", id);

        int rows = command.ExecuteNonQuery();
        Console.WriteLine(rows > 0 ? "Task deleted." : "No task found with that ID.");
    }
}