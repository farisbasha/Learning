# Phase 020: Process vs. Thread — Summary Cheatsheet

## 🏁 Quick Comparison

| Feature | Process | Thread |
|---------|---------|--------|
| **Memory** | Dedicated / Private | Shared within Process |
| **Overhead**| High (Heavyweight) | Low (Lightweight) |
| **Isolation**| Total (If one dies, others live) | None (If one dies, process dies) |
| **Creation**| Slow | Fast |

---

## ⚙️ Model Comparison: PHP vs Node

### PHP-FPM (Multi-Process)
- One request = One process.
- Concurrency = Number of processes.
- **Pros**: Stable, safe isolation.
- **Cons**: High RAM usage, slow under heavy load.

### Node.js (Single-Threaded)
- One process = Multiple requests.
- Concurrency = Event Loop.
- **Pros**: Extremely low RAM, high throughput.
- **Cons**: One heavy task blocks the entire server. One crash can kill all active sessions.

---

## 🧠 Memory Lesson
- **PHP**: Objects created during a request are destroyed when the request ends.
- **Node.js**: Objects created on the global scope live forever. Memory leaks are much more common in Node.js.

---

## 💡 Remember
- **CPU Cores** are the physical "lanes" on the highway.
- **Threads** are the "cars" driving on the lanes.
- **Processes** are the "garage" containing the cars.
- In Node, keep the "cars" moving fast. If a car stops, the lane is blocked for everyone!
