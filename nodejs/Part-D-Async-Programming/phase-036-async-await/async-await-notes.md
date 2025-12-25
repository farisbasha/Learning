# Phase 036: Async/Await — Notes

**Async/Await** is the current industry standard for writing asynchronous code in JavaScript and Node.js. It is built on top of Promises but provides a syntax that looks and behaves like synchronous code.

---

## 1. The `async` Keyword

When you mark a function as `async`, two things happen:
1. It is allowed to use the `await` keyword inside.
2. It **always** returns a Promise. If you return a value, JS wraps it in a Promise automatically.

```typescript
async function getAnswer(): Promise<number> {
    return 42; // Same as returning Promise.resolve(42)
}
```

---

## 2. The `await` Keyword

`await` pauses the execution of the function until the Promise is **settled**.

```typescript
async function run() {
    console.log("Starting...");
    
    // The code stops here for 1 second, but the Event Loop keeps running others!
    const data = await fetchData(); 
    
    console.log("Finished with:", data);
}
```

---

## 3. Error Handling (`try...catch`)

This is the biggest benefit for PHP developers. Instead of `.catch()`, you use the same `try/catch` block you use for everything else.

```typescript
async function safeFetch() {
    try {
        const user = await fetchUser(1);
        console.log(user.name);
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}
```

---

## 4. Sequential vs. Parallel execution

This is the most common mistake with `async/await`.

### ❌ WRONG (Slow - Sequential)
```typescript
const user = await fetchUser(); // Takes 1s
const orders = await fetchOrders(); // Takes 1s
// Total: 2s
```

### ✅ RIGHT (Fast - Parallel)
```typescript
const [user, orders] = await Promise.all([
    fetchUser(),
    fetchOrders()
]);
// Total: 1s
```

---

## 5. Comparison to PHP

- **PHP**: Code is naturally synchronous. If you call `file_get_contents()`, it blocks the thread.
- **Node.js (Async/Await)**: Code looks synchronous, but **it doesn't block the thread**. While `await` is waiting, Node is handling other requests.

---

## 6. Key Takeaways
1. **Await only Promises**: You can only use `await` on functions that return a Promise.
2. **Top-level await**: In modern Node (using ES Modules), you can use `await` at the top level of a file without a function.
3. **Async propagates**: If Function A calls and awaits Function B, then Function A **must** also be `async`.
4. **Conclusion**: This is the peak of the Async Evolution. Most of your Node.js career will be spent writing `async/await` code.
