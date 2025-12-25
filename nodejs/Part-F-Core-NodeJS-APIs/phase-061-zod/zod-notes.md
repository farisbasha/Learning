# Phase 061: Zod for Runtime Validation — Notes

TypeScript is amazing, but it has a secret: **it doesn't exist at runtime.** If an API sends you a string when you expect a number, TypeScript won't stop your app from crashing. **Zod** is the industry-standard tool that bridges this gap.

---

## 1. The Core Idea: Schemas

With Zod, you define a **Schema** once. You then use that schema to:
1. **Validate** incoming data at runtime.
2. **Infer** TypeScript types automatically.

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']).optional()
});

// A. Infer the Type (Magic!)
type User = z.infer<typeof UserSchema>;
```

---

## 2. Validation (`parse` vs `safeParse`)

### `parse()`
Throws an error if the data is invalid. Best for internal logic where failure is unacceptable.

```typescript
try {
  const user = UserSchema.parse(someApiData);
} catch (err) {
  // err contains detailed list of validation failures
}
```

### `safeParse()`
Returns an object `{ success: true, data }` or `{ success: false, error }`. Best for API endpoints.

```typescript
const result = UserSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json(result.error.format());
}
const user = result.data;
```

---

## 3. Transformations

Zod can also clean up your data as it validates it.

```typescript
const querySchema = z.object({
  id: z.string().transform(Number) // Convert string "123" to number 123
});
```

---

## 4. Why use Zod in Node.js?

1. **Safety**: It's the first line of defense against bad data from users or APIs.
2. **Type-Safety**: You never have to write "interface" and "validation logic" separately again.
3. **Error Messages**: Zod provides extremely detailed messages telling the user exactly which field failed and why.

---

## 5. Key Takeaways
1. **Schema First**: Define your schemas near your API routes or models.
2. **Single Source of Truth**: Use `z.infer` so your TS types always match your validation.
3. **Optionality**: Use `.optional()` or `.nullable()` to handle missing values.
4. **Conclusion**: Zod is the "missing piece" of TypeScript. Next, we'll see how to use it to validate our **Environment Variables**.
