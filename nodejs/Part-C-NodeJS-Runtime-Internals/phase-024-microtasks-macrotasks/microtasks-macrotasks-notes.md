# Phase 024: Microtasks vs. Macrotasks — Notes

In Phase 023, we learned about Event Loop phases. Those phases handle **Macrotasks**. But there's a "secret" high-priority queue that runs *between* those phases: the **Microtask Queue**.

---

## 1. The VIP Lane Analogy 🎫

Think of a **theme park**:

| Queue Type | Analogy | Examples |
| :--- | :--- | :--- |
| **Macrotasks** | The regular ride queue | `setTimeout`, `setInterval`, `setImmediate`, I/O callbacks |
| **Microtasks** | The VIP FastPass lane | `Promise.then()`, `process.nextTick()`, `queueMicrotask()` |

**The Rule**: Before the ride operator (Event Loop) lets the next batch from the regular queue on the ride, they **must** let ALL VIP FastPass holders go first.

---

## 2. The Two Queues

### Macrotask Queue (Task Queue)
- One callback per Event Loop "tick"
- Processed inside specific phases (Timers, Poll, Check, etc.)
- Examples: `setTimeout`, `setInterval`, `setImmediate`, I/O

### Microtask Queue
- **ALL** callbacks in this queue are processed before moving to the next phase
- Processed **between** phases
- Examples: `Promise.then/catch/finally`, `process.nextTick`, `queueMicrotask`

---

## 3. The Execution Priority (MEMORIZE THIS!)

When the Event Loop is deciding what to run next:

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣  SYNCHRONOUS CODE (Call Stack)                         │
│      └── Always runs first, until the stack is empty       │
├─────────────────────────────────────────────────────────────┤
│  2️⃣  process.nextTick() Queue  ⚡ (Highest priority async) │
│      └── Runs before ANY other async operation             │
├─────────────────────────────────────────────────────────────┤
│  3️⃣  Promise / Microtask Queue                              │
│      └── Runs after nextTick, before any Macrotask         │
├─────────────────────────────────────────────────────────────┤
│  4️⃣  MACROTASK (One from the current phase)                │
│      └── setTimeout, setImmediate, I/O, etc.               │
└─────────────────────────────────────────────────────────────┘
                        ↓
            (Then repeat from 2️⃣)
```

> [!KEY]
> **`process.nextTick` is faster than Promises!**
> Even though both are "microtasks", `nextTick` has its own special queue that runs before the Promise queue.

---

## 4. The Classic Interview Puzzle 🧩

**Predict the output:**

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

process.nextTick(() => console.log('4'));

console.log('5');
```

### Step-by-Step Breakdown:

| Step | What Happens | Output |
| :--- | :--- | :--- |
| 1 | `console.log('1')` is synchronous → runs immediately | `1` |
| 2 | `setTimeout` → added to **Timers** (Macrotask) queue | — |
| 3 | `Promise.resolve().then()` → added to **Microtask** queue | — |
| 4 | `process.nextTick()` → added to **nextTick** queue (VIP!) | — |
| 5 | `console.log('5')` is synchronous → runs immediately | `5` |
| 6 | Call stack empty → Now process **nextTick** queue first | `4` |
| 7 | nextTick queue empty → Now process **Microtask** queue | `3` |
| 8 | Microtask queue empty → Now process **Macrotask** (Timers) | `2` |

### ✅ Final Output: `1, 5, 4, 3, 2`

---

## 5. A More Complex Puzzle

```javascript
console.log('Start');

setTimeout(() => {
    console.log('Timeout 1');
    Promise.resolve().then(() => console.log('Promise inside Timeout'));
}, 0);

Promise.resolve().then(() => {
    console.log('Promise 1');
    process.nextTick(() => console.log('nextTick inside Promise'));
});

process.nextTick(() => console.log('nextTick 1'));

setTimeout(() => console.log('Timeout 2'), 0);

console.log('End');
```

### Output:
```
Start
End
nextTick 1
Promise 1
nextTick inside Promise
Timeout 1
Promise inside Timeout
Timeout 2
```

