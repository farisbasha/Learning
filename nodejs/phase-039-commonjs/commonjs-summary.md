# Phase 039: CommonJS — Summary Cheatsheet

## 📤 Exporting

```javascript
// Option 1: Object (Recommended)
module.exports = {
  foo: "bar",
  fn: () => {}
};

// Option 2: Shorthand
exports.foo = "bar";

// Option 3: Single Function/Class
module.exports = function() { ... };
```

---

## 📥 Importing

```javascript
// Local file
const myModule = require('./myModule');

// Destructuring
const { foo } = require('./myModule');

// Global package
const express = require('express');
```

---

## 🛡️ The Module Wrapper
Node.js wraps every CJS module in a hidden function that provides `require`, `module`, `exports`, `__filename`, and `__dirname`. This is why these "global" variables are available.

---

## 💡 Remember
- CJS is the "old way" but still everywhere.
- `require` is synchronous — don't use it inside a request handler if possible.
- Modules are loaded **once** and then cached.
- Files must start with `./` or `/` to be treated as local files; otherwise, Node looks in `node_modules`.
