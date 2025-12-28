# Phase 081: Zod Validation (Modern Approach)

## Overview

**Zod is the modern solution for validation in TypeScript Express apps.** Unlike express-validator (legacy), Zod provides:
1. **Single source of truth** — Schema defines both runtime validation AND TypeScript types
2. **Type inference** — TypeScript types automatically derived from schemas
3. **Composable** — Build complex schemas from simple ones
4. **Zero dependencies** — Lightweight and fast

This is the **recommended approach for new projects** in 2024.

---

## The Problem with Legacy Validation

### express-validator (Legacy)

```typescript
// Validation rules separate from types
app.post('/users',
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('age').isInt({ min: 18 }),
    (req, res) => {
        // TypeScript doesn't know req.body shape!
        const { email, password, age } = req.body;  // All 'any'
    }
);

// Must manually define types
interface CreateUserDto {
    email: string;
    password: string;
    age: number;
}
```

**Problems:**
- Validation and types are separate (duplication)
- No type safety on `req.body`
- Verbose syntax
- Hard to compose

---

## Zod: Single Source of Truth

### Installation

```bash
npm install zod
```

### Basic Schema

```typescript
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    age: z.number().int().min(18)
});

// Infer TypeScript type from schema!
type CreateUserDto = z.infer<typeof CreateUserSchema>;
// type CreateUserDto = {
//     email: string;
//     password: string;
//     age: number;
// }
```

**One schema = validation + types!**

---

## Validation Middleware

### Creating Reusable Validator

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

// Usage
app.post('/users', validate(CreateUserSchema), createUser);
```

### Validating Different Parts

```typescript
// Validate body
const validateBody = (schema: z.ZodSchema) => validate('body', schema);

// Validate query
const validateQuery = (schema: z.ZodSchema) => validate('query', schema);

// Validate params
const validateParams = (schema: z.ZodSchema) => validate('params', schema);

// Generic validator
const validate = (location: 'body' | 'query' | 'params', schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[location]);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten()
            });
        }
        
        // Replace with parsed data (transforms applied!)
        req[location] = result.data;
        next();
    };
};
```

---

## Schema Patterns

### Basic Types

```typescript
const schema = z.object({
    // Primitives
    name: z.string(),
    age: z.number(),
    active: z.boolean(),
    
    // With constraints
    email: z.string().email(),
    password: z.string().min(8).max(100),
    username: z.string().regex(/^[a-z0-9_]+$/),
    
    // Numbers
    price: z.number().positive(),
    quantity: z.number().int().min(1),
    rating: z.number().min(1).max(5),
    
    // Dates
    birthdate: z.string().datetime(),  // ISO 8601
    createdAt: z.date(),
});
```

### Optional and Nullable

```typescript
const schema = z.object({
    // Optional (can be undefined)
    middleName: z.string().optional(),
    
    // Nullable (can be null)
    deletedAt: z.string().nullable(),
    
    // Both
    notes: z.string().optional().nullable(),
    
    // With default
    role: z.string().default('user'),
    status: z.enum(['active', 'inactive']).default('active')
});
```

### Arrays

```typescript
const schema = z.object({
    // Array of strings
    tags: z.array(z.string()),
    
    // With constraints
    tags: z.array(z.string()).min(1).max(5),
    
    // Array of objects
    items: z.array(z.object({
        id: z.string(),
        quantity: z.number()
    })),
    
    // Non-empty array
    categories: z.array(z.string()).nonempty()
});
```

### Enums

```typescript
const schema = z.object({
    // String enum
    role: z.enum(['admin', 'user', 'guest']),
    
    // Native enum
    status: z.nativeEnum(UserStatus),
    
    // Union (similar to enum)
    type: z.union([
        z.literal('email'),
        z.literal('sms'),
        z.literal('push')
    ])
});
```

### Nested Objects

```typescript
const AddressSchema = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/)
});

const UserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    address: AddressSchema,  // Nested schema
    
    // Or inline
    settings: z.object({
        notifications: z.boolean(),
        theme: z.enum(['light', 'dark'])
    })
});
```

---

## Transformations

### Transform Data During Validation

```typescript
const schema = z.object({
    // Trim whitespace
    email: z.string().email().trim().toLowerCase(),
    
    // Parse string to number
    age: z.string().transform(val => parseInt(val, 10)),
    
    // Parse date string
    birthdate: z.string().transform(val => new Date(val)),
    
    // Custom transformation
    tags: z.string().transform(val => val.split(',').map(t => t.trim()))
});

