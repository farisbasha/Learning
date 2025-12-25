# Phase 018: TS Advanced — Summary Cheatsheet

## 🛠️ Advanced Operators

| Operator | Usage | Purpose |
|----------|-------|---------|
| **`keyof T`** | `keyof User` | Returns `"id" | "name"` |
| **`T[K]`** | `User["id"]` | Access specific field type. |
| **`in`** | `[K in Keys]` | Iteration (for Mapped Types). |
| **`typeof`** | `typeof myVar`| Get type from a value. |

---

## 🎭 Advanced Definitions

### Mapped Type
Convert one structure to another.
```typescript
type ReadonlyUser = { readonly [K in keyof User]: User[K] };
```

### Conditional Type
Logic inside your types.
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

### Template Literal Type
```typescript
type API_Key = `key_${string}`;
const myKey: API_Key = "key_123"; // OK
```

---

## 🚨 Escape Hatches

- **Type Assertion**: `const v = someValue as string;` ("I know what I'm doing")
- **Non-null Assertion**: `val!.prop` ("I promise this isn't null")
- **Index Signature**: `[key: string]: any` (Allow anything)

---

## 💡 Remember
- These patterns are for **Library Authors** or **Senior Devs** building infrastructure.
- Always check if a **Utility Type** (Phase 017) can do the job before writing a custom Mapped Type.
- Type assertions (`as`) should be a last resort. If you use them too much, your code isn't really type-safe.
- Congratulations on completing **Part B: TypeScript Fundamentals**! 🎉
