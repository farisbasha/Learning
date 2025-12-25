# Phase 039: CommonJS Modules — Notes

Before modern JavaScript modules (ESM) existed, Node.js created its own module system called **CommonJS (CJS)**. Even though ESM is now the standard, CommonJS is still used in billions of lines of legacy code and many existing npm packages.

---

## 1. Importing Modules (`require`)

In CommonJS, you use the `require()` function to import other files or packages.

```javascript
// Import from a package
const fs = require('fs');

// Import from a local file
const math = require('./utils/math');
```

---

## 2. Exporting Modules (`module.exports`)

To make variables or functions available to other files, you assign them to `module.exports`.

```javascript
// math.js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = {
    add,
    subtract
};
```

### The `exports` Shortcut
You can also use `exports` directly, but be careful: it's just a reference to `module.exports`. If you assign a new object to `exports`, it breaks the link.

```javascript
// ✅ Good
exports.add = (a, b) => a + b;

// ❌ Bad (Won't export anything)
exports = { add: (a, b) => a + b }; 
```

---

## 3. Module Caching

Node.js caches modules after the first time they are loaded. If you `require()` the same file twice, the second call returns the **same object** that was created the first time.

```javascript
// logger.js
console.log("Initializing logger...");
module.exports = { log: (msg) => console.log(msg) };

// main.js
require('./logger'); // Prints "Initializing logger..."
require('./logger'); // Prints nothing! (Returns cached object)
```

---

## 4. PHP Comparison

| Feature | PHP | CommonJS |
|---------|-----|----------|
| **Importing** | `require 'file.php'` | `const x = require('./file')` |
| **Scope** | Global (unless using namespaces) | **Private** to the file |
| **Caching** | `require_once` | Automatic caching |

---

## 5. Key Takeaways
1. **Synchronous**: `require()` is synchronous. It stops the event loop until the file is loaded. This is why it's usually only used at the top of a file.
2. **File Scope**: Unlike PHP, variables defined in a CommonJS file are **not** global. They only exist inside that file unless exported.
3. **Legacy**: Most Node.js documentation from before 2020 uses this syntax.
4. **Resolution**: If you don't provide an extension, Node checks for `.js`, `.json`, then `.node`.
