---
description: Gold Loan Portal release workflow — dev → main across gold-loan-portal-api and gold-loan-portal-frontend, auto-classified version bump, race-safe pipeline. CHANGELOG entries are authored per PR (see pr-gla); this command only seals the [Unreleased] block into the new version.
argument-hint: [api|frontend] (omit for both)
allowed-tools: Bash(git:*), Bash(gh:*), Bash(pnpm:*), Bash(date:*), Bash(awk:*), Bash(node:*), Edit, Read, Write
---

# Release Workflow — Gold Loan Portal

Args: **$ARGUMENTS**

Empty → both repos in scope. `api`/`backend` → `gold-loan-portal-api` only. `frontend`/`web`/`ui` → `gold-loan-portal-frontend` only. Unclear → ask before proceeding.

Repo paths (siblings under the workspace root, e.g. `Gold-loan-assignment/`): from either repo, the other is `../gold-loan-portal-api` or `../gold-loan-portal-frontend`. GitHub repo mapping — both map 1:1 to their disk name:

- `gold-loan-portal-api` → `goldloan-portal/gold-loan-portal-api`
- `gold-loan-portal-frontend` → `goldloan-portal/gold-loan-portal-frontend`

## Differences vs a normal feature PR

- **Source = `dev`** (not a new branch off `main`).
- **Multi-commit batch** rolling up everything since the last tag.
- **Bump = patch/minor/major**, auto-classified from conventional commit types.
- **Per-repo independent versions** — do NOT force the same version across both repos.
- **No new branch** — the bump + changelog commit lands directly on `dev`, then a PR `dev → main`.

Files this command touches: `package.json` (version bump) and `CHANGELOG.md`, per repo. **CHANGELOG entries are NOT authored here** — every feature/fix PR lands its own bullets under `## [Unreleased]` at PR time (see the `pr-gla` skill). This command only renames `[Unreleased]` to the new version + date and prepends a fresh `[Unreleased]` scaffold.

---

## Phase A — Pre-flight (parallel across in-scope repos)

Per repo, verify clean, on `dev`, fetched:

```bash
cd <repo-path> && \
git status --porcelain | grep -v '^??' && exit 1; \
git checkout dev && \
git fetch origin && \
git pull origin dev
```

`git pull` here is NOT `--ff-only` — merge resolves the rare case where dev has local commits ahead of origin.

### A.1 — Dev-vs-main sync check (parallel)

```bash
cd <repo-path> && git log dev..origin/main --oneline
```

Non-empty in any repo → **STOP**:

> `<repo>` dev is behind main. Missing commits: <list>. Resolve manually (back-merge or merge, never rebase) before releasing.

### A.2 — Has-anything-to-release check (parallel)

```bash
cd <repo-path> && git log origin/main..dev --oneline
```

Empty for a repo → drop it from scope, surface to the user. Empty for every in-scope repo → **STOP**, "nothing to release."

### A.3 — Snapshot dev tip (parallel)

```bash
cd <repo-path> && git rev-parse origin/dev
```

Save the SHA per repo — used by the Phase F race check.

### A.4 — Last tag per repo (parallel)

```bash
cd <repo-path> && git tag --sort=-v:refname | head -1
```

No tag → this is the repo's first-ever release. Baseline = first commit on `dev` (`git rev-list --max-parents=0 dev | tail -1`). Note this in chat.

### A.5 — Pre-flight checks (parallel)

Run this repo's `/validate` steps (lint → typecheck → build → prettier check, plus `pnpm run test` for the frontend). Red on any in-scope repo → **STOP** for that repo, surface the failure, no release. User fixes on `dev` first.

## Phase B — Scan + classify (parallel)

Per repo, walk first-parent log since the baseline:

```bash
cd <repo-path> && \
git log --first-parent <baseline>..dev --pretty=format:"%H%x09%s%x09%b%x1e"
```

