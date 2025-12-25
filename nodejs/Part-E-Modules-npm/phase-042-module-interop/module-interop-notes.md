# Phase 042: CommonJS vs. ESM Interop — Notes

We currently live in a "Transitional Era." Half the Node.js ecosystem uses the old CommonJS (`require`), and the other half uses modern ES Modules (`import`). Learning how to make them talk to each other is a necessary survival skill.

---

## 1. Importing CJS from ESM

ESM files can usually import CommonJS packages without much trouble.

```typescript
// Inside an ESM file
import express from 'express'; // This works!
```

**The Secret**: TypeScript has a setting called `esModuleInterop: true`. This automatically wraps CommonJS modules so they look like they have a default export.

---

## 2. Importing ESM from CJS

This is **much harder**. You cannot `require()` an ESM file.
- **Why?** ESM is asynchronous, but `require()` is synchronous.
- **Solution**: You must use the dynamic `import()` function.

```javascript
// Inside a CJS file
async function run() {
    const { default: myEsmModule } = await import('./esm-file.mjs');
}
```

---

## 3. The `__dirname` Problem

In CommonJS, you have two global variables: `__dirname` and `__filename`.
In ES Modules, **they do not exist.**

**The Workaround (ESM):**
```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## 4. Key TypeScript Settings for Interop

- **`esModuleInterop`**: Set to `true`. This adds the logic to handle CJS imports smoothly.
- **`allowSyntheticDefaultImports`**: Set to `true`. Allows you to use `import X from 'y'` even if `y` doesn't have a default export.

---

## 5. Decision: Which should I use?

- **New Projects**: Always use **ES Modules**. It is the standard and the future.
- **Old Projects**: Stay in **CommonJS** until you have time for a full migration.

---

## 6. Key Takeaways
1. **ESM is the standard**: But Node still supports CJS for backward compatibility.
2. **`import()` is Dynamic**: It works in both CJS and ESM and returns a promise.
3. **Strictness**: You cannot use `require` inside an ESM file.
4. **Transition finished**: We've covered the internal module systems. Now let's look at the external world: **npm**.
