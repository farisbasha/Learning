# Phase 004: Closures & Scope — Notes

If functions are the engine of JavaScript, **Closures and Scope** are the fuel. This is where most developers struggle, but mastering it will make you a formidable JavaScript engineer.

---

## 1. Lexical Scope: The "Where Am I?"

In JavaScript, scope is determined by where variables and blocks of code are **written** (lexical), not where they are executed.

### Scope Chain
When you use a variable, JavaScript looks for it in the current scope. If it's not there, it looks in the parent scope, and so on, until it hits the Global Scope.

```javascript
const globalVar = "Global";

function outer() {
    const outerVar = "Outer";

    function inner() {
        const innerVar = "Inner";
        console.log(innerVar); // Found here
        console.log(outerVar); // Not here, looks at parent
        console.log(globalVar); // Not here, looks at grandparent
    }
}
```

---

## 2. Function Scope (`var`) vs. Block Scope (`let`/`const`)

This is a critical distinction from PHP.

- **`var` (Function Scope)**: A `var` variable is visible everywhere inside the function it's defined in, even inside other `{}` blocks.
- **`let` / `const` (Block Scope)**: These are only visible inside the immediate `{}` curly braces where they are defined.

```javascript
if (true) {
    var x = 1;
    let y = 2;
}
console.log(x); // 1 (function scope "leaks" out of the if block)
console.log(y); // ReferenceError (block scope stays inside)
```

---

## 3. What is a Closure?

A **Closure** is formed when a function is defined inside another function and then "remembered"—meaning it retains access to its parent's variables even after the parent function has finished executing.

### The Privacy Pattern
Closures are the primary way to create "private" variables in JavaScript.

```javascript
function createVault() {
    let secret = "12345"; // Private variable

    return {
        getSecret: () => secret, // Closure
        setSecret: (newSecret) => secret = newSecret // Closure
    };
}

const myVault = createVault();
console.log(myVault.getSecret()); // "12345"
console.log(myVault.secret); // undefined (cannot touch it directly!)
```

---

## 4. The Loop Closure Trap

This is the most famous interview question and a source of many bugs in Node.js callback logic.

```javascript
// BUG: Using var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Outputs: 3, 3, 3

// Why? Because 'var' is function-scoped. There is only ONE 'i' for the whole loop. 
// By the time the timeout runs, 'i' is already 3.

// FIX: Using let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Outputs: 0, 1, 2

// Why? 'let' creates a NEW 'i' for every single iteration of the loop.
```

---

## 5. Hoisting & The Temporal Dead Zone (TDZ)

### Hoisting
JavaScript moves declarations to the top of their scope.
- `function name() {}` is **fully hoisted** (you can call it before you write it).
- `var x = 1` is **partially hoisted** (the name `x` exists, but its value is `undefined` until the line is hit).

### Temporal Dead Zone (TDZ)
`let` and `const` variables technically exist at the top of their block, but they are in a "dead zone" where you cannot touch them until the declaration line is reached. 
**Accessing them before declaration will crash the app.**

```javascript
// console.log(x); // Throws ReferenceError
let x = 10;
```

---

## 6. PHP vs. JavaScript: Closure Comparison

| PHP | JavaScript |
|-----|------------|
| Must use `use ($var)` to capture. | Automatic capture. |
| Scope is always function-level. | Scope is block-level (`let`/`const`). |
| No hoisting. | Hoisting occurs for `var` and `function`. |

---

## 7. Key Takeaways
1. **Always use `let` or `const`** to avoid the "leaky" behavior of `var`.
2. **Closures** are just functions that "remember" their surroundings.
3. Use closures to **encapsulate data** and keep it private.
4. If you see async code inside a `for` loop, make sure you are using `let`.
