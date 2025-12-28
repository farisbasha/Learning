# Phase 067: Request Object Deep Dive

## Overview

The `Request` object (`req`) is your window into what the client sent. It contains everything about the incoming HTTP request — headers, body, URL parameters, query strings, cookies, and more.

Understanding the Request object deeply is essential because **every route handler and middleware receives it**.

---

## How the Request Object is Created

### Node.js Foundation

Express's Request extends Node's `http.IncomingMessage`:

```typescript
// What Node.js gives you:
interface IncomingMessage {
    method: string;          // 'GET', 'POST', etc.
    url: string;             // '/users?page=1'
    headers: IncomingHttpHeaders;
    socket: Socket;
    // ... raw properties
}

// What Express adds:
interface Request extends IncomingMessage {
    params: ParamsDictionary;    // Route parameters
    query: ParsedQs;             // Parsed query string
    body: any;                   // Parsed body (with middleware)
    cookies: any;                // Parsed cookies (with middleware)
    path: string;                // URL path without query
    hostname: string;            // Host from headers
    ip: string;                  // Client IP
    // ... many more
}
```

### Request Enhancement Flow

```
Raw HTTP Request
       │
       ▼
http.IncomingMessage (Node.js)
       │
       ▼
Express wraps and enhances
       │
       ▼
Middleware modifies (body, cookies, etc.)
       │
       ▼
Your route handler receives final req
```

---

## Core Request Properties

### URL-Related Properties

```typescript
// Request: GET /users/123?page=1&limit=10
// Host: api.example.com

req.url          // '/users/123?page=1&limit=10' (full URL)
req.path         // '/users/123' (without query string)
req.originalUrl  // Same as url, preserved through rewrites
req.baseUrl      // '' or router mount path
req.hostname     // 'api.example.com'
req.protocol     // 'http' or 'https'
req.secure       // true if HTTPS
req.subdomains   // ['api'] (from hostname)
```

### Method and Headers

```typescript
req.method       // 'GET', 'POST', 'PUT', etc.
req.headers      // All headers as object
req.get('Content-Type')     // Get specific header
req.header('Authorization') // Alias for get()

// Common header access
req.headers['content-type']    // 'application/json'
req.headers['authorization']   // 'Bearer xxx'
req.headers['user-agent']      // 'Mozilla/5.0...'
```

### Client Information

```typescript
req.ip           // '192.168.1.1' or '::1' for localhost
req.ips          // Array if behind proxy (X-Forwarded-For)
req.xhr          // true if XMLHttpRequest (AJAX)
```

---

## Route Parameters (`req.params`)

### How It Works

```typescript
// Route definition
app.get('/users/:userId/posts/:postId', (req, res) => {
    console.log(req.params);
    // { userId: '42', postId: '7' }
});

// Request: GET /users/42/posts/7
```

### Types Are Always Strings!

```typescript
app.get('/users/:id', (req, res) => {
    const id = req.params.id;    // '123' (string!)
    
    // Must convert for numeric operations
    const numId = parseInt(id, 10);
    
    // Or for array index
    const user = users[numId];   // Works
    const user2 = users[id];     // Type error!
});
```

### Type-Safe Params

```typescript
interface UserParams {
    id: string;
}

interface PostParams {
    userId: string;
    postId: string;
}

app.get('/users/:id', (req: Request<UserParams>, res) => {
    const id = req.params.id;        // TypeScript: string
    const bad = req.params.userId;   // TypeScript: Error!
});
```

---

## Query Strings (`req.query`)

### Basic Usage

```typescript
// Request: GET /search?q=hello&page=1&tags=a&tags=b

req.query.q       // 'hello'
req.query.page    // '1' (string, not number!)
req.query.tags    // ['a', 'b'] (array if multiple)
req.query.missing // undefined
```

### Query String Gotchas

```typescript
// All values are strings or arrays of strings
// Never numbers or booleans!

// Request: GET /filter?active=true&count=5

req.query.active  // 'true' (string!)
req.query.count   // '5' (string!)

// Must convert:
const active = req.query.active === 'true';
const count = parseInt(req.query.count as string) || 10;
```

### Typed Query

```typescript
interface SearchQuery {
    q?: string;
    page?: string;
    limit?: string;
    sort?: 'asc' | 'desc';
}

app.get('/search', (req: Request<{}, {}, {}, SearchQuery>, res) => {
    const { q, page, limit, sort } = req.query;
    // All properly typed
});
```

---

## Request Body (`req.body`)

### Requires Middleware!

```typescript
// Without middleware - body is undefined!
app.post('/users', (req, res) => {
    console.log(req.body); // undefined!
});

// With middleware - body is parsed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
    console.log(req.body); // { email: 'test@test.com', ... }
});
```

### Content-Type Matters

```typescript
// Request with Content-Type: application/json
// Body: {"name": "John"}
req.body = { name: 'John' }  // Parsed as object

// Request with Content-Type: application/x-www-form-urlencoded
// Body: name=John&age=30
req.body = { name: 'John', age: '30' }  // Also parsed

// Request with Content-Type: text/plain
// Body is NOT parsed by default
req.body = undefined  // Need express.text() middleware
```

### Type-Safe Body

```typescript
interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
}

app.post('/users', (req: Request<{}, {}, CreateUserDto>, res) => {
    const { email, password, name } = req.body;
    // TypeScript knows the types!
});
```

---

## Headers (`req.headers`)

