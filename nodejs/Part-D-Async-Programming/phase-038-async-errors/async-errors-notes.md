# Phase 038: Error Handling in Async Code — Notes

Error handling in asynchronous code is the most common place where production bugs hide. Because the execution "jumps" around the Event Loop, errors can easily get lost or crash your server.

---

## 1. The Async `try/catch` Requirement

When using `async/await`, you **must** use `try/catch` or the error will propagate up as an `unhandledRejection`.

```typescript
// ✅ Good: Inside a function
async function run() {
    try {
        await riskyTask();
    } catch (err) {
        logError(err);
    }
}
```

---

## 2. The Global Safety Net

In Node.js, if a Promise fails and no code catches it, it triggers a global event. You should listen to this to prevent silent failures.

```typescript
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
    // Send to Sentry, Logger, etc.
});
```

---

## 3. Custom Error Classes (TypeScript)

As a professional developer, don't just throw strings. Create a hierarchy of errors so your code (and your API users) can tell exactly what happened.

```typescript
class DatabaseError extends Error {
    constructor(message: string, public query: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

// Handling by type
try {
    await db.save(user);
} catch (err) {
    if (err instanceof DatabaseError) {
        console.error('SQL Error:', err.query);
    }
}
```

---

## 4. The "Result" Pattern (Functional Error Handling)

Some developers prefer to return errors instead of throwing them (similar to Go or Rust). This is great for making errors explicit in your types.

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: Error };

async function fetchUser(id): Promise<Result<User>> {
    try {
        const data = await db.getUser(id);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err };
    }
}
```

---

## 5. Key Takeaways
1. **Don't Swallow Errors**: Never write an empty `catch (err) {}`. It makes debugging impossible.
2. **Awaited Catch**: If you call an async function but **don't** await it, you cannot catch its error with a surrounding `try/catch`. 
3. **Consistency**: Use a consistent error handling strategy across your entire Node.js application.
4. **Part D Final**: You have mastered **Asynchronous Programming**! You have gone from Callbacks to Promises, to Async/Await, and now Advanced Error handling. 
5. **Next Step**: We enter **Part E**, where we learn how Node.js organizes code into **Modules** and uses **npm/package.json**.
