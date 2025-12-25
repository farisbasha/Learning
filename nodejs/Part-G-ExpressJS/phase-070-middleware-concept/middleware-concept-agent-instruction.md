# Phase 070: Middleware Concept
## Agent Instructions

**Phase**: 070 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. What is middleware — the core of Express
2. Middleware function signature: `(req, res, next) => void`
3. `RequestHandler` type
4. `NextFunction` — passing control
5. The middleware stack/chain
6. Order matters! (execution sequence)
7. Application-level vs Router-level middleware
8. `app.use()` for middleware registration
9. Modifying `req` and `res` in middleware
10. Breaking the chain (not calling next)
11. Laravel comparison: Middleware concept is similar

## Example
```typescript
import { Request, Response, NextFunction } from 'express';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next(); // Pass to next middleware
};

app.use(loggerMiddleware);
```

## Content Instructions
**Notes**: Complete middleware concept with execution flow
**Summary**: Middleware patterns cheatsheet
