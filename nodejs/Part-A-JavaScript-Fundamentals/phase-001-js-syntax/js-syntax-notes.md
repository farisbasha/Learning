# Phase 001: JavaScript Syntax for PHP Developers — Notes

Welcome to the first phase of your Node.js journey! As a PHP/Laravel developer, you'll find much of JavaScript's syntax familiar, but there are critical differences in how variables are handled, how strings are interpolated, and how types behave during comparison.

---

## 1. Introduction: PHP vs. JavaScript Syntax

At a glance, both languages share C-style syntax (curly braces, semicolons, parentheses). However, JavaScript is more permissive in some areas and stricter in others.

| Feature | PHP | JavaScript |
|---------|-----|------------|
| **Variable Prefix** | Must start with `$` (`$name`) | No prefix (`name`) |
| **Semicolons** | Strictly Required | Optional (ASI), but Recommended |
| **Output** | `echo`, `print_r`, `var_dump` | `console.log`, `console.table` |
| **Interpolation** | `"Hello $name"` | `` `Hello ${name}` `` |

---

## 2. Variable Declarations (`const`, `let`, `var`)

In PHP, you just use `$var`. In modern JavaScript, how you declare a variable determines its **scope** and **mutability**.

### `const` (The Default)
Use `const` for variables that should not be reassigned. It is block-scoped.
```javascript
const pi = 3.14159;
// pi = 4; // Error: Assignment to constant variable.
```

### `let` (For Reassignment)
Use `let` when you know the value will change (like counters in a loop). It is also block-scoped.
```javascript
let counter = 0;
counter += 1; // Works fine
```

### `var` (Legacy - Avoid)
`var` is function-scoped and "hoisted". It was the only way to declare variables before 2015. **Avoid using it in modern Node.js code.**

> [!TIP]
> **Best Practice**: Default to `const`. Only use `let` if you know you need to change the value. This makes your code easier to reason about.

---

## 3. Console Output: The Developer's Toolbox

While PHP developers use `dd()` or `var_dump()`, Node.js developers live in the console.

- **`console.log()`**: Basic output.
- **`console.error()`**: Prints to stderr (red text in many terminals).
- **`console.table()`**: Magic for arrays and objects! It prints a nice ASCII table.

```javascript
const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
];
console.table(users);
```

---

## 4. String Handling & Template Literals

This is one of the most common "gotchas" for PHP devs.

### The Old Way (Single/Double Quotes)
Neither single nor double quotes support variable interpolation.
```javascript
const name = "John";
console.log("Hello " + name); // Merging with +
```

### The Modern Way (Template Literals)
Use **backticks** (`` ` ``) for interpolation and multi-line strings.
```javascript
// PHP: "Hello, $name!"
const message = `Hello, ${name}!`; 
```

---

## 5. Operators & The Equality "Trap"

JavaScript has two types of equality. This is a common source of bugs.

### Loose Equality (`==`)
Performs **type coercion** before comparing. It tries to force the values to be the same type.
- `5 == "5"` is `true`
- `false == 0` is `true`
- `[] == false` is `true` (Surprise!)

### Strict Equality (`===`)
Checks both **value** and **type**. **Always use this.**
- `5 === "5"` is `false`
- `false === 0` is `false`

```javascript
// PHP equivalent: === also exists but is less "critical" because PHP doesn't coerce as aggressively as JS.
if (userCount === 10) {
    console.log("Exactly ten.");
}
```

---

## 6. Type Coercion Quirks

JavaScript is "weakly typed," meaning it tries to be helpful by converting types on the fly. This can backfire:

```javascript
console.log("5" + 2); // "52" (String wins with +)
console.log("5" - 2); // 3 (Number wins with -)
console.log("5" * "2"); // 10 (Both converted to numbers)
```

> [!IMPORTANT]
> These quirks are exactly why **TypeScript** was created. In later phases, we will use TypeScript to prevent these "silent" bugs by enforcing strict types at compile time.

---

## 7. Key Takeaways

1. **Semicolons**: Use them. Even though they are optional, they prevent rare but nasty bugs.
2. **Backticks**: For strings with variables, use backticks (`` ` ``), not quotes.
3. **Strictness**: Always use `===` instead of `==`.
4. **Scope**: Prefer `const` > `let` > `var`.
5. **Node vs Browser**: In Node.js, `console.log` goes to your terminal, not a browser window.
