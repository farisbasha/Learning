# Phase 081: Zod Validation — Cheatsheet

## Why Zod?

✅ Single source of truth (validation + types)
✅ Type inference
✅ Composable schemas
✅ Transformations built-in
✅ Modern, lightweight

## Installation

```bash
npm install zod
```

## Basic Schema

```typescript
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    age: z.number().int().min(18)
});

// Infer type
type User = z.infer<typeof schema>;
```

## Common Validations

```typescript
// String
z.string()
z.string().email()
z.string().url()
z.string().uuid()
z.string().min(5).max(100)
z.string().regex(/^[a-z]+$/)
z.string().trim().toLowerCase()

// Number
z.number()
z.number().int()
z.number().positive()
z.number().min(0).max(100)

// Boolean
z.boolean()

// Date
z.date()
z.string().datetime()  // ISO string

// Enum
z.enum(['admin', 'user'])
z.nativeEnum(MyEnum)

// Array
z.array(z.string())
z.array(z.string()).min(1).max(10)

// Optional/Nullable
z.string().optional()
z.string().nullable()
z.string().default('default')
```

## Validation Middleware

```typescript
import { z, ZodError } from 'zod';

const validate = (schema: z.ZodSchema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    errors: error.errors
                });
            }
            next(error);
        }
    };
};

// Usage
app.post('/users', validate(CreateUserSchema), handler);
```

## Request Schema Pattern

```typescript
// Validate body, query, params together
const schema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        name: z.string()
    }),
    query: z.object({
        page: z.string().transform(Number)
    })
});

// In middleware
const validated = schema.parse({
    params: req.params,
    body: req.body,
    query: req.query
});
```

## Transformations

```typescript
const schema = z.object({
    // Trim and lowercase
    email: z.string().trim().toLowerCase(),
    
    // String to number
    age: z.string().transform(Number),
    
    // Split string to array
    tags: z.string().transform(s => s.split(','))
});
```

## Custom Validation

```typescript
const schema = z.object({
    password: z.string(),
    confirm: z.string()
}).refine(data => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm']
});
```

## Complete Example

```typescript
// schemas/user.schema.ts
export const CreateUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2)
    })
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>['body'];

// routes/users.ts
import { validate } from '../middleware/validate';
import { CreateUserSchema } from '../schemas/user.schema';

router.post('/', validate(CreateUserSchema), controller.create);

// controller
async create(req: Request, res: Response) {
    const data = req.body as CreateUserDto;  // Typed!
    // ...
}
```

## Error Formatting

```typescript
const result = schema.safeParse(data);

if (!result.success) {
    // Flat format
    const errors = result.error.flatten();
    
    // Custom format
    const formatted = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
    }));
}
```

## Zod vs express-validator

| Feature | Zod | express-validator |
|---------|-----|-------------------|
| Type inference | ✅ | ❌ |
| Single source | ✅ | ❌ |
| Transformations | ✅ | ❌ |
| Modern | ✅ | ⚠️ Legacy |

## Remember

- ✅ Use `z.infer<typeof schema>` for types
- ✅ Validate body, query, AND params
- ✅ Use transformations for data cleaning
- ✅ safeParse() for error handling
- ✅ Compose schemas for reusability
- ❌ Don't use express-validator in new projects
