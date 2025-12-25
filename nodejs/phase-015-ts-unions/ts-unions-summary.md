# Phase 015: Union & Literals — Summary Cheatsheet

## 🔀 Union Syntax
Allow multiple types for one value.
```typescript
let id: string | number;
```

---

## 🎯 Literal Types
Restrict to exact values (Case-sensitive!).
```typescript
type Status = "pending" | "success" | "error";
type Port = 3000 | 8080 | 443;
```

---

## 🔎 Narrowing Techniques

| Method | Syntax |
|--------|--------|
| **typeof** | `if (typeof x === "string")` |
| **instanceof** | `if (x instanceof Date)` |
| **in** operator | `if ("property" in obj)` |
| **Equality Check**| `if (x === null)` |

---

## 🏷️ Discriminated Union Pattern

```typescript
type Response = 
  | { type: "success"; data: string }
  | { type: "error"; message: string };

function handle(res: Response) {
  if (res.type === "success") {
    console.log(res.data);
  } else {
    console.log(res.message);
  }
}
```

---

## 💡 Remember
- Literals work with strings, numbers, and booleans.
- Always use narrowing before calling type-specific methods (like `.toFixed()` or `.toUpperCase()`).
- TypeScript will warn you if your `switch` statement doesn't cover all possible union members.
