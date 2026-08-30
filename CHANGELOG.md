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

### Changed

### Fixed

### Removed
