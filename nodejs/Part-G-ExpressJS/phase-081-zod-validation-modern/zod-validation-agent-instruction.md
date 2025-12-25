# Phase 081: Zod Validation (Modern)
## Agent Instructions

**Phase**: 081 | **Part**: G - Express.js | **Language**: TypeScript

## Why This is Modern
> Zod provides BOTH runtime validation AND TypeScript types from a single source.
> This is the recommended approach for new projects.

## Topics
1. Why Zod for Express — single source of truth
2. Creating request body schemas
3. Creating query/params schemas
4. Type inference with `z.infer<typeof schema>`
5. Creating validation middleware
6. Error formatting for API responses
7. Transformations and defaults
8. Custom error messages
9. Comparison: Zod vs express-validator
10. Integration with OpenAPI/Swagger

## Example
```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const CreateUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2)
    })
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({ body: req.body });
        if (!result.success) {
            return res.status(400).json({ errors: result.error.flatten() });
        }
        next();
    };
};

app.post('/users', validate(CreateUserSchema), createUser);
```

## Content Instructions
**Notes**: Complete Zod integration for Express APIs
**Summary**: Zod validation patterns
