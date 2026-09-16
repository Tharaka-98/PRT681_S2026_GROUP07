using TaskManagerApp;

var repo = new TaskRepository("tasks.db");

Console.WriteLine("=== Task Manager Console App ===");
Console.WriteLine("C# + SQLite CRUD Practice\n");

bool running = true;
while (running)
{
    Console.WriteLine("\n--- Menu ---");
    Console.WriteLine("1. Add Task");
    Console.WriteLine("2. View All Tasks");
    Console.WriteLine("3. View Task by ID");
    Console.WriteLine("4. Update Task");
    Console.WriteLine("5. Toggle Task Completion");
    Console.WriteLine("6. Delete Task");
    Console.WriteLine("7. Exit");
    Console.Write("\nSelect an option: ");

    var choice = Console.ReadLine()?.Trim();

    switch (choice)
    {
        case "1":
            Console.Write("Title: ");
            var title = Console.ReadLine() ?? "";
            Console.Write("Description: ");
            var desc = Console.ReadLine() ?? "";
            int newId = repo.AddTask(title, desc);
            Console.WriteLine($"\nTask created with ID: {newId}");
            break;

        case "2":
            var tasks = repo.GetAllTasks();
            if (tasks.Count == 0)
            {
                Console.WriteLine("\nNo tasks found.");
            }
            else
            {
                Console.WriteLine($"\n{"ID",-5} {"Title",-25} {"Status",-10} {"Created",-20}");
                Console.WriteLine(new string('-', 60));
                foreach (var t in tasks)
                {
                    string status = t.IsCompleted ? "Done" : "Pending";
                    Console.WriteLine($"{t.Id,-5} {t.Title,-25} {status,-10} {t.CreatedAt:yyyy-MM-dd HH:mm}");
                }
            }
            break;

        case "3":
            Console.Write("Enter Task ID: ");
            if (int.TryParse(Console.ReadLine(), out int viewId))
            {
                var task = repo.GetTaskById(viewId);
                if (task != null)
                {
                    Console.WriteLine($"\n  ID:          {task.Id}");
                    Console.WriteLine($"  Title:       {task.Title}");
                    Console.WriteLine($"  Description: {task.Description}");
                    Console.WriteLine($"  Status:      {(task.IsCompleted ? "Done" : "Pending")}");
                    Console.WriteLine($"  Created:     {task.CreatedAt:yyyy-MM-dd HH:mm}");
                }
                else
                {
                    Console.WriteLine("Task not found.");
                }
            }
            break;

        case "4":
            Console.Write("Enter Task ID to update: ");
            if (int.TryParse(Console.ReadLine(), out int updateId))
            {
                var existing = repo.GetTaskById(updateId);
                if (existing == null)
                {
                    Console.WriteLine("Task not found.");
                    break;
                }
                Console.Write($"New Title (current: {existing.Title}): ");
                var newTitle = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(newTitle)) newTitle = existing.Title;

                Console.Write($"New Description (current: {existing.Description}): ");
                var newDesc = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(newDesc)) newDesc = existing.Description;

                Console.Write($"Mark as completed? (y/n, current: {(existing.IsCompleted ? "y" : "n")}): ");
                var compInput = Console.ReadLine()?.Trim().ToLower();
                bool completed = compInput == "y" ? true : compInput == "n" ? false : existing.IsCompleted;

                if (repo.UpdateTask(updateId, newTitle, newDesc, completed))
                    Console.WriteLine("Task updated successfully.");
                else
                    Console.WriteLine("Failed to update task.");
            }
            break;

        case "5":
            Console.Write("Enter Task ID to toggle: ");
            if (int.TryParse(Console.ReadLine(), out int toggleId))
            {
                if (repo.ToggleTaskCompletion(toggleId))
                    Console.WriteLine("Task completion status toggled.");
                else
                    Console.WriteLine("Task not found.");
            }
            break;

        case "6":
            Console.Write("Enter Task ID to delete: ");
            if (int.TryParse(Console.ReadLine(), out int deleteId))
            {
                if (repo.DeleteTask(deleteId))
                    Console.WriteLine("Task deleted successfully.");
                else
                    Console.WriteLine("Task not found.");
            }
            break;

        case "7":
            running = false;
            Console.WriteLine("Goodbye!");
            break;

        default:
            Console.WriteLine("Invalid option. Please try again.");
            break;
    }
}
