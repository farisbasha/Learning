# Phase 048: FS Directories — Summary Cheatsheet

## 📂 Essentials (`fs/promises`)

| Method | Extra Params | Behavior |
|--------|--------------|----------|
| **`mkdir`** | `{ recursive: true }` | Like `mkdir -p`. Creates parents. |
| **`readdir`**| `{ withFileTypes: true }`| Returns `Dirent` objects (stat-lite).|
| **`rm`** | `{ recursive: true }` | Deletes folder + all contents. |
| **`rename`** | `(old, new)` | Moves or renames directory. |

---

## 🕵️ Item Types (`Dirent`)
When using `readdir(path, { withFileTypes: true })`:
- `file.isDirectory()` → true if folder.
- `file.isFile()` → true if file.
- `file.name` → The filename/foldername.

---

## 👁️ Watching for Changes
```typescript
import { watch } from 'fs';

watch('./folder', (type, name) => {
  console.log(`${name} was changed: ${type}`);
});
```

---

## 💡 Remember
- Don't use `rmdir` (it only works for EMPTY folders). Use `rm` instead.
- Recursive deletion is dangerous—always double-check your paths!
- Use `readdir` to build your own local static file servers or build tools.
