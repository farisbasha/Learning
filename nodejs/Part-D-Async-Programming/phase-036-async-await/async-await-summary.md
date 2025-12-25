# Phase 036: Async/Await — Summary Cheatsheet

## 📋 The 2 Golden Rules
1. `await` can **only** be used inside an `async` function.
2. `async` functions **always** return a Promise.

---

## 🏗️ Basic Pattern

```typescript
async function processData(id: number): Promise<string> {
  try {
    const data = await api.get(id); // Wait for result
    return `Processed: ${data}`;    // Success
  } catch (err) {
    throw new Error("Logic failed"); // Failure
  }
}
```

---

## 🥊 Sequential vs Parallel

- **Sequential**: `await A(); await B();` (Wait for A, then B).
- **Parallel**: `await Promise.all([A(), B()]);` (Run both at once).

---

## ⚠️ Common Trap
If you forget the `await` keyword, the function will return a **Pending Promise** instead of the actual data.
```typescript
const user = getUser(); // 🚨 Missing await! 'user' is now a Promise object.
console.log(user.name); // undefined
```

---

## 💡 Remember
- `async/await` makes code easier to read and debug.
- It handles errors exactly like synchronous code (`try/catch`).
- It is just "sugar" on top of Promises—under the hood, it's still using the Event Loop and Callbacks.
