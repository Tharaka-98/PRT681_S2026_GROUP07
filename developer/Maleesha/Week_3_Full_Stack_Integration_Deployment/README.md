# Task Manager

A full-stack task management app built for PRT681/PRT585 Software Engineering Practice — Week 3: Full Stack Integration & Deployment.

## Live Deployment

- **Frontend:** https://taskmanager-web-a86n.onrender.com
- **API:** https://taskmanager-api-bxgj.onrender.com
- **API Swagger UI:** https://taskmanager-api-bxgj.onrender.com/swagger

> **Note:** Both services run on Render's free tier and spin down after periods of inactivity. The first request after a period of inactivity may take 30–60 seconds while the service wakes up.

## Architecture

- **Backend:** ASP.NET Core Web API (.NET 8) with Entity Framework Core, using SQLite for data storage
- **Frontend:** Angular (standalone components, signals for state management)
- **Containerization:** Docker (multi-stage build for the API)
- **Deployment:** Render — API deployed as a Docker-based Web Service, frontend deployed as a Static Site

### Request flow

```
Browser --> Angular app (Static Site on Render)
              |
              | HTTP requests (fetch/HttpClient)
              v
        ASP.NET Core Web API (Docker container on Render)
              |
              v
          SQLite database (tasks.db)
```

## Project Structure

```
developer/Maleesha/Week_3_Full_Stack_Integration_Deployment/
├── TaskManagerApi/          ASP.NET Core Web API
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Migrations/
│   ├── Dockerfile
│   └── appsettings.json
├── task-manager-web/        Angular frontend
│   ├── src/app/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml       Local multi-container setup
└── README.md                This file
```

## Tech Stack

- ASP.NET Core 8 Web API
- Entity Framework Core (SQLite provider)
- Angular (standalone components, signals, reactive UI)
- Docker (multi-stage builds)
- Render (Docker Web Service + Static Site hosting)

## API Endpoints

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/api/tasks`      | List all tasks          |
| GET    | `/api/tasks/{id}` | Get a single task by ID |
| POST   | `/api/tasks`      | Create a new task       |
| PUT    | `/api/tasks/{id}` | Update an existing task |
| DELETE | `/api/tasks/{id}` | Delete a task           |

Each task has: `id`, `title`, `description` (optional), `isComplete`, `createdAt`.

## Running Locally (without Docker)

### 1. Run the API

```bash
cd TaskManagerApi
dotnet restore
dotnet ef database update
dotnet run
```

The API starts at `http://localhost:5002` (port may vary — check the console output). Swagger UI is available at `/swagger`.

### 2. Run the frontend

```bash
cd task-manager-web
npm install
ng serve
```

The frontend starts at `http://localhost:4200`.

> Make sure `src/app/services/task.service.ts` points at your local API URL, and that the API's CORS policy in `Program.cs` includes `http://localhost:4200`, when running locally.

## Running Locally with Docker

### Build and run the API container

```bash
cd TaskManagerApi
docker build -t taskmanager-api .
docker run -p 8080:8080 taskmanager-api
```

API available at `http://localhost:8080` (Swagger at `/swagger`).

### Run both services together with Docker Compose

```bash
docker-compose up --build
```

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080`

`docker-compose.yml` is provided as a convenience for local full-stack testing. It is not used by Render — Render builds and runs the API's Dockerfile directly as an independent service, and builds the frontend separately as a static site.

## Deployment Notes

- The API is deployed to Render as a **Web Service** using the `Dockerfile` in `TaskManagerApi/`. Swagger UI is accessible on the live instance at `/swagger`.
- The frontend is deployed to Render as a **Static Site**, built with `npm install && npm run build` and served from `dist/task-manager-web/browser`.
- Database migrations run automatically on API startup (`db.Database.Migrate()` in `Program.cs`), so no manual migration step is needed after deployment.
- CORS on the API explicitly allows both the local dev origin (`http://localhost:4200`) and the live frontend origin (`https://taskmanager-web-a86n.onrender.com`).

## Known Limitations

- **SQLite persistence on Render's free tier:** Render's free instances do not support persistent disks. This means the SQLite database resets whenever the API container restarts or spins down after inactivity. Task data will not survive indefinitely on the live deployment — this is a free-tier hosting constraint, not an application bug. A paid Render plan (or an external managed database) would resolve this for a production deployment.
- **Cold starts:** Free-tier services spin down after ~15 minutes of inactivity. The first request afterward triggers a cold start, which can take 30–60 seconds.
