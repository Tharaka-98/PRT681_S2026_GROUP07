Console.WriteLine("===== Student Grade Calculator =====");
Console.WriteLine();

Console.Write("Enter student name: ");
string studentName = Console.ReadLine() ?? "";

Console.Write("Enter score (0-100): ");
double score = Convert.ToDouble(Console.ReadLine());

string grade;

if (score >= 85)
{
    grade = "HD";
}
else if (score >= 75)
{
    grade = "D";
}
else if (score >= 65)
{
    grade = "C";
}
else if (score >= 50)
{
    grade = "P";
}
else
{
    grade = "F";
}

string result;

if (score >= 50)
{
    result = "PASS";
}
else
{
    result = "FAIL";
}

Console.WriteLine();
Console.WriteLine("===== Result =====");
Console.WriteLine($"Student: {studentName}");
Console.WriteLine($"Score: {score}");
Console.WriteLine($"Grade: {grade}");
Console.WriteLine($"Result: {result}");