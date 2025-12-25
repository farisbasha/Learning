# Phase 055: Streams Basics — Notes

Streams are the single most powerful feature for building high-performance Node.js applications. They allow you to process data **piece by piece** (chunk by chunk) instead of loading everything into memory at once.

---

## 1. Why Streams? (The Memory Problem)

If you have a 4GB video file and you use `fs.readFile()`, Node will try to load all 4GB into your RAM. If your server only has 2GB of RAM, it will **crash**.

With **Streams**, you read the first 64KB, process it, throw it away, and then read the next 64KB. You could process a 100GB file using only 10MB of RAM.

---

## 2. The Four Types of Streams

1. **Readable**: You can read data from it (e.g., `fs.createReadStream`, `http.IncomingMessage`).
2. **Writable**: You can send data to it (e.g., `fs.createWriteStream`, `http.ServerResponse`).
3. **Duplex**: You can both read and write (e.g., a Network Socket).
4. **Transform**: A Duplex stream that modifies data as it passes through (e.g., a Gzip compressor).

---

## 3. Flowing vs. Paused

- **Flowing**: Data is read automatically as fast as possible (using events).
- **Paused**: You must explicitly call `read()` to get data.

---

## 4. Basic Event Pattern

```typescript
import { createReadStream } from 'fs';

const stream = createReadStream('large-file.txt');

stream.on('data', (chunk) => {
    // This runs many times as data arrives
    console.log(`Received ${chunk.length} bytes`);
});

stream.on('end', () => console.log('Finished!'));
stream.on('error', (err) => console.error(err));
```

---

## 5. Piping (`pipe`)

Piping is the easiest way to connect a source to a destination.

```typescript
import { createReadStream, createWriteStream } from 'fs';

const read = createReadStream('input.txt');
const write = createWriteStream('output.txt');

// Everything from read goes into write automatically
read.pipe(write);
```

---

## 6. Key Takeaways
1. **Efficiency**: Use streams for anything larger than a few megabytes.
2. **Event Loop**: Streams are non-blocking. Your app can still handle users while a 10GB file is Being copied.
3. **Chaining**: You can pipe multiple streams together (`read.pipe(gzip).pipe(write)`).
4. **Summary**: These are the basics. In Phase 056, we'll look at the modern, safer way to use them.
