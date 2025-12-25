# Phase 026: The `process` Object — Summary Cheatsheet

## 📁 Paths & Arguments
- **`process.cwd()`**: Current Working Directory.
- **`process.argv`**: CLI arguments array.
- **`process.env`**: Environment Variables.

---

## 🛑 Control & Status
- **`process.exit(0)`**: Success stop.
- **`process.exit(1)`**: Error stop.
- **`process.pid`**: Process ID (use for monitoring/killing).
- **`process.uptime()`**: Seconds process has been running.

---

## 👂 Critical Event Listeners

| Event | Logic |
|-------|-------|
| **`uncaughtException`** | Logs serious JS errors you didn't catch. |
| **`unhandledRejection`** | Logs Promises without `.catch()`. |
| **`SIGINT`** | Triggered by `Ctrl+C`. Use for graceful shutdown. |

---

## 🧠 Memory Check
```javascript
const { rss, heapUsed } = process.memoryUsage();
console.log(`Memory: ${Math.round(rss / 1024 / 1024)} MB`);
```

---

## 💡 Remember
- `process.nextTick()` (Phase 024) is part of this object!
- Never use `process.env` directly in deep business logic; create a `config.ts` file that reads and validates it once.
- The `process` object is unique to Node.js—it does not exist in the browser.
- **Milestone Complete**: You have finished the Runtime Internals part of the course! 🎉
