# Phase 013: Interfaces & Types — Summary Cheatsheet

## 📋 Syntax Comparison

### Type Alias (`type`)
Best for combining types or naming primitives.
```typescript
type Status = "active" | "inactive";
type User = {
  id: number;
  name: string;
};
```

### Interface (`interface`)
Best for object structures and classes.
```typescript
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  role: string;
}
```

---

## ⚙️ Property Modifiers

- **Optional**: `age?: number` (Property might be missing).
- **Readonly**: `readonly id: number` (Value cannot be changed).
- **Index Signatures**: `[key: string]: any` (Allow any number of extra properties).

---

## 🔗 Combining Types

| Method | Syntax | Use Case |
|--------|--------|----------|
| **Extension** | `interface A extends B` | Interface inheritance. |
| **Intersection**| `type A = B & C` | Merging multiple Type Aliases. |
| **Union** | `type A = B | C` | This OR That. |

---

## 🔄 PHP Comparison

- **Interface**: In PHP, interfaces define *methods* classes must have. In TS, they define *data* objects must have.
- **Type Casting**: In PHP, you cast with `(string)$val`. In TS, you don't cast data, you just tell the compiler what it **is**.

---

## 💡 Remember
- Use `interface` by default for objects.
- Use `type` when you need to use `|` (unions).
- Don't worry about performance; interfaces are slightly faster but the difference is negligible for most projects.
- In Node.js, we use Interfaces to define the "Shape" of our requests, responses, and database models.
