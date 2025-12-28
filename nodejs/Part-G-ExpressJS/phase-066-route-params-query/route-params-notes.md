# Phase 066: Route Parameters & Query Strings

## Overview

In web APIs, you need to receive data from clients in different ways:
1. **Route Parameters** — Data in the URL path: `/users/123`
2. **Query Strings** — Data after `?`: `/users?page=1&limit=10`
3. **Request Body** — Data in POST/PUT body (covered in later phase)

Understanding the difference and when to use each is critical for API design.

---

## The Problem: Different Ways to Pass Data

### Laravel Context
```php
// Route parameter: {id}
Route::get('/users/{id}', function ($id) {
    return User::find($id);
});

// Query string
Route::get('/users', function (Request $request) {
    $page = $request->query('page', 1);
    return User::paginate($page);
});
```

### Express Context
```typescript
// Route parameter: :id
app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    res.json({ id });
});

// Query string
app.get('/users', (req, res) => {
    const page = req.query.page || '1';
    res.json({ page });
});
```

---

## Route Parameters Deep Dive

### Basic Parameters

```typescript
// Single parameter
app.get('/users/:id', (req, res) => {
    console.log(req.params); // { id: '123' }
    res.json({ userId: req.params.id });
});

// Request: GET /users/123
// Result: { userId: '123' }
```

### Multiple Parameters

```typescript
// Multiple parameters in path
app.get('/users/:userId/posts/:postId', (req, res) => {
    console.log(req.params);
    // { userId: '42', postId: '7' }
    
    res.json({
        userId: req.params.userId,
        postId: req.params.postId
    });
});

// Request: GET /users/42/posts/7
```

### How Route Parameters Work Internally

When Express matches a route:

```typescript
app.get('/users/:id', handler);

// Request: GET /users/123

// Express does something like:
const pattern = /^\/users\/([^\/]+)$/;
const match = '/users/123'.match(pattern);
// match = ['/users/123', '123']

req.params = { id: '123' };  // Parameter name from :id
```

**Key Point**: Parameters are ALWAYS strings, never numbers!

---

## Type-Safe Parameters

### Without Types (Dangerous)

```typescript
app.get('/users/:id', (req, res) => {
    // req.params.id is 'any' type
    // No autocomplete, no error checking
    const id = req.params.id;
});
```

### With Types (Recommended)

```typescript
interface UserParams {
    id: string;
}

app.get('/users/:id', (req: Request<UserParams>, res: Response) => {
    const id = req.params.id; // TypeScript knows this is string
    // Typo would be caught: req.params.idd ❌
});
```

### Complex Parameters

```typescript
interface PostParams {
    userId: string;
    postId: string;
}

app.get('/users/:userId/posts/:postId', (req: Request<PostParams>, res) => {
    const { userId, postId } = req.params;
    // Both are typed as string
});
```

---

## Optional Parameters

### Express Doesn't Have Native Optional Params

```typescript
// ❌ This doesn't work as you might expect
app.get('/users/:id?', handler);  // The ? is regex, not "optional"
```

### Solution 1: Multiple Routes

```typescript
// Handle both cases explicitly
app.get('/users', listUsers);       // No ID = list all
app.get('/users/:id', getUser);     // With ID = get one
```

### Solution 2: Wildcard with Logic

```typescript
app.get('/files/*', (req, res) => {
    const filePath = req.params[0]; // The * content
    if (!filePath) {
        return res.json({ files: listAll() });
    }
    res.json({ file: getFile(filePath) });
});
```

---

## Query Strings Deep Dive

### Basic Query String

```typescript
app.get('/users', (req, res) => {
    console.log(req.query);
    // Request: GET /users?page=1&limit=10
    // Output: { page: '1', limit: '10' }
});
```

### Query String Values Are Always Strings

```typescript
// Request: GET /search?page=1&active=true

req.query.page;    // '1' (string, not number!)
req.query.active;  // 'true' (string, not boolean!)

// You must convert:
const page = parseInt(req.query.page as string) || 1;
const active = req.query.active === 'true';
```

### Missing Query Parameters

```typescript
// Request: GET /users (no query string)

req.query.page;  // undefined
req.query.limit; // undefined

// Safe access:
const page = req.query.page || '1';
const limit = req.query.limit ?? '10';
```

### Array Query Parameters

```typescript
// Request: GET /users?role=admin&role=user
// or: GET /users?role[]=admin&role[]=user

req.query.role; // ['admin', 'user']

// Single value is string, multiple is array!
// This is tricky - always normalize:
const roles = Array.isArray(req.query.role) 
    ? req.query.role 
    : [req.query.role].filter(Boolean);
```

---

## Type-Safe Query Strings

### Basic Typing

```typescript
interface SearchQuery {
    q?: string;
    page?: string;
    limit?: string;
    sort?: 'asc' | 'desc';
}

app.get('/search', (req: Request<{}, {}, {}, SearchQuery>, res) => {
    const { q, page, limit, sort } = req.query;
    // All typed as optional strings
});
```

### The Request Generic Shape

```typescript
Request<Params, ResBody, ReqBody, Query>

// Params  - req.params type (route parameters)
// ResBody - Response body type (rarely used)
// ReqBody - req.body type (POST data)
// Query   - req.query type (query string)
```

### Full Example

```typescript
interface UserParams {
    id: string;
}

interface UpdateUserBody {
    name?: string;
    email?: string;
}

interface UserQuery {
    include?: string;  // ?include=posts,comments
}

app.put('/users/:id', (
    req: Request<UserParams, {}, UpdateUserBody, UserQuery>, 
    res: Response
) => {
    const { id } = req.params;           // Typed!
    const { name, email } = req.body;    // Typed!
    const { include } = req.query;       // Typed!
    
    res.json({ id, name, email, include });
});
```

