# Phase 022: Event Loop Concept — Summary Cheatsheet

## 🔄 The Logic
1. Execute **Synchronous** code (until stack is empty).
2. Check the **Async Queues**.
3. Run **ONE** callback from the queue.
4. Repeat.

---

## 🍽️ The Restaurant Analogy
- **Thread**: The Waiter.
- **I/O Ops**: The Kitchen staff.
- **Events**: The bell ringing when food is ready.
- **Callbacks**: Delivering the food to the table.

---

## ⚖️ Concurrency vs Parallelism

| Term | Meaning | Node Context |
|------|---------|--------------|
| **Parallelism** | Doing multiple things at the exact same time. | Possible via Workers (Phase 058). |
| **Concurrency** | Managing multiple tasks at once by switching. | The default Event Loop behavior. |

---

## 🚨 The Golden Rule

> **DON'T BLOCK THE EVENT LOOP.**

If you block the loop, you block every single user on your server. Avoid massive sync loops, `fs.readFileSync`, or heavy crypto on the main thread.

---

## 💡 Remember
- The Event Loop is **automatic**; you don't "start" it.
- It is provided by **libuv**, not the V8 engine itself.
- As long as there is a pending event (timer, network request), Node will not exit.
