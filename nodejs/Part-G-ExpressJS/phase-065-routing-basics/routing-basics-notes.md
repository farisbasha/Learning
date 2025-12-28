# Phase 065: Express Routing Basics

## Overview

Routing determines how your application responds to client requests at specific endpoints. Each route consists of:
1. **HTTP Method** — GET, POST, PUT, DELETE, etc.
2. **Path** — URL pattern like `/users` or `/users/:id`
3. **Handler(s)** — Functions that process the request

Understanding routing deeply is essential because **every request to your API goes through the routing layer**.

---

## How Express Routing Works Internally

### The Route Stack

When you define routes, Express adds them to an internal **route stack**:

```typescript
app.get('/users', handler1);
app.post('/users', handler2);
app.get('/users/:id', handler3);

// Internally creates a stack like:
[
    { method: 'GET',  path: '/users',     handlers: [handler1] },
    { method: 'POST', path: '/users',     handlers: [handler2] },
    { method: 'GET',  path: '/users/:id', handlers: [handler3] }
]
```

### Route Matching Process

When a request comes in, Express:
1. Starts at the top of the route stack
2. Checks each route for **method match** AND **path match**
3. Executes the first matching route's handlers
4. Stops unless `next()` is called

```typescript
// Request: GET /users

app.get('/products', handler1);  // Skip - path doesn't match
app.post('/users', handler2);    // Skip - method doesn't match
app.get('/users', handler3);     // MATCH! Execute handler3
app.get('/users', handler4);     // Not reached (unless next() called)
```

> **Important**: Route order matters! First match wins.

---

## Route Methods

### Basic HTTP Methods

```typescript
// GET - Retrieve resource(s)
app.get('/users', (req, res) => {
    res.json({ users: [] });
});

// POST - Create new resource
app.post('/users', (req, res) => {
    res.status(201).json({ id: 1 });
});

// PUT - Replace entire resource
app.put('/users/:id', (req, res) => {
    res.json({ replaced: true });
});

// PATCH - Partially update resource
app.patch('/users/:id', (req, res) => {
    res.json({ patched: true });
});

// DELETE - Remove resource
app.delete('/users/:id', (req, res) => {
    res.status(204).send();
});
```

### Less Common Methods

```typescript
// OPTIONS - Used for CORS preflight
app.options('/users', (req, res) => {
    res.set('Allow', 'GET, POST, OPTIONS');
    res.status(204).send();
});

// HEAD - Like GET but no response body
app.head('/users', (req, res) => {
    res.set('X-Total-Count', '100');
    res.status(200).send();
});
```

### All Methods

```typescript
// Matches ANY HTTP method
app.all('/api/*', (req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next(); // Continue to actual route handler
});
```

---

## Route Paths

### String Paths

```typescript
// Exact match
app.get('/about', handler);        // Matches: /about
                                   // No match: /about/, /about/us

// With trailing slash handling
app.get('/about/', handler);       // Matches: /about/
                                   // By default, /about != /about/
```

### Pattern Matching

```typescript
// ? - Optional character
app.get('/colou?r', handler);      // Matches: /color, /colour

// + - One or more of previous
app.get('/ab+c', handler);         // Matches: /abc, /abbc, /abbbc

// * - Wildcard (any characters)
app.get('/users/*', handler);      // Matches: /users/anything

// () - Grouping
app.get('/user(s)?', handler);     // Matches: /user, /users
```

### Regular Expression Paths

```typescript
// Match paths containing 'fly'
app.get(/fly/, handler);           // Matches: /butterfly, /dragonfly

// Match specific pattern
app.get(/^\/users\/\d+$/, handler); // Matches: /users/123, /users/456
                                    // No match: /users/abc
```

---

## Route Handler Signature

### Basic Handler

```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Standard handler
const getUsers = (req: Request, res: Response) => {
    res.json({ users: [] });
};

// Handler with next (for middleware pattern)
const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
};
```

### Using RequestHandler Type

```typescript
import { RequestHandler } from 'express';

// Type-safe handler
const getUser: RequestHandler<{ id: string }> = (req, res) => {
    const userId = req.params.id; // TypeScript knows this is string
    res.json({ id: userId });
};

// With body type
interface CreateUserBody {
    email: string;
    name: string;
}

const createUser: RequestHandler<{}, {}, CreateUserBody> = (req, res) => {
    const { email, name } = req.body; // Typed!
    res.status(201).json({ email, name });
};
```

---

## Multiple Handlers Per Route

### Why Use Multiple Handlers?

Separate concerns:
1. Authentication
2. Authorization
3. Validation
4. Actual logic

### Sequential Handlers

```typescript
// Authentication middleware
const authenticate: RequestHandler = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }
    // Verify token and attach user
    req.user = verifyToken(token);
    next(); // Continue to next handler
};

// Authorization middleware
const requireAdmin: RequestHandler = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
};

// Actual handler
const deleteUser: RequestHandler = (req, res) => {
    // Delete logic
    res.status(204).send();
};

// Combined
app.delete('/users/:id', authenticate, requireAdmin, deleteUser);
```

