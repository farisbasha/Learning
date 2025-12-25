# Phase 033: Promise Chaining — Summary Cheatsheet

## ⛓️ The Rules of Chaining

1. Each `.then()` returns a **new Promise**.
2. If you return a **Value**, the next `.then()` gets that value.
3. If you return a **Promise**, the chain **pauses** and waits for it.
4. One **`.catch()`** at the bottom handles all errors in the sequence.

---

## 🆚 Comparison

| Feature | Callback Hell | Promise Chaining |
|---------|---------------|------------------|
| **Structure** | Deeply Nested (Pyramid) | Flat (List) |
| **Error Handling** | Every level manually | One `.catch()` for all |
| **Readability** | Poor / High cognitive load | Good / Easy to follow |

---

## 🛡️ Error Flow
```typescript
TaskA()
  .then(() => TaskB()) // If B fails...
  .then(() => TaskC()) // ...C is skipped...
  .catch(err => ...)   // ...Error handled here.
```

---

## 💡 Remember
- Don't nest promises inside `.then()`. Return them to stay flat.
- Always `return` your promises.
- Avoid "Ghost Promises" (promises that aren't returned and run in the background without the chain knowing).
