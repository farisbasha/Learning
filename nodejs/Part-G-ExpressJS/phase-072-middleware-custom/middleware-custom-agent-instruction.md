# Phase 072: Custom Middleware
## Agent Instructions

**Phase**: 072 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Writing typed middleware
2. Auth middleware with user type
3. Logging middleware
4. Async middleware
5. Error in middleware

## Example
```typescript
import { RequestHandler } from 'express';

const authMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
```

## Content Instructions
**Notes**: Custom middleware patterns
**Summary**: Middleware template patterns
