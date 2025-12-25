# Phase 056: Streams Advanced — Notes

While `pipe()` is great, modern Node.js development uses more robust tools for handling streams, especially for error handling and custom logic.

---

## 1. The `pipeline` Utility

The problem with `.pipe()` is that it doesn't handle errors well. If one stream in the middle fails, the others might stay open (memory leak). 

**`pipeline`** handles all the cleanup and error propagation for you.

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

async function run() {
    await pipeline(
        createReadStream('input.txt'),
        createGzip(),
        createWriteStream('input.txt.gz')
    );
    console.log('Zip finished!');
}
```

---

## 2. Using Streams as Async Iterators

In modern Node, you don't even need `on('data')`. You can use a `for await` loop!

```typescript
import { createReadStream } from 'fs';

async function process() {
    const stream = createReadStream('data.csv');
    
    for await (const chunk of stream) {
        console.log("Chunk received:", chunk.toString());
    }
}
```

---

## 3. Backpressure

What happens if you are reading data at 100MB/s but your database can only write at 10MB/s? The data will pile up in your RAM until the app crashes. This is called **Backpressure**.

Node's `pipe()` and `pipeline()` handle this **automatically** by telling the source to "slow down" until the destination is ready.

---

## 4. Transform Streams

You can wrap logic in a stream that modifies data on the fly.

```typescript
import { Transform } from 'stream';

const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }
});
```

---

## 5. Object Mode

By default, streams handle Buffers/Strings. But you can put a stream into "Object Mode" to pass actual JavaScript objects (like records from a DB).

---

## 6. Key Takeaways
1. **`pipeline` over `pipe`**: Use the `stream/promises` version for better error handling.
2. **Async Loops**: `for await` is the cleanest way to consume a readable stream.
3. **Resilience**: Understanding backpressure is what separates a beginner from a senior Node.js engineer.
4. **Conclusion**: You now know how to handle massive data flows efficiently. Next, we'll see how to use **Child Processes** to run external commands.
