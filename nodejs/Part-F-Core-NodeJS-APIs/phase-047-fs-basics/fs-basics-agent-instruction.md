# Phase 047: File System Basics
## Agent Instructions

**Phase**: 047 | **Part**: F - Core Node APIs | **Language**: TypeScript

## Topics
1. `fs` module overview
2. `fs/promises` — async API (preferred)
3. Reading files: `readFile()`
4. Writing files: `writeFile()`
5. Appending: `appendFile()`
6. Deleting: `unlink()`
7. Checking existence: `access()`, `stat()`

## Example
```typescript
import { readFile, writeFile } from 'fs/promises';

const content = await readFile('file.txt', 'utf8');
await writeFile('output.txt', content.toUpperCase());
```

## PHP Comparison
| PHP | Node.js |
|-----|---------|
| `file_get_contents()` | `readFile()` |
| `file_put_contents()` | `writeFile()` |

## Content Instructions
**Notes**: fs/promises API with examples
**Summary**: File operations quick reference
