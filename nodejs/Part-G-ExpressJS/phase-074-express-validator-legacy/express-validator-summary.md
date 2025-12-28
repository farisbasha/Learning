# Phase 074: Express-Validator — Cheatsheet

## ⚠️ LEGACY - Use Zod Instead!

## Basic Usage

```typescript
import { body, validationResult } from 'express-validator';

app.post('/users',
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Process...
    }
);
```

## Common Validators

```typescript
body('email').isEmail()
body('age').isInt({ min: 18 })
body('website').isURL()
body('name').isLength({ min: 2, max: 50 })
body('password').matches(/[A-Z]/)
```

## Why NOT Use This

| Issue | express-validator | Zod |
|-------|-------------------|-----|
| Type inference | ❌ Manual | ✅ Automatic |
| Verbosity | ❌ Verbose | ✅ Concise |
| Composability | ❌ Hard | ✅ Easy |
| Single source | ❌ No | ✅ Yes |

## Use Zod Instead

```typescript
// Zod (Modern)
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

type UserDto = z.infer<typeof schema>;  // Auto-typed!
```

**Recommendation**: See Phase 081 for Zod.
