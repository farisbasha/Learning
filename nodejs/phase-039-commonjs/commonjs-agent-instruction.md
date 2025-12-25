# Phase 039: CommonJS Modules (Legacy)
## Agent Instructions

**Phase**: 039 | **Part**: E - Modules & npm | **Language**: JavaScript (Legacy)

## Topics
1. `require()` function — import modules
2. `module.exports = {}` — export object
3. `exports.foo = bar` — shorthand
4. Module caching — modules loaded once
5. Circular dependencies
6. Module resolution algorithm
7. Why CommonJS is still relevant (legacy code)

## Examples
```javascript
// math.js
module.exports = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};

// app.js
const math = require('./math');
console.log(math.add(2, 3));
```

## PHP Comparison
| PHP | CommonJS |
|-----|----------|
| `require 'file.php'` | `require('./file')` |
| `include_once` | Automatic caching |

## Content Instructions
**Notes**: CommonJS for legacy codebases
**Summary**: require/exports patterns
