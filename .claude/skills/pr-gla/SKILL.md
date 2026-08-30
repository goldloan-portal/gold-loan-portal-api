---
name: pr-gla
description: Create a GitHub PR for a Gold Loan Portal repo (gold-loan-portal-api / gold-loan-portal-frontend) using the standard title format `<Category>: GLA-XXX <subject>`, with the Jira ticket URL in the body, and no test-plan / generator footer.
---

# /pr-gla

Standard PR creation for Gold Loan Portal repos. Enforces title format, a required ticket URL, and forbidden body sections so PRs render consistently across both repos.

## Title format

```
<Category>: GLA-XXX <subject>
```

- **Category** — `Feature`, `Bugfix`, `Hotfix`, or `Chore`. Capitalized.
- **GLA-XXX** — Jira ticket ID, uppercase, no brackets.
- **Subject** — short, imperative, no trailing period.

### Category semantics

| Category | Use for                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Feature  | New user-facing functionality, new route/endpoint, new screen/component                                |
| Bugfix   | Fix to incorrect behavior                                                                              |
| Hotfix   | Urgent fix branched off `main`                                                                         |
| Chore    | Tooling/infra, `CLAUDE.md`, `.claude/*`, dependency bumps, docs-only, lint config — no behavior change |

### Branch-prefix → Title category map

| Branch prefix | Title category |
| ------------- | -------------- |
| `feature/`    | Feature        |
| `bugfix/`     | Bugfix         |
| `hotfix/`     | Hotfix         |
| `chore/`      | Chore          |

If the branch prefix is missing or ambiguous, ASK which category to use. Do not guess.

## Ticket URL — REQUIRED

The PR body must lead with the Jira URL, on its own line at the top: `https://adhishpacharya2.atlassian.net/browse/GLA-XXX`.

If the URL isn't already known from the conversation, ASK the user before opening the PR. Never invent or guess it.

## Body structure

```
<URL>

## Summary
- <bullet 1>
- <bullet 2>
- <bullet 3>

<optional: cross-repo merge order, or other non-obvious caller-impacting note>
```

- **Summary** — 1-3 bullets, plain English, high level.
- **Optional notes** — only when non-obvious (cross-repo merge order, env var addition, breaking response-shape change).

## Forbidden — never include

- **No "Test plan" / "Testing" / "QA" section.** No checklists, no manual-QA notes.
- **No `🤖 Generated with [Claude Code]` footer.**
- **No `Co-Authored-By:` footer.**
- **No emojis.**

## Repo → GitHub slug map

| Local dir                   | `--repo` slug                               |
| --------------------------- | ------------------------------------------- |
| `gold-loan-portal-api`      | `goldloan-portal/gold-loan-portal-api`      |
| `gold-loan-portal-frontend` | `goldloan-portal/gold-loan-portal-frontend` |

Always pass `--repo` explicitly.

## Base branch

`dev` by default. For a hotfix, base on `main` and confirm with the user.

## CHANGELOG entry — REQUIRED before opening PR

Every PR targeting `dev` adds a Keep-a-Changelog bullet under `## [Unreleased]` in the repo's `CHANGELOG.md` BEFORE running `gh pr create`.

### Section selection

| Conventional commit type on the branch                       | CHANGELOG section |
| ------------------------------------------------------------ | ----------------- |
| `feat` / Feature                                             | `### Added`       |
| `refactor` / `perf` / behavior-altering Chore                | `### Changed`     |
| `fix` / Bugfix / Hotfix                                      | `### Fixed`       |
| `revert`                                                     | `### Removed`     |
| Foundational `chore` (tooling/CLAUDE.md/husky/skill setup)   | `### Added`       |
| Trivial `chore` / `docs` / `style` / `test` / `build` / `ci` | none — skip       |

The "foundational chore → Added" row is a deliberate departure from a mature-project convention: this project is at its earliest stage, so tooling/setup tickets (husky, CLAUDE.md, skills) are real project milestones worth a CHANGELOG line, not noise. Once the project has real features shipping regularly, stop giving routine chores an entry — reserve `### Added` chore lines for setup work a teammate would actually want to know happened.

