# Phase 073: Custom Middleware — Cheatsheet

## Basic Pattern

```typescript
export const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Do something
    next(); // Continue to next middleware
};
```

## Common Patterns

### Request ID
```typescript
export const addRequestId = (req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
};
```

### Authentication
```typescript
export const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    req.user = await verifyToken(token);
    next();
};
```

### Authorization
```typescript
export const authorize = (...roles: string[]) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
```

### Rate Limiting
```typescript
const store = {};
export const rateLimit = ({ windowMs, max }) => {
    return (req, res, next) => {
        const ip = req.ip;
        // Check and increment count
        if (store[ip]?.count > max) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        next();
    };
};
```

### Async Handler
```typescript
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
```

## Remember

- ✅ Call `next()` to continue
- ✅ Return after `res.send()` to stop
- ✅ Use factory pattern for config
- ✅ Extend Request type for custom props
- ❌ Don't call `next()` after sending response
