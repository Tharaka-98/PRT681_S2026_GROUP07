using System.Text.Json;

Console.WriteLine("C# and .NET Basic Examples");
Console.WriteLine("==========================");

VariablesAndDataTypesExample();
InputAndOutputExample();
IfElseExample();
LoopExample();
MethodExample();
ArrayAndListExample();
ClassObjectConstructorPropertyExample();
EncapsulationExample();
InheritanceAndPolymorphismExample();
InterfaceExample();
ExceptionHandlingExample();
FileAndJsonExample();
LinqExample();

static void VariablesAndDataTypesExample()
{
    string studentName = "Anand";
    int age = 22;
    double gradeAverage = 84.5;
    bool isEnrolled = true;

    Console.WriteLine("\n1. Variables and Data Types");
    Console.WriteLine($"Name: {studentName}, Age: {age}, Average: {gradeAverage}, Enrolled: {isEnrolled}");

    // Explanation:
    // Variables store information that the program can use later.
    // Each variable has a data type, such as string for text, int for whole numbers,
    // double for decimal numbers, and bool for true/false values.
}

static void InputAndOutputExample()
{
    Console.WriteLine("\n2. Input and Output");
    Console.Write("Enter your course name: ");
    string? courseName = Console.ReadLine();
    Console.WriteLine($"You entered: {courseName}");

    // Explanation:
    // Console.ReadLine() takes input typed by the user.
    // Console.WriteLine() shows output back to the user on the screen.
}

static void IfElseExample()
{
    Console.WriteLine("\n3. If / Else");

    int mark = 72;

    if (mark >= 50)
    {
        Console.WriteLine("Result: Pass");
    }
    else
    {
        Console.WriteLine("Result: Fail");
    }

    // Explanation:
    // An if/else statement lets the program make a decision.
    // If the condition is true, the first block runs.
    // If the condition is false, the else block runs instead.
}

static void LoopExample()
{
    Console.WriteLine("\n4. Loops");

    for (int number = 1; number <= 5; number++)
    {
        Console.WriteLine($"Count: {number}");
    }

    // Explanation:
    // A loop repeats code without writing the same line many times.
    // This for loop starts at 1, keeps going while the number is 5 or less,
    // and adds 1 to the number after each loop.
}

static void MethodExample()
{
    Console.WriteLine("\n5. Methods");
    int total = AddNumbers(10, 5);
    Console.WriteLine($"10 + 5 = {total}");

    // Explanation:
    // A method is a named block of code that performs a task.
    // Here, AddNumbers is called with 10 and 5, then returns the answer.
}

static int AddNumbers(int firstNumber, int secondNumber)
{
    return firstNumber + secondNumber;

    // Explanation:
    // This method accepts two int parameters and returns their total as an int.
    // The return keyword sends the result back to the place where the method was called.
}

static void ArrayAndListExample()
{
    Console.WriteLine("\n6. Arrays and Lists");

    string[] fixedSubjects = { "C#", "SQL", "ASP.NET" };
    Console.WriteLine($"First array item: {fixedSubjects[0]}");

    List<string> studyTasks = new() { "Read notes", "Write code" };
    studyTasks.Add("Test project");
    studyTasks.Remove("Read notes");

    Console.WriteLine("List items:");
    foreach (string task in studyTasks)
    {
        Console.WriteLine($"- {task}");
    }

    // Explanation:
    // An array stores multiple values, but its size is fixed.
    // A List also stores multiple values, but it can grow or shrink while the program runs.
    // foreach is used to go through every item in the List.
}

static void ClassObjectConstructorPropertyExample()
{
    Console.WriteLine("\n7. Classes, Objects, Constructors, Properties");

    Student student = new("Anand", 101);
    student.Age = 22;

    Console.WriteLine($"{student.Name} has student ID {student.StudentId} and age {student.Age}");

    // Explanation:
    // Student is a class, which works like a blueprint.
    // The student variable is an object created from that class.
    // The constructor sets the starting Name and StudentId values.
    // Properties such as Name, StudentId, and Age store the object's data.
}

static void EncapsulationExample()
{
    Console.WriteLine("\n8. Encapsulation");

    BankAccount account = new("A1001", 200);
    account.Deposit(50);
    account.Withdraw(30);

    Console.WriteLine($"Account {account.AccountNumber} balance: {account.Balance}");

    // Explanation:
    // Encapsulation protects data inside a class.
    // The balance field is private, so outside code cannot change it directly.
    // The Deposit and Withdraw methods control how the balance is changed.
}

