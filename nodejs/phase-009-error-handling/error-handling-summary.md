# Phase 009: Error Handling — Summary Cheatsheet

## 🛡️ The Handling Pattern

```javascript
try {
  // 1. Run Risky Code
  throw new Error("Something broke!");
} catch (error) {
  // 2. Handle Error
  console.error(error.message); // The string message
  console.error(error.name);    // e.g., "Error" or "TypeError"
  console.error(error.stack);   // The file and line number trace
} finally {
  // 3. Cleanup (Optional)
  console.log("Runs no matter what");
}
```

---

## 🏗️ Custom Errors

```javascript
class MyCustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "MyCustomError";
    this.code = 404; // Custom property
  }
}
```

---

## 🔬 Native Error Reference

| Type | When it happens? |
|------|------------------|
| **`TypeError`** | `null.name`, `x()` where x is not a function. |
| **`ReferenceError`** | `console.log(nonExistentVar)` |
| **`SyntaxError`** | `if (true {` (Code that is grammatically wrong) |
| **`URIError`** | Malformed `decodeURI()` commands. |

---

## 🔄 PHP ↔ JS Error Map

| Feature | PHP | JavaScript |
|---------|-----|------------|
| Throw | `throw new Exception("...")` | `throw new Error("...")` |
| Catch | `catch (Exception $e)` | `catch (error)` |
| Message | `$e->getMessage()` | `error.message` |
| Stack | `$e->getTraceAsString()`| `error.stack` |

---

## 💡 Remember
- **Always throw `new Error()`**, never just a string or number.
- `finally` is great for things that **must** happen (like turning off a loading spinner or closing a database connection).
- If your `catch` block doesn't know how to handle the specific error, **re-throw it**: `if (...) throw error;`.
- Unhandled errors in Node.js can **kill the whole server**. Catch them at the boundary or top-level.
