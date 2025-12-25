# Phase 040: ES Modules — Notes

**ES Modules (ESM)** are the official standard for JavaScript modules. They bring a unified module system to both the browser and Node.js. 

---

## 1. named Exports

You can export multiple variables or functions from a single file by prefixing them with the `export` keyword.

```typescript
// math.ts
export const add = (a: number, b: number) => a + b;
export const PI = 3.14;
```

To import them, you use curly braces:
```typescript
import { add, PI } from './math.js';
```

---

## 2. Default Exports

Each file can have **one** default export. This is often used for the main class or function of a module.

```typescript
// logger.ts
export default class Logger {
    log(msg: string) { console.log(msg); }
}
```

To import a default export, you don't use curly braces and you can name it whatever you want:
```typescript
import MyLogger from './logger.js';
```

---

## 3. Mixing named and Default

You can have both in one file.

```typescript
import Logger, { name, version } from './logger.js';
```

---

## 4. Enabling ESM in Node.js

Node.js treats files as CommonJS by default. To use ESM, you must:
1. Use the `.mjs` extension.
2. **OR** add `"type": "module"` to your `package.json`.

---

## 5. Why ESM is better than CJS

1. **Static Analysis**: The engine knows imports at "compile time", allowing for better performance and "tree-shaking" (removing unused code).
2. **Asynchronous**: Imports can be asynchronous (though `import` at the top level is still blocking for the module loader).
3. **Browser Native**: You can use the same code in React/Vue and Node.js without changes.
4. **Top-level Await**: You can use `await` outside of a function in ESM.

---

## 6. PHP Comparison

| PHP | ES Modules |
|-----|------------|
| `use App\Services\Logger;` | `import Logger from './logger.js'` |
| `namespace App\Utils;` | (Not needed, file is the scope) |
| `public function` | `export function` |

---

## 7. Key Takeaways
1. **Extensions Matter**: In ESM, you must usually include the file extension in the import (e.g., `./math.js` instead of `./math`).
2. **Read-only**: Imported variables are "live bindings" but they are **read-only** in the importing file.
3. **Strict Mode**: ESM always runs in JavaScript's "Strict Mode" automatically.
4. **Conclusion**: Most new Node.js projects should be built using ESM.
