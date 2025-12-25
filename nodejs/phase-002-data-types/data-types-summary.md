# Phase 002: Data Types — Summary Cheatsheet

## 💎 Primitive Types

| Type | How to check | Notes |
|------|--------------|-------|
| `string` | `typeof x === "string"` | Text data ('' or "" or ``) |
| `number` | `typeof x === "number"` | Includes integers and floats |
| `boolean`| `typeof x === "boolean"`| `true` or `false` |
| `null`   | `x === null` | **Intentional** absence. `typeof` returns "object". |
| `undefined` | `typeof x === "undefined"`| Variable not initialized. |
| `bigint` | `typeof x === "bigint"` | Operations on huge integers. |

---

## 🏗️ Reference Types (Objects)

Always use specific checks, as `typeof` returns `"object"` for all of these:
- **Arrays**: `Array.isArray(x)`
- **Objects**: `typeof x === "object" && x !== null`
- **Functions**: `typeof x === "function"`

---

## 🚦 Truthy vs. Falsy

Quickly determine if an `if(x)` will pass:

| Falsy (Fails `if`) | Truthy (Passes `if`) |
|--------------------|----------------------|
| `false`            | `true` |
| `0`, `-0`          | `1`, `-1`, `3.14` |
| `""` (Empty string)| `" "`, `"0"`, `"false"` (Non-empty strings) |
| `null`             | `[]` (Empty Array - **SURPRISE!**) |
| `undefined`        | `{}` (Empty Object - **SURPRISE!**) |
| `NaN`              | All functions |

---

## 🧠 Common Gotchas

1. **`null` is an object?**  
   `typeof null` returns `"object"` due to a legacy bug in JS. Check with `x === null`.

2. **PHP Array vs JS Array**  
   In PHP: `empty([])` is `true`.  
   In JS: `Boolean([])` is **`true`**.  
   *To check if a JS array is empty, use `arr.length === 0`.*

3. **String Math**  
   - `"10" + 5` → `"105"` (String wins)
   - `"10" - 5` → `5` (Number wins)

4. **Floating Point**  
   `0.1 + 0.2` is `0.30000000000000004`. Use `.toFixed(2)` for currency!

---

## 💡 Remember
- In JavaScript, **Arrays are Objects**.
- **`null` == `undefined`** is `true`, but **`null` === `undefined`** is `false`.
- Use `typeof` for primitives and specialized checks for objects/arrays.
