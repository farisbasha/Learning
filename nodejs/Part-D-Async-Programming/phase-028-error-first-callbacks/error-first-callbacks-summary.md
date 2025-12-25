# Phase 028: Error-First Callbacks — Summary Cheatsheet

## 🛡️ The Pattern

```javascript
asyncOp((err, result) => {
  if (err) {
    // Handle error
    return;
  }
  // Use result
});
```

---

## 🏗️ Writing Your Own

```javascript
function myTask(param, callback) {
  if (!param) {
    return callback(new Error("Missing parameter"));
  }
  
  const data = "Success Result";
  callback(null, data);
}
```

---

## ⚠️ Common Mistakes

| Mistake | Prevention |
|---------|------------|
| **Forgetting to return** | Always use `return callback(err)` on one line. |
| **Assuming data exists** | Never touch `result` until `err` is checked. |
| **Throwing inside callback**| **Don't throw**. Pass the error to the callback instead. |

---

## 💡 Remember
- This is a **convention**, not a language feature. But every major legacy library follows it.
- If you see `null` as the first argument in a callback call, it means the operation was successful.
- In modern Node, we use `util.promisify` to convert these to Promises (Phase 035).
