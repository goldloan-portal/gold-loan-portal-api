# AI Log — gold-loan-portal-api

Required by the assignment brief (see `PRODUCT.md` → Submission Deliverables). This log is updated per ticket as work lands (see `CLAUDE.md` → AI Workflow & Prompt Logging), not per message.

## AI tools used

- Claude Code (Sonnet 5), used interactively for the entirety of this repo's work so far.

## Required: 2 exact prompts (form state management or backend validation rules)

**Pending.** No route has been built yet that involves backend validation rules — `GLA-2` and `GLA-3` were tooling/documentation tickets (husky, CLAUDE.md, `.claude/` automation), not feature work. This section will be filled in with the exact prompt text once a ticket implementing `POST /api/v1/leads/submit` (or another validation-bearing route) lands.

## Required: 1 instance of flawed AI-generated code, caught and fixed

**Pending**, for the same reason — flagged here rather than left silent so it isn't forgotten once real feature work starts. One real near-miss so far, worth logging even though it isn't the required category: the initial `tsconfig.json` used `"moduleResolution": "node"`, which the installed TypeScript version (`^7.0.2` at the time) rejected outright (`TS5108: Option 'moduleResolution=node10' has been removed`) — caught immediately by running `tsc` rather than assuming the config was fine, fixed by switching to `"nodenext"` and later pinning TypeScript back to `~6.0.2` for `typescript-eslint` compatibility. Not an AI-authored logic bug, so it doesn't satisfy the requirement above — noted for completeness.

## Ticket Log

### Pre-ticket — Initial scaffolding

- Prompt: Initialize a backend Express application with TypeScript (and a companion React + Vitest frontend in the sibling repo), before any Jira tickets existed for this project.
- Key decisions: plain Express + TypeScript, `tsx` for dev, `cors`/`dotenv` as the only initial runtime dependencies, a single `GET /health` route to verify the setup end-to-end (build, start, curl).
- Files: `package.json`, `tsconfig.json`, `src/index.ts`, `.env`, `.env.example`, `.gitignore`.

### GLA-2 — Setup Husky + lint-staged + commit hooks

- Prompt: Set up Husky pre-commit hooks (lint-staged with ESLint `--fix` + Prettier, plus a whole-project typecheck) in both repos, following the acceptance criteria on the Jira ticket and the conventions found in a pair of reference production repos.
- Key decisions: switched the repo from npm to pnpm and from the Vite-scaffolded `oxlint` to ESLint, to match the reference repos' tooling — both confirmed with the user rather than assumed. Downgraded TypeScript from `^7.0.2` to `~6.0.2` after `typescript-eslint` rejected the newer version's peer range.
- Files: `package.json`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.husky/*`, `scripts/*.sh`, `CHANGELOG.md`.

### GLA-3 — Setup CLAUDE.md + AI workflow conventions

- Prompt: Write `CLAUDE.md` documenting stack, folder structure, and conventions for AI-assisted coding, informed by the same reference repos and by another project's memory of a similar Jira-driven, multi-repo workflow; then extend it with `.claude/` skills (`commit-gla`, `pr-gla`), commands (`/validate`, `/release`, `/test-branch`), instructions files ported from the reference repo's Nest-specific originals, ADR scaffolding, and a `PRODUCT.md` capturing the actual assignment brief once it was shared.
- Key decisions: chosen architecture is MVC + repository layering (`routes → controllers → services → repositories → Prisma`), explicitly not Nest-style modules — the user corrected an early draft that framed this as a comparison to Nest, twice, until the doc stated the architecture as this project's own decision with no comparison language at all. Zod and Prisma are documented as "coming soon" and were deliberately not installed ahead of the ticket that needs them, per explicit user choice. After GLA-2's PRs merged, the user explicitly rejected deleting the now-merged branches — branches are kept unless told otherwise.
- Files: `CLAUDE.md`, `.claude/skills/*`, `.claude/commands/*`, `.claude/instructions/*`, `docs/adr/*`, `PRODUCT.md`, `CHANGELOG.md`.
