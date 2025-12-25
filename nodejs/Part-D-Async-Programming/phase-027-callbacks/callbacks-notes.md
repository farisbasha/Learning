# Phase 027: Callbacks — The Original Pattern — Notes

Before Promises and `async/await`, there were only **Callbacks**. While you should avoid writing new code with callbacks in modern Node.js, you will encounter them in thousands of legacy libraries and older codebases.

---

## 1. What is a Callback?

A callback is simply a **function passed as an argument** to another function, to be executed after that function has finished its task.

```javascript
function greet(name, callback) {
    console.log("Hi, " + name);
    callback(); // This is the callback being executed
}

greet("Basha", function() {
    console.log("The greeting is finished!");
});
```

---

## 2. Why Callbacks are Necessary (Async)

In Node.js, we don't want to block the thread while waiting for a file to read or a DB to respond. Instead, we say: *"Go do this task, and when you're done, run this callback function I'm giving you."*

```javascript
// A simple async simulation using setTimeout
function fetchData(callback) {
    console.log("Starting data fetch...");
    setTimeout(() => {
        // This runs after 2 seconds
        callback("Database results are ready!");
    }, 2000);
}

fetchData((result) => {
    console.log(result);
});

console.log("I run immediately, before the data fetch finishes!");
```

---

## 3. Synchronous vs. Asynchronous Callbacks

Not all callbacks are asynchronous!
- **Synchronous**: `array.forEach()`, `array.map()`. They execute the callback immediately for every item.
- **Asynchronous**: `fs.readFile()`, `setTimeout()`. They put the callback on the queue to be run later.

---

## 4. Execution Context (The `this` Problem)

One of the biggest headaches with callbacks is that `this` can change. If you pass a class method as a callback, you often lose access to the class instance properties.

```javascript
class Service {
    name = "MyService";
    
    start(callback) {
        callback();
    }
}

const s = new Service();
// 🚨 ERROR/Undefined: 'this' will be lost!
s.start(function() {
    console.log(this.name); 
});

// ✅ FIXED: Use an Arrow Function
s.start(() => console.log(s.name));
```

---

## 5. Key Takeaways
1. **Callbacks are foundations**: Understanding them makes Promises easier to grasp.
2. **Execution order**: The code *inside* the callback usually runs much later than the code *after* the function call.
3. **Legacy Knowledge**: If you see code with many nested `function(err, res)` blocks, that is the callback pattern.
4. **Don't use for new code**: Use Promises or `async/await` instead (which we'll cover in Phases 031+).
