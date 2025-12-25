# Phase 041: TypeScript Module Resolution — Notes

TypeScript adds a layer of intelligence to how modules are found and imported. Understanding how to configure **Module Resolution** is key to keeping a clean codebase with shortcuts and aliases.

---

## 1. What is Module Resolution?

It's the process the compiler uses to figure out what an import like `import { User } from './models'` actually points to on your hard drive.

---

## 2. Path Aliases (`paths`)

In large projects, you don't want to see imports like `../../../utils`. Instead, we use aliases.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/core/models/*"]
    }
  }
}
```

Now you can write:
```typescript
import { User } from '@models/User';
```

---

## 3. The "Barrel" Pattern (`index.ts`)

A "Barrel" is a file that re-exports everything from a folder. It simplifies imports for the user.

```typescript
// src/models/index.ts
export * from './User';
export * from './Order';
export * from './Product';

// app.ts
import { User, Order, Product } from './models'; // Looks for index.ts automatically
```

---

## 4. moduleResolution Options

In `tsconfig.json`, you'll see a setting called `moduleResolution`:
- **`node` (Legacy)**: Follows the old CommonJS rules.
- **`node16` / `nodenext`**: Follows modern Node.js ESM rules (requires file extensions).
- **`bundler`**: Used when you use Vite/Webpack to handle the modules.

---

## 5. Importing Non-Code Files

TypeScript can be configured to import JSON or even images (though Node needs specific flags for JSON).

```typescript
import config from './config.json'; // Enable "resolveJsonModule": true
```

---

## 6. Key Takeaways
1. **Source vs Output**: The aliases work for the TypeScript compiler, but you often need a tool like `tsconfig-paths` to make them work when running the compiled JavaScript in Node.
2. **Generic `@`**: Using `@/` for `src/` is the industry standard in the Node/Frontend world.
3. **Auto-imports**: VS Code relies on your `paths` and `baseUrl` configuration to provide accurate auto-import suggestions.
4. **Resolution strategy**: TS checks for `.ts`, then `.tsx`, then `.d.ts`, then `.js`.
