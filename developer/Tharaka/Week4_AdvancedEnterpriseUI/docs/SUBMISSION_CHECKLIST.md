# Week 4 - Brief to Evidence

## Topics and tools

| Brief item | Where it is | Status |
|---|---|---|
| Next.js App Router | `portal/src/app/` - nested layouts, route groups, `loading`/`error`/`not-found` | Done |
| Next.js SSR | `/`, `/tasks`, `/projects`, `/schedule` - `export const dynamic = 'force-dynamic'` | Done |
| Next.js SSG | `/reports` - `force-static` + `revalidate = 3600`; `/analytics` - ISR at 300s | Done |
| Progress Telerik KendoReact | Grid, Form, Scheduler, Dialog, AppBar, Drawer, DropDownList, DatePicker, NumericTextBox, Loader | Done |
| DevExpress DevExtreme | DataGrid, PivotGrid, Chart, PieChart | Done |
| Server-side rendering vs client hydration | README section 2; server components fetch, `'use client'` islands hydrate | Done |
| Commercial suites: grids, schedulers, pivot tables | DataGrid (`/tasks`), Grid (`/projects`), Scheduler (`/schedule`), PivotGrid (`/analytics`) | All three classes present |
| AI-assisted engineering / "vibe coding" | `docs/AI_ASSISTED_WORKFLOW.md` - prompt log, rejected outputs, defects caught | Done |

## Practice tasks

| Required | Evidence |
|---|---|
| Responsive management portal in Next.js using Kendo UI or DevExpress | Both suites; CSS grid with `auto-fit` + `minmax`, Drawer collapses to mini mode, stacks below 720px |
| Scaffold CRUD views with AI-assisted workflows | Tasks CRUD (grid + form + server actions), Projects CRUD (grid + dialog form); workflow documented |
| Validate client-side data forms against your ASP.NET Core API | zod schema -> KendoReact field validators -> server action re-parse -> DataAnnotations + `ValidationProblem` |

## Demo script (about 7 minutes)

1. `docker compose up --build`, then open `http://localhost:3000`.
2. **Dashboard** - KPI tiles and charts; point out the API health pill.
3. **Tasks** - sort a column and page forward; open DevTools Network and show
   each interaction issuing one `skip`/`take` request. That is the server-side
   paging claim, proven.
4. **Tasks** - select three rows, bulk Complete, and note the dashboard tiles
   change on return (`revalidatePath`).
5. **New task** - submit with a 2-character title to show the field error; fix it
   and save.
6. **Projects** - same operations in the KendoReact Grid; enter a bad project
   code (`abc1`) to show the regex validator, then a duplicate code to show the
   API-side uniqueness error surfacing in the form.
7. **Analytics** - drag `Priority` from the filter area into the column area; the
   pivot re-shapes without a server call.
8. **Schedule** - switch Month / Week / Agenda; double-click an appointment to
   land on its edit form.
9. **Reports** - note the "SSG" badge, then show the build output legend where
   `/reports` is `○` and `/tasks` is `ƒ`.
10. `docs/AI_ASSISTED_WORKFLOW.md` - the prompt log and, more importantly, the
    four defects the compiler caught.

## Pre-submission checks

1. `cd portal && npm run build` - passes, and the route table shows the expected
   static/dynamic mix. (Start the API first.)
2. `cd portal && npm run typecheck` - clean.
3. `docker compose up --build` - both containers reach `healthy`.
4. `curl "http://localhost:8080/api/tasks?page=2&pageSize=5&sortBy=dueDate&sortDir=asc"`
   returns 5 items and the full `total`.
5. `curl http://localhost:8080/api/health` returns `"status":"healthy"`.
6. `node_modules`, `bin`, `obj`, `.next` and `tasks.db` are not committed.
7. Mention the KendoReact / DevExtreme trial watermark before a marker asks.

## Leads into Week 5

The structured request log in `Program.cs` is a placeholder for Serilog + Seq;
both Dockerfiles already run on Alpine with a `HEALTHCHECK`, which is most of the
Week 5 containerisation task done early. Unhandled-exception telemetry (ELMAH /
Exceptionless) and the Temporal.io email workflow are the genuinely new pieces.
