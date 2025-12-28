# Phase 075: Error Handling

## Overview

Error handling is one of the most important aspects of building robust Express applications. Express has a specific pattern for error handling using **4-parameter middleware functions**. Mastering this pattern is essential for production applications.

---

## The Problem: Unhandled Errors

### Without Proper Error Handling

```typescript
app.get('/users/:id', async (req, res) => {
    const user = await db.user.findUnique({ where: { id: req.params.id } });
    res.json(user);  // What if db throws an error?
});

// If database fails:
// - Request hangs forever
// - Server might crash
// - No useful error to client
// - No logging for debugging
```

### The JavaScript Problem

```typescript
// Synchronous errors are caught
app.get('/sync', (req, res) => {
    throw new Error('Sync error');  // Express catches this
});

// BUT async errors are NOT caught by default!
app.get('/async', async (req, res) => {
    throw new Error('Async error');  // Server crashes!
});
```

---

## Error Handling Middleware

### The 4-Parameter Signature

Express identifies error handlers by the **number of parameters**:

```typescript
import { ErrorRequestHandler } from 'express';

// Regular middleware: 3 parameters
const normalMiddleware = (req, res, next) => { };

// Error middleware: 4 parameters (err first!)
const errorMiddleware = (err, req, res, next) => { };

// Typed version
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
};
```

### Registering Error Handlers

```typescript
// Error handlers must be registered LAST
app.use(express.json());
app.use('/api', apiRoutes);
app.use(notFoundHandler);     // 404 handler
app.use(errorHandler);        // Error handler - LAST!
```

---

## How Error Flow Works

### Triggering Errors

```typescript
// Method 1: Call next(error)
app.get('/users/:id', (req, res, next) => {
    const error = new Error('User not found');
    next(error);  // Jumps to error handler
});

// Method 2: Throw in sync code
app.get('/sync', (req, res) => {
    throw new Error('Sync error');  // Express catches this
});

// Method 3: Wrap async errors
app.get('/async', async (req, res, next) => {
    try {
        const data = await riskyOperation();
        res.json(data);
    } catch (err) {
        next(err);  // Pass to error handler
    }
});
```

### Error Flow Diagram

```
Route Handler
     │
     ├──► Success: res.json()
     │
     └──► Error: next(err)
              │
              ▼
     Error Handler 1
              │
              ├──► Handle and respond
              │
              └──► next(err) → Error Handler 2
                                    │
                                    ▼
                              (chain continues)
```

---

## Custom Error Classes

### Basic Custom Error

```typescript
class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Usage
throw new AppError(404, 'User not found');
throw new AppError(400, 'Invalid input');
throw new AppError(401, 'Unauthorized');
```

### Specific Error Types

```typescript
class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(404, `${resource} not found`);
    }
}

class ValidationError extends AppError {
    constructor(
        message: string,
        public errors: Record<string, string[]> = {}
    ) {
        super(422, message);
    }
}

class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
    }
}

class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(403, message);
    }
}

// Usage
throw new NotFoundError('User');
throw new ValidationError('Validation failed', {
    email: ['Email is required'],
    password: ['Password must be at least 8 characters']
});
```

---

## Centralized Error Handler

### Production-Ready Handler

```typescript
import { ErrorRequestHandler } from 'express';

interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: unknown;
    };
    stack?: string;
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // Log the error
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
    
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: unknown = undefined;
    
    // Handle known error types
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        if (err instanceof ValidationError) {
            details = err.errors;
        }
    }
    
    // Handle Prisma errors
    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Resource not found';
    }
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'Resource already exists';
    }
    
    // Handle JSON parse errors
    if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON';
    }
    
    // Build response
    const response: ErrorResponse = {
        success: false,
        error: {
            message,
            details
        }
    };
    
    // Include stack in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    
    res.status(statusCode).json(response);
};

export default errorHandler;
```

---

## Async Error Handling

### The Problem with Async

