# Phase 037: Advanced Async Patterns — Summary Cheatsheet

## 🛠️ The Power Patterns

| Pattern | Goal | Helper |
|---------|------|--------|
| **Retry** | Handle temporary failures. | Exponential Backoff Loop. |
| **Timeout** | Prevent hanging forever. | `Promise.race([Task, Timer])`. |
| **Async Loop**| Process data as it streams. | `for await (const x of ...)`. |
| **Limit** | Prevent overloading CPU/Net. | `p-limit` or chunking. |

---

## 🔁 Exponential Backoff Logic
1. Fail.
2. Wait $2^0$s (1s).
3. Fail again.
4. Wait $2^1$s (2s).
5. Fail again.
6. Wait $2^2$s (4s).

---

## 🚦 Async Chunks
Instead of `Promise.all(hugeArray)`, process in batches of 10-20 to keep memory low and the Event Loop responsive.

---

## 💡 Remember
- **Concurrency** is how many tasks are active.
- **Throughput** is how many tasks finish per second.
- Advanced patterns are about balancing these two for stability.
- In Node.js, stability is often more important than pure speed.
