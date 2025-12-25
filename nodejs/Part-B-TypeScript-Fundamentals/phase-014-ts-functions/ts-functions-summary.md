# Phase 014: Functions — Summary Cheatsheet

## 🖋️ Function Declaration Patterns

### Named Function
```typescript
function add(x: number, y: number): number {
  return x + y;
}
```

### Arrow Function
```typescript
const add = (x: number, y: number): number => x + y;
```

---

## ⚙️ Parameters & Arguments

- **Optional**: `(name?: string) => ...` (Value becomes `undefined` if missing).
- **Default**: `(name: string = "Guest") => ...`
- **Rest**: `(...args: number[]) => ...` (Collects all remaining args into an array).

---

## 🧩 Storing Function Shapes (Types)

```typescript
// Define the shape
type Callback = (id: number) => void;

// Use it
function process(id: number, cb: Callback) {
  cb(id);
}
```

---

## 🔄 PHP Comparison Cheat

| PHP | TypeScript |
|-----|------------|
| `function foo(string $s): int` | `function foo(s: string): number` |
| `?string` (nullable) | `string | null` |
| `$arg = "default"` | `arg: string = "default"` |
| `...$params` | `...params: type[]` |

---

## 💡 Remember
- Return type `void` means the function doesn't return anything.
- Return type `never` means the function **crashes** or has an **infinite loop**.
- TypeScript does **not** check the number of arguments at runtime, only during coding/compilation.
- Always put optional parameters **after** required ones.
