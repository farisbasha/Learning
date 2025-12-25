# Phase 032: Consuming Promises — Notes

Creating a Promise is only half the battle. You need to know how to "wait" for it and handle the results. We do this using three methods: `.then()`, `.catch()`, and `.finally()`.

---

## 1. Handling Success (`.then`)

The `.then()` method is called when the promise is **fulfilled**.

```typescript
const myPromise = fetchData();

myPromise.then((data) => {
    console.log("Got data:", data);
});
```

---

## 2. Handling Failure (`.catch`)

The `.catch()` method is called when the promise is **rejected** (due to an error or manual rejection).

```typescript
fetchData()
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error("Oh no! Error:", error.message);
    });
```

---

## 3. Cleanup (`.finally`)

The `.finally()` method runs **regardless** of whether the promise succeeded or failed. It is perfect for cleanup tasks, like closing a database connection or hiding a loading spinner.

```typescript
fetchData()
    .then(data => console.log(data))
    .catch(err => console.error(err))
    .finally(() => {
        console.log("Closing DB connection...");
    });
```

---

## 4. Chaining Basics

Every time you call `.then()`, it returns a **new Promise**. This allows you to transform data in steps.

```typescript
fetchUser(1)
    .then(user => user.name) // Returns name
    .then(name => name.toUpperCase()) // Transforms name
    .then(upperName => console.log(upperName)); // Prints result
```

---

## 5. Comparison to PHP

- **PHP**: `try { ... } catch (Exception $e) { ... } finally { ... }`
- **JS Promises**: `.then(success) .catch(error) .finally(cleanup)`

Note that in JS, we also have `try/catch` for `async/await` (Phase 036), which is even more similar to PHP.

---

## 6. Key Takeaways
1. **Implicit Return**: If you return a value from a `.then()`, the next `.then()` receives that value as its input.
2. **Error Bubbling**: If an error happens in any `.then()`, it will "skip" all subsequent success handlers and jump straight to the nearest `.catch()`.
3. **Don't ignore `.catch()`**: An unhandled promise rejection in Node.js is a serious issue and can crash your process.
4. **TypeScript Inference**: TS is smart enough to know that if `fetchUser` returns a `User` object, the first `.then` will receive a `User`.
