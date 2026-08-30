---
description: Zod schema validation rules — avoid redundant checks, keep business logic out of schemas
applyTo: 'src/schemas/**/*.ts, src/services/**/*.ts'
---

# Schema Validation Rules

(Applies once Zod is installed — see the root `CLAUDE.md` → Coming soon. These are the rules to follow from that point on.)

## No Redundant Checks

Don't stack a broad check when a more specific one already covers it.

```typescript
// ✅ Correct
const schema = z.object({
  loanId: z.string().uuid(),
});

// ❌ Wrong — .uuid() already guarantees a string; a separate min-length or non-empty check is redundant
const schema = z.object({
  loanId: z.string().min(1).uuid(),
});
```

Only add a refinement if it validates something the base type doesn't already cover.

## Business Logic Validation Belongs in the Service Layer

Schemas handle **format and shape** only — type, regex, length, required/optional, enum membership. Anything that depends on **business rules, cross-field conditions, or database state** runs in the service.

### Stays in the schema

- Type guards: `z.string()`, `z.number()`, `z.enum([...])`
- Format rules: `.regex(...)`, `.min()`, `.max()`, `.uuid()`, `.email()`
- Presence: `.optional()`, required by default
- Nested shapes: `z.object({...})`, `z.array(...)`

### Moves to the service

- **Cross-field conditions**: "if `collateralType` is `gold`, `purity` becomes required"
- **Database-dependent rules**: "the branch must exist and be active"
- **Domain invariants**: "a loan cannot exceed the branch's daily disbursal limit"

```typescript
// ❌ Wrong — cross-field business rule inside a Zod refinement tied to DB state
const schema = z
  .object({ collateralType: z.string(), purity: z.number().optional() })
  .refine(async (data) => {
    if (data.collateralType !== 'gold') return true;
    return await branchAllowsPurity(data.purity); // reaching into the DB from inside a schema
  });

// ✅ Correct — schema checks shape only, service enforces the rule
const schema = z.object({
  collateralType: z.enum(['gold', 'silver']),
  purity: z.number().min(0).max(100).optional(),
});

// in the service:
if (input.collateralType === 'gold' && input.purity === undefined) {
  throw new ValidationError('Purity is required for gold collateral');
}
```

### Why

- Keeps schemas as pure input-shape contracts, easy to read and test in isolation.
- Business rules change more than shapes; isolating them in services avoids schema churn.
- Only the service has access to the database and other services — a schema shouldn't reach for either.

## No Client Round-Trips for Derivable Values

If the backend can deterministically derive a value from data it already has, don't add it to a response just so the client echoes it back on the next request.

```typescript
// ❌ Wrong — interestRate is derivable server-side from loan tenure + branch config
type CreateRepaymentInput = {
  loanId: string;
  amount: number;
  interestRate: number;
};

// ✅ Correct — backend derives it
type CreateRepaymentInput = { loanId: string; amount: number };
```

**Allowed exception**: the round-trip is the last resort and skipping it costs a real hot-path lookup. When in doubt, ask rather than add the field speculatively.

## Every Response Field Must Justify Its Existence

When shaping a response, every field must drive a concrete frontend behavior. "It's in the row" is not a justification. Before adding a field, answer:

1. Which screen/component consumes it?
2. What does the UI do with it?
3. If removed, what breaks?

If the answer is "nothing concrete," don't add it. If unsure, ask the user which fields the frontend actually needs.
