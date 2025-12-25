# Phase 040: ES Modules
## Agent Instructions

**Phase**: 040 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. `import { foo } from './module'` — named import
2. `import foo from './module'` — default import
3. `export const foo = bar` — named export
4. `export default foo` — default export
5. `export { foo as bar }` — re-exporting
6. `package.json` `"type": "module"`
7. TypeScript with ES Modules

## Examples
```typescript
// user.ts
export interface User {
    id: number;
    name: string;
}

export const createUser = (name: string): User => ({
    id: Date.now(),
    name
});

export default class UserService { }

// app.ts
import UserService, { User, createUser } from './user';
```

## PHP Comparison
| PHP | ES Modules |
|-----|------------|
| `use App\Models\User;` | `import { User } from './user'` |
| `namespace App\Models;` | `export` from file |

## Content Instructions
**Notes**: Modern ES modules with TypeScript
**Summary**: import/export syntax reference
