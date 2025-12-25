# Phase 005: Objects & Prototypes — Summary Cheatsheet

## 🏗️ Object Syntax Cheatsheet

```javascript
const role = "admin";

const user = {
    // 1. Literal Property
    name: "John",
    
    // 2. Shorthand (if variable 'email' exists)
    email,
    
    // 3. Computed Property
    [`${role}_status`]: "active", // "admin_status": "active"
    
    // 4. Method
    login() { console.log('In!'); }
};
```

---

## 🛠️ Object Static Methods (The `Object.` API)

| Method | Use Case |
|--------|----------|
| `Object.keys(obj)` | Get an array of keys (for loops). |
| `Object.values(obj)` | Get an array of values. |
| `Object.entries(obj)`| Get `[[key, val], ...]` pairs. |
| `Object.freeze(obj)` | Prevent ANY changes to the object. |
| `Object.seal(obj)`   | Prevent adding/removing keys, but allows editing. |

---

## ⚡ Spread & Destructuring Basics

### Merging & Cloning
```javascript
const original = { a: 1, b: 2 };
const clone = { ...original }; // Shallow copy
const merged = { ...original, c: 3 }; // Add/Overwrite
```

### Property Destructuring
```javascript
const { name, age } = user; // Extract into variables
```

---

## 🔄 PHP vs. JS Comparison

| Action | PHP (Associative Array) | JavaScript (Object) |
|--------|-------------------------|----------------------|
| **Create** | `['id' => 1]` | `{ id: 1 }` |
| **Access** | `$arr['id']` | `obj.id` |
| **Check Key**| `isset($arr['id'])` | `'id' in obj` |
| **Delete Key**| `unset($arr['id'])` | `delete obj.id` |
| **Merge** | `array_merge($a, $b)` | `{ ...a, ...b }` |
| **Iteration**| `foreach($a as $k => $v)` | `for(let k in a)` or `Object.entries()`|

---

## 💡 Important Rules
1. **Dots over Brackets**: Use `obj.property` unless you have a dynamic key in a variable.
2. **Method Context**: Don't use Arrow Functions as methods if you need to use `this`.
3. **Immutability**: In many patterns (like Redux or Functional Node), you should never mutate an object. Always create a new one: `const updated = { ...old, someField: 'newVal' }`.
