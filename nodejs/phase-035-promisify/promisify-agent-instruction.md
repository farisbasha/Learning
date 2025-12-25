# Phase 035: Converting Callbacks to Promises
## Agent Instructions

**Phase**: 035 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. `util.promisify()` — built-in converter
2. Manual promisification pattern
3. `fs.promises` API — already promisified
4. Wrapping third-party callback libraries
5. Typing promisified functions
6. Legacy codebase migration strategies

## Examples
```typescript
import { promisify } from 'util';
import { readFile } from 'fs';
import { readFile as readFileAsync } from 'fs/promises';

// Using promisify
const readFilePromise = promisify(readFile);

// Or use fs/promises directly
const data = await readFileAsync('file.txt', 'utf8');
```

## Content Instructions
**Notes**: Migration from callbacks to Promises
**Summary**: Promisification patterns
