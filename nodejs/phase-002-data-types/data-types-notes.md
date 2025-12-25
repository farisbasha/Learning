# Phase 002: Data Types & Dynamic Typing — Notes

In JavaScript, every value has a type. Unlike PHP, where types are often converted automatically for arithmetic (like `"10" + 5` becoming `15`), JavaScript's dynamic and weak typing can be a major source of bugs if not understood properly.

---

## 1. The Primitive Types

Primitives are the building blocks of data. They are immutable and passed by value.

| Type | Description | PHP Equivalent |
|------|-------------|----------------|
| **String** | Textual data | `string` |
| **Number** | All numbers (integers & floats) | `int` or `float` |
| **Boolean** | `true` or `false` | `bool` |
| **Null** | Intentional absence of value | `null` |
| **Undefined** | Variable declared but not assigned | N/A (PHP just uses null) |
| **BigInt** | Large integers (beyond 2^53 - 1) | N/A |
| **Symbol** | Unique identifiers | N/A |

### JavaScript's "Number" Type
In PHP, you distinguish between `$x = 1;` (int) and `$y = 1.0;` (float). 
In JavaScript, **both are just `number`**.
```javascript
let count = 42;    // number
let price = 19.99; // number
```

---

## 2. Null vs. Undefined

This is a key difference from PHP.

- **`undefined`**: Means "I don't know what this is yet." It's the default value for uninitialized variables.
- **`null`**: Means "I am intentionally setting this to nothing."

```javascript
let x; 
console.log(x); // undefined

let y = null;
console.log(y); // null
```

---

## 3. Reference Types (Objects)

Reference types are mutable and passed by reference.
- **Objects**: `{ name: "John" }` (Similar to Associative Arrays in PHP)
- **Arrays**: `[1, 2, 3]` (Ordered list)
- **Functions**: `function() {}`

---

## 4. The `typeof` Operator & Its Historical Bug

To check a type, we use `typeof`. However, there is a famous historical bug you must know:

```javascript
typeof "Hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object"  <-- 🚨 THE BUG! null is NOT an object.
```

### Checking for Arrays
`typeof []` returns `"object"`. To check if something is an array, use the static method:
```javascript
Array.isArray([1, 2, 3]); // true
```

---

## 5. Truthy vs. Falsy Values

In a conditional (`if`), JavaScript converts values to booleans.

### The Falsy List (The only things that are `false`)
- `false`
- `0` and `-0`
- `""` (Empty string)
- `null`
- `undefined`
- `NaN` (Not a Number)

### The Truthy "Surprises"
Unlike some other languages, these are **truthy** in JS:
- `"0"` (A string with content is true)
- `[]` (An empty array is an object, so it's true! **PHP devs beware**, empty arrays in PHP are falsy)
- `{}` (An empty object is true)

---

## 6. Dynamic Typing: The Motivation for TypeScript

In JavaScript, a variable can change types at any time:
```javascript
let data = "Hello";
data = 42; // No error!
```

This leads to issues like:
```javascript
let x = "100";
x = x + 50; 
console.log(x); // "10050" (String concatenation)
```
In PHP, `$x = "100"; $x = $x + 50;` would result in `150`. JavaScript is much more aggressive with strings.

> [!IMPORTANT]
> Because JavaScript doesn't check these types at compile-time, we get **Runtime Errors**. This is why we eventually transition to **TypeScript**, which forces us to define types and catches these errors before the code even runs.

---

## 7. Key Takeaways
1. **Numbers**: JavaScript doesn't care if it's an integer or a decimal; it's all `number`.
2. **Arrays**: `typeof` lies about arrays. Use `Array.isArray()`.
3. **Null/Undefined**: Use `null` for "empty on purpose" and leave `undefined` for "system defaults".
4. **Boolean check**: Be careful with empty arrays `[]` and empty objects `{}`, they are **truthy**!
