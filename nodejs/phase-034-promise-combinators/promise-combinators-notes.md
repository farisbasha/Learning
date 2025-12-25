# Phase 034: Promise Combinators — Notes

What if you want to run multiple asynchronous tasks at the **same time** (in parallel)? Chaining is for sequential tasks (A then B), but **Combinators** are for concurrent tasks (A and B simultaneously).

---

## 1. `Promise.all()` — The "All or Nothing"

Use this when you need multiple results to proceed. It is very fast because the tasks run in parallel.

```typescript
const [user, posts, likes] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchLikes(1)
]);
```
- **Fulfillment**: Resolves when **ALL** items resolve.
- **Rejection**: Rejects immediately if **ANY** item fails (Fail-fast).

---

## 2. `Promise.allSettled()` — The "Survivor"

Use this when you want to wait for everything to finish, even if some of them fail.

```typescript
const results = await Promise.allSettled([fetchA(), fetchB()]);
// Returns an array of objects: { status: 'fulfilled', value: ... } or { status: 'rejected', reason: ... }
```

---

## 3. `Promise.race()` — The "Speedster"

Returns the result of the **first** promise to settle (either success or failure).

```typescript
// Timeout pattern:
const data = await Promise.race([
    fetchDataFromServer(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
]);
```

---

## 4. `Promise.any()` — The "First Success"

Returns the **first** promise to **fulfill**. It ignores rejections unless every single promise fails. Perfect for checking multiple servers for the same data.

---

## 5. Summary Table

| Combinator | Wait for... | Result | Use Case |
|------------|-------------|--------|----------|
| **`all`** | Everything | Array of values | Multiple mandatory result. |
| **`allSettled`** | Everything | Array of statuses | Logging background tasks. |
| **`race`** | First Finisher | One value/Error | Timeouts. |
| **`any`** | First Success | One value | Fast-response fallback. |

---

## 6. Key Takeaways
1. **Parallel vs Serial**: Use `Promise.all()` to speed up your code. Instead of waiting 1s + 1s + 1s separately, you wait 1s total.
2. **Error Handling**: Be careful with `Promise.all()`; if one task is unstable, the whole thing fails.
3. **Empty Arrays**: `Promise.all([])` resolves immediately to `[]`.
4. **Node.js Context**: In a real app, you'd use `Promise.all()` for things like fetching a user and their notifications and their messages in a single dashboard route.
