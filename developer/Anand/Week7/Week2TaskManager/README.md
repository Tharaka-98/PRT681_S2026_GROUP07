# Week 2 Task Manager

This project turns the Week 1 console CRUD idea into a full-stack task manager.

## Parts

- `TaskApi` - ASP.NET Core Web API using Entity Framework Core and SQLite.
- `react-frontend` - minimal React frontend that calls the API.

## API Endpoints

- `GET /api/tasks` - list all tasks.
- `GET /api/tasks/{id}` - get one task.
- `POST /api/tasks` - add a task.
- `PUT /api/tasks/{id}` - update a task.
- `DELETE /api/tasks/{id}` - delete a task.

## Run the API

```powershell
cd "D:\week 1 p\Week2TaskManager\TaskApi"
dotnet run --urls http://localhost:5080
```

The API creates `tasks-api.db` automatically.

## Run the React Frontend

Open a second terminal:

```powershell
cd "D:\week 1 p\Week2TaskManager\react-frontend"
npm start
```

Then open `http://localhost:5173` in a browser. The frontend expects the API to be running at `http://localhost:5080`.

## Tutor Explanation

In Week 2, I changed the Week 1 console CRUD idea into a full-stack application. I built an ASP.NET Core Web API with Entity Framework Core and SQLite to store task records. The API has REST endpoints to list, add, update, and delete tasks. I also created a small React frontend that calls the API using `fetch`, displays the task list, and lets the user add, complete, and delete tasks from the browser.