### Accessing Headers

```typescript
// All lowercase!
req.headers['content-type']      // 'application/json'
req.headers['authorization']     // 'Bearer token123'
req.headers['x-custom-header']   // Custom headers work too

// Helper methods
req.get('Content-Type')          // Same, case-insensitive
req.header('Content-Type')       // Alias for get()

// Check if header exists
if (req.get('Authorization')) {
    // Has auth header
}
```

### Common Headers

```typescript
// Content negotiation
req.get('Accept')           // 'application/json'
req.get('Content-Type')     // 'application/json'
req.get('Content-Length')   // '1234'

// Authentication
req.get('Authorization')    // 'Bearer xxx' or 'Basic xxx'
req.get('Cookie')           // Raw cookie string

// Client info
req.get('User-Agent')       // Browser/client info
req.get('Referer')          // Previous page
req.get('Origin')           // For CORS

// Caching
req.get('If-None-Match')    // ETag matching
req.get('If-Modified-Since')// Date-based caching
```

### Content Negotiation Helpers

```typescript
// Check what client accepts
req.accepts('html')         // 'html' or false
req.accepts(['json', 'html']) // First accepted or false
req.is('json')              // 'json' if Content-Type is JSON
```

---

## Cookies (`req.cookies`)

### Requires cookie-parser Middleware

```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser());

app.get('/dashboard', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const preferences = req.cookies.prefs;
});
```

### Signed Cookies

```typescript
app.use(cookieParser('secret-key'));

app.get('/secure', (req, res) => {
    // Signed cookies in separate object
    const token = req.signedCookies.authToken;
});
```

---

## Extending the Request Object

### Why Extend?

Common use case: attaching authenticated user to request.

### Method 1: Declaration Merging (Recommended)

```typescript
// types/express.d.ts
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: 'admin' | 'user';
            };
            requestId?: string;
            startTime?: number;
        }
    }
}

export {}; // Make this a module
```

Now TypeScript knows about these properties:

```typescript
// In middleware
const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        req.user = await verifyToken(token); // No type error!
    }
    next();
};

// In route
app.get('/profile', authenticate, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ email: req.user.email }); // TypeScript knows user shape!
});
```

### Method 2: Custom Interface (Alternative)

```typescript
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

app.get('/profile', (req: AuthenticatedRequest, res) => {
    res.json({ email: req.user.email });
});
```

---

## PHP/Laravel Comparison

### Accessing Request Data

```php
// Laravel
public function store(Request $request)
{
    // Body
    $name = $request->input('name');
    $all = $request->all();
    $only = $request->only(['name', 'email']);
    
    // Query
    $page = $request->query('page');
    
    // Route params
    $id = $request->route('id');
    
    // Headers
    $token = $request->header('Authorization');
    $bearerToken = $request->bearerToken();
    
    // Cookies
    $session = $request->cookie('session');
    
    // Files
    $file = $request->file('avatar');
}
```

```typescript
// Express
app.post('/users/:id', (req, res) => {
    // Body
    const name = req.body.name;
    const all = req.body;
    const { name, email } = req.body;  // Like only()
    
    // Query
    const page = req.query.page;
    
    // Route params
    const id = req.params.id;
    
    // Headers
    const token = req.get('Authorization');
    const bearerToken = req.get('Authorization')?.split(' ')[1];
    
    // Cookies (needs cookie-parser)
    const session = req.cookies.session;
    
    // Files (needs multer)
    const file = req.file;  // Single file
    const files = req.files; // Multiple files
});
```

### Request Method Mapping

| Laravel | Express | Notes |
|---------|---------|-------|
| `$request->input('key')` | `req.body.key` | POST data |
| `$request->all()` | `req.body` | All body |
| `$request->query('key')` | `req.query.key` | Query string |
| `$request->route('id')` | `req.params.id` | URL params |
| `$request->header('X')` | `req.get('X')` | Headers |
| `$request->cookie('x')` | `req.cookies.x` | Cookies |
| `$request->file('x')` | `req.file` | With Multer |
| `$request->ip()` | `req.ip` | Client IP |
| `$request->method()` | `req.method` | HTTP method |
| `$request->url()` | `req.originalUrl` | Full URL |
| `$request->path()` | `req.path` | Path only |
| `$request->is('api/*')` | Custom check | Pattern match |
| `$request->ajax()` | `req.xhr` | AJAX check |

---

## Common Patterns

### Safe Body Access

```typescript
interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
}

app.post('/users', (req: Request<{}, {}, CreateUserDto>, res) => {
    const { email, password, name = 'Anonymous' } = req.body;
    
    // With validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Continue...
});
```

### Request ID Pattern

```typescript
declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

app.use((req, res, next) => {
    req.id = req.get('X-Request-Id') || crypto.randomUUID();
    res.set('X-Request-Id', req.id);
    next();
});

// Now available everywhere
app.get('/users', (req, res) => {
    console.log(`[${req.id}] Fetching users`);
});
```

---

## Key Takeaways

1. **`req` extends Node's IncomingMessage** — Express adds convenience properties
2. **All params and query values are strings** — Convert with `parseInt()` etc.
3. **`req.body` needs middleware** — Use `express.json()` before routes
4. **Headers are lowercase** — Use `req.get()` for case-insensitive access
5. **Extend Request for custom props** — Use declaration merging in TypeScript
6. **Type your requests** — `Request<Params, ResBody, ReqBody, Query>`
