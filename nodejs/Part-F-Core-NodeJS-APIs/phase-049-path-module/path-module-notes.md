# Phase 049: Path Module — Notes

Never manipulate file paths manually using string concatenation! Because Windows uses backslashes (`\`) and Mac/Linux use forward slashes (`/`), your code will break if you just do `folder + "/" + file`. The `path` module solves this perfectly.

---

## 1. Joining Paths (`path.join`)

The most common method. It combines segments and handles all the slash logic for you.

```typescript
import path from 'path';

// Works on Windows (\) and Mac (/)
const fullPath = path.join('src', 'models', 'User.ts'); 
// Result: 'src/models/User.ts' (on Mac)
```

---

## 2. Resolving to Absolute (`path.resolve`)

Turns a relative path into an **Absolute Path** (starting from the root `/`). This is useful for passing paths to external tools or deep modules.

```typescript
console.log(path.resolve('src/index.ts'));
// Result: /Users/basha/Documents/Learning/nodejs/src/index.ts
```

---

## 3. Extracting Information

| Method | Role | Example for `path/to/file.png` |
|--------|------|---------|
| **`basename`** | Get filename | `file.png` |
| **`dirname`** | Get folder path | `path/to` |
| **`extname`** | Get extension | `.png` |
| **`parse`** | Group everything | `{ root, dir, base, ext, name }` |

```typescript
const info = path.parse('/home/user/notes.txt');
/*
{
  root: '/',
  dir: '/home/user',
  base: 'notes.txt',
  ext: '.txt',
  name: 'notes'
}
*/
```

---

## 4. The ESM `__dirname` Problem

As we saw in Phase 042, `__dirname` doesn't exist in ES Modules. Here is how we reconstruct it using the `path` and `url` modules:

```typescript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can safely do:
const configPath = path.join(__dirname, 'config.json');
```

---

## 5. Key Takeaways
1. **Strings are dangerous**: Hardcoding `/` or `\` is the #1 cause of cross-platform deployment bugs.
2. **`join()` cleans paths**: It automatically removes double slashes (`//`) and handles `./` segments.
3. **`resolve()` is literal**: If you use it on a path starting with `/`, it assumes you are already at the root and stops resolving.
4. **Summary**: The `path` module is the "shield" that protects your file system code from different operating systems.
