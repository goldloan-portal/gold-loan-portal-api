---
description: Custom error conventions — structure, naming, and name assignment
applyTo: 'src/**/*.error.ts, src/services/**/*.ts, src/repositories/**/*.ts'
---

# Custom Error Conventions

## Structure

Every custom error must:

1. Extend `AppError` (message + statusCode — see the root `CLAUDE.md` → Error Handling)
2. Call `super(message, statusCode)` as the first statement in the constructor
3. Assign `this.name` **inside the constructor**, immediately after `super()`

```typescript
// ✅ Correct
export class LoanNotFoundError extends AppError {
  constructor() {
    super('Loan not found', 404);
    this.name = 'LoanNotFoundError';
  }
}

// ❌ Wrong — name assigned as a class property outside the constructor
export class LoanNotFoundError extends AppError {
  readonly name = 'LoanNotFoundError';
  constructor() {
    super('Loan not found', 404);
  }
}
```

## Why `this.name` must be inside the constructor

JavaScript class inheritance resets `name` on the prototype chain. Assigning `this.name` after `super()` ensures it's set on the instance, not the prototype, and survives `instanceof` checks and serialization correctly.

## Naming

- Class name: `PascalCase`, suffixed `Error` (not `Exception` — matches the native `Error` this extends).
- `this.name`: must exactly match the class name as a string literal.
- File name: `kebab-case` matching the class name, suffixed `.error.ts`.

```
LoanNotFoundError        →  loan-not-found.error.ts
DailyDisbursalLimitError →  daily-disbursal-limit.error.ts
```

## Dynamic messages

For errors with dynamic content, accept constructor parameters and build the message before `super()`:

```typescript
export class DailyDisbursalLimitError extends AppError {
  constructor(requested: number, limit: number) {
    super(
      `Requested amount (${requested}) exceeds the branch's daily disbursal limit (${limit}).`,
      409,
    );
    this.name = 'DailyDisbursalLimitError';
  }
}
```

## Message style

- Sentence case.
- Be specific: name the resource and the reason.
- No trailing period for a short noun phrase (`'Loan not found'`).
- Trailing period for a longer explanatory sentence (`'Cannot delete loan — it has recorded repayments.'`).
