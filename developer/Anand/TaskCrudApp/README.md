# TaskCrudApp

A simple C# console application that uses SQLite to perform CRUD operations on a `Tasks` table.

## Features

- Creates the SQLite database automatically.
- Creates the `Tasks` table automatically.
- Adds new tasks.
- Views all tasks.
- Updates task title and description.
- Deletes tasks.
- Toggles tasks between complete and incomplete.

## Run

```powershell
dotnet run
```

The app stores data in `tasks.db` in the project folder.

## Table

```sql
CREATE TABLE Tasks (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Description TEXT,
    IsComplete INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT NOT NULL
);
```
