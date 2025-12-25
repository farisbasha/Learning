# Phase 005: Objects & Prototypes — Notes

In PHP, you use **Associative Arrays** for key-value storage. In JavaScript, **Objects** are the foundation of everything. Understanding how they work, how they link together (prototypes), and how to manipulate them efficiently is crucial for Node.js.

---

## 1. Object Literal Basics

Objects are collections of key-value pairs (properties).

```javascript
const user = {
    name: "John",
    age: 30,
    occupation: "Developer"
};

// Accessing Properties
console.log(user.name);      // Dot notation (Preferred)
console.log(user["age"]);    // Bracket notation (Required for dynamic keys)
```

> [!TIP]
> **When to use Bracket Notation?**
> Use it when the property name is stored in a variable:
> ```javascript
> const key = "occupation";
> console.log(user[key]); // "Developer"
> ```

---

## 2. Modern ES6+ Object Shorthands

JavaScript has several shortcuts to make object creation less verbose.

### Property Shorthand
If the variable name matches the property name, you only write it once.
```javascript
const name = "Alice";
const age = 25;

// Old Way
const user = { name: name, age: age };

// New Way
const user = { name, age }; 
```

### Computed Property Names
You can use an expression as a key inside the literal.
```javascript
const prefix = "user";
const profile = {
    [`${prefix}_id`]: 101, // Key will be "user_id"
};
```

---

## 3. Object Methods

In JavaScript, a "method" is just a property that holds a function.

```javascript
const bot = {
    name: "Robo",
    // Modern Method Syntax
    greet(user) {
        return `Hello ${user}, I am ${this.name}`;
    }
};

console.log(bot.greet("Basha"));
```

---

## 4. Object Utilities (The `Object` Class)

JavaScript provides powerful static methods on the `Object` class for manipulation.

| Method | Behavior | PHP Equivalent |
|--------|----------|----------------|
| `Object.keys(obj)` | Array of keys | `array_keys()` |
| `Object.values(obj)`| Array of values | `array_values()` |
| `Object.entries(obj)`| Array of `[key, value]` pairs | `foreach($arr as $k => $v)` |
| `Object.assign()` | Merges objects | `array_merge()` |
| `Object.freeze()` | Makes object immutable | N/A |

### Merging with Spread Operator
The modern way to merge objects is the **Spread Operator (`...`)**.
```javascript
const settings = { theme: "dark", notify: true };
const userPrefs = { ...settings, notify: false }; // Overwrites notify
```

---

## 5. The Prototype Chain (Conceptual)

This is the most unique part of JavaScript. Every object has a "parent" object called a **Prototype**.

When you try to access a property:
1. JS looks at the object itself.
2. If not found, it looks at its prototype.
3. If not found, it looks at the prototype's prototype (and so on).

This is how inheritance works in JavaScript without traditional classes. For example, `user.toString()` works even if you didn't define it, because it's inherited from `Object.prototype`.

---

## 6. PHP vs. JavaScript: Objects vs. Arrays

In PHP, arrays can be both lists and maps (associative). In JavaScript:
- Use **Arrays** (`[]`) for ordered lists of data.
- Use **Objects** (`{}`) for records with named properties.

> [!WARNING]
> **Reference Mutation**: Like PHP objects (but unlike PHP arrays), JS objects are passed by **reference**. If you modify `obj2 = obj1`, you modify `obj1` too! Use `{ ...obj1 }` to clone.

---

## 7. Key Takeaways
1. **Objects are everywhere**: Almost everything in Node.js (modules, requests, etc.) is an object.
2. **Spread Operator**: Use `{ ...obj }` for shallow copying and merging.
3. **Shorthands**: Master `const obj = { name, age }` to write cleaner code.
4. **Prototypes**: You don't often touch them directly, but knowing they exist explains why objects have methods you didn't write.
5. **JSON**: JavaScript objects look almost exactly like JSON (JavaScript Object Notation), which makes working with APIs effortless.
