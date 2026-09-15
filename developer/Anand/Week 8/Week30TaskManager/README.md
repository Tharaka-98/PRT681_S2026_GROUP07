# Week 3 Task Manager: Integration and Deployment

This project extends the Week 2 task manager into a deployable full-stack application.

## What was added in Week 3

- **ASP.NET Core MVC:** `TaskApi/Controllers/TasksController.cs` and `TaskApi/Views/Tasks/Index.cshtml` provide a server-rendered task dashboard.
- **REST API:** The existing `/api/tasks` endpoints remain available for the React client.
- **Docker:** Separate Dockerfiles package the API and frontend. `docker-compose.yml` runs the complete application locally.
- **Persistent data:** Docker Compose stores the SQLite database in a named volume so restarting containers does not remove tasks.
- **Deployment configuration:** `render.yaml` describes an API service and frontend service for a container-based deployment.

## Architecture

```text
Browser
  |
  +--> React frontend (port 5173) --HTTP/JSON--> ASP.NET Core API (port 5000)
                                                    |
                                                    +--> EF Core --> SQLite
  |
  +--> ASP.NET Core MVC dashboard (http://localhost:5000/)
```

The React frontend is used for the Week 2 client experience. The MVC dashboard is the Week 3 server-rendered view. Both use the same API/database layer.

## Run locally without Docker

Terminal 1:

```powershell
cd TaskApi
dotnet run --urls http://localhost:5000
```

Terminal 2:

```powershell
cd react-frontend
npm start
```

Open `http://localhost:5173` for React, or `http://localhost:5000/` for the MVC dashboard. The API is available at `http://localhost:5000/api/tasks`.

## Run the complete app with Docker

From the `Week3askManager` folder:

```powershell
docker compose up --build
```

Then open `http://localhost:5173` for React, `http://localhost:5000/` for MVC, or `http://localhost:5000/api/tasks` for the API.

Stop the containers with `Ctrl+C`, or run `docker compose down`. The SQLite database remains in the `task-data` volume.

## Deploy with a container platform

The included `render.yaml` defines two web services: `task-manager-api` builds from `TaskApi` and stores SQLite at `/var/data/tasks-api.db`; `task-manager-frontend` builds from `react-frontend` and serves the React application.

After creating the services, set these environment values:

```text
FrontendOrigin=https://<your-frontend-domain>
API_URL=https://<your-api-domain>/api/tasks
```

For Azure App Service, create one Linux Web App for each Dockerfile, set the same values in **Configuration > Application settings**, and expose port `8080` for each container. Free-tier limits and availability depend on the hosting account.

## Important environment settings

| Setting | Local value | Purpose |
| --- | --- | --- |
| `ConnectionStrings__TasksDatabase` | `Data Source=tasks-api.db` | SQLite location |
| `FrontendOrigin` | `http://localhost:5173` | CORS permission |
| `API_URL` | `http://localhost:5000/api/tasks` | API URL for React |
| `ASPNETCORE_URLS` | `http://+:8080` | API container port |

## Week 3 explanation for a tutor

“In Week 3, I integrated my API and frontend into a deployable full-stack application. I used ASP.NET Core MVC to create a server-rendered task dashboard, while keeping the REST API for the React frontend. I containerized both services with Docker and used Docker Compose to run them together locally. Entity Framework Core stores the tasks in SQLite, and a Docker volume preserves the database between restarts. I also added environment variables and deployment configuration so the API and frontend can be hosted as separate services on Azure App Service or Render.”
