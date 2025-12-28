# Phase 066: Route Parameters & Query Strings — Cheatsheet

## Quick Reference

| Type | URL Pattern | Access | Example |
|------|-------------|--------|---------|
| Route Param | `/users/:id` | `req.params.id` | `/users/123` → `'123'` |
| Query String | `/users?page=1` | `req.query.page` | `'1'` |
| Multiple Params | `/users/:id/posts/:postId` | `req.params.id`, `req.params.postId` | |

## Route Parameters

```typescript
// Single param
app.get('/users/:id', (req, res) => {
    req.params.id  // string!
});

// Multiple params
app.get('/users/:userId/posts/:postId', (req, res) => {
    req.params.userId   // string
    req.params.postId   // string
});
```

## Query Strings

```typescript
// URL: /search?q=hello&page=1&active=true

req.query.q        // 'hello' (string)
req.query.page     // '1' (string, not number!)
req.query.active   // 'true' (string, not boolean!)

// Convert types
const page = parseInt(req.query.page as string) || 1;
const active = req.query.active === 'true';
```

## Type-Safe Requests

```typescript
interface UserParams {
    id: string;
}

interface SearchQuery {
    q?: string;
    page?: string;
    limit?: string;
}

interface CreateUserBody {
    email: string;
    name: string;
}

// Full typed request
app.post('/users/:id', (
    req: Request<UserParams, {}, CreateUserBody, SearchQuery>,
    res: Response
) => {
    req.params.id      // typed
    req.body.email     // typed
    req.query.page     // typed
});
```

## Request Generic Order

```typescript
Request<Params, ResBody, ReqBody, Query>
//       ↓       ↓        ↓       ↓
//   :id etc   (skip)   body   ?query
```

## Common Conversions

```typescript
// String to Number
const id = parseInt(req.params.id);
const page = Number(req.query.page) || 1;

// String to Boolean
const active = req.query.active === 'true';

// Handle arrays
const roles = Array.isArray(req.query.role) 
    ? req.query.role 
    : [req.query.role].filter(Boolean);
```

## Validation Pattern

```typescript
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ 
            error: 'Invalid ID' 
        });
    }
    
    // Continue...
});
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `{id}` | `:id` |
| `$request->route('id')` | `req.params.id` |
| `$request->query('page')` | `req.query.page` |
| `$request->query('page', 1)` | `req.query.page \|\| '1'` |
| Route model binding | Manual fetch required |

## Pagination Pattern

```typescript
interface Query {
    page?: string;
    limit?: string;
}

app.get('/users', (req: Request<{}, {}, {}, Query>, res) => {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;
});
```

## Remember

- ✅ Params and query are ALWAYS strings
- ✅ Convert to numbers with `parseInt()`
- ✅ Validate before using
- ✅ Provide defaults for optional query params
- ❌ Don't assume type without checking
- ❌ Don't trust `isNaN()` alone (convert first)

## Common Errors

| Issue | Cause | Fix |
|-------|-------|-----|
| `NaN` in database | Param not converted | `parseInt(req.params.id)` |
| `undefined` error | Missing query param | `req.query.q \|\| ''` |
| Always string compare fails | Type mismatch | Convert to same type |
| Array vs string issues | Multiple query values | Handle both cases |
