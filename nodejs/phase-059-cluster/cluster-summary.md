# Phase 059: Cluster — Summary Cheatsheet

## 🏗️ The Logic

```typescript
if (cluster.isPrimary) {
  // Logic for the Manager (Spawn workers)
  cluster.fork();
} else {
  // Logic for the Server (Actual response)
  server.listen(3000);
}
```

---

## 🚀 Scaling Standard
Usually, you spawn one worker per CPU core:
`const cores = os.cpus().length;`

---

## 🛡️ Error Recovery
```typescript
cluster.on('exit', (worker, code, signal) => {
  cluster.fork(); // Replace the fallen soldier
});
```

---

## 🥊 Comparison

- **Worker Threads**: Many threads in **one** process (internal heavy tasks).
- **Cluster**: Many **individual** processes (horizontal scaling).

---

## 💡 Remember
- All workers share the same network port.
- Workers do not share memory (unlike Worker Threads).
- Communication between workers must go through the Primary.
- **Next Up**: Now that we know how to scale, let's look at security with **Crypto** (Phase 060).
