# Phase 009: Error Handling — Notes

Errors are inevitable in development. In Node.js, an unhandled error can crash your entire server process. Understanding how to gracefully catch, throw, and manage errors is vital for building resilient backend applications.

---

## 1. The `try...catch` Block

This is the primary way to handle exceptions. It looks almost exactly like PHP.

```javascript
try {
    // PHP: Some code that might fail
    const result = someRiskyOperation();
    console.log(result);
} catch (error) {
    // PHP: catch (Exception $e)
    console.error("Oops! Something went wrong:", error.message);
} finally {
    // Always runs, perfect for cleanup (close DB connections, etc.)
    console.log("Cleanup complete.");
}
```

---

## 2. Throwing Errors

You can trigger your own errors using the `throw` keyword.

```javascript
function divide(a, b) {
    if (b === 0) {
        // PHP: throw new Exception("Division by zero");
        throw new Error("Division by zero is not allowed.");
    }
    return a / b;
}
```

> [!TIP]
> **Throwing Strings vs Errors**: You *can* throw a string (`throw "Error!"`), but you **should always throw an `Error` object** (`throw new Error("...")`). This ensures you get a "stack trace" (a map of what led to the error).

---

## 3. Native Error Types

JavaScript has several built-in error types that tell you *why* something failed.

| Error Type | Meaning | Example |
|------------|---------|---------|
| **`Error`** | Generic error | Base class for others |
| **`TypeError`** | Wrong type used | Calling something that isn't a function |
| **`ReferenceError`** | Variable doesn't exist | Accessing `undefined_var` |
| **`SyntaxError`** | Code is unreadable | Missing a curly brace `}` |
| **`RangeError`** | Number out of range | Array with negative length |

---

## 4. Custom Error Classes

In Node.js, you'll often want to define your own error types (e.g., `DatabaseError`, `AuthError`).

```javascript
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

// Handling specifically
try {
    throw new ValidationError("Invalid email", "email");
} catch (err) {
    if (err instanceof ValidationError) {
        console.log(`Error in field: ${err.field}`);
    }
}
```

---

## 5. PHP vs. JavaScript: Error Handling

| Feature | PHP | JavaScript |
|---------|-----|------------|
| Block | `try/catch/finally` | `try/catch/finally` |
| Variable | `catch(Exception $e)` | `catch(e)` |
| Methods | `$e->getMessage()`, `$e->getTrace()` | `e.message`, `e.stack` |
| Throwing | `throw new Exception()` | `throw new Error()` |
| Error Levels | Warnings, Notices, Errors | No "warning" level; it either crashes or is caught. |

---

## 6. Asynchronous Errors (Sneak Peek)

In Node.js, `try/catch` **does not** automatically work with asynchronous code (Phase 027+). This is a major trap for PHP devs.

```javascript
// ❌ WRONG: This won't catch the error!
try {
    setTimeout(() => { throw new Error("Boom"); }, 100);
} catch (e) {
    console.log("Caught!"); // Will never happen
}
```
We will learn how to handle this correctly using **Promises** and **Async/Await** later.

---

## 7. Key Takeaways
1. **Be Specific**: In `catch`, check the error type using `instanceof` to handle it correctly.
2. **Follow Through**: Use `finally` for closing files or connections.
3. **Trace Your Steps**: Use `error.stack` during development to see exactly where the failure happened.
4. **Don't Swallow Errors**: Never use an empty `catch` block (`catch(e) {}`). At minimum, log it.
