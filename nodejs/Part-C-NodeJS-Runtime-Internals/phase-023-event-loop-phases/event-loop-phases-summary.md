# Phase 023: Event Loop Phases — Summary Cheatsheet

## 🔄 The Six Phases (In Order)

```
Timers → Pending → Idle → Poll → Check → Close → (repeat)
```

| Phase | Handles |
| :--- | :--- |
| **Timers** | `setTimeout`, `setInterval` |
| **Pending** | System errors (TCP issues) |
| **Poll** | I/O callbacks (files, network, db) — **THE HEART** |
| **Check** | `setImmediate` |
| **Close** | `socket.on('close')` |

---

## 📥 Poll Phase Decision

```
Poll queue empty?
├── YES + setImmediate exists → Go to CHECK
├── YES + Timer ready → Continue to TIMERS
├── YES + Nothing → WAIT for I/O
└── NO → Run callbacks
```

---

## ⚡ Execution Order

```
1. Sync code (call stack)
2. process.nextTick() queue
3. Promise.then() queue (microtasks)
4. Current phase callbacks
→ Repeat 2-4 after each callback
```

---

## 🥊 setImmediate vs setTimeout(0)

| Location | Winner |
| :--- | :--- |
| Root level | **Unpredictable** |
| Inside I/O callback | **setImmediate ALWAYS** |

---

## 🔑 Key Rules

1. **Never skips phases** — Empty phases pass through in 0ms
2. **Microtasks run between phases** — And after every callback
3. **Poll phase can block** — Waits for I/O if nothing else scheduled
4. **nextTick > Promise** — nextTick is the VIP microtask

---

## 🎯 Quick Reference

| Code | Phase |
| :--- | :--- |
| `setTimeout(fn)` | Timers |
| `setImmediate(fn)` | Check |
| `fs.readFile(cb)` | Poll |
| `http.get(cb)` | Poll |
| `process.nextTick(fn)` | Between phases (VIP) |
| `Promise.then(fn)` | Between phases |
