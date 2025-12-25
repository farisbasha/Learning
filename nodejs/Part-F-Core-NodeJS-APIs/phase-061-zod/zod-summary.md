# Phase 061: Zod — Summary Cheatsheet

## 🏗️ Schema Basics

```typescript
z.string();
z.number().min(1);
z.boolean();
z.date();
z.array(z.string());
z.object({ key: z.string() });
z.enum(['a', 'b']);
```

---

## 🛡️ Validation Flow

```typescript
const result = schema.safeParse(data);

if (result.success) {
  const validData = result.data; // Fully typed
} else {
  console.log(result.error.issues); // List of errors
}
```

---

## 🪄 The Magic Link (TS + Zod)
```typescript
type MyType = z.infer<typeof mySchema>;
```

---

## 💡 Remember
- Zod is a runtime validator; TypeScript is a compile-time checker. You need both.
- Use `.optional()` for fields that might be missing and `.nullable()` for fields that might be `null`.
- Use `.transform()` to cast data (like turning a request string into a Date object).