### Handler Flow Visualization

```
Request: DELETE /users/123

authenticate         requireAdmin         deleteUser
     │                    │                   │
     ▼                    ▼                   ▼
Check token ────► Check admin role ────► Delete user
     │                    │                   │
  next()               next()            res.send()
```

### Array of Handlers

```typescript
const middlewareStack = [authenticate, requireAdmin, validateInput];

app.post('/admin/users', middlewareStack, createAdminUser);
```

---

## Route Chaining with `app.route()`

### The Problem

```typescript
// Repetitive path definition
app.get('/users', getUsers);
app.post('/users', createUser);
app.get('/users/:id', getUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
```

### The Solution

```typescript
// Chain methods for same path
app.route('/users')
    .get(getUsers)
    .post(createUser);

app.route('/users/:id')
    .get(getUser)
    .put(updateUser)
    .patch(patchUser)
    .delete(deleteUser);
```

### With Middleware

```typescript
app.route('/users/:id')
    .all(authenticate)  // Runs for ALL methods
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
```

---

## Response Methods Deep Dive

### `res.send()`

Sends response and auto-sets Content-Type:

```typescript
res.send('Hello');           // Content-Type: text/html
res.send({ data: 'hi' });    // Content-Type: application/json (auto-converts)
res.send(Buffer.from('hi')); // Content-Type: application/octet-stream
```

### `res.json()`

Explicitly sends JSON:

```typescript
res.json({ data: 'hello' });
res.json(null);              // Valid JSON: null
res.json([1, 2, 3]);         // Valid JSON: array
```

### Difference: `send()` vs `json()`

```typescript
// Both work for objects:
res.send({ name: 'John' });  // Works
res.json({ name: 'John' });  // Works

// But json() handles edge cases better:
res.send(null);              // Sends empty response
res.json(null);              // Sends "null" as JSON

// Use json() when sending JSON data
```

### `res.status()`

Sets status code (chainable):

```typescript
res.status(201).json({ created: true });
res.status(404).json({ error: 'Not found' });
res.status(204).send();  // No content
```

### Common Status Codes

```typescript
// Success
res.status(200);  // OK
res.status(201);  // Created
res.status(204);  // No Content

// Client Errors
res.status(400);  // Bad Request
res.status(401);  // Unauthorized
res.status(403);  // Forbidden
res.status(404);  // Not Found
res.status(422);  // Unprocessable Entity

// Server Errors
res.status(500);  // Internal Server Error
```

---

## PHP/Laravel Comparison

### Route Definition

```php
// Laravel routes/api.php
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Laravel route grouping
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

```typescript
// Express
app.get('/users', userController.index);
app.post('/users', userController.store);
app.get('/users/:id', userController.show);
app.put('/users/:id', userController.update);
app.delete('/users/:id', userController.destroy);

// Express route chaining (similar to grouping)
app.route('/users/:id')
    .get(userController.show)
    .put(authenticate, userController.update)
    .delete(authenticate, userController.destroy);
```

### Response Methods

```php
// Laravel
return response()->json(['users' => $users]);
return response()->json(['user' => $user], 201);
return response()->noContent(); // 204
```

```typescript
// Express
res.json({ users });
res.status(201).json({ user });
res.status(204).send();
```

---

## Common Mistakes

### 1. Route Order Matters

```typescript
// ❌ Wrong order - :id catches 'new'
app.get('/users/:id', getUser);
app.get('/users/new', showNewForm);  // Never reached!

// ✅ Correct order - specific before generic
app.get('/users/new', showNewForm);
app.get('/users/:id', getUser);
```

### 2. Forgetting `next()` in Middleware

```typescript
// ❌ Wrong - request hangs
app.get('/users', (req, res, next) => {
    console.log('Logging...');
    // Forgot next()! Request hangs forever.
}, getUsers);

// ✅ Correct
app.get('/users', (req, res, next) => {
    console.log('Logging...');
    next();
}, getUsers);
```

### 3. Calling `next()` After Response

```typescript
// ❌ Wrong - next() after send
app.get('/users', (req, res, next) => {
    res.json({ users: [] });
    next(); // Don't do this!
});

// ✅ Correct - no next() after final response
app.get('/users', (req, res) => {
    res.json({ users: [] });
});
```

---

## Key Takeaways

1. **Route order matters** — First match wins, put specific routes before generic
2. **Multiple handlers = middleware chain** — Use `next()` to continue
3. **`app.route()` reduces repetition** — Chain methods for same path
4. **`app.all()` catches all methods** — Useful for logging or auth
5. **Use `res.json()` for JSON** — More explicit than `res.send()`
6. **Type your handlers** — Use `RequestHandler<Params, ResBody, ReqBody, Query>`
