# gold-loan-portal-api

Express 5 + TypeScript API for the Gold Loan Portal. This document is the reference for AI-assisted coding (Claude Code, Cursor, Copilot) on this repo — read it before generating code so the output matches how the rest of the codebase is built. Read [PRODUCT.md](PRODUCT.md) first for what's actually being built — the assignment brief, domain formulas, and required API surface.

## Stack

- Express 5, TypeScript (`~6.0.2`), `tsx` for dev (watch mode), plain `tsc` build.
- `cors`, `dotenv` — current runtime dependencies besides Express.
- **Prisma 7** (PostgreSQL) — connected to a live Supabase project. See below.
- Package manager: **pnpm** (pinned via `packageManager` in `package.json`). Don't use `npm`/`yarn` in this repo.
- Lint/format/hooks: ESLint (flat config), Prettier, Husky, lint-staged. See `.husky/*` and `CHANGELOG.md` for what's enforced.

### Database: Prisma (connected — Supabase Postgres)

Prisma lives under `src/prisma/`, not at the repo root — schema, migrations, generated client, and the seed script are all colocated there (mirrors the reference production repo's layout). Schema is **split per resource** under `src/prisma/schema/` — `main.prisma` holds only the `generator`/`datasource` blocks, every resource gets its own `<resource>.prisma` file (e.g. `loan-scheme.prisma`). `prisma.config.ts`'s `schema` points at that directory, not a single file; Prisma merges every `.prisma` file under it. Migrations live nested inside it, at `src/prisma/schema/migrations/`. Prisma 7's `prisma-client` generator emits TypeScript source (not a prebuilt package) to `src/prisma/generated/` (gitignored; regenerate via `pnpm exec prisma generate` or `pnpm run prisma:generate`) — a sibling of `schema/`, not nested inside it, so `main.prisma`'s `generator.output` is `../generated`.

`tsconfig.json`'s `rootDir` is still the repo root and the compiled build still lands at `dist/src/index.js` (not `dist/index.js`) — not because of where the generated Prisma output lives (that's inside `src/` now), but because `prisma.config.ts` itself must stay at the repo root (Prisma 7's CLI convention) and is also typechecked as part of `tsc`.

Prisma 7 dropped the schema-embedded `datasource.url` — connection config lives in `prisma.config.ts` at the repo root instead, read only by the Prisma CLI (migrations, `prisma generate`'s config loading, `prisma db seed`). The app's own runtime client is `src/lib/prisma.ts`, a `PrismaClient` built with the `@prisma/adapter-pg` driver adapter — the only place Prisma gets imported outside `repositories/` once one exists.

**Two connection strings** — Supabase's connection poolers don't all support the same operations:

- `DATABASE_URL` — the app's own runtime queries (`src/lib/prisma.ts`'s adapter). Supabase's transaction pooler.
- `DATABASE_SESSION_POOLER_URL` — migrations and seeding (`prisma.config.ts`'s datasource; `src/prisma/seed.ts` connects with it directly too). Supabase's session pooler — transaction pooling doesn't support the session-level operations `prisma migrate`/`prisma db seed` need.

**Seeding**: `prisma.config.ts`'s `migrations.seed` wires `tsx src/prisma/seed.ts` into `prisma db seed` (also `pnpm run prisma:seed`) — Prisma 7's config-based seed hook, run automatically at the end of `prisma migrate dev` or standalone. `src/prisma/seed.ts` opens its own `PrismaPg` adapter against `DATABASE_SESSION_POOLER_URL` (independent of `src/lib/prisma.ts`'s runtime client) and `upsert`s each row keyed by a unique business field (e.g. `LoanScheme.name`) so re-running the script is a no-op on unchanged rows.

Conventions, established with the first real model (`LoanScheme`, GLA-9):

- UUID primary keys (`@default(uuid()) @db.Uuid`).
- snake_case columns via `@map`, snake_case tables via `@@map`.
- Every table gets `createdAt @db.Timestamptz(6) @default(now())`; mutable tables also get `updatedAt @db.Timestamptz(6) @updatedAt`.
- Money fields are `Decimal` with explicit precision/scale, never `Float`.
- A field with a fixed set of values uses the Prisma-generated enum — it doesn't get redeclared in hand-written TypeScript.
- Transactional/historical tables (loan records, repayments, audit trails) get a `deletedAt` soft delete; reference/master data (branches, gold rate tables, staff, loan schemes) gets an `isActive` toggle.

### Coming soon (not installed yet)

Committed choices, not yet wired up. Add each in the ticket that actually needs it rather than ahead of time, and follow the convention below from that point on.

- **Validation: Zod.** One schema file per resource (`schemas/<resource>.schema.ts`), one schema per route body/query/params. Infer types with `z.infer<typeof schema>` instead of hand-writing a parallel interface. Parse at the route boundary through a shared `validate(schema)` middleware — a controller or service should never see an unparsed `req.body`/`req.query`/`req.params`.
- **Supabase Auth client** (`@supabase/supabase-js`) — for the admin/partner view, if that ends up needing its own auth. No admin/partner auth ticket exists yet.

## Folder Structure

`routes/`, `controllers/`, `lib/`, and `prisma/` hold real content now (the health check, the Prisma client singleton, the `LoanScheme` model). The remaining layers land once the first real resource needs them:

```
src/
  routes/
    health.routes.ts           # done
    <resource>.routes.ts       # Express Router; wires an HTTP path + method to a controller function
  controllers/
    health.controller.ts       # done
    <resource>.controller.ts   # reads the (already-validated) request, calls the service, shapes the response
  services/
    <resource>.service.ts      # business logic and orchestration, calls repositories
  repositories/
    <resource>.repository.ts   # data access — the only place Prisma gets imported. One file per resource, plain exported functions.
  schemas/
    <resource>.schema.ts       # Zod schemas for this resource's request bodies/params/query
  middlewares/                 # validate(), the error handler, auth (once added)
  lib/
    prisma.ts                  # done — Prisma client singleton (PrismaPg adapter), unused until a repository imports it
  prisma/
    schema/
      main.prisma               # generator + datasource only
      <resource>.prisma         # one file per resource, e.g. loan-scheme.prisma
      migrations/                # prisma migrate dev output
    generated/                  # gitignored — regenerate via `pnpm exec prisma generate`
    seed.ts                     # `prisma db seed` entrypoint, upserts idempotent seed rows
  config/                      # env parsing/validation
  types/                       # shared TS types not owned by a single resource
  index.ts                     # app bootstrap: middleware wiring, route mounting, listen
```

A request flows one way: `routes → controllers → services → repositories → Prisma`. Don't skip a layer — a controller doesn't reach into a repository directly, a route doesn't hold logic.

## Error Handling

- One error-handling Express middleware, registered last, maps known error types to HTTP status codes. Add it in the ticket that adds the first real route.
- A base `AppError` (message + statusCode) with specific subclasses thrown from services (e.g. `NotFoundError`, `ValidationError`, `ConflictError`). Never throw a raw `Error` or a bare string from a service or repository.
- Once Prisma is in: map its known error codes explicitly in the error middleware (`P2002` → 409 conflict, `P2025` → 404 not found, `P2003` → 400 bad request) instead of letting them fall through as unhandled 500s.
- Never leak a stack trace or a raw error message to the client in production — log the full error server-side, return a stable `{ error: { code, message } }` shape to the client.

## Response Shape

Every JSON response follows one of:

```jsonc
// success
{ "data": <payload> }

// failure
{ "error": { "code": "NOT_FOUND", "message": "Loan not found" } }
```

One envelope, not a different shape per route.

## Patterns Claude Must Follow

Granular, enforced conventions live in `.claude/instructions/*.md` — treat them as mandatory for every edit to a matching file. Each has an **"Enforcement on Every Touch"** section: when any function in a matching file is added, edited, or removed, check the _entire_ file against the rule, not just the touched lines.

@.claude/instructions/code-organization.md
@.claude/instructions/validation.md
@.claude/instructions/exceptions.md
@.claude/instructions/response-shape.md
@.claude/instructions/update.md
@.claude/instructions/date-time.md

## Environment Variables

- `.env` for local values (gitignored), `.env.example` kept in sync with every key `.env` defines (no real values in the example file).
- Once config grows past `PORT`, read it through a single validated accessor rather than scattering `process.env.X` reads across the codebase.
- `DATABASE_URL`, `DATABASE_SESSION_POOLER_URL` are live (a real Supabase Postgres project — see Stack → Database). `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are documented in `.env.example` but unset — no Supabase Auth client installed yet (see Stack → Coming soon).

## Git, Commits & Releases

- Branch off `dev`: `feature/GLA-<n>-<title>`, `bugfix/GLA-<n>-<title>`, `hotfix/GLA-<n>-<title>`, `chore/GLA-<n>-<title>` (tooling/docs/config, no behavior change).
- Commit messages: `<type>: [GLA-<n>] <description>` on feature/bugfix/hotfix/chore branches — the `commit-msg` hook checks the ticket number also shows up in the branch name. On `main`/`dev` directly, only a conventional type prefix is required (`chore: release v0.2.0`).
- `pnpm lint-staged` + `tsc --noEmit` + a CHANGELOG-section check run on every commit; lint + prettier check run on every push. See `.husky/pre-commit` and `.husky/pre-push`.
- Every user-facing change gets a `CHANGELOG.md` entry under `## [Unreleased]`, tagged `[GLA-<n>]`. Never add an entry to an already-released version section.

## PR & Merge Workflow

1. Get the ticket link before running `gh pr create` if it hasn't been given.
2. Branch name and PR title share the ticket number. PR title: `<Category>: GLA-<n> <human-readable title>`, category from the branch prefix (`feature/` → `Feature:`, `bugfix/` → `Bugfix:`, `hotfix/` → `Hotfix:`, `chore/` → `Chore:`).
3. PR description is just a `## Summary` section (bullets), ticket link as the first line above it. No test plan, no checklist, no AI-generated footer.
4. Base branch is `dev`. Assignee is always `--assignee @me`.
5. Merging: pass an explicit conventional-commit `--subject` to `gh pr merge` (don't let GitHub auto-generate the merge title) — `<type>: [GLA-<n>] <imperative title>`, `<type>` mapped the same way as commit types (`Feature:`→`feat`, `Bugfix:`/`Hotfix:`→`fix`, `Chore:`→`chore`). Default to `--merge`; `--squash` only if asked.
6. When a change spans `gold-loan-portal-api` and `gold-loan-portal-frontend`, raise PRs in both with the same GLA number, title, and ticket link. Merge the API first — the frontend consumes its response contract.

## AI Workflow & Prompt Logging

This project is built with AI-assisted coding. To keep an honest record of what the AI actually did (for later compilation into `AI_LOG.md` at the repo root), log one entry per ticket once its work has landed — not per message, per clarifying question, or per read-only exploration.

Entry format (append to `AI_LOG.md` when it is created):

```markdown
### GLA-<n> — <ticket title>

- Tool: Claude Code / Cursor / Copilot
- Prompt: <1-2 sentence paraphrase of what was asked>
- Key decisions: <any non-obvious choice the AI made, or the user directed, worth remembering>
- Files: <top-level paths changed>
```

Only log prompts that produced a change which actually merged. A ticket revisited across multiple sessions gets one entry, updated — not one per session.

## Known Issues / Notes

- Prisma is connected to a live Supabase Postgres project; `LoanScheme` (GLA-9) is the only model so far, with one migration and a seed script (`pnpm run prisma:seed`) that seeds two plans (Bullet Repayment, Monthly EMI). No repository/service/controller reads it yet — that's a separate ticket.
- No authentication/authorization yet — a Supabase Auth client is documented as coming soon (see Stack), not installed.
- No test framework in this repo yet (the frontend has Vitest; this one doesn't). Add one when a ticket first needs test coverage.
- No structured logging yet — plain `console` until request volume or debugging need justifies more.
