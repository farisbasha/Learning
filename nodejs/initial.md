# Node.js Concurrency — Complete Summary

## 1️⃣ Core Foundations

### CPU → Process → Thread (the hierarchy)

- **CPU Core**
  - Physical execution unit
  - **Runs ONE thread at a time**

- **Thread**
  - The *real* execution path
  - **Scheduled onto cores by the OS**

- **Process**
  - A container for:
    - Memory
    - One or more threads
    - File handles, sockets, etc.

### **KEY RULE**
> **CPU cores run threads — processes only own threads.**


---

## 2️⃣ PHP vs Node.js — Core Difference

### PHP (PHP-FPM model)
- One request = **one process (or thread)**
- CPU / blocking affects **only that request**
- OS time-slices across workers
- Scaling = **more workers**

---

### Node.js
- One process
- **One main thread**
- That thread runs the **event loop**
- Blocking CPU work blocks **everyone in that process**

So Node needs:
- PM2 (multi-process scaling)
- Worker Threads (parallel CPU work)
- Async I/O (to avoid blocking)

---

## 3️⃣ Event Loop — What & Why

### Definition
> **The event loop is a loop running on the main thread that keeps checking if any events (callbacks) are ready to run — and executes them one at a time.**

It processes:
- HTTP request handlers
- I/O callbacks
- Timers (`setTimeout`)
- `Promise` continuations
- `setImmediate`

### Still **single-threaded execution**
Only **one JS callback at a time**.

---

## 4️⃣ One Event Loop Iteration (Simplified)

In each cycle Node checks:

1. **Timers phase**
2. **I/O callbacks (poll phase)**
3. **Check phase (setImmediate)**
4. **Close callbacks**

And **between phases:**
➡️ Runs **microtasks (Promises/await)**

---

## 5️⃣ async/await — The Real Truth

```js
const data = await fetchData();
console.log("done");
```

Internally:

- Execution **splits**
- Code after `await` becomes a **continuation function**
- Event loop runs it later
- **No thread is paused**

---

## 6️⃣ I/O Tasks vs CPU-Bound Tasks

### I/O Task
Done by **kernel or hardware**, not CPU directly:
- DB calls
- Files
- HTTP
- Redis

✔ Non-blocking in Node

---

### CPU-Bound Task
Requires **continuous CPU work**:
- Loops
- Encryption
- Compression
- JSON parsing (large)
- Image processing

❌ Blocks event loop if done in JS

---

## 7️⃣ PM2 — Why & When

PM2 runs **multiple Node processes**.

```
CPU cores = 4
PM2 instances = 4
```

Result:
- 4 event loops
- 4 threads
- 4 cores utilized

### Rule of thumb
```
Instances ≈ CPU cores
```

More than cores:
- Good for I/O apps
- Bad for CPU-heavy apps (context switching)

---

## 8️⃣ Worker Threads — Why They Exist

### Problem
CPU work blocks the event loop.

### Solution
> **Worker threads run CPU-heavy tasks on separate threads so the event loop stays responsive.**

Structure:

```
Node process
├── Main thread → Event Loop
├── Worker thread 1
├── Worker thread 2
```

Workers:
- Real OS threads
- Can run **in parallel on other CPU cores**
- Communicate via messaging

Use for:
- Image processing
- PDF generation
- Encryption
- Heavy loops

NOT for:
- DB queries
- HTTP calls
- File reads

---

## 9️⃣ Event Loop + Worker Threads — How They Work Together

### Flow

1. Request hits event loop
2. CPU work is handed to a worker
3. `await` frees the event loop
4. Worker finishes
5. Sends result back
6. Event loop resumes callback

Event loop = **manager**  
Workers = **laborers**

---

## 🔟 PHP vs Node — Final Comparison Table

| Topic | PHP | Node |
|------|-----|------|
| Model | Multi-process | Single thread + event loop |
| Request isolation | Strong | Weak (per process) |
| I/O handling | Blocking per request | Non-blocking |
| CPU work | Blocks one request | Blocks whole process |
| Scaling | More workers | PM2 + workers |
| Best for | Traditional apps | High-concurrency APIs |

---

## 1️⃣1️⃣ Golden Rules to Remember

- **CPU cores run threads**
- **Node main thread must stay free**
- **I/O → fine**
- **CPU work → move to worker threads**
- **Scale Node via PM2**
- **Never block the event loop**

---

## 1️⃣2️⃣ Ultimate Cheat-Sheet

```
CPU → runs threads
Thread → does work
Process → owns threads
Node → one main thread
Event Loop → schedules callbacks
await → continuation, not pause
I/O → non-blocking
CPU work → use worker threads
Scaling → PM2 multi-process
```

---

## 🎯 Why This Matters for Jobs

You now understand:
- System internals
- Runtime behavior
- Scalability patterns

This is exactly what **senior backend engineers** get paid for — not just syntax.

---

### 💬 If you want next:
Ask for:

> **“Give me revision exercises for these concepts”**

I’ll give you hands-on tasks to lock this knowledge permanently 🚀
