# Phase 070: Middleware Concept — The Core of Express

## Overview

**Middleware is THE fundamental concept in Express.** If you understand middleware, you understand Express. Everything in Express — routing, authentication, logging, error handling, body parsing — is middleware.

A middleware is simply a function that has access to:
- The **request** object (`req`)
- The **response** object (`res`)
- The **next** function to pass control

---

## The Problem Middleware Solves

### Without Middleware (Repetitive Code)

```typescript
app.get('/users', (req, res) => {
    // Log request
    console.log(`${new Date().toISOString()} GET /users`);
    
    // Check authentication
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Actual logic
    res.json({ users: [] });
});

app.get('/posts', (req, res) => {
    // Same logging - repeated!
    console.log(`${new Date().toISOString()} GET /posts`);
    
    // Same auth check - repeated!
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Actual logic
    res.json({ posts: [] });
});
```

### With Middleware (DRY)

```typescript
// Define once
const logger = (req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
};

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Apply globally
app.use(logger);
app.use(authenticate);

// Clean routes!
app.get('/users', (req, res) => {
    res.json({ users: [] });
});

app.get('/posts', (req, res) => {
    res.json({ posts: [] });
});
```

---

## How Middleware Works Internally

### The Middleware Stack

Express maintains an internal array of middleware functions:

```typescript
// When you do:
app.use(logger);
app.use(authenticate);
app.get('/users', getUsers);

// Express creates a stack like:
[
    { path: '/', handler: logger },
    { path: '/', handler: authenticate },
    { path: '/users', method: 'GET', handler: getUsers }
]
```

### The Execution Flow

When a request comes in:

```
Client Request
      │
      ▼
┌─────────────────┐
│     logger      │ ──► console.log() ──► next()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   authenticate  │ ──► check token ──► next() (or res.send)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    getUsers     │ ──► res.json()
└────────┬────────┘
         │
         ▼
    Response sent
```

### The `next()` Function

`next()` is the magic that connects middleware:

```typescript
const middleware1 = (req, res, next) => {
    console.log('Middleware 1 - before');
    next();  // <-- Calls the next middleware
    console.log('Middleware 1 - after');  // This runs after next() returns!
};

const middleware2 = (req, res, next) => {
    console.log('Middleware 2 - before');
    next();
    console.log('Middleware 2 - after');
};

const handler = (req, res) => {
    console.log('Handler');
    res.send('Done');
};

app.get('/test', middleware1, middleware2, handler);

// Request: GET /test
// Output:
// Middleware 1 - before
// Middleware 2 - before
// Handler
// Middleware 2 - after
// Middleware 1 - after
```

This is like a **call stack** — each `next()` pushes, response pops back up.

---

## Middleware Function Signature

### Basic Signature

```typescript
import { Request, Response, NextFunction } from 'express';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
```

### Using RequestHandler Type

```typescript
import { RequestHandler } from 'express';

const logger: RequestHandler = (req, res, next) => {
    console.log(req.path);
    next();
};
```

### Typed Middleware

```typescript
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const authenticate: RequestHandler = (req: AuthenticatedRequest, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }
    
    try {
        const user = verifyToken(token);
        req.user = user;  // Attach to request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

---

## Registering Middleware

### Application-Level Middleware

```typescript
// Runs for ALL requests
app.use(logger);

// Runs for paths starting with /api
app.use('/api', apiMiddleware);

// Specific method + path
app.use('/admin', authenticate, authorizeAdmin);
```

### Router-Level Middleware

```typescript
const userRouter = express.Router();

// Applies to all routes in this router
userRouter.use(authenticate);

userRouter.get('/', getUsers);
userRouter.get('/:id', getUser);

app.use('/users', userRouter);
```

### Route-Specific Middleware

```typescript
// Only for this route
app.get('/admin', authenticate, authorizeAdmin, adminDashboard);

// Array syntax
app.get('/admin', [authenticate, authorizeAdmin], adminDashboard);
```

---

## Middleware Execution Order

### General Rule: First defined = First executed

```typescript
app.use(middleware1);  // Runs first
app.use(middleware2);  // Runs second
app.use(middleware3);  // Runs third

app.get('/test', handler);  // Runs last
```

### Path-Specific Ordering

```typescript
app.use(globalLogger);           // 1. All requests
app.use('/api', apiLogger);      // 2. Only /api/* requests
app.get('/api/users', getUsers); // 3. Only GET /api/users
```

### Common Mistake: Wrong Order

```typescript
// ❌ Wrong - route defined before body parser
app.post('/users', createUser);  // req.body undefined!
app.use(express.json());

// ✅ Correct - body parser before routes
app.use(express.json());
app.post('/users', createUser);  // req.body works!
```

---

## Modifying Request and Response

### Adding Properties to `req`

```typescript
// Extend Request type
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; email: string };
            requestId?: string;
        }
    }
}

