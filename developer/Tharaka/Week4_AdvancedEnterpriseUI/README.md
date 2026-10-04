# Week 4 - Advanced Enterprise UI, Next.js & Modern Dev Workflows

A responsive management portal built in **Next.js 15 (App Router)** on top of the
Week 3 **ASP.NET Core 8** Web API, using **both** commercial enterprise component
suites named in the brief: **Progress Telerik KendoReact** and **DevExpress
DevExtreme**.

```
Week4_AdvancedEnterpriseUI/
├── docker-compose.yml           # api + portal, one command
├── README.md                    # this file
├── docs/
│   ├── AI_ASSISTED_WORKFLOW.md  # the "vibe coding" deliverable
│   └── SUBMISSION_CHECKLIST.md  # brief -> evidence mapping
├── TaskManagerAPI/              # Week 3 API, extended for enterprise grids
│   ├── Controllers/             # Tasks, Projects, Analytics, Health
│   ├── Data/                    # AppDbContext + DbSeeder (64 seeded tasks)
│   ├── Models/                  # entities, DTOs, GridQuery, PagedResult
│   ├── Services/TaskQueryService.cs
│   └── Dockerfile               # aspnet:8.0-alpine + HEALTHCHECK
└── portal/                      # Next.js App Router frontend
    ├── src/app/                 # routes, server actions, proxy route handler
    ├── src/components/          # Kendo + DevExtreme component islands
    ├── src/lib/                 # api client, zod schemas, chart tokens
    └── Dockerfile               # standalone output, node:20-alpine
```

## 1. What each route demonstrates

| Route | Rendering | Component suite | What it shows |
|---|---|---|---|
| `/` | SSR (`force-dynamic`) | DevExtreme Chart + PieChart | KPI tiles + charts, data fetched server-side and passed as props |
| `/tasks` | SSR shell + remote paging | **DevExtreme DataGrid** | `CustomStore` with `remoteOperations`, multi-select, bulk actions, column state storing |
| `/tasks/new`, `/tasks/[id]/edit` | SSR + Server Actions | **KendoReact Form** | Validated CRUD form, three validation layers |
| `/projects` | SSR + remote paging | **KendoReact Grid** | Same job as `/tasks`, other suite; add/edit in a Kendo `Dialog` |
| `/analytics` | ISR (`revalidate = 300`) | **DevExtreme PivotGrid** | Drag-and-drop pivot over a flat fact table |
| `/schedule` | SSR (`force-dynamic`) | **KendoReact Scheduler** | Month / week / agenda views of task due dates |
| `/reports` | **SSG** (`force-static`, `revalidate = 3600`) | plain HTML table | Build-time pre-render, refreshed hourly |
| `/api/proxy/[...path]` | Route handler | - | Same-origin proxy to the API, so no CORS in the browser |

Run `npm run build` and the terminal legend proves it: `○` = static,
`ƒ` = server-rendered on demand.

## 2. Server-side rendering vs client-side hydration

The split is deliberate and visible in the code:

1. **Server Components** (no directive) fetch data and render markup in Node.
   They never ship to the browser. Example: `src/app/tasks/page.tsx`.
2. **Client Components** (`'use client'`) are the interactive islands - grids,
   forms, charts. They *hydrate* in the browser, so they must be client-side,
   but they receive their initial data as props from the server component above.
3. **The result:** `/tasks` arrives with the first ten rows already in the HTML.
   `TasksGrid` serves those rows on its first `load()` call instead of
   re-fetching, then takes over paging from row 11 onward.
4. **Mutations** go through **Server Actions** (`src/app/actions/*.ts`) - async
   functions marked `'use server'` that the client calls directly. They end with
   `revalidatePath()`, which invalidates the cached server render so the KPI
   tiles and pivot pick up the change.

## 3. API additions for the enterprise grids

The Week 3 API returned every task as a flat array. An enterprise grid needs
paging metadata, so the API was extended:

1. **`GridQuery`** - one query-string contract: `page`/`pageSize` **or**
   `skip`/`take` (DevExtreme sends the latter), plus `sortBy`, `sortDir`,
   `search`, `status`, `priority`, `projectId`, `assignedTo`.
