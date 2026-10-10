# Week 5 — Resiliency, Logging, Workflows & Linux Containers

Tharaka's Week 5 continuation of the Week 4 management portal. The Next.js UI
and task/project API are carried forward; this week adds structured logs, error
telemetry, a durable email workflow, SMTP capture for local demos, and health
checked Linux containers.

## What was added

- **Serilog + Seq:** structured request logging and application events are
  emitted to the console and Seq. Seq is at <http://localhost:8081> and its
  ingestion endpoint is on port 5341.
- **Exceptionless:** ASP.NET Core exception middleware and the standard
  Problem Details response. Set `EXCEPTIONLESS_API_KEY` to send captured
  unhandled exceptions to an Exceptionless project. The key is intentionally
  not checked in.
- **Temporal + MailKit:** `POST /api/notifications/email` starts an
  `EmailDispatchWorkflow` on the `taskmanager-email` queue and returns HTTP
  202 with a workflow ID. The activity sends SMTP mail and Temporal retries
  failures up to five attempts. The Temporal Web UI is at
  <http://localhost:8233>.
- **Mailpit:** catches local SMTP messages without sending real email. Its
  inbox is at <http://localhost:8025>.
- **Linux runtime:** the API uses the .NET 8 Debian slim image, runs as a
  non-root user, and has a curl health check. Debian slim is used because the
  Temporal .NET SDK ships a native bridge that expects glibc.

## Run locally

Requires Docker Compose. From this directory:

```sh
docker compose up --build
```

Endpoints:

| Service | URL |
|---|---|
| Management portal | <http://localhost:3000> |
| API / Swagger | <http://localhost:8080/swagger> |
| API health | <http://localhost:8080/api/health> |
| Seq | <http://localhost:8081> |
| Temporal UI | <http://localhost:8233> |
| Mailpit inbox | <http://localhost:8025> |

Queue a sample email:

```sh
curl -X POST http://localhost:8080/api/notifications/email \
  -H 'Content-Type: application/json' \
  -d '{"to":"learner@example.test","subject":"Task alert","body":"A task needs your attention."}'
```

The API returns `202 Accepted`. Inspect the workflow in Temporal and the
captured message in Mailpit. Trigger an unhandled error in a local development
branch to review the Problem Details response and Seq event. Configure
`EXCEPTIONLESS_API_KEY` in the shell before Compose when a real Exceptionless
project is available.

## Configuration

Compose uses environment variables for service endpoints and SMTP settings.
For a real SMTP relay, set `Smtp__Host`, `Smtp__Port`, `Smtp__Username`,
`Smtp__Password`, and `Smtp__From`; use a secrets store for credentials outside
this local exercise. `EXCEPTIONLESS_SERVER_URL` can point to a self-hosted
Exceptionless instance.

