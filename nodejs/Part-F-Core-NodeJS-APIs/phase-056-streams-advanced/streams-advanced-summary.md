# Phase 056: Streams Advanced — Summary Cheatsheet

## 🛡️ Modern Pipeline (Safe)

```typescript
import { pipeline } from 'stream/promises';

// Automatically handles errors and cleanup
await pipeline(src, transform, dest);
```

---

## 🔁 Consuming with for await

```typescript
for await (const chunk of readable) {
  // Logic here
}
```

---

## 🏗️ Transform Stream Recipe

```typescript
const myTransform = new Transform({
  transform(chunk, enc, cb) {
    const processed = chunk.toString().slice(0, 5);
    cb(null, processed); // Sends data to next stream
  }
});
```

---

## 💡 Remember
- **Backpressure**: The automatic "pause/resume" logic.
- **pipeline()**: Use it to avoid memory leaks.
- **Object Mode**: Allows streaming JS objects instead of just binary.
- This phase brings together everything from Buffers to Async Iterators.
