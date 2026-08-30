# gold-loan-portal-api

![CI](https://github.com/goldloan-portal/gold-loan-portal-api/actions/workflows/ci.yaml/badge.svg)

Express 5 + TypeScript API for the Gold Loan Portal. See [PRODUCT.md](PRODUCT.md) for what this application does and [CLAUDE.md](CLAUDE.md) for its technical conventions.

## Prerequisites

- Node.js 24+
- [pnpm](https://pnpm.io/) 10+ (`corepack enable` will pick up the version pinned in `package.json`)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The server starts on the port set in `.env` (`PORT`, default `4000`). Confirm it's up:

```bash
curl http://localhost:4000/api/v1/health
```

Prisma is connected to a live Supabase Postgres project — `pnpm run prisma:generate` regenerates the client from the per-resource schema files under `src/prisma/schema/` into `src/prisma/generated/`, `pnpm run prisma:migrate` applies migrations, `pnpm run prisma:seed` runs `src/prisma/seed.ts`. See [CLAUDE.md](CLAUDE.md) → Stack → Database for the two-connection-string setup and schema conventions.

## Running the Full Stack Locally

This API is the backend half of the Gold Loan Portal — the sibling [`gold-loan-portal-frontend`](../gold-loan-portal-frontend) repo is its only consumer today.

1. Start this API first: `pnpm dev` — defaults to `http://localhost:4000`. Confirm with `curl http://localhost:4000/api/v1/health`.
2. Start the frontend (see its own `README.md` → Setup) with `VITE_API_BASE_URL` pointed at this API's URL (`http://localhost:4000` by default, already the default in the frontend's `.env.example`).
3. CORS is currently unrestricted (see `CLAUDE.md` → Known Issues), so the frontend can call this API from any port without extra configuration.

## Scripts

| Command                | What it does                             |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | Start the dev server with `tsx watch`    |
| `pnpm build`           | Compile to `dist/`                       |
| `pnpm start`           | Run the compiled build (`dist/index.js`) |
| `pnpm typecheck`       | Typecheck only, no build                 |
| `pnpm lint`            | ESLint, with `--fix`                     |
| `pnpm prettier:check`  | Check formatting without writing         |
| `pnpm prettier:format` | Write formatting fixes                   |

## Development Process

This project was built ticket-by-ticket in Jira (project key `GLA`), following a lightweight Agile workflow: each unit of work is a Jira story/task with its own acceptance criteria, implemented on its own `feature/GLA-<n>-*` branch, and shipped through a dedicated PR back into `dev` — commit messages and CHANGELOG entries are tagged with their ticket number (`[GLA-<n>]`) so any change can be traced back to the ticket that drove it.

## Documentation

- [PRODUCT.md](PRODUCT.md) — the assignment brief this project fulfills: domain formulas, required API surface, evaluation criteria.
- [CLAUDE.md](CLAUDE.md) — stack, folder structure, and conventions for AI-assisted coding on this repo.
- [AI_LOG.md](AI_LOG.md) — log of AI-assisted work on this repo (mandatory assignment deliverable).
- [CHANGELOG.md](CHANGELOG.md) — notable changes, Keep a Changelog format.
