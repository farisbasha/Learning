# Phase 062: Environment Variables
## Agent Instructions

**Phase**: 062 | **Part**: F - Core Node APIs | **Language**: TypeScript

## Topics
1. `dotenv` package
2. Typing `process.env`
3. Zod for env validation
4. Type-safe config objects
5. Multiple environments
6. Secrets management basics

## Example
```typescript
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().transform(Number),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production'])
});

export const env = envSchema.parse(process.env);
```

## PHP Comparison
| PHP | Node.js |
|-----|---------|
| `.env` + `$_ENV` | `.env` + `process.env` |
| `env('KEY')` | `process.env.KEY` |

## Content Instructions
**Notes**: Type-safe environment config
**Summary**: Env configuration patterns