2. **`PagedResult<T>`** - serialises `items`/`total` *and* `data`/`totalCount`,
   because KendoReact and DevExtreme read different property names.
3. **`TaskQueryService`** - all filtering and sorting in one place. Sorting is a
   **whitelist switch**, not a string-to-expression builder, so an unknown column
   name can never reach SQL.
4. **New entity `Project`** - gives the grids, pivot and scheduler a second
   dimension. Tasks gained `Priority`, `DueDate`, `AssignedTo`, `EstimatedHours`
   and `ProjectId`.
5. **`/api/analytics/task-facts`** - denormalised fact rows for the PivotGrid
   (a pivot wants flat data and does its own grouping).
6. **`/api/health`** - used by both `HEALTHCHECK` directives and the dashboard
   status pill.
7. **`DbSeeder`** - 4 projects and 64 tasks with a fixed random seed, so paging
   and the pivot have real data on first run and the demo is repeatable.
8. **`/api/tasks/all`** - the old unpaged endpoint, kept so the Week 3 React
   frontend still works unchanged.

## 4. Client-side form validation

Three layers, each cheap to add and none trusted alone:

1. **Per-field, in the browser** - `src/lib/validation.ts` defines a zod schema;
   `fieldValidator(schema, 'title')` turns one field of it into the
   `(value) => string | undefined` signature KendoReact's `<Field validator>`
   expects. Errors appear on blur via `<Error>` from `kendo-react-labels`.
2. **In the Server Action** - the same schema re-parses the whole payload before
   the API call. Client-side validation is a convenience; a crafted request
   bypasses it entirely.
3. **In the API** - DataAnnotations on the DTOs plus explicit checks (project
   exists, project code unique) returning RFC 7807 `ValidationProblem`, which the
   form surfaces field by field.

## 5. Running it

### Option A - Docker (nothing but Docker required)

```bash
cd Week4_AdvancedEnterpriseUI
docker compose up --build
# portal  http://localhost:3000
# api     http://localhost:8080/swagger
```

### Option B - locally, two terminals

```bash
# terminal 1 - API (listens on http://localhost:5145)
cd Week4_AdvancedEnterpriseUI/TaskManagerAPI
dotnet restore
dotnet run

# terminal 2 - portal
cd Week4_AdvancedEnterpriseUI/portal
npm install
cp .env.example .env     # API_BASE_URL=http://localhost:5145
npm run dev              # http://localhost:3000
```

> **Start the API before `npm run build`.** `/reports` and `/analytics` are
> pre-rendered at build time; if the API is down they bake a "cannot reach the
> API" notice until their revalidation window passes.

Useful scripts: `npm run dev`, `npm run build`, `npm start`,
`npm run typecheck` (`tsc --noEmit`).

## 6. Component licensing - read before the demo

Both suites are **commercial**. They install and run from npm, but:

1. **KendoReact** needs a licence key. Without one the components still work but
   print a console warning and show a watermark. Get a free 30-day trial key at
   `telerik.com`, then: `npx kendo-ui-license activate` with `KENDO_UI_LICENSE`
   set, or save the key to `portal/kendo-ui-license.txt` (git-ignored).
2. **DevExtreme** is likewise trial-licensed for evaluation. A trial notice may
   appear on first load. Nothing else changes.
3. For the assessment this is fine - evaluating licensed suites is the point of
   the exercise. Just mention it rather than letting a marker wonder about the
   watermark.

## 7. Known trade-offs

1. **Two component suites in one bundle** is intentional for the brief and would
   be wrong in production - roughly 1 MB of extra JS and two CSS systems whose
   specificity occasionally collides. `/tasks` is the heaviest route because of it.
2. **SQLite** stays from Week 3. `EnsureCreated()` plus a seeder, not migrations:
   fast to demo, but schema changes mean deleting `tasks.db`.
3. **No authentication.** Every route is anonymous; adding auth is a later week.
4. **The pivot loads all facts client-side.** Fine at 64 rows, wrong past a few
   thousand - that is when you move aggregation into SQL.
5. **`localStorage` grid state** is per browser, not per user. It is a
   convenience, not persistence.
