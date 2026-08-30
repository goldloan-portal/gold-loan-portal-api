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

Prisma is scaffolded but not connected to a live database yet (no models, no Supabase project) — `pnpm exec prisma generate` regenerates the client from `prisma/schema.prisma` into `prisma/generated/` without needing a real connection. See [CLAUDE.md](CLAUDE.md) → Stack → Database for the two-connection-string setup once a real Supabase project exists.

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

## Documentation

- [PRODUCT.md](PRODUCT.md) — the assignment brief this project fulfills: domain formulas, required API surface, evaluation criteria.
- [CLAUDE.md](CLAUDE.md) — stack, folder structure, and conventions for AI-assisted coding on this repo.
- [AI_LOG.md](AI_LOG.md) — log of AI-assisted work on this repo (mandatory assignment deliverable).
- [CHANGELOG.md](CHANGELOG.md) — notable changes, Keep a Changelog format.
