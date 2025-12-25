# Phase 031: Promises Introduction — Summary Cheatsheet

## 💎 The Promise States

| State | Meaning | Final? |
|-------|---------|--------|
| **`pending`** | Still working... | No |
| **`fulfilled`**| Successfully finished. | **Yes** |
| **`rejected`** | Failed with an error. | **Yes** |

---

## 🏗️ Creation Syntax

```typescript
function doWork(): Promise<number> {
  return new Promise((resolve, reject) => {
    // 1. Do some work...
    const success = true;
    
    if (success) {
      resolve(42); // Send back data
    } else {
      reject(new Error("Fail")); // Send back error
    }
  });
}
```

---

## ⚖️ Promise vs. Callback

- **Callback**: "Here is a function, call it whenever you finish."
- **Promise**: "Start working and give me an object. I'll ask the object for the result when I'm ready."

---

## 💡 Remember
- The executor function (`(resolve, reject) => { ... }`) runs **synchronously**.
- The `resolve` and `reject` functions can be called with any value (usually an object or an Error).
- Don't forget the **`new`** keyword!
- **Part D Progression**: Callbacks (Old) → Events (Broadcasting) → **Promises** (Future Value)
