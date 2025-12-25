# Phase 041: TS Module Resolution — Summary Cheatsheet

## 📍 Path Aliases (Aliases)
```json
"paths": {
  "@/*": ["src/*"]
}
```
**Import**: `import { x } from '@/utils/file';`

---

## 🛢️ Barrel Pattern
Create an `index.ts` in a folder to export multiple files.
```typescript
export * from './fileA';
export * from './fileB';
```

---

## ⚙️ Key tsconfig Options

| Option | Purpose |
|--------|---------|
| **`baseUrl`** | The root for non-relative imports. |
| **`paths`** | Custom aliases for long paths. |
| **`moduleResolution`**| How TS finds files (Use `NodeNext` for modern Node). |
| **`resolveJsonModule`**| Allows `import data from './data.json'`. |

---

## 💡 Remember
- Relative paths (`./` or `../`) are always resolveable.
- Non-relative paths (like `react` or `@/utils`) trigger the resolution algorithm.
- If you use aliases, remember to configure your production runner (like `PM2` or `node`) to recognize them too.
