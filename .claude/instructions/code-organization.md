---
description: Code organization — grouping reads and writes in controllers, services and repositories
applyTo: 'src/controllers/**/*.ts, src/services/**/*.ts, src/repositories/**/*.ts'
---

# Code Organization: READS / WRITES / HELPERS Sections

## Rule

Group methods in controllers, services, and repositories into `// READS`, `// WRITES`, and `// HELPERS` sections using single-line comments. Always maintain this order — READS first, WRITES second, HELPERS last.

## Controllers

Read handlers (GET) go at the top, write handlers (POST, PATCH, PUT, DELETE) go in the middle. Helper functions used only within the controller go at the bottom.

```typescript
// src/controllers/loan.controller.ts

// READS
export async function getLoans(req: Request, res: Response) {}
export async function getLoanById(req: Request, res: Response) {}

// WRITES
export async function createLoan(req: Request, res: Response) {}
export async function updateLoan(req: Request, res: Response) {}

// HELPERS
function buildLoanQueryParams(req: Request) {}
```

## Services and repositories

Read methods (get, list) go at the top, write methods (create, update, delete) go in the middle. Validation helpers, mapping helpers, and query builders go at the bottom under `// HELPERS`.

```typescript
// src/services/loan.service.ts

// READS
export async function getLoans() {}
export async function getLoanById(id: string) {}

// WRITES
export async function createLoan(input: CreateLoanInput) {}
export async function updateLoan(id: string, input: UpdateLoanInput) {}

// HELPERS
async function ensureLoanExists(id: string) {}
```

## Method Naming

All controller, service, and repository functions follow the `verb + ResourceName` pattern. Never use generic CRUD-style names (`findAll`, `findOne`, `create`, `update`) — always include the resource name.

| Operation    | Pattern                       | Example       |
| ------------ | ----------------------------- | ------------- |
| List         | `get` + ResourceName (plural) | `getLoans`    |
| Single by ID | `get` + ResourceName + `ById` | `getLoanById` |
| Create       | `create` + ResourceName       | `createLoan`  |
| Update       | `update` + ResourceName       | `updateLoan`  |
| Delete       | `delete` + ResourceName       | `deleteLoan`  |

Helper functions in the `// HELPERS` section follow their own patterns:

| Use case        | Pattern                                    | Example                |
| --------------- | ------------------------------------------ | ---------------------- |
| Existence guard | `ensure` + ResourceName + `Exists`         | `ensureLoanExists`     |
| State guard     | `ensure` + ResourceName + `Is` + Condition | `ensureLoanIsEditable` |
| Internal fetch  | `fetch` + noun phrase                      | `fetchActiveGoldRate`  |

## Return Types

Every exported `async` function in `controllers/`, `services/`, and `repositories/` has an explicit `Promise<T>` return type. Non-async helpers also get an explicit return type. Never leave a function signature without one.

## Single Responsibility per Resource

Each `<resource>.controller.ts` / `.service.ts` / `.repository.ts` handles one resource. When a sub-resource grows its own CRUD, give it its own trio of files rather than bloating the parent's.

## No Types or Utility Functions Inline in Service/Repository Files

`services/*.service.ts` and `repositories/*.repository.ts` carry functions only. They must NOT declare:

- Module-level `type`/`interface` aliases — move to `src/types/<resource>.types.ts`
- Pure converter/helper functions unrelated to this resource's own logic — move to a `<resource>.util.ts` alongside the service

## Mappers Take Data, Not Services or the Prisma Client

If response-shaping mapper functions are introduced, they accept only plain data — repository row shapes, primitives, other DTOs. They must NOT accept the Prisma client, a config object, or anything that wraps I/O.

When a field needs a derived value (a signed URL, a formatted amount), the caller resolves it first and passes the resolved primitive to the mapper. This keeps mappers pure and trivially testable once tests exist.

```typescript
// ❌ Wrong — mapper depends on a service
function toLoanResponse(loan: LoanRow, uploadService: UploadService) {
  return { ...loan, documentUrl: uploadService.toPublicUrl(loan.documentPath) };
}

// ✅ Correct — caller resolves, mapper just projects
function toLoanResponse(loan: LoanRow, documentUrl: string | null) {
  return { ...loan, documentUrl };
}
```

## Folder Structure for Multiple Repositories per Resource

A resource with more than one natural sub-collection (e.g. a loan's repayments) gets its own `<sub-resource>.repository.ts` / `.service.ts` / `.controller.ts` trio rather than folding into the parent's files. Register its routes separately in `src/routes/`.

## Notes

- The `// HELPERS` section is for anything not a direct route handler or public read/write method.
- Never place helper functions above READS or between READS and WRITES.
- If there are no helper functions, omit the `// HELPERS` section entirely.

## Enforcement on Every Touch

Whenever any function is added, edited, or removed from a controller, service, or repository file — even a single-line change — the entire file must be checked and corrected for:

1. `// READS` / `// WRITES` / `// HELPERS` sections present and in order
2. All functions placed in the right section
3. Function names follow the `verb + ResourceName` pattern
4. All async functions have an explicit `Promise<T>` return type

A partial fix (only the touched function) is not acceptable.
