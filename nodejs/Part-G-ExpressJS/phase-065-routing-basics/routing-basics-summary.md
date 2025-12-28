# Phase 065: Express Routing Basics — Cheatsheet

## Route Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `app.get()` | Read | `app.get('/users', handler)` |
| `app.post()` | Create | `app.post('/users', handler)` |
| `app.put()` | Replace | `app.put('/users/:id', handler)` |
| `app.patch()` | Update | `app.patch('/users/:id', handler)` |
| `app.delete()` | Delete | `app.delete('/users/:id', handler)` |
| `app.all()` | Any method | `app.all('/api/*', logger)` |

## Route Patterns

```typescript
// Exact path
app.get('/users', handler);

// Parameter
app.get('/users/:id', handler);

// Multiple params
app.get('/users/:userId/posts/:postId', handler);

// Optional character (?)
app.get('/colou?r', handler);  // /color, /colour

// Wildcard (*)
app.get('/files/*', handler);  // /files/anything

// Regex
app.get(/.*fly$/, handler);    // /butterfly, /dragonfly
```

## Chaining Routes

```typescript
app.route('/users')
    .get(getUsers)
    .post(createUser);

app.route('/users/:id')
    .all(authenticate)    // All methods
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
```

## Multiple Handlers

```typescript
// Sequence
app.get('/admin', authenticate, authorize, handleRequest);

// Array
app.get('/admin', [auth, validate], handleRequest);
```

## Response Methods

| Method | Usage |
|--------|-------|
| `res.send()` | Auto-detect content type |
| `res.json()` | Send JSON explicitly |
| `res.status(404)` | Set status code |
| `res.status(201).json({})` | Chain status + JSON |
| `res.status(204).send()` | No content |

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Handler Types

```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Basic
const handler = (req: Request, res: Response) => {};

// With next
const middleware = (req: Request, res: Response, next: NextFunction) => {};

// Typed
const handler: RequestHandler<{ id: string }> = (req, res) => {};
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `Route::get()` | `app.get()` |
| `Route::post()` | `app.post()` |
| `Route::resource()` | `app.route().get().post()...` |
| `Route::middleware()` | Multiple handlers |
| `{id}` | `:id` |

## Remember

- ✅ Order matters — specific routes before generic
- ✅ Call `next()` in middleware
- ✅ Use `app.route()` for DRY routes
- ❌ Don't call `next()` after `res.send()`
- ❌ Don't forget to send a response
