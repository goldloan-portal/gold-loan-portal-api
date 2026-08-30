---
description: Guarding update/PATCH handlers against no-op requests where every field is undefined
applyTo: 'src/services/**/*.ts, src/schemas/**/*.ts'
---

# Update API — No-Op Guard

In update/PATCH service functions, don't guard individual fields with `if (field !== undefined)` checks scattered through the handler.

Instead, after validating the input, check whether **every** field is undefined. If so, throw a `NoUpdateFieldsError`.

### Pattern

```typescript
// ✅ Correct
if (Object.values(updateInput).every((v) => v === undefined)) {
  throw new NoUpdateFieldsError();
}

// ❌ Avoid
if (input.amount !== undefined) { ... }
if (input.dueDate !== undefined) { ... }
```

`NoUpdateFieldsError` lives alongside the other custom errors (see `.claude/instructions/exceptions.md`).

---

## Update schema — separate shape vs `.partial()`

**Rule:** if any field from the create schema must never change after creation, write the update schema as a separate, explicit shape. Only derive it with `.partial()` when every field from create is also freely editable after creation.

```typescript
// ✅ Write separately when a field is immutable post-creation
const updateLoanSchema = z.object({
  // only the editable fields, explicitly listed — no `collateralType`, no `branchId`
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

// ✅ .partial() is fine for a flat schema with no immutable fields
const updateTagSchema = createTagSchema.partial();

// ❌ Avoid — silently makes an immutable field optionally updatable
const updateLoanSchema = createLoanSchema
  .omit({ collateralType: true })
  .partial();
```

**Why `.omit(...).partial()` composition is risky:**

- Any new field added to the create schema automatically becomes optionally updatable — often unintentional.
- If the create schema has conditional validation between fields, that coupling is invisible in the composed update schema.
- Understanding what update actually accepts requires reading the create schema too.

**Decision rule:** any field immutable after creation, or any cross-field conditional validation on create → write the update schema separately. Flat schema, everything freely editable → `.partial()` is fine.
