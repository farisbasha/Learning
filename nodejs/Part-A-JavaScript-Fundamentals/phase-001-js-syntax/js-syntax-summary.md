# Phase 001: JavaScript Syntax — Summary Cheatsheet

## 🚀 Quick Reference: PHP vs JS

| Feature | PHP | JavaScript (Modern) |
|---------|-----|----------------------|
| **Variables** | `$name = 'John';` | `const name = 'John';` |
| **Constants** | `define('PI', 3.14);` | `const PI = 3.14;` |
| **Output** | `echo $val;` | `console.log(val);` |
| **Strings** | `"Hello $name"` | `` `Hello ${name}` `` |
| **Concatenation** | `.` (dot) | `+` (plus) |
| **Strict Check**| `===` | `===` (MUCH more important!) |

---

## 📦 Variable Declarations

| Keyword | Scope | Reassignable? | Use Case |
|---------|-------|---------------|----------|
| `const` | Block | No | **Default choice** for everything. |
| `let`   | Block | Yes | Loops, counters, toggles. |
| `var`   | Function | Yes | **Avoid.** Legacy code only. |

---

## 🔤 String Patterns

```javascript
const user = "Basha";

// ❌ WRONG (No interpolation)
const s1 = "Hello ${user}"; // Output: Hello ${user}

// ✅ RIGHT (Template Literal)
const s2 = `Hello ${user}`; // Output: Hello Basha

// ✅ Multi-line
const s3 = `
  This is a
  multi-line string.
`;
```

---

## ⚖️ Equality Guide

> [!CAUTION]
> **RULE**: Never use `==`. Always use `===`.

```javascript
// The Dangerous Loose Equality (==)
null == undefined;   // true
0 == false;          // true
"" == false;         // true

// The Safe Strict Equality (===)
null === undefined;  // false
0 === false;         // false
```

---

## 🛠️ Console Tricks

- `console.log(a, b, c);` — Log multiple values at once.
- `console.table(objectOrArray);` — Best for viewing data.
- `console.dir(object, { depth: null });` — View deep nested objects.
- `console.time('label')` / `console.timeEnd('label')` — Simple benchmarking.

---

## 💡 Remember
- JavaScript doesn't use `$` for variables.
- `+` is for both addition AND string concatenation. Be careful!
- Use `const` until you are forced to use `let`.
- Template literals use **backticks** (the key beside `1`), not single quotes.
