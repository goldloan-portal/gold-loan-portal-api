# Architecture Decision Records

This directory records significant architectural and technical decisions for `gold-loan-portal-api`, using the [Nygard ADR template](0000-template.md).

## When to write one

A decision that affects system structure, non-functional characteristics, dependencies, interfaces, or a construction technique — not a routine, small, or easily-reversible edit. Dev-tooling changes (agent config, slash commands, skills, hooks, CI/lint config) are below the bar: they don't change the running system.

Never create one silently — confirm with the user first.

## Conventions

- File name: `NNNN-kebab-case-title.md`, zero-padded to four digits, numbered sequentially in this repo.
- A decision that spans both `gold-loan-portal-api` and `gold-loan-portal-frontend` goes in whichever repo it most constrains, cross-linked from the other.
- Lifecycle: `Proposed` → `Accepted` → (`Deprecated` | `Superseded`). Never edit an accepted ADR's decision — write a new one and set the old one's Status to `Superseded by ADR-XXXX`.

## Index

| Number | Title | Status |
| ------ | ----- | ------ |
