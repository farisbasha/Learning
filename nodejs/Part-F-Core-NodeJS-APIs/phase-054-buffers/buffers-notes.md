# Phase 054: Buffers — Notes

JavaScript was originally built for the browser, where it mostly handled text. But Node.js needs to handle binary data—images, TCP streams, or encrypted files. This is what the **Buffer** class is for.

---

## 1. What is a Buffer?

Think of a Buffer like a **shelf of bytes**.
- It is a fixed-size chunk of memory allocated outside the V8 engine.
- Every "slot" in the buffer is a number from 0 to 255 (one byte).

---

## 2. Creating Buffers

### A. From existing data (`Buffer.from`)
```typescript
const buf = Buffer.from('Hello', 'utf8');
console.log(buf); // <Buffer 48 65 6c 6c 6f>
```

### B. Allocating fresh memory (`Buffer.alloc`)
Use this when you know how much space you need but don't have the data yet.

```typescript
const buf = Buffer.alloc(10); // 10 bytes of zeroes
```

---

## 3. Encodings (The "Translator")

A buffer is just binary. To see it as a string, you must tell Node how to translate those bits.

| Encoding | Appearance | Use Case |
|----------|------------|-----------|
| **`utf8`** | "Hello" | Standard text. |
| **`hex`** | "48656c..." | Debugging / Binary signatures. |
| **`base64`** | "SGVsbG8..." | Sending images in JSON or URLs. |

```typescript
const buf = Buffer.from("Hello");
console.log(buf.toString('base64')); // SGVsbG8=
```

---

## 4. Why should you care?

1. **Performance**: Buffers are much faster than strings for raw data manipulation.
2. **Compatibility**: Most Node APIs (`fs`, `crypto`, `net`) return Buffers by default.
3. **Slicing**: You can "cut" a buffer without copying the data, which saves memory.

---

## 5. Key Takeaways
1. **Fixed Size**: Once a buffer is created, you cannot change its length.
2. **Raw Memory**: Be careful with `Buffer.allocUnsafe()`. It's faster but may contain old sensitive data from your RAM. Use `Buffer.alloc()` if you aren't sure.
3. **No Import needed**: `Buffer` is a global object in Node.js.
4. **Summary**: Buffers are the language that the computer's hardware speaks. Streams (Phase 055) are how we move those buffers around.
