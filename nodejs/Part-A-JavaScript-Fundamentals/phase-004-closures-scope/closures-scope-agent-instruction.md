# Phase 004: Closures & Scope
## Agent Instructions for Content Generation

---

## 📋 Phase Overview

**Phase Number**: 004  
**Phase Name**: Closures & Scope  
**Part**: A - JavaScript Fundamentals  
**Primary Language**: JavaScript  
**Difficulty**: Intermediate  
**Prerequisites**: Phase 001-003  

---

## 🎯 Learning Objectives

By the end of this phase, the learner should be able to:
1. Understand lexical scope
2. Differentiate function scope vs block scope
3. Create and use closures
4. Avoid common closure pitfalls
5. Understand hoisting and temporal dead zone

---

## 📚 Topics to Cover

### 1. Lexical Scope
- Scope determined at write-time, not run-time
- Inner functions can access outer variables
- Scope chain lookup

### 2. Function Scope (`var`)
- `var` is function-scoped
- Visible throughout the entire function
- Hoisted to function top

### 3. Block Scope (`let`, `const`)
- `let` and `const` are block-scoped
- Limited to `{}` blocks
- Not accessible before declaration (TDZ)

### 4. Closures
- Function that "remembers" its lexical scope
- Even when executed outside that scope
- One of JS's most powerful features

### 5. Closure Use Cases
- Data privacy
- Factory functions
- Callbacks and event handlers
- Partial application

### 6. The Loop Closure Trap
- Classic bug with `var` in loops
- Solution with `let` or IIFE

### 7. Hoisting
- `var` declarations hoisted (value = undefined)
- `function` declarations fully hoisted
- `let`/`const` not accessible before declaration

### 8. Temporal Dead Zone (TDZ)
- Period between scope entry and declaration
- Accessing `let`/`const` in TDZ throws error

---

## 🔄 PHP Comparison Points

| Concept | PHP | JavaScript |
|---------|-----|------------|
| Closure | `function() use ($var)` | Automatic capture |
| Scope | Function scope only | Function + block scope |
| Hoisting | No equivalent | Declarations hoisted |
| Private vars | `private` keyword | Closures (before class private) |

---

## 💻 Code Examples to Include

### Example 1: Lexical Scope
```javascript
function outer() {
    const message = "Hello";
    
    function inner() {
        console.log(message); // Can access outer's variable
    }
    
    inner();
}
outer(); // "Hello"
```

### Example 2: Closure
```javascript
function createCounter() {
    let count = 0; // Private variable
    
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
// count is not directly accessible!
```

### Example 3: PHP vs JS Closure
```javascript
// PHP:
// $multiplier = 2;
// $fn = function($x) use ($multiplier) {
//     return $x * $multiplier;
// };

// JavaScript - automatic capture
const multiplier = 2;
const fn = (x) => x * multiplier; // No "use" needed!

console.log(fn(5)); // 10
```

### Example 4: The Loop Closure Trap
```javascript
// BUG with var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all same!)

// FIX with let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 (correct!)
```

### Example 5: Hoisting
```javascript
console.log(hoistedVar); // undefined (hoisted but not initialized)
// console.log(notHoisted); // ReferenceError!

var hoistedVar = "I'm hoisted";
let notHoisted = "I'm not hoisted";

// Function declarations are fully hoisted
sayHello(); // Works!
function sayHello() {
    console.log("Hello!");
}
```

---

## 🚨 Common Mistakes to Highlight

1. **The classic loop closure bug**
   - Using `var` in loops with async callbacks
   - Solution: use `let`

2. **Confusing scope types**
   - `var` = function scope
   - `let`/`const` = block scope

3. **PHP developers forgetting JS auto-captures**
   - No need for `use` keyword
   - Can lead to unexpected captures

4. **Not understanding TDZ**
   - `let`/`const` exist but not accessible before declaration

---

## 📝 Content Generation Instructions

When generating `closures-scope-notes.md`:
1. Start with scope fundamentals
2. Build up to closures step by step
3. Include the loop trap with detailed explanation
4. Cover hoisting thoroughly
5. Provide real-world use cases

When generating `closures-scope-summary.md`:
1. Scope rules cheatsheet
2. Closure patterns
3. var vs let vs const table
4. Quick hoisting reference

---

## 📚 Resources for Deeper Learning

- MDN: Closures
- JavaScript.info: Closure
- "You Don't Know JS: Scope & Closures"
