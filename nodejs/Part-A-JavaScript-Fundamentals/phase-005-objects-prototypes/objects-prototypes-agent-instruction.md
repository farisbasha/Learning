# Phase 005: Objects & Prototypes
## Agent Instructions for Content Generation

---

## 📋 Phase Overview

**Phase Number**: 005  
**Phase Name**: Objects & Prototypes  
**Part**: A - JavaScript Fundamentals  
**Primary Language**: JavaScript  
**Difficulty**: Intermediate  
**Prerequisites**: Phase 001-004  

---

## 🎯 Learning Objectives

By the end of this phase, the learner should be able to:
1. Create and manipulate objects
2. Use property shorthand and computed properties
3. Understand prototype chain
4. Work with `Object` static methods
5. Distinguish objects from PHP associative arrays

---

## 📚 Topics to Cover

### 1. Object Literals
```javascript
const user = {
    name: "John",
    age: 30,
    isActive: true
};
```

### 2. Property Access
- Dot notation: `user.name`
- Bracket notation: `user["name"]`
- When to use each

### 3. Shorthand Property Syntax
```javascript
const name = "John";
const age = 30;
const user = { name, age }; // Same as { name: name, age: age }
```

### 4. Computed Property Names
```javascript
const key = "dynamicKey";
const obj = {
    [key]: "value",
    [`computed_${key}`]: "another value"
};
```

### 5. Object Methods
```javascript
const user = {
    name: "John",
    greet() {
        return `Hello, ${this.name}`;
    }
};
```

### 6. Prototype Chain
- Every object has a prototype
- Property lookup chain
- `Object.prototype` is the root
- `__proto__` vs `prototype`

### 7. Object Static Methods
- `Object.keys(obj)` — array of keys
- `Object.values(obj)` — array of values
- `Object.entries(obj)` — array of [key, value]
- `Object.assign(target, ...sources)` — merge
- `Object.freeze(obj)` — make immutable
- `Object.create(proto)` — create with prototype

### 8. Spread Operator with Objects
```javascript
const base = { a: 1, b: 2 };
const extended = { ...base, c: 3 };
```

---

## 🔄 PHP Comparison Points

| PHP | JavaScript |
|-----|------------|
| `$arr = ["name" => "John"];` | `const obj = { name: "John" };` |
| `$arr["name"]` | `obj.name` or `obj["name"]` |
| `array_keys($arr)` | `Object.keys(obj)` |
| `array_values($arr)` | `Object.values(obj)` |
| `array_merge($a, $b)` | `{ ...a, ...b }` or `Object.assign({}, a, b)` |
| `(object)$arr` | Objects are native |
| Classes with `extends` | Prototypes (or ES6 classes) |

---

## 💻 Code Examples to Include

### Example 1: Object Creation and Access
```javascript
// Creating objects
const user = {
    name: "John",
    age: 30,
    email: "john@example.com"
};

// Access
console.log(user.name);        // "John"
console.log(user["age"]);      // 30

// Dynamic access (like PHP $arr[$key])
const field = "email";
console.log(user[field]);      // "john@example.com"
```

### Example 2: Object Methods
```javascript
const calculator = {
    value: 0,
    add(n) {
        this.value += n;
        return this; // For chaining
    },
    subtract(n) {
        this.value -= n;
        return this;
    },
    getResult() {
        return this.value;
    }
};

const result = calculator.add(10).subtract(3).getResult();
console.log(result); // 7
```

### Example 3: Object Utilities
```javascript
const user = { name: "John", age: 30: city: "NYC" };

// PHP: array_keys($user)
console.log(Object.keys(user));   // ["name", "age", "city"]

// PHP: array_values($user)
console.log(Object.values(user)); // ["John", 30, "NYC"]

// PHP: foreach as $key => $value
for (const [key, value] of Object.entries(user)) {
    console.log(`${key}: ${value}`);
}
```

### Example 4: Prototype Chain (Conceptual)
```javascript
const animal = {
    eat() {
        console.log("Eating...");
    }
};

const dog = Object.create(animal);
dog.bark = function() {
    console.log("Woof!");
};

dog.eat();  // "Eating..." (inherited from prototype)
dog.bark(); // "Woof!" (own method)
```

---

## 🚨 Common Mistakes to Highlight

1. **Confusing objects with PHP arrays**
   - JS objects are NOT ordered (mostly)
   - Use `Map` for ordered key-value pairs

2. **Mutating objects unintentionally**
   - Objects are passed by reference
   - Use spread to clone: `{ ...obj }`

3. **Using arrow functions for methods**
   - Arrow functions don't have their own `this`
   - Use regular methods for object methods

4. **Forgetting bracket notation for dynamic keys**
   - `obj.dynamicKey` looks for literal "dynamicKey"
   - `obj[dynamicKey]` uses variable value

---

## 📝 Content Generation Instructions

When generating `objects-prototypes-notes.md`:
1. Start with object creation and access
2. Cover all shorthand syntaxes
3. Explain prototype chain conceptually
4. Compare with PHP associative arrays extensively
5. Include Object static methods

When generating `objects-prototypes-summary.md`:
1. Object syntax cheatsheet
2. Object methods quick reference
3. PHP ↔ JS comparison table
4. Common patterns

---

## 📚 Resources for Deeper Learning

- MDN: Working with Objects
- JavaScript.info: Objects
- "You Don't Know JS: this & Object Prototypes"