// Input:  { email: "  USER@TEST.COM  ", age: "25", tags: "a, b, c" }
// Output: { email: "user@test.com", age: 25, tags: ["a", "b", "c"] }
```

### Preprocessing

```typescript
const schema = z.preprocess(
    // Preprocess function
    (val) => {
        if (typeof val === 'string') {
            return val.trim();
        }
        return val;
    },
    // Then validate
    z.string().min(1)
);
```

---

## Custom Validation

### Refinements

```typescript
const schema = z.object({
    password: z.string().min(8),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']  // Error path
});

// Multiple refinements
const schema = z.object({
    age: z.number()
}).refine(data => data.age >= 18, {
    message: 'Must be 18 or older'
}).refine(data => data.age <= 120, {
    message: 'Invalid age'
});
```

### Custom Error Messages

```typescript
const schema = z.object({
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string"
    }).email("Invalid email format"),
    
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[0-9]/, "Password must contain a number")
});
```

---

## Complete Express Integration

### Request Schema Pattern

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2)
    })
});

export const UpdateUserSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        email: z.string().email().optional(),
        name: z.string().min(2).optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided"
    })
});

export const GetUserSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});

export const ListUsersSchema = z.object({
    query: z.object({
        page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
        limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
        search: z.string().optional()
    })
});

// Type inference
export type CreateUserDto = z.infer<typeof CreateUserSchema>['body'];
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>['body'];
```

### Validation Middleware

```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            
            // Replace with validated data
            req.body = validated.body;
            req.query = validated.query;
            req.params = validated.params;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
```

### Route Usage

```typescript
// routes/users.ts
import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
    CreateUserSchema,
    UpdateUserSchema,
    GetUserSchema,
    ListUsersSchema
} from '../schemas/user.schema';
import { UserController } from '../controllers/UserController';

const router = Router();
const controller = new UserController();

router.get('/', validate(ListUsersSchema), controller.list);
router.get('/:id', validate(GetUserSchema), controller.show);
router.post('/', validate(CreateUserSchema), controller.create);
router.put('/:id', validate(UpdateUserSchema), controller.update);

export default router;
```

### Type-Safe Controller

```typescript
// controllers/UserController.ts
import { Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto } from '../schemas/user.schema';

export class UserController {
    async create(req: Request, res: Response) {
        // req.body is typed as CreateUserDto!
        const { email, password, name } = req.body as CreateUserDto;
        
        const user = await prisma.user.create({
            data: { email, password, name }
        });
        
        res.status(201).json({ success: true, data: user });
    }
    
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body as UpdateUserDto;
        
        const user = await prisma.user.update({
            where: { id },
            data
        });
        
        res.json({ success: true, data: user });
    }
}
```

---

## Error Formatting

### Flat Errors

```typescript
const result = schema.safeParse(data);

if (!result.success) {
    const formatted = result.error.flatten();
    // {
    //   formErrors: [],
    //   fieldErrors: {
    //     email: ['Invalid email'],
    //     password: ['String must contain at least 8 characters']
    //   }
    // }
}
```

### Custom Format

```typescript
const formatZodError = (error: ZodError) => {
    return error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        if (!acc[path]) {
            acc[path] = [];
        }
        acc[path].push(err.message);
        return acc;
    }, {} as Record<string, string[]>);
};

// Result: { 'email': ['Invalid email'], 'password': ['Too short'] }
```

---

## Comparison: Zod vs express-validator

| Aspect | Zod | express-validator |
|--------|-----|-------------------|
| Type inference | ✅ Automatic | ❌ Manual |
| Composability | ✅ Excellent | ⚠️ Limited |
| Transformations | ✅ Built-in | ❌ Manual |
| Bundle size | ✅ Small | ⚠️ Larger |
| Learning curve | ✅ Simple | ⚠️ Steeper |
| Ecosystem | ✅ Growing | ✅ Mature |
| **Recommendation** | **Use for new projects** | Legacy only |

---

## Key Takeaways

1. **Zod is the modern standard** — Single source for validation + types
2. **Type inference is powerful** — `z.infer<typeof schema>`
3. **Validate all inputs** — body, query, params
4. **Use transformations** — Clean data during validation
5. **Custom error messages** — Better UX
6. **Compose schemas** — Build complex from simple
7. **Replace express-validator** — In new projects
