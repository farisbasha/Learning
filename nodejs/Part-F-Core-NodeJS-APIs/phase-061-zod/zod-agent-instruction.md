# Phase 061: Zod for Runtime Validation
## Agent Instructions

**Phase**: 061 | **Part**: F - Core Node APIs | **Language**: TypeScript

## Topics
1. Why Zod — runtime + compile-time types
2. Basic schemas: `z.string()`, `z.number()`
3. Object schemas: `z.object({})`
4. Array schemas: `z.array()`
5. Union schemas
6. Type inference: `z.infer<typeof schema>`
7. `parse()` vs `safeParse()`
8. Integration with APIs

## Example
```typescript
import { z } from 'zod';

const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email()
});

type User = z.infer<typeof UserSchema>;
```

## Content Instructions
**Notes**: Zod complete guide
**Summary**: Zod schema patterns
