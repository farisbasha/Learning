# Phase 003: Functions & Arrow Functions — Notes

Functions are the primary unit of execution in JavaScript. Unlike PHP, where functions are mostly global or tied to classes, JavaScript treats functions as **"First-Class Citizens"**—they can be stored in variables, passed as arguments, and returned from other functions.

---

## 1. Three Ways to Write a Function

In PHP, you almost always use `function name() {}`. In JavaScript, you have three common patterns.

### A. Function Declaration
This is the most "PHP-like" way.
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```
> [!NOTE]
> **Hoisting**: These are moved to the top of the file by the compiler, so you can call them *before* they are defined.

### B. Function Expression
A function stored in a variable. 
```javascript
const greet = function(name) {
    return `Hello, ${name}!`;
};
```
> [!NOTE]
> These are **not** hoisted. You must define them before calling them.

### C. Arrow Function (ES6+)
The modern, concise way to write functions.
```javascript
const greet = (name) => `Hello, ${name}!`;
```
- For single expressions, the `return` is **implicit** (automatic).
- For multiple lines, you **must** use `{}` and `return`.

---

## 2. All About Arrow Functions

Arrow functions are the standard in modern Node.js and React development.

### Syntax Variations:
```javascript
// No parameters
const sayHi = () => "Hi!";

// One parameter (parentheses optional, but recommended for consistency)
const double = x => x * 2;

// Multiple parameters
const add = (a, b) => a + b;

// Multi-line block (Requires explicit return!)
const process = (x) => {
    const result = x * 2;
    return result + 1;
};
```

---

## 3. Parameters (Default & Rest)

### Default Parameters
Identical to PHP.
```javascript
function welcome(user = "Stranger") {
    return `Welcome, ${user}`;
}
```

### Rest Parameters (`...`)
Collects an unknown number of arguments into an **array**.
```javascript
// PHP: function sum(...$nums)
function sum(...nums) {
    return nums.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3)); // 6
```

---

## 4. Higher-Order Functions

A Higher-Order Function (HOF) is a function that either takes a function as an argument or returns one.

### Functions as Arguments (Callbacks)
This is how most Node.js APIs work.
```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2); // map is a HOF
```

### Functions as Return Values (Factories)
```javascript
function createMultiplier(factor) {
    return (n) => n * factor;
}

const double = createMultiplier(2);
console.log(double(5)); // 10
```

---

## 5. PHP vs. JavaScript: The Closure Difference

In PHP, a closure must explicitly import variables from the parent scope using `use`.
```php
// PHP
$factor = 2;
$fn = function($n) use ($factor) { return $n * $factor; };
```

In JavaScript, functions **automatically** "capture" the variables in their parent scope. This is called a **Closure**.
```javascript
// JS
const factor = 2;
const fn = (n) => n * factor; // 'factor' is automatically available
```

---

## 6. Key Takeaways
1. **Arrow Functions**: Use them by default for most logic.
2. **First-Class**: Remember you can treat functions like strings or numbers—pass them around!
3. **Implicit Return**: If you use `{}` in an arrow function, you **must** write `return`. If you don't use `{}`, it returns the expression result automatically.
4. **Hoisting**: Only `function name() {}` syntax can be called before it's defined.
5. **Closures**: JS functions naturally "remember" the variables around them when they were created.
