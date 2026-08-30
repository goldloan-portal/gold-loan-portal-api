# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry references the Jira ticket (`GLA-XXX`) that introduced the change.

## [Unreleased]

<!-- New entries go here. Never add to a released version section below: a release
     cut while your PR is open renames this heading, and entries written against the
     old one land in a version that never shipped them. -->

### Added

- [GLA-2] Husky pre-commit/commit-msg/pre-push hooks, lint-staged, ESLint, and Prettier set up to enforce code quality and conventional, ticket-tagged commit messages.
- [GLA-3] `CLAUDE.md` documenting stack, folder structure, error handling, response shape, git/PR conventions, and AI prompt-logging conventions.
- [GLA-3] `.claude/skills/commit-gla` and `.claude/skills/pr-gla` — husky-compliant conventional commit and PR-creation automation. `.claude/commands/validate.md` (lint/typecheck/build/prettier pipeline) and `.claude/commands/release.md` (dev → main release across both repos).
- [GLA-3] `.claude/commands/test-branch.md` — inline curl HTTP QA runner for the current feature branch, diff-aware, no script files.
- [GLA-3] `.claude/instructions/` — enforced conventions for code organization, Zod validation, custom errors, response shape, update/PATCH guards, and date/time handling, referenced from `CLAUDE.md`.
- [GLA-3] `docs/adr/` — Nygard-template ADR scaffolding (`README.md` index + `0000-template.md`).
- [GLA-4] GitHub Actions CI (`.github/workflows/ci.yaml`): install, lint, prettier check, typecheck, build on every PR into `dev`/`main` and every push to `main`. `changelog-guard.yaml` reuses `scripts/check-changelog-section.sh` to gate PRs into `dev`.
- [GLA-4] `README.md` with setup instructions, script table, and a CI status badge.
- [GLA-5] Prisma 7 scaffolded (`prisma/schema.prisma`, `prisma.config.ts`, `@prisma/adapter-pg` client singleton at `src/lib/prisma.ts`) — no models yet, no live database connection. `.env.example` documents `DATABASE_URL`/`DATABASE_SESSION_POOLER_URL` (Supabase transaction/session poolers) and `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`.
- [GLA-5] Health check moved into the `routes → controllers` layering and re-pathed to `GET /api/v1/health`, returning the `{ data }` response envelope.
- [GLA-9] `LoanScheme` Prisma model (`id`, `name`, `interestRate`, `maxLtv`, `isActive`, `createdAt`) and its first migration, applied to a live Supabase Postgres project. Seed script (`src/prisma/seed.ts`, `pnpm run prisma:seed`) seeds two plans — Bullet Repayment Plan and Monthly EMI Plan — idempotently via `upsert` keyed on `name`.
- [GLA-8] `GET /api/v1/loan-schemes` — repository/service/controller/route layering returning active `LoanScheme` rows as `{ id, name, interestRate, maxLtv }` (Decimal fields converted to numbers). First real route beyond health, so it also introduces the app's error-handling middleware: an `AppError` base class and `src/middlewares/error-handler.middleware.ts` mapping known Prisma error codes (`P2002`/`P2025`/`P2003`) to the `{ error: { code, message } }` envelope.
- [GLA-11] `POST /api/v1/leads/submit` — validates gold + customer details with Zod (`src/middlewares/validate.middleware.ts`, `src/schemas/lead.schema.ts`), computes `pureGoldWeight`/`maxEligibleLoan` via a pure, isolated calculation (`src/services/lead.util.ts`) against the 75% LTV cap and a configured gold rate (`src/config/gold-loan.config.ts`), rejects a second submission from the same `mobileNumber` within 7 days with `409`, and persists valid leads with status `SUBMITTED` via a new `Lead` Prisma model, returning `201` with the generated `applicationId`. Adds `ValidationError` (field-level `400`), `DuplicateLeadError` (`409`), and `LoanSchemeNotFoundError` (`404`) to the error-handling middleware.

### Changed

- [GLA-5] Build output moved from `dist/index.js` to `dist/src/index.js` (`tsconfig.json`'s `rootDir` widened to the repo root so the generated Prisma client under `prisma/generated/` compiles alongside `src/`); `package.json`'s `main`/`start` updated to match.
- [GLA-5] CI (`.github/workflows/ci.yaml`) runs `pnpm exec prisma generate` after install, before lint/typecheck/build — the generated client is gitignored and required for the type-aware lint/typecheck/build steps to resolve `src/lib/prisma.ts`'s import.
- [GLA-9] Prisma relocated from the repo root (`prisma/`) to `src/prisma/`, matching the reference production repo's layout: schema split per resource under `src/prisma/schema/` (`main.prisma` for generator/datasource, one `<resource>.prisma` file per model), migrations nested at `src/prisma/schema/migrations/`, generated client at `src/prisma/generated/`, seed script at `src/prisma/seed.ts`. `prisma.config.ts`, `.gitignore`, `tsconfig.json`'s `include`, and `src/lib/prisma.ts`'s import path updated to match; `rootDir` stays at the repo root regardless, since `prisma.config.ts` itself must remain there.

### Fixed

### Removed
