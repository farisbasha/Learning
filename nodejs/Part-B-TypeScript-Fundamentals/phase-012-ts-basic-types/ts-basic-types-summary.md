# Phase 012: TS Basic Types — Summary Cheatsheet

## 💎 Primitives

| Type | Example |
|------|---------|
| `string` | `"hello"`, `'hi'`, `` `val: ${x}` `` |
| `number` | `10`, `3.14`, `-50` |
| `boolean`| `true`, `false` |
| `null`   | `null` |
| `undefined`| `undefined` |

---

## 🏗️ Complex Types

### Arrays
- `string[]` — Array of strings.
- `number[]` — Array of numbers.
- `(string | number)[]` — Mixed array (Either).

### Tuples (Fixed size/order)
- `[number, string]` — e.g., `[200, "OK"]`.

### Special Types
- `any` — Any type (Turn off safety).
- `unknown` — Any type (Safe safety).
- `void` — Return type for "nothing".
- `never` — Return type for functions that never finish.

---

## 🧠 Type Inference
You don't need `: string` if you assign `"text"` immediately.
```typescript
let x = 10; // x is number
let y = "hi"; // y is string
```

---

## 💡 Remember
- Don't use `Array` unless you need generics. `string[]` is more common.
- Use `unknown` instead of `any` for external API data you haven't validated yet.
- TypeScript is case-sensitive: Use lowercase `string`, not `String` (big capital `String` is a JavaScript object).