---

## Parameter Validation

### The Problem

```typescript
// Route: /users/:id
// Request: GET /users/abc   <- Not a valid ID!
// Request: GET /users/-1    <- Negative ID?

app.get('/users/:id', async (req, res) => {
    const user = await db.user.findUnique({
        where: { id: parseInt(req.params.id) }  // NaN if 'abc'!
    });
});
```

### Solution 1: Manual Validation

```typescript
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ 
            error: 'Invalid user ID. Must be positive integer.' 
        });
    }
    
    // Continue with valid id
});
```

### Solution 2: Validation Middleware

```typescript
const validateId = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const value = req.params[paramName];
        const id = parseInt(value);
        
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                error: `Invalid ${paramName}. Must be positive integer.`
            });
        }
        
        // Optionally attach parsed value
        (req as any).parsedParams = { 
            ...(req as any).parsedParams, 
            [paramName]: id 
        };
        
        next();
    };
};

app.get('/users/:id', validateId('id'), (req, res) => {
    const id = (req as any).parsedParams.id; // Now it's a number
});
```

### Solution 3: Zod Validation (Modern)

```typescript
import { z } from 'zod';

const userParamsSchema = z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
});

app.get('/users/:id', (req, res) => {
    const result = userParamsSchema.safeParse(req.params);
    
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
    }
    
    const { id } = result.data; // id is now a number!
});
```

---

## PHP/Laravel Comparison

### Route Parameters

```php
// Laravel
Route::get('/users/{id}', function ($id) {
    return User::findOrFail($id);
});

// With constraint
Route::get('/users/{id}', function ($id) {
    // ...
})->where('id', '[0-9]+');

// Route model binding (automatic!)
Route::get('/users/{user}', function (User $user) {
    return $user;  // Laravel finds the user automatically
});
```

```typescript
// Express - no automatic model binding
app.get('/users/:id', async (req, res) => {
    const user = await findUser(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Express - regex constraint
app.get('/users/:id(\\d+)', (req, res) => {
    // Only matches numeric IDs
});
```

### Query Strings

```php
// Laravel
public function index(Request $request)
{
    $page = $request->query('page', 1);           // With default
    $all = $request->query();                     // All query params
    $has = $request->has('filter');               // Check existence
    $filled = $request->filled('search');         // Non-empty check
}
```

```typescript
// Express
app.get('/users', (req, res) => {
    const page = req.query.page || '1';           // With default
    const all = req.query;                        // All query params
    const has = 'filter' in req.query;            // Check existence
    const filled = req.query.search?.length > 0;  // Non-empty check
});
```

---

## Common Patterns

### Pagination Pattern

```typescript
interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

const parsePagination = (query: PaginationQuery) => {
    return {
        page: Math.max(1, parseInt(query.page || '1')),
        limit: Math.min(100, Math.max(1, parseInt(query.limit || '10'))),
        sort: query.sort || 'createdAt',
        order: query.order || 'desc'
    };
};

app.get('/users', (req: Request<{}, {}, {}, PaginationQuery>, res) => {
    const { page, limit, sort, order } = parsePagination(req.query);
    
    // Use in database query
    const users = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order }
    });
    
    res.json({ users, page, limit });
});
```

### Filter Pattern

```typescript
interface UserFilters {
    role?: string;
    status?: string;
    search?: string;
}

app.get('/users', (req: Request<{}, {}, {}, UserFilters>, res) => {
    const where: any = {};
    
    if (req.query.role) {
        where.role = req.query.role;
    }
    if (req.query.status) {
        where.status = req.query.status;
    }
    if (req.query.search) {
        where.OR = [
            { name: { contains: req.query.search } },
            { email: { contains: req.query.search } }
        ];
    }
    
    const users = await prisma.user.findMany({ where });
    res.json(users);
});
```

---

## Common Mistakes

### 1. Assuming Parameters Are Numbers

```typescript
// ❌ Wrong - id is string, not number!
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    // Won't match! u.id is number, req.params.id is string
});

// ✅ Correct - convert first
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
});
```

### 2. Not Handling Missing Query Params

```typescript
// ❌ Wrong - may crash if undefined
app.get('/search', (req, res) => {
    const results = search(req.query.q.toLowerCase());
    // TypeError if q is undefined!
});

// ✅ Correct - check first
app.get('/search', (req, res) => {
    if (!req.query.q) {
        return res.status(400).json({ error: 'Search query required' });
    }
    const results = search(req.query.q.toLowerCase());
});
```

### 3. Not Validating Parameter Format

```typescript
// ❌ Dangerous - uuid could be anything
app.get('/users/:uuid', async (req, res) => {
    const user = await db.findByUuid(req.params.uuid);
    // SQL injection possible if not using ORM properly
});

// ✅ Safe - validate format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

app.get('/users/:uuid', async (req, res) => {
    if (!uuidRegex.test(req.params.uuid)) {
        return res.status(400).json({ error: 'Invalid UUID format' });
    }
    const user = await db.findByUuid(req.params.uuid);
});
```

---

## Key Takeaways

1. **Parameters are ALWAYS strings** — Convert with `parseInt()`, validate first
2. **Query values are also strings** — `?active=true` is `'true'` not `true`
3. **Type your requests** — Use `Request<Params, {}, Body, Query>` generics
4. **Validate before using** — Never trust client input
5. **Arrays in query strings** — `?role=a&role=b` gives array, handle both cases
6. **No route model binding** — Unlike Laravel, you must fetch entities manually
7. **Order routes carefully** — `/users/new` before `/users/:id`
