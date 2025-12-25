# Phase 033: Promise Chaining — Notes

Promise chaining is the solution to **Callback Hell**. It allows you to perform a sequence of asynchronous tasks, one after the other, in a flat and readable structure.

---

## 1. The Power of Returning Promises

Inside a `.then()`, you can return two things:
1. **A Value**: The next `.then()` gets that value immediately.
2. **A Promise**: The chain **waits** for that promise to resolve before moving to the next `.then()`.

---

## 2. Flattening the Pyramid

Let's compare the "Old Way" (Callbacks) with the "New Way" (Promise Chaining).

### Callback Hell (Legacy)
```javascript
getUser(1, (user) => {
    getOrders(user.id, (orders) => {
        getDetails(orders[0].id, (details) => {
            console.log(details);
        });
    });
});
```

### Promise Chaining (Modern)
```typescript
getUser(1)
    .then(user => getOrders(user.id))         // Return a promise
    .then(orders => getDetails(orders[0].id)) // Return another promise
    .then(details => {
        console.log(details);                 // Final result
    })
    .catch(err => {
        console.error("Chain failed:", err);  // Catch ANY error in the sequence
    });
```

---

## 3. One Exception Handler for All

In the callback model, you had to check for errors at every level. In a promise chain, **one `.catch()` handles everything**. If `getUser`, `getOrders`, or `getDetails` fails, the execution jumps straight to the end.

---

## 4. Branching out

Sometimes you want to return different things based on the data.

```typescript
getSettings()
    .then(settings => {
        if (settings.useCache) {
            return getFromCache(); // Return cached promise
        }
        return fetchFromServer(); // Return server promise
    })
    .then(data => console.log(data));
```

---

## 5. Key Takeaways
1. **Flat is better than Nested**: Keep your `.then()` handlers at the same indentation level.
2. **Sequencing**: Use chaining when Task B depends on the result of Task A.
3. **Return Always**: If you forget to `return` the promise in a `.then()`, the chain won't wait for it, leading to "racing" bugs.
4. **Conclusion**: Promise chaining was a massive upgrade, but it still has some readability issues with complex logic. Next, we'll see **Async/Await**, which makes this even cleaner.
