---
description: Date/time handling — UTC math, calendar dates vs instants. Applies once the first date-bearing field lands.
applyTo: 'src/services/**/*.ts, src/repositories/**/*.ts'
---

# Date / Time Handling

No date-bearing field exists yet — this is the rule to follow once one does (a loan's issue date, due date, a gold rate's as-of date, a repayment's paid-at timestamp), so it doesn't get designed ad hoc under deadline pressure later.

## Two Different Semantics — Don't Conflate Them

| Semantic                             | Examples                                          | Storage (once a DB exists)                |
| ------------------------------------ | ------------------------------------------------- | ----------------------------------------- |
| **Calendar date** (no time, no zone) | loan issue date, due date, gold rate's as-of date | a date-only column (e.g. Postgres `date`) |
| **Real instant**                     | `createdAt`, `updatedAt`, `paidAt`                | a timestamptz column                      |

A calendar date is what a person wrote on paper — "10 May 2026" — and must render identically to every viewer regardless of timezone. An instant is a specific point in universal time. Storing a calendar date in an instant column (or vice versa) is the single most common source of an off-by-one-day bug in this kind of domain.

## Server Timezone

Run the server with a fixed, known timezone (`TZ=UTC` is the simplest choice) once this matters — document it in `.env.example` and check it at boot. Every rule below assumes the server's own clock is not the thing shifting.

## Date Math — UTC Accessors Only

Local-TZ accessors silently shift depending on the server's timezone. Use the UTC variants:

| Forbidden                    | Required                           |
| ---------------------------- | ---------------------------------- |
| `d.setHours(0, 0, 0, 0)`     | `d.setUTCHours(0, 0, 0, 0)`        |
| `d.setDate(d.getDate() + 1)` | `d.setUTCDate(d.getUTCDate() + 1)` |
| `d.getMonth()`               | `d.getUTCMonth()`                  |
| `d.getFullYear()`            | `d.getUTCFullYear()`               |

For constructing a date from parts: `new Date(Date.UTC(year, monthIndex, day))`, never `new Date(year, monthIndex, day)`.

## Forbidden Patterns

- `new Date(iso).toLocaleDateString()` for a calendar-date field — renders in the server's local timezone, not a stable value.
- Parsing a calendar-date string (`"2026-05-10"`) with `new Date("2026-05-10T00:00:00")` (no `Z`) and then applying local-TZ math to it.
- Storing a calendar date in an instant-typed column, or an instant in a date-only column, because "it's close enough."

## Enforcement on Every Touch

Once a date-bearing field exists: whenever it, or the code path that reads/writes it, is touched, confirm which semantic it is (calendar date vs instant) and that every accessor along that path (input parsing → service math → storage → response) uses the UTC-safe form.
