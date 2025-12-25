# Phase 074: Express-Validator (Legacy Validation)
## Agent Instructions

**Phase**: 074 | **Part**: G - Express.js | **Language**: TypeScript

## Why Learn This (Legacy)
> `express-validator` has been the standard validation library since ~2014.
> You will encounter this in many production codebases.
> Modern alternative: Zod (covered in Phase 081)

## Topics
1. Installing `express-validator`
2. `check()` and `body()` validators
3. Validation chains
4. `validationResult()` — collecting errors
5. Custom validators
6. Sanitizers: `trim()`, `escape()`, `normalizeEmail()`
7. Schema validation
8. Error message customization
9. Integration with routes
10. Comparison: express-validator vs Zod

## Example
```typescript
import { body, validationResult } from 'express-validator';

app.post('/users',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Create user...
    }
);
```

## Content Instructions
**Notes**: Complete express-validator guide with modern comparison
**Summary**: express-validator patterns and migration path
