# Phase 047: File System Basics — Notes

The `fs` (File System) module allows your Node.js application to interact with the hard drive. For a PHP developer, this is your `file_get_contents()` and `file_put_contents()` but with asynchronous power.

---

## 1. The `fs/promises` API

In modern Node.js development, we almost always use the **Promises version** of the module. This allows us to use `async/await` and keep our code clean.

```typescript
import { readFile, writeFile, appendFile, unlink } from 'fs/promises';
```

---

## 2. Basic Operations

### A. Reading a File
Always specify the **encoding** (usually `'utf8'`). If you don't, you'll get a raw `Buffer` (binary data) instead of a string.

```typescript
try {
    const data = await readFile('./config.json', 'utf8');
    const config = JSON.parse(data);
} catch (err) {
    console.error("Could not read file:", err.message);
}
```

### B. Writing & Appending
`writeFile()` **overwrites** the file. `appendFile()` adds to the end.

```typescript
await writeFile('output.txt', 'Hello World!');
await appendFile('output.txt', '\nMore data...');
```

### C. Deleting
In Node.js/C syntax, deleting is called **Unlinking**.

```typescript
await unlink('old-file.txt');
```

---

## 3. Metadata & Existence

You might want to check if a file exists or how big it is without reading the whole thing.

### Checking Stats
```typescript
import { stat } from 'fs/promises';

const stats = await stat('photo.jpg');
console.log(`Size: ${stats.size} bytes`);
console.log(`Is Directory? ${stats.isDirectory()}`);
```

### Checking Existence
Instead of a simple boolean, Node uses `access()`. If it doesn't throw an error, the file exists.

```typescript
import { access, constants } from 'fs/promises';

try {
    await access('secret.txt', constants.F_OK);
    console.log("File exists!");
} catch {
    console.log("File does not exist.");
}
```

---

## 4. PHP Comparison

| Action | PHP | Node.js (`fs/promises`) |
|--------|-----|---------|
| Read | `file_get_contents($path)` | `await readFile(path, 'utf8')` |
| Write | `file_put_contents($path, $data)` | `await writeFile(path, data)` |
| Append | `file_put_contents($path, $d, FILE_APPEND)`| `await appendFile(path, data)` |
| Delete | `unlink($path)` | `await unlink(path)` |

---

## 5. Key Takeaways
1. **Never use `readFileSync`**: In a web server, using "Sync" versions blocks the entire thread for every user while the disk is spinning.
2. **Handle Errors**: Use `try/catch`. File operations often fail (missing files, permissions, etc.).
3. **Encoding**: Don't forget `'utf8'` if you want text!
4. **Conclusion**: The `fs` module is the foundation for everything—from logging to database storage.
