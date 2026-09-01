using TasksCrud;

var repository = new TaskRepository();
var running = true;

Console.WriteLine("Tasks CRUD Console App");
Console.WriteLine("Database: SQLite (tasks.db)");
Console.WriteLine();

while (running)
{
    PrintMenu();
    Console.Write("Choose an option: ");
    var choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            ListTasks(repository);
            break;
        case "2":
            CreateTask(repository);
            break;
        case "3":
            UpdateTask(repository);
            break;
        case "4":
            DeleteTask(repository);
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

static void CreateTask(TaskRepository repository)
{
    Console.Write("Title: ");
    var title = Console.ReadLine()?.Trim() ?? string.Empty;

    Console.Write("Description: ");
    var description = Console.ReadLine()?.Trim() ?? string.Empty;

    if (string.IsNullOrWhiteSpace(title))
    {
        Console.WriteLine("Title is required.");
        return;
    }

    var id = repository.Create(title, description);
    Console.WriteLine($"Task created with Id {id}.");
}

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
        title = existing.Title;
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
        "" => existing.IsCompleted,
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
