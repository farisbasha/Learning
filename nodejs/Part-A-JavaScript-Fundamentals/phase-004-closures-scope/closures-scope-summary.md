# Phase 004: Closures & Scope — Summary Cheatsheet

## 📍 Scope Types

| Type | Keyword | Persistence | Scoping Level |
|------|---------|-------------|---------------|
| **Global** | `var`, `let`, `const` | Entire app | Top of file / window / global |
| **Function** | `var` | Function body | Reached via function calls |
| **Block** | `let`, `const` | Inside `{ ... }` | Loops, If-statements, blocks |

---

## 🔒 Closure Blueprint

A closure is a function **plus** its environment.

```javascript
const factory = (prefix) => {
    // Hidden variable
    let count = 0;
    
    return (msg) => {
        count++;
        return `${prefix} [${count}]: ${msg}`;
    };
};

const logger = factory("API");
logger("Call"); // API [1]: Call
logger("Done"); // API [2]: Done
```

### Top Use Cases:
1. **Encapsulation**: Private state without ES6 Classes.
2. **Callbacks**: Preserving state in asynchronous Node.js operations.
3. **Currying**: Partially applying arguments to functions.

---

## 🚀 Hoisting Reference

| Code Element | Behavior | Can access before line? |
|--------------|----------|-------------------------|
| `function name() {}` | Fully hoisted | ✅ Yes (runs normally) |
| `var x = 1` | Declaration only | ⚠️ Yes (returns `undefined`) |
| `let x = 1` | TDZ (Not accessible) | ❌ No (Throws Error) |
| `const x = 1`| TDZ (Not accessible) | ❌ No (Throws Error) |

---

## ⚠️ The "Golden Rule" for Loops

**Never use `var` in a loop with an asynchronous operation.**

```javascript
// ❌ WRONG
for (var i = 0; i < 5; i++) {
    // All 5 callbacks will see i as 5
}

// ✅ RIGHT
for (let i = 0; i < 5; i++) {
    // Every callback gets its own unique 'i'
}
```

---

## 💡 Remember
- **JavaScript is Lexical**: Scope is defined by where you **write** the code, not where you call it.
- **Don't leak variables**: Use `const` to keep things trapped in their block or function.
- **Privacy**: Closures were the only way to have private variables until very recently (Phase 008 classes).
