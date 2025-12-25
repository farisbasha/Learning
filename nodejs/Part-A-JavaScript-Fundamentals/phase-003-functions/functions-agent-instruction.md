# Phase 003: Functions & Arrow Functions
## Agent Instructions for Content Generation

---

## 📋 Phase Overview

**Phase Number**: 003  
**Phase Name**: Functions & Arrow Functions  
**Part**: A - JavaScript Fundamentals  
**Primary Language**: JavaScript  
**Difficulty**: Beginner  
**Prerequisites**: Phase 001, 002  

---

## 🎯 Learning Objectives

By the end of this phase, the learner should be able to:
1. Declare functions using different syntaxes
2. Use arrow functions effectively
3. Work with default and rest parameters
4. Understand functions as first-class citizens
5. Create and use higher-order functions

---

## 📚 Topics to Cover

### 1. Function Declarations
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```
- Hoisted (can be called before declaration)
- Has its own `this` binding

### 2. Function Expressions
```javascript
const greet = function(name) {
    return `Hello, ${name}!`;
};
```
- Not hoisted
- Stored in a variable
- Can be anonymous

### 3. Arrow Functions
```javascript
const greet = (name) => `Hello, ${name}!`;
```
- Concise syntax
- Implicit return for single expressions
- Lexical `this` (inherits from parent scope)
- Cannot be used as constructors

### 4. Arrow Function Variations
```javascript
// No parameters
const sayHi = () => "Hi!";

// One parameter (parentheses optional)
const double = x => x * 2;

// Multiple parameters
const add = (a, b) => a + b;

// Multi-line (needs braces and return)
const process = (x) => {
    const result = x * 2;
    return result + 1;
};
```

### 5. Default Parameters
```javascript
function greet(name = "Guest") {
    return `Hello, ${name}!`;
}
```
- PHP comparison: `function greet($name = "Guest")`

### 6. Rest Parameters
```javascript
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10
```
- Collects remaining arguments into array
- PHP comparison: `function sum(...$numbers)`

### 7. Functions as First-Class Citizens
- Stored in variables
- Passed as arguments
- Returned from functions
- Stored in objects/arrays

### 8. Higher-Order Functions
```javascript
// Function that takes a function
function map(arr, fn) {
    return arr.map(fn);
}

// Function that returns a function
function multiplier(factor) {
    return (number) => number * factor;
}
const double = multiplier(2);
double(5); // 10
```

### 9. IIFE (Immediately Invoked Function Expression)
```javascript
(function() {
    // Code runs immediately
    // Variables are scoped here
})();

// Arrow version
(() => {
    console.log("Runs immediately");
})();
```

---

## 🔄 PHP Comparison Points

| PHP | JavaScript |
|-----|------------|
| `function greet($name) {}` | `function greet(name) {}` |
| `$greet = function($name) {};` | `const greet = function(name) {};` |
| `$greet = fn($name) => $name;` (PHP 7.4+) | `const greet = (name) => name;` |
| `...$args` (splat operator) | `...args` (rest parameters) |
| `$fn = 'functionName'; $fn();` | `const fn = functionName; fn();` |
| Closures need `use ($var)` | Closures auto-capture (closure) |

---

## 💻 Code Examples to Include

### Example 1: Function Syntaxes Comparison
```javascript
// Declaration (hoisted)
function add1(a, b) {
    return a + b;
}

// Expression (not hoisted)
const add2 = function(a, b) {
    return a + b;
};

// Arrow (concise)
const add3 = (a, b) => a + b;

// All three work the same way
console.log(add1(2, 3)); // 5
console.log(add2(2, 3)); // 5
console.log(add3(2, 3)); // 5
```

### Example 2: Higher-Order Function (PHP Developer's Perspective)
```javascript
// PHP: array_map(fn($x) => $x * 2, [1, 2, 3]);
const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6]

// PHP: array_filter($arr, fn($x) => $x > 2);
const filtered = numbers.filter(x => x > 2);
console.log(filtered); // [3]
```

### Example 3: Returning Functions
```javascript
// Factory function
function createGreeter(greeting) {
    return function(name) {
        return `${greeting}, ${name}!`;
    };
}

const sayHello = createGreeter("Hello");
const sayHi = createGreeter("Hi");

console.log(sayHello("John")); // "Hello, John!"
console.log(sayHi("Jane"));    // "Hi, Jane!"
```

### Example 4: Callback Pattern (Very Important in Node.js)
```javascript
// Simulating async operation
function fetchData(callback) {
    setTimeout(() => {
        callback("Data loaded!");
    }, 1000);
}

fetchData((result) => {
    console.log(result); // "Data loaded!" after 1 second
});
```

---

## 🚨 Common Mistakes to Highlight

1. **Arrow functions and `this`**
   - Arrow functions don't have their own `this`
   - Will cause issues in object methods (covered in Phase 006)

2. **Forgetting `return` in multi-line arrow functions**
   ```javascript
   // Wrong - returns undefined
   const add = (a, b) => {
       a + b;
   };
   
   // Correct
   const add = (a, b) => {
       return a + b;
   };
   ```

3. **Confusing expression vs declaration hoisting**
   - Declarations are hoisted
   - Expressions are NOT

4. **Not understanding closures**
   - PHP needs `use ($var)` to capture
   - JavaScript captures automatically

---

## 📝 Content Generation Instructions

When generating `functions-notes.md`:
1. Start with function declaration vs expression
2. Deep dive into arrow functions
3. Cover all parameter types
4. Explain first-class functions with examples
5. Include callback patterns (important for Node.js)

When generating `functions-summary.md`:
1. Syntax comparison table
2. When to use each function type
3. Arrow function cheatsheet
4. Common patterns

---

## 📚 Resources for Deeper Learning

- MDN: Functions
- JavaScript.info: Functions
- "You Don't Know JS" — Functions chapter
