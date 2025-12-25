# Phase 037: Advanced Async Patterns — Notes

Now that you've mastered the basics, it's time to look at the professional patterns used in high-traffic Node.js applications. These techniques solve problems like network instability, rate limiting, and infinite data streams.

---

## 1. Async Iterators (`for await...of`)

If you have a stream of data (like lines in a massive file or events from a database), you can iterate over them as they arrive.

```typescript
async function readLargeFile(stream) {
    for await (const chunk of stream) {
        process(chunk);
    }
}
```

---

## 2. Retry with Exponential Backoff

When an API call fails due to network issues, you shouldn't just give up. But you also shouldn't spam the server immediately. You wait longer and longer between retries.

```typescript
async function fetchWithRetry(url, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fetch(url);
        } catch (err) {
            const delay = Math.pow(2, i) * 1000;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error("Max retries exceeded");
}
```

---

## 3. The Timeout Pattern

Node.js operations don't always have built-in timeouts. You can create your own using `Promise.race`.

```typescript
const result = await Promise.race([
    doWork(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
]);
```

---

## 4. Concurrency Limiting (Throttling)

If you have 10,000 images to download, `Promise.all()` will try to start all 10,000 at once, which will crash your OS or get you banned by the server. We use specialized libraries (like `p-limit`) or simple logic to limit the "concurrency".

---

## 5. Debouncing Async Operations

Common in search bars. Only trigger the async task if the user has stopped typing for a certain amount of time.

---

## 6. Key Takeaways
1. **Be Respectful**: Use retries and timeouts to build resilient systems.
2. **Infinite Data**: Use async iterators for memory-efficient processing of huge datasets.
3. **Flow Control**: Don't use `Promise.all()` on massive arrays; process them in chunks.
4. **Utility Libraries**: In production, developers often use libraries like `bluebird`, `async`, or `p-retry` instead of writing these patterns from scratch.
