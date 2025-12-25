# Phase 055: Streams Basics — Summary Cheatsheet

## 🌊 Stream Types

| Type | Action | Example |
|------|--------|---------|
| **Readable** | Source of data. | `fs.createReadStream()` |
| **Writable** | Sink for data. | `fs.createWriteStream()` |
| **Duplex** | Read + Write. | `net.Socket` |
| **Transform**| Modify + Pass. | `zlib.createGzip()` |

---

## 🏗️ Standard Events

- **`data`**: Fired when a new chunk is available.
- **`end`**: Fired when all data has been read.
- **`finish`**: Fired when all data has been written.
- **`error`**: **MANDATORY**. Always listen for errors.

---

## 🔌 The pipe Shortcut

```typescript
readable.pipe(writable);
```
Connects a source to a destination. Perfect for serving files via HTTP.

---

## 💡 Remember
- Streams process data in **chunks** (usually 64KB).
- You are working with **Buffers** by default unless you set an encoding.
- Streams prevent "Full RAM" crashes.
- **Part F Progression**: Files → HTTP → Buffers → **Streams**.
