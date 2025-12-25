# Phase 154: Environment Configuration
## Agent Instructions

**Phase**: 154 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Managing environments: dev, staging, prod
2. Environment files: `.env`, `.env.production`
3. dotenv configuration
4. Typed environment with Zod
5. Config factory pattern
6. Secrets management
7. Environment in Docker
8. CI/CD environment variables
9. Never commit secrets!
10. Laravel comparison: env() helper

## Example
```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']),
    PORT: z.string().transform(Number).default('3000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    REDIS_URL: z.string().url().optional()
});

export const env = envSchema.parse(process.env);

// Usage
import { env } from './config/env';

if (env.NODE_ENV === 'production') {
    // Production-specific code
}
```

## Content Instructions
**Notes**: Environment configuration best practices
**Summary**: Environment setup checklist
