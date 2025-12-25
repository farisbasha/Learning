# Phase 031: Promises Introduction — Notes

A **Promise** is one of the most important concepts in modern JavaScript and Node.js. It is an object that represents the **eventual completion** (or failure) of an asynchronous operation and its resulting value.

---

## 1. What is a Promise?

Think of a Promise like a **buzzer** at a restaurant.
1. You place your order (Start Async Task).
2. They give you a buzzer (The Promise). It is currently **Pending**.
3. You go sit down. You can do other things (Event Loop continues).
4. When the food is ready, the buzzer flashes (The Promise is **Fulfilled**).
5. If they run out of ingredients, the buzzer might flash red (The Promise is **Rejected**).

---

## 2. The Three States

A Promise is always in one of these three states:
- **`pending`**: Initial state, neither fulfilled nor rejected.
- **`fulfilled`**: The operation completed successfully.
- **`rejected`**: The operation failed.

Once a Promise is fulfilled or rejected, it is **"settled"** and its state can never change again.

---

## 3. Creating a Promise (TypeScript)

To create a promise, you use the `new Promise` constructor. It takes a "executor" function with two arguments: `resolve` and `reject`.

```typescript
const myPromise = new Promise<string>((resolve, reject) => {
    const success = true;
    
    setTimeout(() => {
        if (success) {
            resolve("Result found!"); // Success
        } else {
            reject(new Error("Database connection failed")); // Failure
        }
    }, 1000);
});
```

---

## 4. Why Promises are Better than Callbacks

1. **Flat Syntax**: No more deep nesting (Callback Hell).
2. **Standardization**: Every Promise works the same way.
3. **Control**: You can decide exactly when and how to handle the result.
4. **Error Handling**: You can catch errors for a whole chain of operations in one place.

---

## 5. Key Takeaways
1. **Immediate Execution**: The code inside `new Promise` runs **immediately**.
2. **One-Way Street**: A promise can only resolve or reject ONCE.
3. **Objects**: A promise is a real object you can pass around, store in variables, or return from functions.
4. **TypeScript**: Always use generics `<T>` to define the type of the resolved value.
