---
description: Exhaustive HTTP-driven QA for the current gold-loan-portal-api feature branch — diff-aware, inline curl, no script files
argument-hint: [--smoke] [--fail-fast] [--keep]
allowed-tools: Bash(curl:*), Bash(git:*), Bash(date:*), Read, Grep, Glob
---

# Backend Feature-Branch QA Runner

Inline HTTP test runner for the **current feature branch** in `gold-loan-portal-api`. Frontend is out of scope.

Args: **$ARGUMENTS**

- `--smoke` — the 5-10 most load-bearing happy paths only (default: exhaustive)
- `--fail-fast` — stop on first failure (default: continue, report all)
- `--keep` — preserve mutated data (default: clean up at the end)

## Overview

1. Identify what changed on this branch vs `origin/dev`.
2. Map each touched file to the routes and business flows it affects, plus downstream consumers.
3. Generate a case list (or a smoke list with `--smoke`).
4. Confirm the dev server is reachable (no auth exists yet — see Phase B).
5. Execute every case via inline `curl` Bash calls.
6. Report inline: per-case pass/fail with first-failure detail, summary at the end.
7. Clean up mutated data unless `--keep`.

Never write test scripts to disk. Never persist intermediate state. Everything inline, in chat.

---

## Phase A — Scope Discovery

A.1. Confirm working in `gold-loan-portal-api`: `git rev-parse --show-toplevel`. If not, refuse and say so.

A.2. Capture branch + diff stats:

```bash
git branch --show-current
git diff --stat origin/dev...HEAD
git log --oneline origin/dev..HEAD
```

A.3. List changed files under `src/`:

```bash
git diff --name-only origin/dev...HEAD -- 'src/**'
```

A.4. Identify the resources touched (by folder: `src/controllers/<x>`, `src/services/<x>`, `src/repositories/<x>`).

A.5. **Business-rule extraction** — invariants are not hardcoded in this command; they live in the codebase. For every touched resource, harvest from:

1. **The root `CLAUDE.md`** — repo-wide rules (response shape, error handling, `.claude/instructions/*.md`).
2. **Custom error classes** (`*.error.ts`) — each one is a negative-path case verifying the throwing condition.
3. **Service/repository code** — grep for `ensure*`, `validate*`, `throw new *Error` patterns. Each guard is one negative-path case.
4. **Zod schemas** (once they exist) — every constraint (`.min`, `.max`, `.regex`, `.enum`) is a case.

Print what was harvested:

```
Business rules harvested: <resource>: <N> guards, <M> custom errors, <K> schema constraints
```

If a touched resource has no discoverable guards/errors/schema at all (nothing to test beyond a bare happy path), say so plainly rather than inventing cases — this command reflects what the code actually enforces, not a hypothetical spec.

A.6. **Build the case list.** For each affected route:

- Happy path (2xx) with realistic data.
- Each schema constraint (missing field, wrong type, out-of-range, bad enum value) once schemas exist.
- Each custom error condition, by name.
- Malformed ID in a path param → 400.
- Non-existent ID → 404.
- Empty-body PATCH → 400 (`NoUpdateFieldsError`, once the update convention lands — see `.claude/instructions/update.md`).
- For paginated lists (once any exist): bounds and ordering.
- For a route behind auth (once auth exists): absent/invalid token → 401.

A.7. Print the discovered scope:

```
Branch: <branch>
Touched files: <count>
Resources: <list>
Test cases planned: <N> (or <N_smoke> with --smoke)
```

Today, before the first real route exists beyond `GET /health`, this phase will legitimately produce a near-empty case list — report that honestly instead of padding it.

---

## Phase B — Setup

No authentication exists yet (see `CLAUDE.md` → Known Issues) — skip any auth/token setup entirely until a ticket adds it. Once it does, extend this phase with however that auth actually works; don't guess ahead of it.

Confirm the server is up:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-4000}/health
```

Expect `200`. If it fails, tell the user to start the server with `pnpm dev`.

---

## Phase C — Execution

C.1. Pick a prefix for any created data: `QA-<branch>-<UTC-timestamp>` (e.g. `QA-GLA-14-20260830T101530Z`) — every created record uses it so reruns don't collide with leftovers from a previous run.

C.2. Execute cases sequentially. For each:

- Print `[N/total] <case-id> <description>` before firing.
- `curl`, capture status + body.
- Assert status and body shape match what's expected.
- Print `  pass (<ms>ms)` or `  fail: <reason>` with the response body truncated to 400 chars.
- `--fail-fast` set and a case fails → stop.

C.3. Hold created IDs in conversation memory (loanId, customerId, whatever the branch introduces) and reuse them in downstream cases.

C.4. For anything schema-validated, pipe through `jq` if available; otherwise `grep` the field. Assert minimum invariants, not a full deep-diff.

---

## Phase D — Reporting (inline only)

```
━━━ QA Report — <branch> ━━━

Scope: <N> cases across resources: <list>

Results:
  <resource A>   [pass pass pass]   3/3
  <resource B>   [pass fail]        1/2  (1 fail)

Failures:
  B2   description
       expected: 409 DailyDisbursalLimitError
       got: 200 OK
       body: {...}

Findings worth flagging:
  - <anything surprising found along the way>

Coverage gaps (not testable here):
  - <e.g. anything requiring a browser, a real payment gateway, etc.>

TOTAL: <pass>/<total>  duration: <ms>
```

Never write the report to a file. Chat output only.

---

## Phase E — Cleanup

E.1. `--keep` set → skip. Print the kept IDs grouped by resource.

E.2. Otherwise: no database exists yet, so there is nothing to clean up today beyond whatever this run held in memory — say so. Once a database lands, track every created ID per table during Phase C and delete by ID here, children before parents by FK, only for tables this run actually touched — no `LIKE 'QA-%'` scans, no hardcoded table list.

---

## Hard Rules

1. **No script files.** Everything runs inline via Bash + curl.
2. **No production database**, once one exists — confirm the target is local/dev before mutating anything.
3. **Never `--no-verify` or bypass husky** — no commits happen here anyway.
4. **Idempotent naming** — every created record's name/identifier includes the run's timestamp prefix so reruns don't collide.
5. **No file writes during the run** — including no log files.

## Example Invocations

```
/test-branch
/test-branch --smoke
/test-branch --fail-fast
/test-branch --keep
```

When invoked, move straight to Phase A — don't preface with "I'll help you test...".
