# Phase 048: File System Directories — Notes

Working with directories in Node.js goes beyond just creating and deleting folders. You can list contents, watch for changes, and perform nested operations.

---

## 1. Directory Operations

### A. Creating Folders (`mkdir`)
You'll often want the `recursive: true` option (like `mkdir -p` in terminal). This creates parent folders if they don't exist and won't throw an error if the folder already exists.

```typescript
import { mkdir } from 'fs/promises';

await mkdir('./logs/daily/today', { recursive: true });
```

### B. Reading Folders (`readdir`)
Returns an array of strings (filenames). Using `withFileTypes: true` returns `Dirent` objects, which tell you if the item is a file or a folder.

```typescript
import { readdir } from 'fs/promises';

const files = await readdir('./src', { withFileTypes: true });

for (const file of files) {
    const type = file.isDirectory() ? '📁 Folder' : '📄 File';
    console.log(`${type}: ${file.name}`);
}
```

### C. Deleting Folders (`rm`)
In modern Node, use `rm()` for both files and folders. Set `recursive: true` to delete a folder and everything inside it.

```typescript
import { rm } from 'fs/promises';

await rm('./temp-dir', { recursive: true, force: true });
```

---

## 2. Watching the File System (`watch`)

Node can listen for changes in a directory. This is how tools like `nodemon` or `webpack` work.

```typescript
import { watch } from 'fs';

// This is an Async Iterator
const watcher = watch('./src', (eventType, filename) => {
    console.log(`Detected ${eventType} on ${filename}`);
});
```

---

## 3. Walking a Directory (Searching)

To find every `.ts` file in a project, you need a recursive function.

```typescript
import { readdir, stat } from 'fs/promises';
import path from 'path';

async function walk(dir: string) {
    const files = await readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
            await walk(fullPath); // Recurse
        } else {
            console.log("File found:", fullPath);
        }
    }
}
```

---

## 4. Key Takeaways
1. **`recursive` is your friend**: It prevents basic "Folder exists" or "Path not found" errors in `mkdir` and `rm`.
2. **Performance**: `readdir` with `withFileTypes` is faster than calling `stat` separately for every file.
3. **Paths**: Always use the **`path` module** (Phase 049) when combining directory names with filenames!
4. **Summary**: Directory management is the logical next step after file management.
