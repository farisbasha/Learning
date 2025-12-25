# Phase 047: FS Basics — Summary Cheatsheet

## 📁 Core Async Methods (`fs/promises`)

| Method | Role | Example |
|--------|------|---------|
| **`readFile`** | Read file content. | `await readFile(path, 'utf8')` |
| **`writeFile`**| Overwrite file. | `await writeFile(path, data)` |
| **`appendFile`**| Add to the end. | `await appendFile(path, log)` |
| **`unlink`** | Delete file. | `await unlink(path)` |
| **`stat`** | Get file details. | `await stat(path)` |

---

## 🚨 The UTF-8 Rule
If you forget `'utf8'`, you get a **Buffer** (hexadecimal binary data).
```typescript
// ❌ returns <Buffer 48 65 6c 6c 6f...>
const data = await readFile('file.txt'); 

// ✅ returns "Hello..."
const text = await readFile('file.txt', 'utf8');
```

---

## 🛡️ Existence Pattern
```typescript
async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
```

---

## 💡 Remember
- **Always** prioritize `fs/promises`.
- **Never** use `Sync` methods in Express/HTTP server routes.
- File paths are relative to where you **run** the command (`process.cwd()`), not where the script is located.
