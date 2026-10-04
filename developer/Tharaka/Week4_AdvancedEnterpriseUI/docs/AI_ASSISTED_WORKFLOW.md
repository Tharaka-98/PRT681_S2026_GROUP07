# AI-Assisted Engineering - Prompt-Driven Prototyping

The Week 4 brief asks for AI-assisted workflows ("vibe coding") used to scaffold
CRUD views and validate forms against the ASP.NET Core API. This is the record of
how that was actually done, what it was good at, and where it had to be corrected.

## 1. The workflow in five steps

1. **Give the model the contract, not the vibe.** The first thing handed over was
   `TasksController.cs` and `TaskItem.cs` - the actual C# - and the question
   "what does a server-paged grid need that this does not return?" That produced
   `GridQuery` + `PagedResult<T>`. Asking for "a nice task grid" first produces a
   grid bound to a hard-coded array every time.
2. **Scaffold the boring layer wholesale.** DTOs, the typed `src/lib/types.ts`,
   the `api.ts` fetch wrappers, the proxy route handler and the six form wrapper
   components are mechanical once the shape is fixed. These were generated in
   bulk and reviewed, not typed by hand.
3. **Generate component boilerplate from the docs' own vocabulary.** The prompt
   that worked for the grid was explicit about the library API:
   *"DevExtreme DataGrid, CustomStore with loadMode processed, remoteOperations
   paging+sorting+filtering, return { data, totalCount }, key: 'id'."*
   Naming the real API surface stops the model inventing props.
4. **Refactor by diff, not by rewrite.** Changes like "store the enum as int so
   ORDER BY sorts Low->Critical" were applied as targeted edits. Asking for a
   whole-file rewrite silently loses earlier fixes.
5. **Let the compiler be the reviewer.** `npm run build` and `tsc --noEmit` after
   every batch. That loop caught four real defects (section 3) that reading the
   code did not.

## 2. Prompt log - the ones that earned their place

| # | Prompt (abridged) | Output | Kept? |
|---|---|---|---|
| 1 | "Here is `TasksController.cs`. What does a server-side paged enterprise grid need that this doesn't provide?" | `GridQuery`, `PagedResult<T>`, skip/take aliasing | Yes, as designed |
| 2 | "Generate `TaskQueryService` with whitelisted sorting - a switch over field names, no dynamic LINQ." | Working service | Yes |
| 3 | "DevExtreme DataGrid + CustomStore, remoteOperations, return `{ data, totalCount }`." | ~80% correct | Yes, after ref-type fix |
| 4 | "Six KendoReact form field wrappers wiring `FieldRenderProps` to Label/Hint/Error." | Correct boilerplate | Yes, verbatim |
| 5 | "Turn one zod field into KendoReact's `(value) => string \| undefined` validator signature." | `fieldValidator()` helper | Yes - best single win |
| 6 | "Seed 4 projects and 64 tasks with a fixed `Random(681)` so the demo is repeatable." | `DbSeeder` | Yes |
| 7 | "Write the DataGrid with client-side paging over all tasks." | Worked at 64 rows | **No** - defeats the exercise |
| 8 | "Add a dual-axis chart: task count and estimated hours." | Dual-axis chart | **No** - two y-scales mislead; split into two charts |

## 3. What the AI got wrong (and how it was caught)

1. **Invented prop types.** `customizeTooltip` was typed as
   `{ argument: string }`; DevExtreme's real `PointInfo.argument` is
   `string | number | Date | undefined`. Caught by `tsc`, fixed with a narrow
   local `PointLike` alias.
2. **Wrong ref type.** `useRef<DataGrid>(null)` - `DataGrid` is a value, not a
   type. The real type is `DataGridRef`. Caught by `tsc`.
3. **Invented theme tokens.** `themeColor="dark"` and `"light"` on Kendo
   `AppBar`/`Button`; the actual union is
   `base | primary | secondary | tertiary | inverse | info | success | warning | error`.
   Caught by `tsc`.
4. **An untranslatable LINQ projection.** `.Select(t => Map(t))` inside an
   `IQueryable` - EF Core cannot turn a custom method into SQL and throws at
   runtime, not compile time. Caught by reading, not by the compiler, which is
   the point: type checking does not catch semantic errors.
5. **Missing `transpilePackages`.** Both suites ship untranspiled ESM; without
   listing them in `next.config.mjs` the server build fails. The model only
   suggested this after being shown the error.

**The pattern:** AI assistance is strongest on *shape* (boilerplate, mapping,
repetitive wrappers) and weakest on *library-specific truth* (exact prop names,
type unions, what a given ORM can translate). Every generated line went through
the compiler, and the two prompts whose output was discarded were discarded for
engineering reasons, not style.

## 4. Tooling notes

1. **GitHub Copilot** (inline, in-editor) suits step 2 - it completes the next
   obvious DTO property or column definition from surrounding context.
2. **Cursor / chat-style agents** suit steps 1, 3 and 4 - whole-file generation
   and multi-file refactors, because they can hold several files at once.
3. **Context beats prompt length.** Pasting `TasksController.cs` improved output
   more than any amount of instruction phrasing.
4. **The non-negotiable:** nothing merged without `npm run build` passing. A
   generated file that type-checks is a starting point, not a finished one.
