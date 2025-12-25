# Phase 025: Blocking vs. Non-Blocking — Notes

This phase is about the life-and-death of a Node.js server. The difference between blocking and non-blocking is the difference between a high-performance system and a frozen one.

---

## 1. What is Blocking Code?

Code is **Blocking** when the execution of additional JavaScript must wait until a non-JavaScript operation completes. This happens because the **Event Loop** is stopped from continuing.

### Common Blocking Operations:
- **Synchronous I/O**: `fs.readFileSync()`, `fs.writeFileSync()`.
- **CPU Intensive Tasks**: Calculating a complex hash (bcrypt), processing a massive array, image resizing.
- **Synchronous JSON Parsing**: Using `JSON.parse()` on a 50MB string.

---

## 2. What is Non-Blocking Code?

Code is **Non-Blocking** when the operation is handed off to the system/libuv, and JavaScript continues execution immediately. When the operation finishes, a callback is sent to the queue.

```javascript
// BLOCKING (PHP Style)
const data = fs.readFileSync('file.txt'); // Server stays here until file is read
console.log(data);

// NON-BLOCKING (Node Style)
fs.readFile('file.txt', (err, data) => {
    console.log(data); // Runs later
});
console.log("I run immediately!");
```

---

## 3. I/O Bound vs. CPU Bound

### I/O Bound (Node's Strength)
Task is limited by the speed of input/output (Network, Disk, Database).
- **Example**: Fetching 100 users from a DB.
- **Node's Approach**: Start all 100 fetches, handle other requests, finish as they come back.

### CPU Bound (Node's Weakness)
Task is limited by the speed of the processor (Math, Compression, Encryption).
- **Example**: Calculating the first 10 million digits of Pi.
- **Node's problem**: The CPU can only do one thing at a time on one thread. While calculating Pi, the thread cannot handle any HTTP requests.

---

## 4. Why Blocking is Dangerous

In PHP-FPM, if one request blocks, it only affects that one user.
In Node.js, if one request blocks for 5 seconds, **every single user** visiting your site for those 5 seconds will see a "timed out" or "loading" state. 

**Blocking Node.js is like a car stopping in the middle of a one-lane tunnel.**

---

## 5. How to Fix Blocking

1. **Use Async APIs**: Always prefer the `promises` version of built-in modules.
   ```javascript
   import fs from 'node:fs/promises';
   const data = await fs.readFile('file.txt'); // Still non-blocking!
   ```
2. **Offload to Workers**: For CPU-heavy tasks, use **Worker Threads** (Phase 058) to run the task on a different CPU core.
3. **Chunking**: Break a huge loop into smaller pieces using `setImmediate`.

---

## 6. Key Takeaways
1. **Never use `*Sync`**: Avoid `readFileSync`, `writeFileSync`, etc., in a server environment. They are only okay for initial startup scripts or CLI tools.
2. **Know your limits**: Node is optimized for high-volume I/O, not for high-volume number crunching.
3. **The Event Loop is a Resource**: Protect it. If it doesn't loop, your app is dead.
4. **Monitoring**: In production, we use tools to track "Event Loop Lag" to see if our code is accidentally blocking.