(`%x1e` = record separator so multi-line bodies don't bleed into the next entry.)

**Drop** entries whose subject matches: `^chore: back-merge main v`, `^chore: \[?GLA-\d+\]? release v`, `^chore: release v`, `^Merge ` (default unconventional merge — shouldn't exist on `dev` under husky, but a safety net).

**Classify** what's left by conventional type:

| Type       | CHANGELOG section | Counts toward bump |
| ---------- | ----------------- | ------------------ |
| `feat`     | Added             | minor              |
| `fix`      | Fixed             | patch              |
| `refactor` | Changed           | patch              |
| `perf`     | Changed           | patch              |
| `revert`   | Removed           | patch              |
| `chore`    | excluded          | none               |
| `docs`     | excluded          | none               |
| `style`    | excluded          | none               |
| `test`     | excluded          | none               |
| `build`    | excluded          | none               |
| `ci`       | excluded          | none               |

**Breaking change** — subject contains `!:` (e.g. `feat!: ...`) or body contains `BREAKING CHANGE:` → **major**, regardless of type.

**Bump rule per repo**: any breaking → major; else any `feat` → minor; else only `fix`/`refactor`/`perf`/`revert` → patch; all commits excluded (chore/docs/style/test/build/ci only) → **STOP** for that repo:

> `<repo>`: only chore/docs/style/test/build/ci commits since v<last>. Nothing user-facing. Reply "release anyway" (forces a patch bump, empty CHANGELOG sections), "skip" (drop from scope), or "abort".

## Phase C — Confirm scope + versions (single message, STOP checkpoint)

```
RELEASE PLAN
────────────
gold-loan-portal-api:      v0.1.0 → v0.2.0   (2 feat, 1 fix)
gold-loan-portal-frontend: skipped             (chore-only since v0.1.0)
```

Ask: **"Confirm versions? Override or approve."** User can override any bump. No file edits yet.

## Phase D — Verify `[Unreleased]` block exists per repo (parallel)

```bash
cd <repo-path> && \
awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md
```

**Empty** for a repo whose Phase B scan classified as `feat`/`fix`/`refactor`/`perf`/`revert` → **STOP** for that repo:

> `<repo>`: commits landed since v<last> but `## [Unreleased]` is empty. A PR skipped its changelog entry. Reply "list PRs" (list PR numbers/titles since the last tag so you can hand-edit `CHANGELOG.md`, commit, and re-run), "skip", or "abort".

Otherwise show the existing block + the version that will own it, and ask: **"Seal these entries as v<new>? Confirm or abort."** No file edits yet.

## Phase E — Bump version + seal `[Unreleased]` (parallel, `--no-verify` OK)

```bash
cd <repo-path> && pnpm version <bump> --no-git-tag-version
```

Edit `CHANGELOG.md`:

1. Rename `## [Unreleased]` to `## [<new-version>] - <YYYY-MM-DD>` (UTC date via `date -u +%Y-%m-%d`).
2. Insert a fresh `## [Unreleased]` block immediately above it, carrying the guard comment and all four empty subsection headings:

   ```markdown
   ## [Unreleased]

   <!-- New entries go here. Never add to a released version section below: a release
        cut while your PR is open renames this heading, and entries written against the
        old one land in a version that never shipped them. -->

   ### Added

   ### Changed

   ### Fixed

   ### Removed
   ```

   The empty headings matter, not just the comment — without them the first `### Added`/`### Fixed` in the file belongs to the version just cut, so the next PR to add an entry by heading-search lands inside a released block.

3. Delete any subsection heading that stayed empty in the just-sealed version block — a released section never shows an empty category.

Do not rewrite or "improve" the existing bullets; they were authored on their own PRs.

Verify the sealed section against the commits it claims:

```bash
cd <repo-path> && ./scripts/audit-changelog.sh <new-version> <last-tag>
```

Non-zero exit → **STOP** for that repo, show the script output (`MIS-FILED` = an entry names work not in this range; `UNDOCUMENTED` = shipped work with no entry), fix `CHANGELOG.md` on `dev`, re-run this phase. Do not release around it.

Commit:

```bash
cd <repo-path> && \
git add package.json CHANGELOG.md && \
git commit -m "chore: release v<new-version>" --no-verify
```

`--no-verify` is justified here: a mechanical bump + heading rename, no logic, and it deliberately bypasses `scripts/check-changelog-section.sh` — cutting a release moves entries into a released section, which is exactly what that guard rejects everywhere else. Husky `commit-msg` on `dev` accepts `chore: <subject>` with no ticket required.

## Phase F — Race check + push (parallel, hooks ON)

Before pushing, verify `origin/dev` did not advance during Phases B–E:

```bash
cd <repo-path> && \
git fetch origin dev && \
echo "snapshot=<A.3-snapshot> origin=$(git rev-parse origin/dev)"
```

Differ → **STOP**: show the new commits (`git log <snapshot>..origin/dev --oneline`), ask "abort" (`git reset --hard <snapshot>`, restart) or "include" (redo Phase B–E from A.3 with the new commits folded in).

Else push:

```bash
cd <repo-path> && git push origin dev
```

Pre-push runs lint + prettier check (and `vitest run` on the frontend). Red push → **STOP**, fix on `dev` with a NEW commit (never amend after a push attempt), re-push. NEVER `--no-verify` here.

## Phase G — Open the release PR (parallel)

```bash
cd <repo-path> && \
gh pr create \
  --repo goldloan-portal/<gh-repo> \
  --base main \
  --head dev \
  --assignee @me \
  --title "Release: v<new-version>" \
  --body "$(cat <<'EOF'
## Release v<new-version>

Rolls up <N> changes since v<previous-version>.

<sealed-changelog-block-without-the-versioned-heading>
EOF
)"
```

Capture the PR URL + `git rev-parse origin/dev` per repo (needed for the Phase H drift check).

**STOP CHECKPOINT:**

> Release PRs opened:
>
> - gold-loan-portal-api: <url>
> - gold-loan-portal-frontend: <url>
>
> Review and merge each via GitHub UI. In the merge confirmation dialog, edit the merge commit subject to `chore: release v<new-version> (#<pr-num>)` — do not accept GitHub's default `Merge pull request #X from ...`. Do NOT delete the `dev` branch.
>
> Reply "merged" once merged, or "abort" to roll back.

Do not proceed without explicit confirmation.

## Phase H — Post-merge race check + tag `main` (parallel)

Detect commits that landed on `dev` between PR open and merge:

```bash
cd <repo-path> && git fetch origin && git log <pr-open-snapshot>..origin/dev --oneline
```

Non-empty → **STOP**: these are now on `main` via the merge but weren't in the Phase B scan. Ask "ack" (continue tagging; the next release picks them up), "amend" (hand-edit CHANGELOG on `main`, rare), or "abort".

Then tag `main` — but verify `main` actually carries the release before creating the tag:

```bash
cd <repo-path> && \
git checkout main && \
git pull --ff-only origin main && \
ACTUAL=$(node -p "require('./package.json').version") && \
[ "$ACTUAL" = "<new-version>" ] || { echo "main is at $ACTUAL, refusing to tag v<new-version>"; exit 1; }
```

Non-zero → **STOP**: `main` hasn't received the release merge yet (PR still open, merge still processing, or the pull fetched nothing). Do not tag. Re-check the PR is actually merged, then re-run.

This check is load-bearing, not defensive filler: `package.json`'s version reaches `main` only through the release merge, so a mismatch means the tag would silently land on the _previous_ release's commit — `git tag`/`git push` both succeed, nothing errors, and the damage only surfaces later as a changelog claiming a version that contains no commits.

Only once it passes:

```bash
cd <repo-path> && \
git tag -a v<new-version> -m "v<new-version>" && \
git push origin v<new-version>
```

Tag refs skip the `pre-push` hook — no `--no-verify` needed.

## Phase I — Back-merge `main` → `dev` (parallel)

```bash
cd <repo-path> && \
git checkout dev && \
git pull origin dev && \
git merge main -m "chore: back-merge main v<new-version> into dev"
```

NEVER `--ff-only` on this pull — `dev` has commits ahead of `main`. The `-m` is required: the default `Merge branch 'main' into dev` message lacks a conventional type prefix and husky on `dev` rejects it.

- **Clean merge** → `git push origin dev`.
- **Conflicts** → **STOP**, list the conflicted files, ask the user to resolve, then `git add <resolved> && git commit --no-edit && git push origin dev`.
- **`git pull` itself fails** → **STOP**, surface the exact error, don't guess.

## Phase J — GitHub release (parallel)

Extract the just-sealed CHANGELOG section (`## [<new-version>]` to the next `## [` heading):

```bash
cd <repo-path> && \
gh release create v<new-version> \
  --repo goldloan-portal/<gh-repo> \
  --title "v<new-version>" \
  --notes "<extracted-section>"
```

## Phase K — Summary

```
Release complete

gold-loan-portal-api:      v<x.y.z>
  PR:      <url> (merged)
  Tag:     v<x.y.z>
  Release: <url>
  dev:     synced (back-merge pushed)

gold-loan-portal-frontend: <shipped v<x.y.z> | skipped>
```

---

## Rules

- **Parallel by default.** Independent per-repo operations (A.\*, B, D, E, F, G, H, I, J) fire one Bash call per repo in the same assistant message.
- **Race guards mandatory.** Pre-flight snapshot (A.3), pre-push fetch (F), post-merge fetch (H). Drift → STOP. Never `--force`. Never silently include unscanned commits.
- **`--no-verify` allowed only on Phase E** (mechanical bump + changelog commit). Nowhere else — NEVER on the Phase F push or the Phase I back-merge push.
- **Bump on `dev`, tag on `main` only.** Never tag `dev`.
- **Verify before tagging (H).** Refuse to tag unless `package.json` on `main` already reads the new version.
- **Per-repo versions independent.** Don't force the same version across both repos.
- **No `--delete-branch`** on the release PR merge — head is `dev`, must never be deleted.
- **Merge commit subject on `main`**: `chore: release v<new-version> (#<pr-num>)`. Edit it in the UI dialog; never accept the default.
- **Back-merge subject on `dev`**: `chore: back-merge main v<new-version> into dev`. Identical across repos and releases.
- **Bump commit subject on `dev`**: `chore: release v<new-version>` (no PR number — that comes on the merge commit).
- **Merge style**: merge commits, not squash — preserves the first-parent walk this command scans on the next release.
- **Excluded from the bump/CHANGELOG scan**: back-merge commits, release commits, default `Merge ` subjects, and `chore`/`docs`/`style`/`test`/`build`/`ci` types. (This is separate from `pr-gla`'s per-PR authoring choice to give a _foundational_ setup chore an `### Added` entry — that entry, once merged, is still excluded from what counts toward _this_ command's bump math.)
- **Chore-only release**: surface it, ask the user. Default action is abort.
- **Behind-main detection**: STOP, list, do not auto-merge — user resolves manually.
- **First-ever release for a repo**: baseline = first commit on `dev`. Surface it in chat.
- **Stop checkpoints**: A.1 (behind main), B (chore-only), C (version confirm), D (changelog confirm), F (race drift), G (PR opened — wait for merge), H (post-merge drift), I (conflicts).
- **Print every git/gh/pnpm command before running it** so the user can follow along.
