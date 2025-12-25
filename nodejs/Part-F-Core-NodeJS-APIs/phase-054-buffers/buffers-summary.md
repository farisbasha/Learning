# Phase 054: Buffers — Summary Cheatsheet

## 🏗️ The Creation API

- **`Buffer.from(data, encoding)`**: Create from string/array/buffer.
- **`Buffer.alloc(size)`**: Create empty, zero-filled buffer.
- **`Buffer.concat([b1, b2])`**: Combine multiple buffers into one.

---

## 🔄 Encodings

```typescript
const buf = Buffer.from("Hi");

buf.toString('utf8');   // "Hi"
buf.toString('hex');    // "4869"
buf.toString('base64'); // "SGk="
```

---

## 📏 Useful Properties

- **`buf.length`**: Size in **bytes** (Note: for characters like 🍎, the length in bytes is larger than the string length).
- **`buf.toJSON()`**: Converts to an object for serialization.
- **`buf[0]`**: Access the value of the first byte (0-255).

---

## 💡 Remember
- Strings are immutable; Buffers are mutable (you can change individual bytes).
- Buffers are allocated outside the shared V8 heap, which is great for large data.
- Most `fs` methods return Buffers if you skip the 'utf8' argument.
