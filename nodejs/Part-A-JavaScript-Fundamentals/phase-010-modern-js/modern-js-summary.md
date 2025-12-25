# Phase 010: Modern JS — Summary Cheatsheet

## 🛡️ Safer Access

| Feature | Syntax | Behavior |
|---------|--------|----------|
| **Optional Chaining** | `a?.b` | Returns `undefined` if `a` is nullish. |
| **Nullish Coalescing** | `a ?? b` | Returns `b` ONLY if `a` is `null` or `undefined`. |
| **Logical OR** | `a || b` | Returns `b` if `a` is any falsy value (`0`, `""`, `false`). |

---

## 📦 Data Packing & Unpacking

### Destructuring
```javascript
// Object
const { id, name: fullName } = user; // Extract & Rename

// Array
const [first, , third] = [1, 2, 3]; // Skip elements
```

### Spread (Expand)
```javascript
const combined = { ...objA, ...objB };
const copy = [...myArr];
```

### Rest (Collect)
```javascript
const [head, ...tail] = [1, 2, 3, 4]; // head = 1, tail = [2, 3, 4]
```

---

## 🔁 Modern Loops

```javascript
// 1. Arrays (Values)
for (const val of ["apple", "banana"]) { ... }

// 2. Objects (Keys)
for (const key in { id: 1, name: "basha" }) { ... }

// 3. Object Entries
for (const [key, val] of Object.entries(obj)) { ... }
```

---

## ✍️ Expressive Logic

```javascript
// 1. Conditional Invoke
isLoggedIn && showDashboard();

// 2. Computed Keys
const status = "active";
const user = { [status]: true }; // { active: true }

// 3. Shorthand Properties
const name = "Basha";
const config = { name }; // { name: "Basha" }
```

---

## 💡 Remember
- **Optional chaining** works for function calls too: `user.login?.()`.
- **`??`** is better for numeric settings where `0` is a valid input.
- **Destructuring** inside function parameters is very common in Node.js: `function handle({ id, type }) { ... }`.
- You have officially finished the **JavaScript Fundamentals** part of the course! 🎉
