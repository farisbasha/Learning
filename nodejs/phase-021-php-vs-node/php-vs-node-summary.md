# Phase 021: PHP vs. Node Architecture — Summary Cheatsheet

## 🔄 Request Lifecycle Comparison

### PHP-FPM (Stateless)
- Starts fresh every time.
- **Model**: Multi-process.
- **Behavior**: Blocking I/O is normal.
- **Scaling**: Increase RAM & Process count.

### Node.js (Stateful)
- Stays alive across requests.
- **Model**: Single-thread Event Loop.
- **Behavior**: Blocking is fatal.
- **Scaling**: Cluster across CPU cores.

---

## 🏁 The Performance Truth

| Scenario | Winner | Why? |
|----------|--------|------|
| **Simple CRUD** | Tie | Both handle DB well. |
| **Real-time Chat** | 🟢 Node | WebSockets & Async I/O. |
| **Heavy Video Processing** | 🟢 PHP / Python | CPU bound tasks block Node. |
| **High Concurrency** | 🟢 Node | Lower RAM overhead per user. |

---

## ⚠️ Critical Rule for PHP Devs

> In PHP, `$this->cache = 'data'` is safe (only for that user).
> In Node, `this.cache = 'data'` might be shared across **every user** on the server.

---

## 💡 Remember
- PHP scales **out** (more RAM).
- Node scales **up** (more CPU cores).
- Avoid `while(true)` or massive loops in Node.
- Always use asynchronous versions of functions (e.g., `fs.readFile` instead of `fs.readFileSync`).
