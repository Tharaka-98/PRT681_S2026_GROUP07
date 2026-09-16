# Task Manager - Full Stack Containerized Application

## Architecture

```
┌──────────────────────────────────────────────┐
│                   Docker                     │
│                                              │
│  ┌─────────────┐       ┌──────────────────┐  │
│  │   Frontend   │──────▶│    API Server    │  │
│  │  (React +    │ /api/ │  (ASP.NET Core)  │  │
│  │   Nginx)     │       │                  │  │
│  │  Port: 80    │       │   Port: 8080     │  │
│  └─────────────┘       └──────┬───────────┘  │
│                                │              │
│                         ┌──────▼───────┐      │
│                         │   SQLite DB  │      │
│                         │  (Volume)    │      │
│                         └──────────────┘      │
└──────────────────────────────────────────────┘
```

- **Frontend**: React SPA served by Nginx, which also reverse-proxies `/api/` requests to the backend
- **Backend**: ASP.NET Core 8 Web API with Entity Framework Core + SQLite
- **Database**: SQLite stored in a Docker volume for persistence

## Project Structure

```
Week3_FullStackIntegrationDeployment/
├── docker-compose.yml          # Orchestrates both services
├── README.md
├── TaskManagerAPI/
│   ├── Dockerfile              # Multi-stage build for .NET API
│   ├── Controllers/
│   │   └── TasksController.cs  # REST endpoints (GET, POST, PUT, DELETE, PATCH)
│   ├── Data/
│   │   └── AppDbContext.cs     # EF Core DbContext
│   ├── Models/
│   │   ├── TaskItem.cs         # Entity model
│   │   ├── TaskCreateDto.cs    # Create DTO
│   │   └── TaskUpdateDto.cs    # Update DTO
│   └── Program.cs              # App configuration, DI, middleware
└── task-manager-frontend/
    ├── Dockerfile              # Multi-stage build: Node build + Nginx serve
    ├── nginx.conf              # Nginx config with API reverse proxy
    └── src/
        ├── App.js              # Main React component
        ├── App.css             # Styling
        ├── api.js              # API client functions
        └── index.js            # React entry point
```

## API Endpoints

| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | /api/tasks            | List all tasks             |
| GET    | /api/tasks/{id}       | Get a task by ID           |
| POST   | /api/tasks            | Create a new task          |
| PUT    | /api/tasks/{id}       | Update a task              |
| DELETE | /api/tasks/{id}       | Delete a task              |
| PATCH  | /api/tasks/{id}/toggle| Toggle completion status   |

## How to Run Locally

### Option 1: Docker Compose (Recommended)

```bash
# From the Week3_FullStackIntegrationDeployment directory
docker-compose up --build

# App available at: http://localhost
# API available at: http://localhost:8080/api/tasks
# Swagger UI:       http://localhost:8080/swagger (dev mode only)
```

To stop:
```bash
docker-compose down
```

### Option 2: Run Without Docker

**Backend:**
```bash
cd TaskManagerAPI
dotnet run
# API runs at http://localhost:5145
```

**Frontend:**
```bash
cd task-manager-frontend
npm install
REACT_APP_API_URL=http://localhost:5145/api/tasks npm start
# Frontend runs at http://localhost:3000
```

## Deploying to Azure App Service

1. Create a resource group and App Service plan:
   ```bash
   az group create --name taskmanager-rg --location australiaeast
   az appservice plan create --name taskmanager-plan --resource-group taskmanager-rg --sku F1 --is-linux
   ```

2. Create and deploy the API:
   ```bash
   az webapp create --resource-group taskmanager-rg --plan taskmanager-plan --name taskmanager-api --runtime "DOTNETCORE:8.0"
   cd TaskManagerAPI
   dotnet publish -c Release -o ./publish
   cd publish && zip -r ../deploy.zip .
   az webapp deploy --resource-group taskmanager-rg --name taskmanager-api --src-path ../deploy.zip
   ```

3. Deploy the frontend as a Static Web App or second App Service.

## Deploying to Render (Free Tier)

1. Push the repo to GitHub.
2. On Render, create a **Web Service** pointing to `TaskManagerAPI/` with:
   - Runtime: Docker
   - Plan: Free
3. Create a **Static Site** pointing to `task-manager-frontend/` with:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Set the `REACT_APP_API_URL` environment variable to your Render API URL.

## Environment Variables

| Variable          | Default                  | Description                     |
|-------------------|--------------------------|---------------------------------|
| DB_PATH           | tasks.db                 | SQLite database file path       |
| ALLOWED_ORIGINS   | http://localhost:3000     | CORS allowed origins (CSV)      |
| REACT_APP_API_URL | /api/tasks               | API base URL for the frontend   |
