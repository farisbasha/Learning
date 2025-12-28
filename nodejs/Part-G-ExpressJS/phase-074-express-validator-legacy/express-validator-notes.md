# Phase 074: Express-Validator (Legacy)

## ⚠️ Important Note

**This is a LEGACY pattern.** For new projects, use **Zod** (Phase 081) instead. Express-validator is covered here for:
- Understanding older codebases
- Migration scenarios
- Historical context

**Modern alternative**: Zod provides type inference, better composability, and single source of truth.

---

## What is Express-Validator?

Express-validator is a middleware-based validation library built on top of `validator.js`. It was the standard validation approach before TypeScript and Zod became popular.

### Installation

```bash
npm install express-validator
```

---

## Basic Usage

### Validation Chain

```typescript
import { body, validationResult } from 'express-validator';

app.post('/users',
    // Validation middleware
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters'),
    body('age').isInt({ min: 18 }).withMessage('Must be 18 or older'),
    
    // Handler
    (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // Validation passed
        const { email, password, age } = req.body;
        // Create user...
    }
);
```

### Validation Methods

```typescript
import { body, param, query, header, cookie } from 'express-validator';

// Body validation
body('email').isEmail()
body('password').isLength({ min: 8 })
body('age').isInt({ min: 18, max: 120 })
body('website').isURL()
body('phone').isMobilePhone('en-US')

// URL parameter validation
param('id').isInt()
param('slug').isSlug()

// Query string validation
query('page').isInt({ min: 1 })
query('limit').isInt({ min: 1, max: 100 })

// Header validation
header('authorization').exists()

// Cookie validation
cookie('sessionId').exists()
```

---

## Common Validators

```typescript
// String validators
.isEmail()
.isURL()
.isUUID()
.isAlpha()              // Only letters
.isAlphanumeric()       // Letters and numbers
.isNumeric()            // Only numbers
.isLength({ min, max })
.matches(/regex/)

// Number validators
.isInt()
.isFloat()
.isDecimal()

// Date validators
.isDate()
.isISO8601()
.isBefore('2024-12-31')
.isAfter('2024-01-01')

// Boolean
.isBoolean()

// Custom
.custom((value) => {
    // Custom validation logic
    if (value !== 'expected') {
        throw new Error('Invalid value');
    }
    return true;
})
```

---

## Sanitization

```typescript
body('email')
    .isEmail()
    .normalizeEmail()           // Lowercase, remove dots in Gmail
    .trim()

body('name')
    .trim()
    .escape()                   // Escape HTML entities

body('age')
    .toInt()                    // Convert to integer

body('price')
    .toFloat()

body('tags')
    .toArray()                  // Convert to array
```

---

## Custom Validators

```typescript
body('email').custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (user) {
        throw new Error('Email already in use');
    }
    return true;
});

body('password').custom((value, { req }) => {
    if (value !== req.body.confirmPassword) {
        throw new Error('Passwords do not match');
    }
    return true;
});
```

---

## Conditional Validation

```typescript
body('companyName').if(body('accountType').equals('business')).notEmpty()

body('vatNumber').if((value, { req }) => {
    return req.body.country === 'EU';
}).isLength({ min: 10 })
```

---

## Error Handling

```typescript
const errors = validationResult(req);

if (!errors.isEmpty()) {
    // Array format
    console.log(errors.array());
    // [
    //   { msg: 'Invalid email', param: 'email', location: 'body' },
    //   { msg: 'Password too short', param: 'password', location: 'body' }
    // ]
    
    // Mapped format
    console.log(errors.mapped());
    // {
    //   email: { msg: 'Invalid email', param: 'email', location: 'body' },
    //   password: { msg: 'Password too short', param: 'password', location: 'body' }
    // }
}
```

---

## Reusable Validation Chains

```typescript
// validators/user.validators.ts
export const createUserValidation = [
    body('email')
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be 8+ characters')
        .matches(/[A-Z]/).withMessage('Must contain uppercase')
        .matches(/[0-9]/).withMessage('Must contain number'),
    
    body('name')
        .trim()
        .isLength({ min: 2 }).withMessage('Name too short')
];

// routes/users.ts
import { createUserValidation } from '../validators/user.validators';

app.post('/users', createUserValidation, handleValidationErrors, createUser);
```

---

## Validation Middleware Helper

```typescript
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    next();
};

// Usage
app.post('/users', 
    createUserValidation,
    handleValidationErrors,  // Reusable error handler
    createUser
);
```

---

## Why NOT Use This (Use Zod Instead)

### Problem 1: No Type Inference

```typescript
// express-validator - types are separate
body('email').isEmail();

interface CreateUserDto {  // Must define separately!
    email: string;
    password: string;
}

// Zod - types inferred automatically
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

type CreateUserDto = z.infer<typeof schema>;  // Automatic!
```

### Problem 2: Verbose Syntax

```typescript
// express-validator - verbose
app.post('/users',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Too short'),
    body('age').isInt({ min: 18 }).withMessage('Must be 18+'),
    handleValidationErrors,
    createUser
);

// Zod - cleaner
const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Too short'),
    age: z.number().int().min(18, 'Must be 18+')
});

app.post('/users', validate(schema), createUser);
```

### Problem 3: Hard to Compose

```typescript
// express-validator - hard to reuse
const emailValidation = body('email').isEmail();
const passwordValidation = body('password').isLength({ min: 8 });

// Zod - easy composition
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

const userSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

const adminSchema = userSchema.extend({
    role: z.enum(['admin', 'superadmin'])
});
```

---

## Migration to Zod

### Before (express-validator)

```typescript
app.post('/users',
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    handleValidationErrors,
    (req, res) => {
        const { email, password } = req.body;  // No type safety!
    }
);
```

### After (Zod)

```typescript
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

type CreateUserDto = z.infer<typeof createUserSchema>;

app.post('/users', validate(createUserSchema), (req, res) => {
    const { email, password } = req.body as CreateUserDto;  // Type safe!
});
```

---

## When You Might Still Use It

1. **Legacy codebase** - Already using it extensively
2. **Quick prototypes** - When types don't matter
3. **Team familiarity** - Team already knows it well

But for **new projects**, strongly prefer Zod.

---

## Key Takeaways

1. **Express-validator is legacy** - Use Zod for new projects
2. **No type inference** - Must define types separately
3. **Middleware-based** - Validation in route definition
4. **Verbose** - More code than Zod
5. **Hard to compose** - Difficult to reuse validators
6. **Still works** - Fine for legacy codebases

**Recommendation**: Skip this for new projects, use Zod (Phase 081) instead.
