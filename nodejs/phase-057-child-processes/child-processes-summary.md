# Phase 057: Child Processes — Summary Cheatsheet

## 🛠️ Method Selection

| Method | Best For... | Behavior |
|--------|-------------|----------|
| **`exec`** | Small shell commands. | Buffers entire output. |
| **`spawn`** | Long/Large data. | Pipes data as it arrives (Streams). |
| **`fork`** | Scaling Node logic. | Built-in IPC (messaging). |
| **`execFile`**| Direct executables. | More secure than `exec`. |

---

## 🛡️ Safer Shell Logic

Avoid `exec` if possible. Use `spawn` with arguments as an array to prevent **Command Injection** attacks.

```typescript
// ✅ SAFE
spawn('convert', [input, output]); 
```

---

## 📡 Messaging (fork)
In the child process:
```typescript
process.on('message', (data) => {
  process.send('Work done!');
});
```

---

## 💡 Remember
- `exec` has a default buffer limit of 1MB. If your output is larger, the app will crash unless you use `spawn`.
- Use **`fork`** when you want to run heavy JavaScript logic without blocking the main event loop.
- **Child Processes** are separate OS processes, each with its own memory (heavy). **Worker Threads** (Phase 058) are lighter.
