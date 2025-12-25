# Phase 058: Worker Threads — Summary Cheatsheet

## 🧵 The Worker Pattern

```typescript
// Parent
const w = new Worker('./file.js', { workerData: { x: 1 } });
w.on('message', (msg) => { ... });

// Worker
import { parentPort, workerData } from 'worker_threads';
parentPort.postMessage(workerData.x * 2);
```

---

## ⚙️ Communication Methods

- **`postMessage()`**: Send data to the other side.
- **`on('message')`**: Receive data from the other side.
- **`SharedArrayBuffer`**: True shared memory (advanced).

---

## ⚖️ The Choice

| Task Type | Best Tool | Why? |
|-----------|-----------|------|
| **I/O Bound** (DB, Net) | **Async / Callbacks** | Main thread is efficient at waiting. |
| **CPU Bound** (Math, Crypto)| **Worker Threads** | Prevents blocking the event loop. |

---

## 💡 Remember
- Don't over-use workers. They have overhead.
- Total workers should usually equal your `os.cpus().length`.
- `workerData` is used to send initial configuration to a worker.
- **Part F Progression**: Child Proc (External) → **Worker Threads** (Internal Heavy) → Clusters (Horizontal Scalability).
