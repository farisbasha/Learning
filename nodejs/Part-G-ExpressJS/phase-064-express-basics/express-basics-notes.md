# Phase 064: Express Basics

## Overview

Express applications are built around three core concepts:
1. **The Application** — The main express instance that configures and runs your server
2. **Routes** — URL patterns mapped to handler functions
3. **Request/Response** — Objects representing the HTTP request and response

In this phase, we'll deeply understand how Express handles HTTP requests and how to build type-safe route handlers.

---

## The Express Application Instance

### Creating an Application

```typescript
import express, { Application } from 'express';

const app: Application = express();
```

### What is `app` Actually?

The `app` object is **many things at once**:

```typescript
// It's a function (can be used as HTTP handler)
const server = http.createServer(app);

// It's a router (can register routes)
app.get('/users', handler);

// It's an EventEmitter
app.on('mount', () => console.log('Mounted'));

// It has settings
app.set('view engine', 'ejs');
app.get('env'); // 'development' or 'production'
```

### How Express Creates the App

Internally, Express does something like this:

```typescript
function createApplication() {
    // Create a function that handles requests
    const app = function(req, res, next) {
        app.handle(req, res, next);
    };
    
    // Mix in EventEmitter
    Object.setPrototypeOf(app, EventEmitter.prototype);
    
    // Mix in application methods
    mixin(app, proto);
    
    // Initialize settings
    app.init();
    
    return app;
}
```

This is why `app` can be:
1. Passed to `http.createServer()`
2. Used to register routes
3. Used to emit/listen to events

---

## Starting the Server

### Basic Start

```typescript
app.listen(3000);
```

### With Callback (Recommended)

```typescript
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### What `app.listen()` Does Internally

```typescript
// This:
app.listen(3000, callback);

// Is shorthand for:
const server = http.createServer(app);
server.listen(3000, callback);
```

### With Host Binding

```typescript
// Listen on all interfaces (default)
app.listen(3000, '0.0.0.0', () => {});

// Listen only on localhost (safer for dev)
app.listen(3000, '127.0.0.1', () => {});
```

### Getting Server Reference

```typescript
const server = app.listen(3000, () => {
    console.log('Server started');
});

// Now you can:
server.close(); // Close the server
server.address(); // Get bound address
```

---

## HTTP Methods

### The Four Core Methods

```typescript
// READ - Get data
app.get('/users', (req, res) => {
    res.json({ users: [] });
});

// CREATE - Add new data
app.post('/users', (req, res) => {
    // Create user from req.body
    res.status(201).json({ id: 1 });
});

// UPDATE - Replace entire resource
app.put('/users/:id', (req, res) => {
    // Replace user completely
    res.json({ updated: true });
});

// UPDATE - Modify partial resource
app.patch('/users/:id', (req, res) => {
    // Update specific fields only
    res.json({ patched: true });
});

// DELETE - Remove data
app.delete('/users/:id', (req, res) => {
    res.status(204).send(); // No content
});
```

### Other HTTP Methods

```typescript
app.options('/users', handler);  // CORS preflight
app.head('/users', handler);     // Like GET but no body
app.all('/api/*', handler);      // Matches ALL methods
```

### The `all()` Method

```typescript
// Runs for ANY HTTP method on this path
app.all('/api/*', (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next(); // Continue to actual handler
});
```

---

## Route Handler Functions

### Basic Handler Signature

```typescript
import { Request, Response, NextFunction } from 'express';

// Standard handler
const handler = (req: Request, res: Response) => {
    res.json({ data: 'hello' });
};

// Handler with next (for middleware/errors)
const middlewareHandler = (req: Request, res: Response, next: NextFunction) => {
    // Do something
    next(); // Pass to next handler
};
```

### Multiple Handlers

Express allows multiple handlers for a single route:

```typescript
// Multiple handlers in sequence
app.get('/dashboard', 
    authenticate,    // First: check auth
    loadUser,        // Second: load user data
    renderDashboard  // Third: render response
);

// Array of handlers
app.get('/admin', [authenticate, authorize('admin'), renderAdmin]);
```

### How Multiple Handlers Work

```
Request → authenticate → loadUser → renderDashboard → Response
              ↓              ↓              ↓
           next()         next()        res.render()
```

If any handler doesn't call `next()`, the chain stops.

---

## The Request Object (`req`)

### What is `req`?

`req` is Node's `http.IncomingMessage` **enhanced** with Express properties:

```typescript
// Node original properties
req.method      // 'GET', 'POST', etc.
req.url         // '/users?page=1'
req.headers     // { 'content-type': 'application/json', ... }

// Express additions
req.params      // { id: '123' } from '/users/:id'
req.query       // { page: '1' } from '?page=1'
req.body        // Parsed body (needs middleware)
req.path        // '/users' (without query string)
req.hostname    // 'localhost'
req.ip          // Client IP
req.cookies     // Parsed cookies (needs middleware)
```

### Type-Safe Request

```typescript
interface CreateUserBody {
    email: string;
    password: string;
    name?: string;
}

interface UserParams {
    id: string;
}

interface SearchQuery {
    q?: string;
    page?: string;
    limit?: string;
}

// Fully typed request
app.post('/users', (req: Request<{}, {}, CreateUserBody>, res) => {
    const { email, password } = req.body; // TypeScript knows the types!
});

app.get('/users/:id', (req: Request<UserParams>, res) => {
    const userId = req.params.id; // TypeScript knows this is string
});

app.get('/search', (req: Request<{}, {}, {}, SearchQuery>, res) => {
    const page = req.query.page; // string | undefined
});
```

### Request Type Generic Order

```typescript
Request<Params, ResBody, ReqBody, Query, Locals>