### Bullet shape

`- [GLA-XXX] <dense 1-2 sentence description>`

- Sentence 1: what changed + where (file/route/component). Backticks for code refs.
- Sentence 2 (optional): why it matters, or what it unlocks.

### Verify before pushing the PR

```bash
awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md
```

Output must contain the new bullet. Stage + commit alongside the code, or as a follow-up `chore: [GLA-XXX] add changelog entry` commit on the same branch.

## Workflow

1. Confirm the current branch is pushed and tracks `origin`. If not, push with `-u origin <branch>` first.
2. Confirm the Jira ticket URL. If not in the conversation, ASK. Never invent.
3. Derive the title category from the branch prefix (see map). If ambiguous, ASK.
4. **Add or verify the CHANGELOG entry on the branch** (see section above). Stop if missing and it's required.
5. Build the title in the exact format above.
6. Compose the body: URL → `## Summary` → optional notes.
7. Run:

```bash
gh pr create \
  --repo goldloan-portal/<canonical-name> \
  --base dev \
  --head <branch> \
  --title "<Category>: GLA-XXX <subject>" \
  --assignee @me \
  --body "$(cat <<'EOF'
<URL>

## Summary
- <bullet>
- <bullet>
EOF
)"
```

8. Return the PR URL from the command output.

## Cross-repo features

When a feature spans `gold-loan-portal-api` and `gold-loan-portal-frontend`:

- Open one PR per repo. Both carry the same GLA ticket in the title.
- If merge order matters, the dependent PR's body states it explicitly: `Requires gold-loan-portal-api GLA-XXX merged first.`

## Adding tooling / skill / docs alongside a feature

If a tooling change (skill, `CLAUDE.md`, lint config) lands during a feature task, prefer to commit it onto the same `feature/GLA-XXX-*` branch as a follow-up commit (`chore: [GLA-XXX] ...`) rather than spinning up a separate `chore/` branch. Husky permits multiple conventional types on the same GLA-XXX branch. Open one PR for the whole branch using the dominant category (usually `Feature`).

Spin up a separate `chore/GLA-XXX-*` branch only when the tooling change must land independently of any active feature branch.

## Examples

### Single repo

```
Title:  Feature: GLA-14 loan intake submission endpoint
Body:
https://adhishpacharya2.atlassian.net/browse/GLA-14

## Summary
- New POST /loans endpoint validating applicant, gold item weight/purity, requested amount.
- Rejects amounts above the branch's daily disbursal limit with a 409.
```

### Chore

```
Title:  Chore: GLA-2 Setup Husky + lint-staged + commit hooks
Body:
https://adhishpacharya2.atlassian.net/browse/GLA-2

## Summary
- Switch to pnpm and add ESLint + Prettier alongside Husky pre-commit/commit-msg/pre-push hooks.
- Add CHANGELOG.md with a check-changelog-section.sh guard.
```

### Cross-repo

```
Title:  Feature: GLA-20 loan repayment schedule
Body:
https://adhishpacharya2.atlassian.net/browse/GLA-20

## Summary
- New GET /loans/:id/schedule endpoint returning the installment plan.
- Frontend repayment schedule table consuming the new endpoint.

Requires gold-loan-portal-api GLA-20 merged first.
```

## Failure modes

| Symptom                           | Cause                                            | Fix                                                                      |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| PR title rejected in review       | Used lowercase / conventional-commit type prefix | Use `Feature`/`Bugfix`/`Hotfix`/`Chore` (capitalized) — not `feat`/`fix` |
| PR body has a "Test plan" section | Default `gh pr create` template or boilerplate   | Strip it. Body is URL + `## Summary` only.                               |
| Reviewer asks "what ticket?"      | URL forgotten in body                            | Open with the URL on line 1. Re-edit with `gh pr edit --body-file ...`.  |