// Add request ID middleware
const addRequestId: RequestHandler = (req, res, next) => {
    req.requestId = crypto.randomUUID();
    next();
};

// Add user middleware
const attachUser: RequestHandler = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        req.user = await verifyAndGetUser(token);
    }
    next();
};

// Now accessible in routes
app.get('/profile', (req, res) => {
    res.json({ user: req.user, requestId: req.requestId });
});
```

### Adding Properties to `res.locals`

```typescript
// res.locals is designed for request-scoped data
app.use((req, res, next) => {
    res.locals.startTime = Date.now();
    next();
});

app.use((req, res, next) => {
    // Access in any subsequent middleware
    const startTime = res.locals.startTime;
    
    res.on('finish', () => {
        console.log(`Request took ${Date.now() - startTime}ms`);
    });
    
    next();
});
```

---

## Breaking the Chain

### Stopping Middleware Execution

Don't call `next()` to stop the chain:

```typescript
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        // Stop here - don't call next()
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Continue if authenticated
    next();
};
```

### Early Return Pattern

```typescript
const validateInput = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password too short' });
    }
    
    // All validations passed
    next();
};
```

---

## Error Handling Middleware

### Passing Errors

```typescript
const riskyOperation = async (req, res, next) => {
    try {
        const data = await someAsyncOp();
        req.data = data;
        next();
    } catch (err) {
        next(err);  // Pass error to error handler
    }
};
```

### Error Handler Signature

Error handlers have **4 parameters**:

```typescript
import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
};

// Must be registered LAST
app.use(errorHandler);
```

---

## PHP/Laravel Comparison

### Laravel Middleware

```php
// app/Http/Middleware/Authenticate.php
class Authenticate
{
    public function handle($request, Closure $next)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        return $next($request);  // Equivalent to next()
    }
}

// Register in Kernel.php
protected $middleware = [
    \App\Http\Middleware\Authenticate::class,
];

// Or route-specific
Route::get('/profile', [ProfileController::class, 'index'])
    ->middleware('auth');
```

### Express Middleware

```typescript
// middleware/authenticate.ts
const authenticate: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthenticated' });
    }
    next();  // Same concept as $next($request)
};

// Register globally
app.use(authenticate);

// Or route-specific
app.get('/profile', authenticate, profileController.index);
```

### Key Differences

| Aspect | Laravel | Express |
|--------|---------|---------|
| Definition | Class with `handle` method | Function with `(req, res, next)` |
| Registration | `Kernel.php` | `app.use()` |
| Continue chain | `$next($request)` | `next()` |
| Stop chain | Return response | Don't call `next()` |
| Error handling | Exception handlers | Error middleware (4 params) |
| Middleware groups | `$middlewareGroups` | Router-level middleware |

---

## Common Middleware Patterns

### Logging

```typescript
const requestLogger: RequestHandler = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};
```

### Rate Limiting (Simple)

```typescript
const requests = new Map<string, number[]>();

const rateLimit: RequestHandler = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100;
    
    const timestamps = requests.get(ip) || [];
    const recent = timestamps.filter(t => t > now - windowMs);
    
    if (recent.length >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    
    recent.push(now);
    requests.set(ip, recent);
    next();
};
```

### CORS (Simple)

```typescript
const cors: RequestHandler = (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
};
```

---

## Common Mistakes

### 1. Forgetting to Call `next()`

```typescript
// ❌ Request hangs forever!
app.use((req, res, next) => {
    console.log('Logging...');
    // Forgot next()!
});

// ✅ Always call next() or send response
app.use((req, res, next) => {
    console.log('Logging...');
    next();
});
```

### 2. Calling `next()` After Response

```typescript
// ❌ Error: Can't set headers after sent
app.use((req, res, next) => {
    res.json({ data: 'hello' });
    next();  // Don't do this!
});

// ✅ Either respond OR next(), not both
app.use((req, res, next) => {
    if (someCondition) {
        return res.json({ data: 'hello' });
    }
    next();
});
```

### 3. Wrong Middleware Order

```typescript
// ❌ Auth check will use express.json() result!
app.use(authenticate);    // req.body undefined here
app.use(express.json());

// ✅ Body parser must come first
app.use(express.json());  // Parse body first
app.use(authenticate);    // Now can check body
```

---

## Key Takeaways

1. **Middleware is Express's core pattern** — Everything is middleware
2. **Signature: `(req, res, next)`** — Or `(err, req, res, next)` for errors
3. **`next()` passes control** — Don't call it after sending response
4. **Order matters** — First defined = first executed
5. **Can modify `req` and `res`** — Attach data for downstream middleware
6. **Breaking chain** — Don't call `next()` to stop
7. **Error handlers have 4 params** — `(err, req, res, next)`
8. **Use `app.use()` for registration** — Optionally with path prefix