### Explanation:
1. **Sync code**: `Start`, `End`
2. **nextTick queue**: `nextTick 1`
3. **Microtask queue**: `Promise 1`
4. **(New nextTick added by Promise 1)**: `nextTick inside Promise`
5. **Macrotask (Timer 1)**: `Timeout 1`
6. **(New Microtask added by Timer 1)**: `Promise inside Timeout`
7. **Macrotask (Timer 2)**: `Timeout 2`

---

## 6. `process.nextTick()` vs. `queueMicrotask()` vs. `Promise.then()`

| Feature | `process.nextTick()` | `queueMicrotask()` / `Promise.then()` |
| :--- | :--- | :--- |
| **Priority** | Highest (runs first) | Lower than nextTick |
| **Use Case** | Must run before ANY I/O | Standard async deferral |
| **Danger** | Can starve I/O if recursive | Safer for general use |
| **Browser Support** | Node.js only | Works in browsers too |

---

## 7. ⚠️ DANGER: Microtask Starvation

Because Node.js **must** empty the microtask queue before moving on, you can accidentally freeze your entire server:

### Example of Starvation:
```javascript
function freezeTheWorld() {
    process.nextTick(freezeTheWorld); // 🚨 Adds itself forever!
}

freezeTheWorld();

// This HTTP server will NEVER work!
// The Event Loop can never reach the Poll phase to handle requests.
http.createServer((req, res) => {
    res.end('Hello'); // Never executes
}).listen(3000);
```

### Same problem with Promises:
```javascript
function freezeWithPromises() {
    Promise.resolve().then(freezeWithPromises); // 🚨 Also dangerous!
}
```

### ✅ The Safe Alternative:
```javascript
function safeRecursion() {
    setImmediate(safeRecursion); // ✅ Lets the Event Loop breathe
}
```
`setImmediate` is a **Macrotask**, so the Event Loop can process I/O between calls.

---

## 8. When to Use What?

| Situation | Use This |
| :--- | :--- |
| "I need this to run ASAP, before any I/O" | `process.nextTick()` |
| "I need this to run after the current operation, standard priority" | `Promise.resolve().then()` or `queueMicrotask()` |
| "I need this to run after I/O has been processed" | `setImmediate()` |
| "I need this to run after X milliseconds" | `setTimeout(fn, X)` |

---

## 9. Visual Timeline Example

```javascript
fs.readFile('file.txt', () => {
    console.log('A: File read');
    
    process.nextTick(() => console.log('B: nextTick'));
    
    Promise.resolve().then(() => console.log('C: Promise'));
    
    setImmediate(() => console.log('D: setImmediate'));
    
    setTimeout(() => console.log('E: setTimeout'), 0);
});
```

### Timeline:
```
Poll Phase: fs.readFile callback executes
    ├── Sync: "A: File read"
    │
    ├── Call Stack Empty → Process nextTick queue
    │   └── "B: nextTick"
    │
    ├── nextTick empty → Process Microtask queue
    │   └── "C: Promise"
    │
    └── Phase complete → Move to Check phase
        └── "D: setImmediate"

Loop back to Timers Phase:
    └── "E: setTimeout"
```

### Output: `A, B, C, D, E` (Always in this order!)

---

## 10. Key Takeaways

| Concept | Remember |
| :--- | :--- |
| **Sync always wins** | No async code runs until the call stack is empty |
| **nextTick is the VIP** | Runs before Promises, which run before Macrotasks |
| **Microtasks can starve** | Recursive nextTick/Promises block everything |
| **setImmediate is safe** | Use it for recursion to let I/O breathe |
| **Promises = Microtasks** | `.then()` doesn't run in a phase, it runs between them |

---

## 11. Practice Questions

1. **What's the output?**
   ```javascript
   setTimeout(() => console.log('A'), 0);
   Promise.resolve().then(() => console.log('B'));
   console.log('C');
   ```
   → `C, B, A`

2. **Why is recursive `process.nextTick()` dangerous?**
   → It never lets the Event Loop move forward, so I/O is never processed.

3. **Which runs first: `Promise.then()` or `process.nextTick()`?**
   → `process.nextTick()` always runs first.

4. **How do you safely defer work without blocking I/O?**
   → Use `setImmediate()` instead of `process.nextTick()`.
