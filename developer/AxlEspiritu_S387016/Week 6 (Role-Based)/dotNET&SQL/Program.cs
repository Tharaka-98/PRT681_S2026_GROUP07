using Microsoft.Data.SqlClient;

class Program
{
    static string connectionString =
        "Server=localhost;Database=TaskManagerDB;Trusted_Connection=True;TrustServerCertificate=True;";

    static void Main()
    {
        bool running = true;

        while (running)
        {
            Console.WriteLine();
            Console.WriteLine("===== Task Manager =====");
            Console.WriteLine("1. View Tasks");
            Console.WriteLine("2. Add Task");
            Console.WriteLine("3. Update Task");
            Console.WriteLine("4. Delete Task");
            Console.WriteLine("5. Mark Task Complete");
            Console.WriteLine("6. Exit");
            Console.WriteLine();

            Console.Write("Choose an option: ");
            string choice = Console.ReadLine() ?? "";

            switch (choice)
            {
                case "1":
                    ViewTasks();
                    break;

                case "2":
                    AddTask();
                    break;

                case "3":
                    UpdateTask();
                    break;

                case "4":
                    DeleteTask();
                    break;

                case "5":
                    CompleteTask();
                    break;

                case "6":
                    running = false;
                    Console.WriteLine("Goodbye!");
                    break;

                default:
                    Console.WriteLine("Invalid option.");
                    break;
            }
        }
    }

    static void ViewTasks()
    {
        using SqlConnection connection =
            new SqlConnection(connectionString);

        connection.Open();

        string sql =
            "SELECT Id, Title, IsCompleted FROM Tasks";

        using SqlCommand command =
            new SqlCommand(sql, connection);

        using SqlDataReader reader =
            command.ExecuteReader();

        Console.WriteLine();
        Console.WriteLine("===== Tasks =====");

        bool hasTasks = false;

        while (reader.Read())
        {
            hasTasks = true;

            int id = reader.GetInt32(0);
            string title = reader.GetString(1);
            bool isCompleted = reader.GetBoolean(2);

            string status =
                isCompleted ? "Completed" : "Pending";

            Console.WriteLine(
                $"{id}. {title} - {status}"
            );
        }

        if (!hasTasks)
        {
            Console.WriteLine("No tasks available.");
        }
    }

    static void AddTask()
    {
        Console.Write("Enter task title: ");
        string title = Console.ReadLine() ?? "";

        using SqlConnection connection =
            new SqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO Tasks (Title, IsCompleted) VALUES (@Title, 0)";

        using SqlCommand command =
            new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@Title", title
        );

        command.ExecuteNonQuery();

        Console.WriteLine(
            "Task added successfully."
        );
    }

    static void UpdateTask()
    {
        ViewTasks();

        Console.Write("Enter task ID to update: ");
        int id =
            Convert.ToInt32(Console.ReadLine());

        Console.Write("Enter new task title: ");
        string newTitle =
            Console.ReadLine() ?? "";

        using SqlConnection connection =
            new SqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE Tasks SET Title = @Title WHERE Id = @Id";

        using SqlCommand command =
            new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@Title", newTitle
        );

        command.Parameters.AddWithValue(
            "@Id", id
        );

        int rows =
            command.ExecuteNonQuery();

        if (rows > 0)
        {
            Console.WriteLine(
                "Task updated successfully."
            );
        }
        else
        {
            Console.WriteLine(
                "Task not found."
            );
        }
    }

    static void DeleteTask()
    {
        ViewTasks();

        Console.Write("Enter task ID to delete: ");
        int id =
            Convert.ToInt32(Console.ReadLine());

        using SqlConnection connection =
            new SqlConnection(connectionString);

        connection.Open();

        string sql =
            "DELETE FROM Tasks WHERE Id = @Id";

        using SqlCommand command =
            new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@Id", id
        );

        int rows =
            command.ExecuteNonQuery();

        if (rows > 0)
        {
            Console.WriteLine(
                "Task deleted successfully."
            );
        }
        else
        {
            Console.WriteLine(
                "Task not found."
            );
        }
    }

    static void CompleteTask()
    {
        ViewTasks();

        Console.Write(
            "Enter task ID to mark complete: "
        );

        int id =
            Convert.ToInt32(Console.ReadLine());

        using SqlConnection connection =
            new SqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE Tasks SET IsCompleted = 1 WHERE Id = @Id";

        using SqlCommand command =
            new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@Id", id
        );

        int rows =
            command.ExecuteNonQuery();

        if (rows > 0)
        {
            Console.WriteLine(
                "Task marked as completed."
            );
        }
        else
        {
            Console.WriteLine(
                "Task not found."
            );
        }
    }
}