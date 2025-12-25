# Phase 026: The `process` Object — Notes

The `process` object is a global object in Node.js that provides information about, and control over, the current Node.js process. It is your bridge between the JavaScript code and the underlying Operating System.

---

## 1. Environment Variables (`process.env`)

This is where you store configurations like DB credentials, API keys, and Ports.
- **Tip**: Always use a `.env` file (via `dotenv` package) instead of hardcoding.

```typescript
// Accessing variable
const PORT = process.env.PORT || 3000;

// Professional TS Pattern
interface Config {
    apiKey: string;
    port: number;
}

const config: Config = {
    apiKey: process.env.API_KEY!, // ! tells TS "I know this exists"
    port: Number(process.env.PORT) || 3000
};
```

---

## 2. Command Line Arguments (`process.argv`)

When you run `node app.js --env=prod`, these arguments are stored in an array.
- `[0]`: Path to the Node executable.
- `[1]`: Path to the script being run.
- `[2...]`: Your actual arguments.

---

## 3. Current Working Directory (`process.cwd()`)

Returns the absolute path of the directory you were in when you started the Node process.
> **Note**: This is different from `__dirname`, which is the directory where the *current file* resides.

---

## 4. Lifecycle & Exit

You can manually stop a process using `process.exit(code)`.
- `0`: Success (Everything is fine).
- `1`: Failure (Crashed/Error).

---

## 5. Event Handlers

You can listen for system-level events using `process.on()`.

### `uncaughtException`
The "Last Resort" handler for errors you forgot to `try/catch`. 
> **Warning**: After this event, the process is in an "unstable" state. You should log the error and restart the process.

### `unhandledRejection`
Catches Promises that failed but had no `.catch()` block. Very common in modern Node apps.

```typescript
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, then shutdown
});
```

---

## 6. Memory Usage (`process.memoryUsage()`)

Returns an object describing the memory usage of the Node process in bytes.
- `rss`: Resident Set Size (Total memory allocated).
- `heapTotal`: Memory available for dynamic objects.
- `heapUsed`: Actually used memory.

---

## 7. Key Takeaways
1. **`process` is Global**: You don't need to `import` it.
2. **Environment Safety**: Treat `process.env` as untrusted. Always validate or cast types (e.g., string → number) in TypeScript.
3. **Signal Handling**: Use `process.on('SIGINT', ...)` to handle `Ctrl+C` and close database connections gracefully.
4. **Graduation**: You have successfully completed **Part C: Node.js Runtime & Internals**! You now understand the machine under the hood. 
5. **Next Step**: We enter **Part D**, the world of **Asynchronous Programming**, where we master the art of writing code that doesn't block!
