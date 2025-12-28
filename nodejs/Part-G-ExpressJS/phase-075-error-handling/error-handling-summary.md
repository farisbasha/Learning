# Phase 075: Error Handling — Cheatsheet

## Error Handler Signature

```typescript
import { ErrorRequestHandler } from 'express';

// Must have 4 parameters!
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        error: err.message
    });
};

// Register LAST
app.use(errorHandler);
```

## Triggering Errors

```typescript
// Method 1: next(error)
app.get('/users', (req, res, next) => {
    next(new Error('Something wrong'));
});

// Method 2: throw in sync code
app.get('/users', (req, res) => {
    throw new Error('Sync error');  // Caught by Express
});

// Method 3: try-catch in async
app.get('/users', async (req, res, next) => {
    try {
        await riskyOp();
    } catch (err) {
        next(err);  // Forward to error handler
    }
});
```

## Custom Error Class

```typescript
class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true
    ) {
        super(message);
    }
}

// Specific errors
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
    }
}

class ValidationError extends AppError {
    constructor(message: string, public errors: object = {}) {
        super(422, message);
    }
}

// Usage
throw new NotFoundError('User');
throw new ValidationError('Invalid data', { email: ['Required'] });
```

## Async Handler Wrapper

```typescript
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFn) => 
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);

// Usage
app.get('/users', asyncHandler(async (req, res) => {
    const users = await db.user.findMany();
    res.json(users);  // Errors auto-caught!
}));
```

## Or Use Package

```typescript
import 'express-async-errors';  // One line!

// Async errors now auto-forwarded
app.get('/users', async (req, res) => {
    throw new Error('Caught!');
});
```

## Complete Setup

```typescript
import 'express-async-errors';

// Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Error Handler (LAST!)
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Server Error';
    
    res.status(status).json({
        success: false,
        error: message
    });
});
```

## Common HTTP Error Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Already exists |
| 422 | Unprocessable | Validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Unexpected error |

## PHP → Express

| Laravel | Express |
|---------|---------|
| `Handler.php` | Error middleware |
| `ModelNotFoundException` | `NotFoundError` |
| `ValidationException` | `ValidationError` |
| `abort(404)` | `throw new NotFoundError()` |
| `$exception->render()` | Error handler response |

## Remember

- ✅ Error handlers need 4 params: `(err, req, res, next)`
- ✅ Register error handler LAST
- ✅ Use `express-async-errors` or wrapper
- ✅ Create custom error classes
- ✅ Log errors for debugging
- ❌ Don't expose stack traces in production
- ❌ Don't forget 404 handler
