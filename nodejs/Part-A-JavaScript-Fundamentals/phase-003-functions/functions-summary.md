# Phase 003: Functions — Summary Cheatsheet

## 🛠️ Definition Syntaxes

| Feature | Declaration | Expression | Arrow |
|---------|-------------|------------|-------|
| **Syntax** | `function add(a, b) { ... }` | `const add = function(a, b) { ... }` | `const add = (a, b) => ...` |
| **Hoisted?** | ✅ Yes | ❌ No | ❌ No |
| **Implicit Return?** | ❌ No | ❌ No | ✅ Yes (if no `{}`) |
| **`this` context** | Own `this` | Own `this` | Lexical (inherited) |
| **Best for** | Global helpers | Local variables | Callbacks, short logic |

---

## 🔝 Arrow Function Shortcuts

- **Single Param**: `x => x * 2` (Parentheses optional)
- **Zero Params**: `() => console.log('Hi')` (Parentheses required)
- **Implicit Object Return**: `() => ({ name: 'John' })` (Wrap in parentheses)

---

## 📦 Parameters & Inputs

- **Defaults**: `(name = 'Guest') => ...`
- **Remaining Items (Rest)**: `(first, ...others) => ...`
- **No arguments?** In arrow functions, use `(...)` anyway. In declarations, you have the `arguments` object (Legacy).

---

## 🔀 Functional Patterns

### Higher-Order Functions (HOF)
Functions that accept or return functions.
```javascript
// Function taking a function
[1, 2].forEach(n => console.log(n));

// Function returning a function
const greet = (msg) => (name) => `${msg}, ${name}`;
```

### IIFE (Run once immediately)
```javascript
(() => {
    // Hidden internal scope
    console.log("Self-executing!");
})();
```

---

## 💡 Important Rules
1. **Prefer `const` + Arrow Functions** for nearly everything in modern Node.js.
2. **Never forget `return`** if you use curly braces `{}` in an arrow function.
3. **Implicit returns** only work for single-expression arrows.
4. **Rest parameters (`...`)** must always be the **last** parameter in the list.
