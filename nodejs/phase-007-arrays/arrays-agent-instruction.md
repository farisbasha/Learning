# Phase 007: Arrays & Iteration Methods
## Agent Instructions for Content Generation

---

## 📋 Phase Overview

**Phase Number**: 007  
**Phase Name**: Arrays & Iteration Methods  
**Part**: A - JavaScript Fundamentals  
**Primary Language**: JavaScript  
**Difficulty**: Beginner-Intermediate  
**Prerequisites**: Phase 001-003  

---

## 🎯 Learning Objectives

By the end of this phase, the learner should be able to:
1. Create and manipulate arrays
2. Use all major iteration methods
3. Choose the right method for the task
4. Use spread operator and destructuring with arrays
5. Map PHP array functions to JavaScript equivalents

---

## 📚 Topics to Cover

### 1. Array Creation
```javascript
const arr1 = [1, 2, 3];
const arr2 = new Array(3); // [empty × 3]
const arr3 = Array.from("hello"); // ["h", "e", "l", "l", "o"]
const arr4 = Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
```

### 2. Mutating Methods (Modify Original)
- `push()` — add to end
- `pop()` — remove from end
- `unshift()` — add to start
- `shift()` — remove from start
- `splice()` — add/remove at index
- `sort()` — sort in place
- `reverse()` — reverse in place

### 3. Non-Mutating Iteration Methods (Return New Array/Value)
- `forEach()` — iterate (no return)
- `map()` — transform each element
- `filter()` — keep matching elements
- `reduce()` — accumulate to single value
- `find()` — first matching element
- `findIndex()` — index of first match
- `some()` — any match?
- `every()` — all match?
- `includes()` — contains value?
- `indexOf()` — index of value

### 4. Other Useful Methods
- `slice()` — extract portion
- `concat()` — merge arrays
- `flat()` — flatten nested arrays
- `flatMap()` — map then flatten

### 5. Spread Operator
```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4]
```

### 6. Destructuring
```javascript
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]
```

---

## 🔄 PHP Comparison Points

| PHP | JavaScript |
|-----|------------|
| `array_push($arr, $val)` | `arr.push(val)` |
| `array_pop($arr)` | `arr.pop()` |
| `array_shift($arr)` | `arr.shift()` |
| `array_unshift($arr, $val)` | `arr.unshift(val)` |
| `array_map(fn, $arr)` | `arr.map(fn)` |
| `array_filter($arr, fn)` | `arr.filter(fn)` |
| `array_reduce($arr, fn, $init)` | `arr.reduce(fn, init)` |
| `in_array($val, $arr)` | `arr.includes(val)` |
| `array_search($val, $arr)` | `arr.indexOf(val)` |
| `array_slice($arr, $start, $len)` | `arr.slice(start, end)` |
| `array_merge($a, $b)` | `[...a, ...b]` |
| `count($arr)` | `arr.length` |

---

## 💻 Code Examples to Include

### Example 1: map, filter, reduce
```javascript
const numbers = [1, 2, 3, 4, 5];

// map — transform each element
// PHP: array_map(fn($x) => $x * 2, $numbers)
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter — keep matching elements
// PHP: array_filter($numbers, fn($x) => $x > 2)
const greaterThanTwo = numbers.filter(n => n > 2);
console.log(greaterThanTwo); // [3, 4, 5]

// reduce — accumulate to single value
// PHP: array_reduce($numbers, fn($acc, $n) => $acc + $n, 0)
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15
```

### Example 2: find and findIndex
```javascript
const users = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "Bob" }
];

// find — returns first matching element
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, name: "Jane" }

// findIndex — returns index
const index = users.findIndex(u => u.name === "Bob");
console.log(index); // 2
```

### Example 3: Chaining Methods
```javascript
const orders = [
    { product: "Laptop", price: 1000, quantity: 2 },
    { product: "Mouse", price: 25, quantity: 5 },
    { product: "Keyboard", price: 75, quantity: 3 }
];

// Get total value of orders over $50
const totalValueOfLargeOrders = orders
    .filter(order => order.price > 50)
    .map(order => order.price * order.quantity)
    .reduce((sum, value) => sum + value, 0);

console.log(totalValueOfLargeOrders); // 2225
```

### Example 4: some and every
```javascript
const numbers = [1, 2, 3, 4, 5];

// some — at least one matches?
const hasEven = numbers.some(n => n % 2 === 0);
console.log(hasEven); // true

// every — all match?
const allPositive = numbers.every(n => n > 0);
console.log(allPositive); // true

const allEven = numbers.every(n => n % 2 === 0);
console.log(allEven); // false
```

### Example 5: Spread and Destructuring
```javascript
// Spread — merge arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Destructuring — extract values
const [first, second, ...rest] = merged;
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5, 6]

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a]; // a = 2, b = 1
```

---

## 🚨 Common Mistakes to Highlight

1. **Mutating when you shouldn't**
   - `sort()` and `reverse()` mutate the original
   - Use `[...arr].sort()` to avoid mutation

2. **Forgetting forEach returns nothing**
   - Use `map()` when you need a result

3. **Using indexOf for objects**
   - `indexOf` uses `===`, won't find objects by value
   - Use `find()` or `findIndex()` for objects

4. **Not providing initial value to reduce**
   - Can cause issues with empty arrays

---

## 📝 Content Generation Instructions

When generating `arrays-notes.md`:
1. Cover each method with examples
2. Create PHP comparison table
3. Show method chaining patterns
4. Include when to use each method

When generating `arrays-summary.md`:
1. Method quick reference table
2. PHP ↔ JS mapping table
3. Mutating vs non-mutating list
4. Common patterns

---

## 📚 Resources for Deeper Learning

- MDN: Array
- JavaScript.info: Arrays, Array methods
