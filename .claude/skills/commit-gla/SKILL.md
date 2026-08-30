---
name: commit-gla
description: Conventional commit for Gold Loan Portal repos (gold-loan-portal-api, gold-loan-portal-frontend), enforced by husky. Auto-extracts GLA-XXX from the branch name (required on feature/bugfix/hotfix/chore branches; bypassed on main/dev where only the conventional type prefix is enforced). Concise plain-English body. No Co-Authored-By.
trigger: /commit-gla
---

# /commit-gla

Stage + commit current changes for a Gold Loan Portal repo (`gold-loan-portal-api` or `gold-loan-portal-frontend`). Enforces husky `commit-msg` + `pre-commit` rules so the first attempt passes.

## Husky rules (authoritative — match exactly)

`.husky/commit-msg` has **two modes** keyed off branch name:

**1. On `main` / `dev`** — GLA ticket requirement bypassed. Only the conventional type prefix is enforced:

```
^(chore|refactor|docs|style|test|build|revert|feat|fix|ci|perf)(\(.+\))?: .+
```

Use case: release commits, merge commits, direct fixups on `dev`.

**2. On every other branch** (`feature/`, `bugfix/`, `hotfix/`, `chore/`) — GLA ticket required:

```
^(chore|refactor|docs|style|test|build|revert|feat|fix|ci|perf): \[(GLA-[0-9]+)\] .+$
```

Plus: the branch name MUST contain the ticket ID from the message. The hook aborts otherwise.

`.husky/pre-commit` runs, in order: `pnpm lint-staged` (prettier + eslint `--fix` on staged files) → `pnpm run typecheck` (whole-project `tsc --noEmit` / `tsc -b --noEmit`) → `./scripts/check-changelog-section.sh` (rejects a new CHANGELOG bullet added outside `## [Unreleased]`). Lint-staged re-stages the formatted files automatically.

## Output format

```
<type>: [GLA-XXX] <subject>

- <body line>
- <body line>
```

Subject line MUST match the husky regex. Body optional, plain English, concise — not a re-statement of the subject.

## Type prefix (allowed list — pick one)

`chore` `refactor` `docs` `style` `test` `build` `revert` `feat` `fix` `ci` `perf`

Pick by diff:

- `feat` — new functionality / route / feature
- `fix` — bug fix
- `perf` — query/render optimization, caching
- `refactor` — restructure, no behavior change
- `style` — formatting, whitespace, lint-only
- `docs` — `.md` / comment changes only
- `test` — test files only
- `build` — `package.json`, lockfile, tsconfig, build scripts
- `ci` — husky, lint-staged config
- `revert` — git revert
- `chore` — anything else (`.claude/` files, `CLAUDE.md`, configs, miscellany)

## Workflow

1. **Read state** — parallel: `git status` (no `-uall`), `git diff --staged`, `git diff` (if nothing staged), `git log --oneline -5`, `git branch --show-current`.
2. **Extract ticket** — if branch is `main` or `dev`, skip ticket extraction (bypass mode). Else regex `GLA-\d+` (case-insensitive) on branch name, normalize to upper. No match → STOP, ask user.
3. **Secret scan** — refuse to stage files matching: `.env`, `.env.*`, `*credentials*`, `*.pem`, `*.key`, `*secret*`, `id_rsa*`. Warn; require explicit override.
4. **Stage** — never `git add .` / `-A`. Stage by name.
5. **Draft message** — plain English, concise. Skip the body entirely if the subject self-explains. Subject ≤ 60 chars, lowercase after the tag, imperative, no trailing period.
6. **Commit** via HEREDOC.
7. **On hook failure** — read the error, fix the root cause, re-stage modified files, NEW commit (never `--amend` for a hook failure, never `--no-verify`).
8. **Post-commit** — `git status` to confirm clean. Show the commit hash.

## Hard rules

- **No `Co-Authored-By:` footer.** Ever.
- **No `--no-verify`.** Ever.
- **No emojis.**
- **No `--amend` on a pushed commit.** Check `git status` "ahead" before any amend.
- **Branch/ticket mismatch** → STOP. Tell the user to rename the branch or pick the correct ticket.
- **One logical change per commit.** Suggest a split if the diff spans unrelated areas.

## Commit command

```bash
git commit -m "$(cat <<'EOF'
<type>: [GLA-XXX] <subject>

- <body line>
EOF
)"
```

## Examples

Branch `chore/GLA-2-husky-lint-staged-commit-hooks`, diff = husky/eslint/prettier setup:

```
chore: [GLA-2] set up husky, lint-staged, eslint, prettier and changelog
```

(no body — subject self-explains)

Branch `feature/GLA-14-loan-intake-form`, diff = new route + validation + a service change:

```
feat: [GLA-14] add loan intake submission endpoint

- Validates applicant, gold item weight/purity, requested amount.
- Rejects amounts above the branch's daily disbursal limit.
```

Branch `feature/no-ticket-cleanup` → halt, ask for a ticket.

## Failure modes

| Symptom                                                     | Cause                          | Fix                                                                           |
| ----------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `Invalid commit message format.`                            | Subject failed the regex       | Re-check type prefix in the allowed list, brackets around the ticket, spacing |
| `Hold up! Your ticket ID 'GLA-X' isn't in the branch name.` | Branch ↔ commit mismatch       | Pick the ticket from the branch, or have the user rename the branch           |
| Lint-staged modifies files mid-commit                       | Prettier/eslint auto-fixes     | Re-stage the modified files, NEW commit                                       |
| `tsc --noEmit` fails in pre-commit                          | Type error in the changed code | Fix the type error, re-stage, new commit                                      |

## Multi-repo note

`gold-loan-portal-api` and `gold-loan-portal-frontend` share this husky setup. This skill works in either. Always run from the repo root (where `.husky/` lives) — the two repos are independent git repos, not one monorepo.
