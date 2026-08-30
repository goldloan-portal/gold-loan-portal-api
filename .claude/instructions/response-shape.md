---
description: Response shape conventions — nested vs flat related entity fields, date fields
applyTo: 'src/controllers/**/*.ts, src/services/**/*.ts'
---

# Response Shape: Nested Objects for Related Entities

Builds on the root `CLAUDE.md` → Response Shape (`{ data }` / `{ error }` envelope). This covers what goes inside `data`.

## Rule

When a response includes fields from a related entity, group them as a nested object — never flatten them as `*Id` + `*Name` pairs.

**Correct:**

```typescript
{
  id: loan.id,
  amount: loan.amount,
  branch: { id: branch.id, name: branch.name }, // nested
}
```

**Wrong:**

```typescript
{
  id: loan.id,
  amount: loan.amount,
  branchId: branch.id,     // flat — do not do this
  branchName: branch.name, // flat — do not do this
}
```

## Consistency: List vs Detail

A list endpoint and a detail endpoint return the **same shape** per item. Never flat in one and nested in the other.

## When NOT to nest

- **Option/dropdown endpoints** — the response object itself is the reference (`{ id, name }`). Nothing to nest into.
- A single derived display field from a relation where the relation's own `id` is never used by the client — flat is acceptable in that narrow case.

## Date Fields in Responses

Type date fields as `Date` in the code that builds the response, not `string`. Don't manually call `.toISOString()` or slice a date string before returning — `res.json()` calls `JSON.stringify`, which calls `Date.prototype.toJSON()` automatically, producing an ISO 8601 string on the wire. Manual conversion is redundant and an easy place to introduce an off-by-one (see `CLAUDE.md` → Coming soon date handling, once date-bearing fields exist).

```typescript
// ✅ Correct — return the Date as-is, JSON.stringify converts it
return { dueDate: loan.dueDate };

// ❌ Wrong — manual conversion, easy to get subtly wrong
return { dueDate: loan.dueDate.toISOString().split('T')[0] };
```
