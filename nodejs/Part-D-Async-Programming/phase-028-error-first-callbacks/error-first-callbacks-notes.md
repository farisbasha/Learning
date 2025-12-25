# Phase 028: Error-First Callback Convention — Notes

In the early days of Node.js, there was no standard way to handle errors in callbacks. The community eventually settled on a "Gold Standard" called the **Error-First Callback**.

---

## 1. The Convention

A function that performs an asynchronous operation accepts a callback where:
1. The **first argument** is reserved for an Error object (if one occurred).
2. The **subsequent arguments** are for the successful data.

```javascript
function (error, result) {
    // ...
}
```

---

## 2. Why Error First?

By putting the error first, you are **forced** to acknowledge it before you use the data. This prevents "silent failures" where you accidentally try to process data that doesn't exist.

```javascript
const fs = require('fs');

fs.readFile('config.json', 'utf8', (err, data) => {
    // 1. Check for Error
    if (err) {
        console.error("Failed to read file:", err.message);
        return; // Important: Stop execution!
    }

    // 2. Use Data
    const config = JSON.parse(data);
    console.log("Config loaded:", config.db_host);
});
```

---

## 3. Propagating Errors

If you are writing your own library/utility using callbacks, you must follow this same pattern. When an error occurs, you call the callback with the error as the first argument and `null` or `undefined` as the second.

```javascript
function getUser(id, callback) {
    db.query(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
        if (err) {
            // Pass the error up the chain
            return callback(err);
        }
        
        if (!row) {
            return callback(new Error("User not found"));
        }
        
        // Success! First arg is null
        callback(null, row);
    });
}
```

---

## 4. Key Rules
1. **Always Check**: Never assume `err` is null.
2. **Early Return**: Always `return` inside the `if (err)` block so the success code doesn't try to run.
3. **Pass the Object**: Pass a real `Error` object, not just a string, to preserve the stack trace.

---

## 5. Key Takeaways
1. **Gold Standard**: If you see a callback with two arguments, assume the first is `err`.
2. **Forced Logic**: This pattern moves error handling to the top of the function.
3. **Exit Early**: Forgetting to `return` after `callback(err)` is one of the most common bugs in legacy Node.js code.
