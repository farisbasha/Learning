# Phase 007: Arrays & Iteration Methods — Notes

In PHP, arrays are multi-purpose tools (lists, hash maps, queues). In JavaScript, **Arrays** are specifically for ordered lists. Performance and readability in Node.js depend heavily on choosing the right iteration method.

---

## 1. PHP vs. JavaScript: The Big Picture

| PHP | JavaScript |
|-----|------------|
| `count($arr)` | `arr.length` |
| `$arr[] = $val` | `arr.push(val)` |
| `array_merge($a, $b)` | `[...a, ...b]` |
| `in_array($val, $arr)` | `arr.includes(val)` |

> [!WARNING]
> **Important difference**: JavaScript arrays are objects. `typeof []` is `"object"`. Use `Array.isArray(arr)` to check.

---

## 2. Iteration Methods (The "Big Three")

Instead of using `for` loops, modern JavaScript uses specialized methods that take a callback (arrow function).

### A. `.map()` — The Transformer
Use when you want to create a **new array** by changing every element.
```javascript
const prices = [10, 20, 30];
const taxed = prices.map(p => p * 1.1); // [11, 22, 33]
```

### B. `.filter()` — The Janitor
Use when you want to create a **new array** with only elements that pass a test.
```javascript
const users = [{ age: 10 }, { age: 30 }];
const adults = users.filter(u => u.age >= 18); // [{ age: 30 }]
```

### C. `.reduce()` — The Accumulator
Use when you want to turn an array into a **single value** (like a sum or a combined object).
```javascript
const numbers = [1, 2, 3, 4];
const total = numbers.reduce((sum, n) => sum + n, 0); // 10
```

---

## 3. Searching Methods

| Method | Behavior |
|--------|----------|
| **`.find()`** | Returns the **first** element that matches. Best for finding an object. |
| **`.findIndex()`**| Returns the index of the first match. |
| **`.includes()`** | Returns true/false (works for simple values only). |
| **`.some()`** | Returns true if **at least one** element matches. |
| **`.every()`** | Returns true if **all** elements match. |

```javascript
const items = ["Apple", "Banana", "Cherry"];
const hasB = items.some(item => item.startsWith("B")); // true
```

---

## 4. Spread & Destructuring

These make array manipulation extremely clean.

### The Spread Operator (`...`)
```javascript
const fruits = ["Apple", "Orange"];
const allFoods = ["Pizza", ...fruits, "Bread"]; // ["Pizza", "Apple", "Orange", "Bread"]
```

### Array Destructuring
```javascript
const [first, second] = ["Red", "Green", "Blue"];
console.log(first); // "Red"

// Swapping variables (The JS magic trick)
let a = 1, b = 2;
[a, b] = [b, a]; // a=2, b=1
```

---

## 5. Method Chaining

You can pipe array methods together to perform complex data processing in one statement.

```javascript
const orders = [
    { type: "A", amount: 100 },
    { type: "B", amount: 200 },
    { type: "A", amount: 50 },
];

const totalA = orders
    .filter(o => o.type === "A")
    .map(o => o.amount)
    .reduce((sum, amt) => sum + amt, 0); // 150
```

---

## 6. Key Takeaways
1. **Don't use `for` loops**: Unless you need to `break` or `continue` early, `.forEach`, `.map`, and `.filter` are much more readable.
2. **Mutation Warning**: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, and `reverse` **modify the original array**.
3. **Immutability**: Methods like `map`, `filter`, `slice`, and `concat` **return a new array**. In Node.js, returning new arrays is usually safer to avoid bugs in shared state.
4. **Length**: `arr.length` is a property, not a function. Don't write `arr.length()`.
