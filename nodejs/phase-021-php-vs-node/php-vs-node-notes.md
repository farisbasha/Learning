# Phase 021: PHP-FPM vs. Node.js Architecture — Notes

This is the phase that helps a PHP developer truly "grok" Node.js. We are comparing the request lifecycle and threading models of both environments.

---

## 1. The PHP-FPM Request Lifecycle (The "Disposable" Model)

In PHP, every single request starts from a blank slate.

1. **Request Arrives**: Nginx receives it and sends it to the PHP-FPM socket.
2. **Worker Selection**: FPM picks an idle worker process from the "Pool".
3. **Boot**: PHP boots up, loads configuration, autoloader, and starts your code.
4. **Execution**: Your code runs. If it hits a DB, it **stops and waits** (Blocking).
5. **Completion**: Data is sent back to Nginx.
6. **Death**: The process **clears its memory** and goes back to the pool (or dies).

> [!KEY]
> **Isolation**: If Request A has a memory leak or a fatal error, it has **zero impact** on Request B.

---

## 2. The Node.js Request Lifecycle (The "Marathon" Model)

In Node.js, the server **never stops**. It handles everything in one continuous process.

1. **Start**: You run `node app.js`. The app boots ONCE. Global variables are initialized.
2. **Event Loop Starts**: The process sits and waits for events (like an incoming HTTP request).
3. **Request Arrives**: The Event Loop picks up the request and gives it to your routing logic.
4. **I/O Encountered**: If your code hits a DB, Node says: *"Okay, DB, tell me when you're done. Next visitor please!"* (Non-blocking).
5. **Callback**: When the DB is done, it puts a "message" in the queue. The Event Loop picks it up and continues your code.
6. **Persistence**: The memory is **not cleared**. The same variables, cached data, and objects stay in memory.

---

## 3. Comparison Breakdown

| Category | PHP-FPM | Node.js |
|----------|---------|---------|
| **Architecture** | Process-per-request | Event Loop per thread |
| **Concurrency** | Parallel processes | Event-driven concurrency |
| **I/O Model** | Blocking / Synchronous | Non-blocking / Asynchronous |
| **Memory Persistence** | None (reset per request) | High (state persists) |
| **Scaling** | Add more worker processes | Add more processes (Clustering) |

---

## 4. Why Blocking is Fatal in Node.js

In PHP, a `sleep(10)` only affects the one user who triggered it.
In Node.js, a `sleep(10)` (if done synchronously) **FREEZES THE ENTIRE SERVER** for every single visitor. Nobody can even hit the homepage while that sleep is happening.

---

## 5. Scaling Strategies

### Scaling PHP:
- Increase `pm.max_children` in your FPM config.
- Add more RAM to handle more heavy processes.

### Scaling Node:
- **Clustering**: Since Node is single-threaded, it only uses one CPU core. To use 8 cores, you run 8 instances of your app.
- **PM2**: The standard process manager for Node.js that handles restarts and clustering automatically.

---

## 6. When to Use Which?

- **Use PHP (Laravel)** if your app is CPU-heavy (image processing, heavy math, complex logic) where process isolation keeps it stable.
- **Use Node.js** if your app is I/O-heavy (Chat, API Gateway, Real-time feeds, many different DB queries) or if you want extremely fast performance with low hardware cost.

---

## 7. Key Takeaways
1. **Shared State**: Variables in Node.js are shared across users. Don't store user-specific data in a global scope!
2. **Don't wait for I/O**: Use callbacks, promises, or async/await to keep the loop moving.
3. **Continuous process**: Your initialization code (loading DB config, etc.) only runs once. This makes request handling much faster than PHP.
4. **Isolation**: You are responsible for catching errors; one uncaught error can bring down the entire process.
