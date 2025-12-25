# Phase 027: Callbacks — Summary Cheatsheet

## 📋 The Logic
1. Function A takes Function B as an argument.
2. Function A does some work (often async).
3. Function A calls Function B when done.

---

## 🏗️ Basic Patterns

### Named Callback
```javascript
function onComplete() { console.log("Done"); }
doTask(onComplete);
```

### Anonymous Callback (Most Common)
```javascript
doTask(function() {
    console.log("Done");
});
```

### Arrow Callback (Modern)
```javascript
doTask(() => console.log("Done"));
```

---

## ⚠️ The Checklist
- Does the function expect a callback? Check the documentation.
- Is the callback sync or async? Sync runs now, async runs later.
- Are you handling errors? (See the next phase for the standard way).

---

## 💡 Remember
- Callbacks were the **only** way to handle async in Node.js for many years.
- They are simple, but lead to unreadable code when nested (The "Pyramid of Doom").
- You are passing the **definition** of the function, NOT the result.
  - `doTask(myFn)` ✅
  - `doTask(myFn())` ❌ (Passing the result of myFn)
