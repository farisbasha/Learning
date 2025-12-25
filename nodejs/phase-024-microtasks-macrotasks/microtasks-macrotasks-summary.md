# Phase 024: Microtasks vs. Macrotasks — Summary Cheatsheet

## 📋 The Task Types

| Type | Examples | Timing |
|------|----------|--------|
| **Macrotasks** | `setTimeout`, `setInterval`, `setImmediate`, I/O | Runs in specific Event Loop phases. |
| **Microtasks** | `Promise.then`, `queueMicrotask` | Runs **between** phases. |
| **nextTick**   | `process.nextTick` | Runs **immediately** after current op. |

---

## 🏗️ Priority Order
1. **Global/Synchronous Code** (The Call Stack).
2. **`process.nextTick` callbacks**.
3. **Promise Microtasks** (`.then`, `await`).
4. **Macrotasks** (`setTimeout` callbacks).

---

## 🧪 Code Execution Cheat
```javascript
// Sync
console.log('A'); 

// Macrotask
setTimeout(() => console.log('B'), 0); 

// Microtask
Promise.resolve().then(() => console.log('C')); 

// Result: A, C, B
```

---

## 💡 Remember
- The Microtask queue must be **completely empty** before the loop moves to the next phase.
- **`process.nextTick`** is more "aggressive" than Promises.
- Avoid recursive `nextTick` calls to prevent freezing the server.
- Most modern async code (Async/Await) uses the **Promise Microtask** queue.
