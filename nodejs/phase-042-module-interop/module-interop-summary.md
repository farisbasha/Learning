# Phase 042: CJS/ESM Interop — Summary Cheatsheet

## 🥊 The Conflicts

| Scenario | Mode | Rule |
|----------|------|------|
| **CJS → CJS** | `require()` | Standard legacy behavior. |
| **ESM → ESM** | `import` | Standard modern behavior. |
| **ESM → CJS** | `import` | Works flawlessly if `esModuleInterop: true`. |
| **CJS → ESM** | `import()` | **REQUIRED**. You cannot use `require()`. |

---

## 🖼️ The __dirname Replacement (ESM)
```typescript
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
```

---

## ⚙️ Recommended tsconfig
```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

---

## 💡 Remember
- `.cjs` extension forces CommonJS mode.
- `.mjs` extension forces ES Module mode.
- Dynamic `import()` returns a Promise.
- Use ES Modules for all modern development!
