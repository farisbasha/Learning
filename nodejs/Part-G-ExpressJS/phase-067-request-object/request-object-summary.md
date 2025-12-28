# Phase 067: Request Object — Cheatsheet

## Request Properties

| Property | Type | Description |
|----------|------|-------------|
| `req.params` | object | Route parameters (`:id`) |
| `req.query` | object | Query string (`?page=1`) |
| `req.body` | any | Request body (needs middleware) |
| `req.headers` | object | HTTP headers (lowercase keys) |
| `req.cookies` | object | Cookies (needs cookie-parser) |
| `req.method` | string | 'GET', 'POST', etc. |
| `req.path` | string | URL path without query |
| `req.url` | string | Full URL with query |
| `req.originalUrl` | string | Original URL |
| `req.hostname` | string | Host from headers |
| `req.ip` | string | Client IP address |
| `req.xhr` | boolean | Is AJAX request |

## Accessing Data

```typescript
// Route params (always strings!)
app.get('/users/:id', (req, res) => {
    req.params.id  // '123' (string)
});

// Query string (always strings!)
// GET /search?q=hello&page=1
req.query.q     // 'hello'
req.query.page  // '1' (string, not number!)

// Body (needs express.json())
req.body.email  // From JSON body

// Headers (lowercase!)
req.get('Authorization')  // Case-insensitive
req.headers['content-type']  // Lowercase key
```

## Type-Safe Requests

```typescript
// Generic order: Params, ResBody, ReqBody, Query
Request<Params, ResBody, ReqBody, Query>

// Example
interface UserParams { id: string; }
interface UserBody { email: string; name: string; }
interface UserQuery { include?: string; }

app.put('/users/:id', (
    req: Request<UserParams, {}, UserBody, UserQuery>,
    res: Response
) => {
    req.params.id      // typed
    req.body.email     // typed
    req.query.include  // typed
});
```

## Extending Request

```typescript
// types/express.d.ts
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; email: string };
            requestId?: string;
        }
    }
}
export {};

// Now use anywhere
req.user?.id
req.requestId
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `$request->input('key')` | `req.body.key` |
| `$request->all()` | `req.body` |
| `$request->query('key')` | `req.query.key` |
| `$request->route('id')` | `req.params.id` |
| `$request->header('X')` | `req.get('X')` |
| `$request->cookie('x')` | `req.cookies.x` |
| `$request->ip()` | `req.ip` |
| `$request->method()` | `req.method` |
| `$request->path()` | `req.path` |

## Common Conversions

```typescript
// String to number
const page = parseInt(req.query.page as string) || 1;
const id = Number(req.params.id);

// String to boolean
const active = req.query.active === 'true';

// Default values
const limit = req.query.limit || '10';
```

## Remember

- ✅ All params/query values are strings
- ✅ Body needs `express.json()` middleware
- ✅ Headers are accessed lowercase
- ✅ Use declaration merging for custom props
- ❌ Don't assume req.body exists without middleware
- ❌ Don't treat query params as numbers/booleans
