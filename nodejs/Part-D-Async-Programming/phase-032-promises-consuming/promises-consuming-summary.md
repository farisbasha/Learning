# Phase 032: Consuming Promises — Summary Cheatsheet

## 🛠️ The Promise API Methods

| Method | When does it run? | Typical Use |
|--------|-------------------|--------------|
| **`.then(fn)`** | Success (Fulfilled) | Process the result. |
| **`.catch(fn)`**| Failure (Rejected) | Handle the error. |
| **`.finally(fn)`**| Always (Settled) | Cleanup / Stop Loaders. |

---

## 🔗 Chaining Syntax

```typescript
fetchData()
  .then(data => {
    // handle success
    return data.id; 
  })
  .then(id => {
    // handle next step
  })
  .catch(err => {
    // handle ANY error in the chain above
  })
  .finally(() => {
    // cleanup
  });
```

---

## 🛡️ Error Flow
An error starts a "cascade." It will skip every `.then()` until it hits a `.catch()`.
If no `.catch()` is found, the process emits an `unhandledRejection` event.

---

## 💡 Remember
- `.then()` always returns a promise.
- You can pass two arguments to `.then(success, failure)`, but it's cleaner to use `.catch()` instead.
- If you don't return anything from a `.then()`, the next link in the chain gets `undefined`.
