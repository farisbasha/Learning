# Phase 070: Middleware Concept — Cheatsheet

## What is Middleware?

A function that runs between request and response with access to `req`, `res`, and `next`.

```typescript
const middleware = (req: Request, res: Response, next: NextFunction) => {
    // Do something
    next(); // Pass to next middleware
};
```

## Middleware Flow

```
Request → Middleware 1 → Middleware 2 → Handler → Response
              │              │            │
           next()         next()      res.json()
```

## Registration Methods

```typescript
// Global - all requests
app.use(logger);

// Path prefix - only /api/*
app.use('/api', apiMiddleware);

// Route-specific
app.get('/admin', authenticate, handler);

// Router-level
const router = express.Router();
router.use(authenticate);
```

## Middleware Types

| Type | Params | Purpose |
|------|--------|---------|
| Regular | `(req, res, next)` | Normal processing |
| Error | `(err, req, res, next)` | Error handling |

## Common Patterns

### Logging
```typescript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
```

### Authentication
```typescript
const auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No token' });
    }
    req.user = verifyToken(token);
    next();
};
```

### Error Handler
```typescript
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});
```

## Extending Request Type

```typescript
declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
            requestId?: string;
        }
    }
}
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `handle($request, $next)` | `(req, res, next) => {}` |
| `$next($request)` | `next()` |
| Return response | `res.json()` (no `next()`) |
| Kernel.php | `app.use()` |
| Middleware groups | Router + `app.use()` |

## Order Rules

```typescript
// ✅ Correct order
app.use(express.json());    // 1. Parse body
app.use(logger);            // 2. Log request
app.use(authenticate);      // 3. Auth (needs body)
app.get('/users', handler); // 4. Route
app.use(errorHandler);      // 5. Errors (LAST)
```

## Remember

- ✅ Always call `next()` or send response
- ✅ Register body parser BEFORE routes
- ✅ Error handlers have 4 parameters
- ✅ Error handlers go LAST
- ❌ Don't call `next()` after `res.send()`
- ❌ Don't forget `return` before response

## Breaking the Chain

```typescript
const middleware = (req, res, next) => {
    if (unauthorized) {
        return res.status(401).json({}); // Stops here
    }
    next(); // Continue chain
};
```

## Common Errors

| Issue | Cause | Fix |
|-------|-------|-----|
| Request hangs | Missing `next()` | Add `next()` |
| "Headers sent" | `next()` after response | Remove `next()` or add `return` |
| `req.body` undefined | Wrong order | Put `express.json()` before routes |