static void InheritanceAndPolymorphismExample()
{
    Console.WriteLine("\n9. Inheritance and Polymorphism");

    User regularUser = new("Regular user");
    User adminUser = new AdminUser("Admin user");

    regularUser.ShowAccessLevel();
    adminUser.ShowAccessLevel();

    // Explanation:
    // Inheritance allows AdminUser to reuse code from User.
    // Polymorphism allows the same method name, ShowAccessLevel, to behave differently
    // depending on whether the object is a User or an AdminUser.
}

static void InterfaceExample()
{
    Console.WriteLine("\n10. Interfaces");

    IReportPrinter printer = new ConsoleReportPrinter();
    printer.PrintReport("Weekly progress report");

    // Explanation:
    // An interface is a contract that says what methods a class must have.
    // ConsoleReportPrinter follows the IReportPrinter contract by providing PrintReport.
}

static void ExceptionHandlingExample()
{
    Console.WriteLine("\n11. Exception Handling");

    try
    {
        int firstNumber = 10;
        int secondNumber = 0;
        int answer = firstNumber / secondNumber;
        Console.WriteLine(answer);
    }
    catch (DivideByZeroException)
    {
        Console.WriteLine("Cannot divide by zero.");
    }

    // Explanation:
    // Exception handling lets a program deal with errors without crashing.
    // The try block contains code that might fail.
    // The catch block runs if that specific error happens.
}

static void FileAndJsonExample()
{
    Console.WriteLine("\n12. Files and JSON");

    Course course = new("ASP.NET Core", 6);
    string json = JsonSerializer.Serialize(course, new JsonSerializerOptions { WriteIndented = true });

    File.WriteAllText("course.json", json);
    string savedJson = File.ReadAllText("course.json");
    Course? loadedCourse = JsonSerializer.Deserialize<Course>(savedJson);

    Console.WriteLine($"Saved and loaded course: {loadedCourse?.Title}");

    // Explanation:
    // JSON is a text format used to store structured data.
    // JsonSerializer.Serialize changes a C# object into JSON text.
    // File.WriteAllText saves it, File.ReadAllText reads it, and Deserialize turns it back into an object.
}

static void LinqExample()
{
    Console.WriteLine("\n13. LINQ");

    List<Student> students = new()
    {
        new Student("Anand", 101) { Age = 22 },
        new Student("Priya", 102) { Age = 19 },
        new Student("Sam", 103) { Age = 17 }
    };

    List<Student> adultStudents = students
        .Where(student => student.Age >= 18)
        .OrderBy(student => student.Name)
        .ToList();

    Console.WriteLine("Students aged 18 or older:");
    foreach (Student student in adultStudents)
    {
        Console.WriteLine(student.Name);
    }

    // Explanation:
    // LINQ makes it easier to query collections such as Lists.
    // Where filters the list, OrderBy sorts it, and ToList creates the final filtered list.
}

public class Student
{
    public Student(string name, int studentId)
    {
        Name = name;
        StudentId = studentId;
    }

    public string Name { get; set; }

    public int StudentId { get; set; }

    public int Age { get; set; }
}

// Explanation:
// This Student class is a blueprint for student objects.
// It has a constructor to set required starting values and properties to store data.

public class BankAccount
{
    private decimal balance;

    public BankAccount(string accountNumber, decimal openingBalance)
    {
        AccountNumber = accountNumber;
        balance = openingBalance;
    }

    public string AccountNumber { get; }

    public decimal Balance => balance;

    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            balance += amount;
        }
    }

    public void Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= balance)
        {
            balance -= amount;
        }
    }
}

// Explanation:
// This class demonstrates private data and public methods.
// The balance can only be changed through Deposit and Withdraw, which helps keep the object valid.

public class User
{
    public User(string name)
    {
        Name = name;
    }

    public string Name { get; }

    public virtual void ShowAccessLevel()
    {
        Console.WriteLine($"{Name}: basic access");
    }
}

// Explanation:
// This parent class has common user information and a virtual method.
// A virtual method can be changed by a child class.

public class AdminUser : User
{
    public AdminUser(string name) : base(name)
    {
    }

    public override void ShowAccessLevel()
    {
        Console.WriteLine($"{Name}: administrator access");
    }
}

