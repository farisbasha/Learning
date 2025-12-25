# Phase 040: ES Modules — Summary Cheatsheet

## 📤 Exporting Patterns

```typescript
// Named
export const foo = 1;
export function bar() {}

// Default
export default class MyClass {}

// Re-export
export { foo as newName } from './other';
```

---

## 📥 Importing Patterns

```typescript
// Named
import { foo, bar } from './module.js';

// Default
import MyClass from './module.js';

// All as object
import * as Math from './math.js';

// Side effects only
import './setup.js';
```

---

## ⚙️ Configuration
Add this to `package.json`:
```json
{
  "type": "module"
}
```

---

## 💡 Remember
- Use `.js` extension in imports even if the source is `.ts` (TypeScript rule).
- `__dirname` and `__filename` are **NOT** available in ESM. Use `import.meta.url`.
- ESM is strict by default.
- Top-level `await` is supported.
