# Phase 058: Worker Threads — Notes

Node.js is famous for being single-threaded. But what if you have to do massive image processing or complex math? If you do that on the main thread, your entire server will stop responding to other users. **Worker Threads** are the solution.

---

## 1. Process vs. Thread (Refresh)

- **Child Process**: Has its own memory, its own V8 instance. Communication is expensive.
- **Worker Thread**: Shares memory with the main thread. Communication is fast.

---

## 2. Creating a Worker

You write two files (or one file that checks if it's the "Main" or "Worker").

```typescript
// main.ts
import { Worker } from 'worker_threads';

const worker = new Worker('./worker.ts');
worker.postMessage('Start heavy work');
worker.on('message', (result) => console.log('Done:', result));

// worker.ts
import { parentPort } from 'worker_threads';

parentPort?.on('message', (task) => {
    // 🧮 Do heavy math here...
    const result = performComputation();
    parentPort?.postMessage(result);
});
```

---

## 3. When to use Workers?

Workers are for **CPU-bound** tasks only. 
- **YES**: Cryptography, image resizing, complex algorithms, file compression.
- **NO**: Database queries, API calls, file reading. (Use standard Async/Promises for these).

---

## 4. Shared Memory (`SharedArrayBuffer`)

Workers can actually "touch" the same pieces of memory at the same time using `SharedArrayBuffer` and `Atomics`. This is advanced but allows for incredible performance in multi-threaded code.

---

## 5. The "Worker Pool" Pattern

You shouldn't create a new worker for every request (it takes time to wake up a worker). Instead, you create a "Pool" of 4-8 workers (usually one per CPU core) and give them tasks from a queue.

---

## 6. Key Takeaways
1. **Independence**: Each worker has its own independent Event Loop.
2. **Main Thread Safety**: Workers allow you to keep the main thread fast and responsive for low-latency web responses.
3. **Data Cloning**: By default, data sent with `postMessage` is **cloned**, not shared. It's safe but has a small performance cost.
4. **Conclusion**: Worker Threads are how Node.js competes with Java or C# for heavy-duty computation.