// Explanation:
// AdminUser inherits from User using ": User".
// It overrides ShowAccessLevel to provide different behaviour for admin users.

public interface IReportPrinter
{
    void PrintReport(string title);
}

// Explanation:
// The interface lists a method that implementing classes must provide.
// It does not decide how the method works internally.

public class ConsoleReportPrinter : IReportPrinter
{
    public void PrintReport(string title)
    {
        Console.WriteLine($"Printing report: {title}");
    }
}

// Explanation:
// This class implements the IReportPrinter interface.
// Because of that, it must include a PrintReport method.

public record Course(string Title, int DurationWeeks);

// Explanation:
// A record is a short way to create a simple data object.
// This Course record stores a title and duration.

/*
14. .NET Project, Solution, SDK and NuGet

Project example:
    dotnet new console -n MyApp

Solution example:
    dotnet new sln -n MySolution
    dotnet sln add MyApp/MyApp.csproj

SDK example:
    dotnet build
    dotnet run

NuGet example:
    dotnet add package Microsoft.Data.Sqlite

Explanation:
    A project contains the files for one app or library.
    A solution groups related projects together.
    The .NET SDK gives the tools needed to build and run code.
    NuGet installs reusable packages made by Microsoft or other developers.
*/

/*
15. ASP.NET Core Web API Example

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/tasks", () =>
{
    return Results.Ok(new[] { "Read notes", "Build API", "Test frontend" });
});

app.Run();

Explanation:
    ASP.NET Core receives web requests and sends responses.
    MapGet creates a GET endpoint.
    In this example, visiting /api/tasks returns a small list of task names.
*/

/*
16. MVC Example

Model:
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

Controller:
public class ProductsController : Controller
{
    public IActionResult Index()
    {
        List<Product> products = new();
        return View(products);
    }
}

View:
@model List<Product>
@foreach (Product product in Model)
{
    <p>@product.Name</p>
}

Explanation:
    MVC separates a web app into Model, View, and Controller.
    The Model holds data, the Controller handles requests,
    and the View displays information to the user.
*/

/*
17. Razor Example

@{
    string userName = "Anand";
}

<h1>Welcome, @userName</h1>

Explanation:
    Razor lets HTML and C# work together in the same file.
    The @ symbol is used to insert C# values into the page.
*/

/*
18. Form and Validation Example

public class RegisterUser
{
    [Required]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
}

Explanation:
    A form collects user input.
    Validation checks that the input follows rules before the app accepts it.
    [Required] means the value cannot be empty, and [EmailAddress] checks email format.
*/

/*
19. Entity Framework Core Example

public class TasksDbContext : DbContext
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}

TaskItem task = new() { Title = "Learn EF Core" };
database.Tasks.Add(task);
await database.SaveChangesAsync();

Explanation:
    Entity Framework Core lets C# classes work with database tables.
    Adding an object to DbSet prepares it for saving.
    SaveChangesAsync writes the change to the database.
*/

/*
20. SQL Database Example

CREATE TABLE Students (
    StudentId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Age INTEGER NOT NULL
);

SELECT * FROM Students WHERE Age >= 18;
INSERT INTO Students (Name, Age) VALUES ('Anand', 22);
UPDATE Students SET Age = 23 WHERE StudentId = 1;
DELETE FROM Students WHERE StudentId = 1;

Explanation:
    SQL databases store data in tables with rows and columns.
    SELECT reads data, INSERT adds data, UPDATE changes data, and DELETE removes data.
*/

/*
21. Dependency Injection Example

builder.Services.AddScoped<IReportPrinter, ConsoleReportPrinter>();

app.MapGet("/report", (IReportPrinter printer) =>
{
    printer.PrintReport("Injected service example");
    return Results.Ok();
});

Explanation:
    Dependency Injection gives a class or endpoint the service it needs.
    The app creates the service and passes it in, instead of the code creating it manually.
*/

/*
22. Authentication and Authorization Example

Authentication checks who the user is.
Authorization checks what the user is allowed to access.

[Authorize]
app.MapGet("/account", () => "Only logged-in users can see this.");

[Authorize(Roles = "Admin")]
app.MapDelete("/users/{id}", (int id) => "Only admins can delete users.");

Explanation:
    Authentication confirms who the user is, usually during login.
    Authorization checks what that logged-in user is allowed to do.
    [Authorize] protects routes so only allowed users can access them.
*/