```typescript
// Express 4 doesn't catch async errors!
app.get('/users', async (req, res) => {
    const users = await db.user.findMany();  // If this throws...
    res.json(users);  // ...server crashes!
});
```

### Solution 1: Try-Catch Wrapper

```typescript
// Wrap each async handler
app.get('/users', async (req, res, next) => {
    try {
        const users = await db.user.findMany();
        res.json(users);
    } catch (err) {
        next(err);
    }
});
```

### Solution 2: Async Wrapper Function

```typescript
// Create a wrapper
type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Usage - clean and simple
app.get('/users', asyncHandler(async (req, res) => {
    const users = await db.user.findMany();
    res.json(users);  // Errors auto-forwarded!
}));
```

### Solution 3: express-async-errors Package

```typescript
// Install: npm install express-async-errors
import 'express-async-errors';  // Import once at top

// Now async errors are auto-caught!
app.get('/users', async (req, res) => {
    const users = await db.user.findMany();  // Errors forwarded!
    res.json(users);
});
```

---

## 404 Not Found Handler

### As Middleware (After Routes)

```typescript
// Must be after all routes but before error handler
app.use('/api', apiRoutes);

// 404 handler - catches unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Cannot ${req.method} ${req.path}`
        }
    });
});

// Error handler - last
app.use(errorHandler);
```

### Alternative: Throw NotFoundError

```typescript
app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path}`));
});
```

---

## Development vs Production Errors

### Environment-Based Responses

```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Development: full details
    if (isDev) {
        return res.status(err.statusCode || 500).json({
            success: false,
            error: err.message,
            stack: err.stack,
            details: err
        });
    }
    
    // Production: minimal info for non-operational errors
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    
    // Unknown errors in production
    console.error('UNEXPECTED ERROR:', err);
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
    });
};
```

---

## Error Logging

### Console Logging (Development)

```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('─'.repeat(50));
    console.error(`[${new Date().toISOString()}]`);
    console.error(`${req.method} ${req.originalUrl}`);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('─'.repeat(50));
    
    // ... rest of handler
};
```

### Structured Logging (Production)

```typescript
import winston from 'winston';

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log' })
    ]
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        user: req.user?.id,
        timestamp: new Date().toISOString()
    });
    
    // ... rest of handler
};
```

---

## PHP/Laravel Comparison

### Laravel Exception Handling

```php
// app/Exceptions/Handler.php
class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($exception instanceof ModelNotFoundException) {
            return response()->json([
                'error' => 'Resource not found'
            ], 404);
        }
        
        return parent::render($request, $exception);
    }
}

// Custom exception
class UserNotFoundException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'error' => $this->getMessage()
        ], 404);
    }
}
```

### Express Equivalent

```typescript
// middleware/errorHandler.ts
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof NotFoundError) {
        return res.status(404).json({
            error: err.message
        });
    }
    
    // Default error response
    res.status(500).json({ error: 'Server error' });
};

// Custom error class
class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message);
    }
}
```

---

## Complete Setup Example

```typescript
// errors/AppError.ts
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true
    ) {
        super(message);
    }
}

// errors/index.ts
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public errors: object = {}) {
        super(422, message);
    }
}

// middleware/asyncHandler.ts
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export const asyncHandler = (fn: AsyncFn) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);

// middleware/errorHandler.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// app.ts
import 'express-async-errors';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './errors';

app.use(express.json());
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Error handler (LAST)
app.use(errorHandler);
```

---

## Key Takeaways

1. **Error handlers have 4 parameters** — `(err, req, res, next)`
2. **Register error handlers LAST** — After all routes
3. **Use custom error classes** — `AppError` with `statusCode`
4. **Handle async errors** — Use wrapper or `express-async-errors`
5. **Differentiate dev vs prod** — Show stack in dev only
6. **Log errors properly** — Use structured logging in production
7. **Operational vs programmer errors** — Handle differently
