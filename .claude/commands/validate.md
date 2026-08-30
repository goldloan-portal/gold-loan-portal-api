---
description: gold-loan-portal-api verification pipeline — lint, typecheck, build, prettier check. Run before commit-gla/pr-gla, or any time you want evidence the branch is clean.
argument-hint: (no arguments)
allowed-tools: Bash(pnpm:*), Bash(git:*)
---

# /validate — gold-loan-portal-api

Canonical health check for this repo. Run every step in order; stop at the first failure and show the exact command + output, don't guess at what broke. Never claim "passes" without the command output to back it.

## Steps

1. **Lint (mutates)**: `pnpm run lint` — runs `eslint . --fix`. This can modify files; re-check `git status` after.
2. **Typecheck**: `pnpm run typecheck` — `tsc --noEmit`.
3. **Build**: `pnpm run build` — `tsc -p tsconfig.json`. Delete the resulting `dist/` afterward; it's a build artifact, not something to leave sitting in the working tree.
4. **Format check**: `pnpm run prettier:check`. If it fails, run `pnpm run prettier:format` and re-check — don't hand-fix formatting.

No test step: this repo has no test framework configured yet (see `CLAUDE.md` → Known Issues). Don't invent one mid-task to satisfy this command — if a change genuinely warrants test coverage, raise adding a framework as its own decision with the user.

## After all steps pass

- `git status` — confirm only the changes you intended are present (lint --fix may have touched files beyond what you edited; review before staging).
- If this branch's diff against `dev` includes anything beyond docs/tooling, confirm `CHANGELOG.md` has a bullet under `## [Unreleased]` before moving on to `commit-gla` / `pr-gla` — `pr-gla` requires it before opening the PR anyway, but catching it here saves a round trip.

## On failure

Fix the root cause in the source, not by loosening a lint rule or adding a suppression comment, unless the rule itself is wrong for the situation — and say so explicitly if you go that route rather than silently adding `// eslint-disable`.
