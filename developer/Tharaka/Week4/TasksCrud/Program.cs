using TasksCrud;

// --- Application entry point (Presentation layer) ---
// Handles user input and menu navigation; all data goes through TaskRepository.

var repository = new TaskRepository();
var running = true;

Console.WriteLine("Tasks CRUD Console App");
Console.WriteLine("Database: SQLite (tasks.db)");
Console.WriteLine();

// Main event loop — keeps showing menu until user exits
while (running)
{
    PrintMenu();
    Console.Write("Choose an option: ");
    var choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            ListTasks(repository);   // Read
            break;
        case "2":
            CreateTask(repository);  // Create
            break;
        case "3":
            UpdateTask(repository);  // Update
            break;
        case "4":
            DeleteTask(repository);  // Delete
            break;
        case "5":
            running = false;
            Console.WriteLine("Goodbye!");
            break;
        default:
            Console.WriteLine("Invalid option. Please try again.");
            break;
    }

    Console.WriteLine();
}

static void PrintMenu()
{
    Console.WriteLine("1. List all tasks");
    Console.WriteLine("2. Create task");
    Console.WriteLine("3. Update task");
    Console.WriteLine("4. Delete task");
    Console.WriteLine("5. Exit");
}

/// <summary>
/// Reads all tasks from the database and displays them in the console.
/// </summary>
static void ListTasks(TaskRepository repository)
{
    var tasks = repository.GetAll();

    if (tasks.Count == 0)
    {
        Console.WriteLine("No tasks found.");
        return;
    }

    foreach (var task in tasks)
    {
        var status = task.IsCompleted ? "Done" : "Pending";
        Console.WriteLine($"[{task.Id}] {task.Title} ({status})");
        Console.WriteLine($"    {task.Description}");
        Console.WriteLine($"    Created: {task.CreatedAt:yyyy-MM-dd HH:mm}");
    }
}

/// <summary>
/// Prompts for task details and saves a new record to the database.
/// </summary>
static void CreateTask(TaskRepository repository)
{
    Console.Write("Title: ");
    var title = Console.ReadLine()?.Trim() ?? string.Empty;

    Console.Write("Description: ");
    var description = Console.ReadLine()?.Trim() ?? string.Empty;

    // Basic validation — title is mandatory
    if (string.IsNullOrWhiteSpace(title))
    {
        Console.WriteLine("Title is required.");
        return;
    }

    var id = repository.Create(title, description);
    Console.WriteLine($"Task created with Id {id}.");
}

/// <summary>
/// Loads an existing task, lets the user edit fields, then saves changes.
/// Pressing Enter on a field keeps the current value.
/// </summary>
static void UpdateTask(TaskRepository repository)
{
    Console.Write("Task Id: ");
    if (!int.TryParse(Console.ReadLine(), out var id))
    {
        Console.WriteLine("Invalid Id.");
        return;
    }

    var existing = repository.GetById(id);
    if (existing is null)
    {
        Console.WriteLine($"Task {id} not found.");
        return;
    }

    Console.Write($"Title ({existing.Title}): ");
    var title = Console.ReadLine()?.Trim();
    if (string.IsNullOrWhiteSpace(title))
    {
        title = existing.Title; // Keep existing value if user skips
    }

    Console.Write($"Description ({existing.Description}): ");
    var description = Console.ReadLine()?.Trim();
    if (string.IsNullOrWhiteSpace(description))
    {
        description = existing.Description;
    }

    Console.Write($"Completed? (y/n) [{(existing.IsCompleted ? "y" : "n")}]: ");
    var completedInput = Console.ReadLine()?.Trim().ToLowerInvariant();
    var isCompleted = completedInput switch
    {
        "y" or "yes" => true,
        "n" or "no" => false,
        "" => existing.IsCompleted,  // Enter = no change
        _ => existing.IsCompleted
    };

    if (repository.Update(id, title, description, isCompleted))
    {
        Console.WriteLine("Task updated.");
    }
    else
    {
        Console.WriteLine("Update failed.");
    }
}

/// <summary>
/// Removes a task from the database by Id.
/// </summary>
static void DeleteTask(TaskRepository repository)
{
    Console.Write("Task Id: ");
    if (!int.TryParse(Console.ReadLine(), out var id))
    {
        Console.WriteLine("Invalid Id.");
        return;
    }

    if (repository.Delete(id))
    {
        Console.WriteLine("Task deleted.");
    }
    else
    {
        Console.WriteLine($"Task {id} not found.");
    }
}