// Params   - req.params type
// ResBody  - Response body type (rarely used)
// ReqBody  - req.body type
// Query    - req.query type
// Locals   - res.locals type
```

---

## The Response Object (`res`)

### What is `res`?

`res` is Node's `http.ServerResponse` **enhanced** with Express convenience methods:

```typescript
// Node original methods
res.writeHead(200, { 'Content-Type': 'text/plain' });
res.end('Hello');

// Express convenience methods (what you'll use)
res.send('Hello');           // Send any response
res.json({ data: 'hi' });    // Send JSON
res.status(404).send();      // Set status and send
res.redirect('/login');      // Redirect
res.render('home', data);    // Render template
```

### Sending Responses

```typescript
// Send string (auto Content-Type: text/html)
res.send('Hello World');

// Send JSON (auto Content-Type: application/json)
res.json({ message: 'Hello' });

// Send with status code
res.status(201).json({ id: 1, created: true });

// Send no content
res.status(204).send();

// Send file
res.sendFile('/path/to/file.pdf');

// Download file
res.download('/path/to/file.pdf', 'report.pdf');
```

### Chaining Response Methods

```typescript
res
    .status(201)
    .set('X-Custom-Header', 'value')
    .json({ created: true });
```

### Response Headers

```typescript
// Set single header
res.set('Content-Type', 'text/plain');

// Set multiple headers
res.set({
    'Content-Type': 'application/json',
    'X-Request-Id': '123'
});

// Shorthand for Content-Type
res.type('json');  // application/json
res.type('html');  // text/html
```

---

## PHP/Laravel Comparison

### Route Definition

```php
// Laravel
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
```

```typescript
// Express
import { UserController } from './controllers/UserController';

const userController = new UserController();

app.get('/users', userController.index);
app.post('/users', userController.store);
app.get('/users/:id', userController.show);
app.put('/users/:id', userController.update);
app.delete('/users/:id', userController.destroy);
```

### Request Access

```php
// Laravel
public function store(Request $request)
{
    $email = $request->input('email');
    $all = $request->all();
    $id = $request->route('id');
    $page = $request->query('page');
}
```

```typescript
// Express
app.post('/users/:id', (req, res) => {
    const email = req.body.email;     // $request->input()
    const all = req.body;             // $request->all()
    const id = req.params.id;         // $request->route('id')
    const page = req.query.page;      // $request->query('page')
});
```

### Response

```php
// Laravel
return response()->json(['user' => $user]);
return response()->json(['user' => $user], 201);
return redirect('/login');
```

```typescript
// Express
res.json({ user });
res.status(201).json({ user });
res.redirect('/login');
```

---

## Common Patterns

### RESTful Resource Pattern

```typescript
// All routes for a resource
app.get('/users', listUsers);           // List all
app.get('/users/:id', getUser);         // Get one
app.post('/users', createUser);         // Create
app.put('/users/:id', updateUser);      // Update (full)
app.patch('/users/:id', patchUser);     // Update (partial)
app.delete('/users/:id', deleteUser);   // Delete
```

### API Response Wrapper

```typescript
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const sendSuccess = <T>(res: Response, data: T, status = 200) => {
    res.status(status).json({ success: true, data });
};

const sendError = (res: Response, error: string, status = 400) => {
    res.status(status).json({ success: false, error });
};

// Usage
app.get('/users/:id', async (req, res) => {
    try {
        const user = await findUser(req.params.id);
        if (!user) {
            return sendError(res, 'User not found', 404);
        }
        sendSuccess(res, user);
    } catch (err) {
        sendError(res, 'Server error', 500);
    }
});
```

---

## Common Mistakes

### 1. Sending Multiple Responses

```typescript
// ❌ Wrong - can't send twice!
app.get('/users', (req, res) => {
    res.json({ data: 'first' });
    res.json({ data: 'second' }); // Error: headers already sent!
});

// ✅ Correct - use return or if/else
app.get('/users/:id', (req, res) => {
    const user = findUser(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.json(user); // Only runs if user exists
});
```

### 2. Forgetting Return After Response

```typescript
// ❌ Wrong - continues executing
app.get('/admin', (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        // Code continues! This will cause "headers already sent"
    }
    res.json(adminData);
});

// ✅ Correct - return after response
app.get('/admin', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(adminData);
});
```

### 3. Not Using TypeScript Types

```typescript
// ❌ Weak typing
app.post('/users', (req, res) => {
    const name = req.body.naem; // Typo not caught!
});

// ✅ Strong typing
interface CreateUserDto {
    name: string;
    email: string;
}

app.post('/users', (req: Request<{}, {}, CreateUserDto>, res) => {
    const name = req.body.naem; // TypeScript error!
});
```

---

## Key Takeaways

1. **`app` is a function AND an object** — It can be passed to `http.createServer()`
2. **`app.listen()` returns the server** — Store it for graceful shutdown
3. **HTTP methods are semantic** — GET=read, POST=create, PUT=replace, PATCH=modify, DELETE=remove
4. **`req` is enhanced IncomingMessage** — Express adds `params`, `query`, `body`
5. **`res` is enhanced ServerResponse** — Express adds `json()`, `send()`, `status()`
6. **Type your requests** — Use `Request<Params, ResBody, ReqBody, Query>` generics
7. **Return after sending responses** — Prevents "headers already sent" errors

---

## Further Reading

- [Express.js Official Docs - Request](https://expressjs.com/en/api.html#req)
- [Express.js Official Docs - Response](https://expressjs.com/en/api.html#res)
