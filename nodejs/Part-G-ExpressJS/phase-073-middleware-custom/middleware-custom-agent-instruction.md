# Phase 073: Custom Middleware
## Agent Instructions

**Phase**: 073 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Creating typed middleware functions
2. Middleware factories (configurable middleware)
3. Async middleware patterns
4. Error handling in middleware
5. Authentication middleware
6. Request validation middleware
7. Logging middleware
8. Timing middleware (request duration)
9. Conditional middleware
10. Laravel comparison: Custom middleware creation

## Example
```typescript
// Middleware factory pattern
const authMiddleware = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};

app.get('/admin', authMiddleware('admin'), adminController);
```

## Content Instructions
**Notes**: Creating production-ready custom middleware
**Summary**: Custom middleware patterns
