# Phase 049: Path Module — Summary Cheatsheet

## 🛠️ Main Tactics

| Method | Goal |
|--------|------|
| **`path.join(...)`** | Smart stitching of paths. Handling slashes. |
| **`path.resolve(...)`**| Convert relative path to Absolute. |
| **`path.parse(...)`** | Explode path into object (extension, name, folder). |

---

## ✂️ Quick Extraction
```typescript
const myPath = "/users/basha/app.js";

path.basename(myPath); // "app.js"
path.dirname(myPath);  // "/users/basha"
path.extname(myPath);  // ".js"
```

---

## 🌍 Platform Specifics
- **Forward Slash (`/`)**: Mac / Linux.
- **Backslash (`\`)**: Windows.
- **`path.sep`**: Use this if you need the actual separator character for the current OS.

---

## 💡 Remember
- Path methods don't check if the file actually exists; they just manipulate the **labels (strings)**.
- `path.join('a', 'b')` is always better than `"a/" + "b"`.
- Use `path.resolve()` when you need to be 100% sure where a file is regardless of where the app was started.
