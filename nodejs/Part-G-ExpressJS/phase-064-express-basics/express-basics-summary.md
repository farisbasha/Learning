# Phase 064: Express Basics — Cheatsheet

## Quick Reference

| Concept | Code |
|---------|------|
| Create app | `const app = express()` |
| Start server | `app.listen(3000, callback)` |
| GET route | `app.get('/path', handler)` |
| POST route | `app.post('/path', handler)` |
| All methods | `app.all('/path', handler)` |
| Route params | `'/users/:id'` → `req.params.id` |
| Query string | `'?page=1'` → `req.query.page` |
| Send JSON | `res.json({ data })` |
| Set status | `res.status(404).json({})` |

## HTTP Methods

| Method | Purpose | CRUD |
|--------|---------|------|
| `GET` | Retrieve data | Read |
| `POST` | Create new data | Create |
| `PUT` | Replace entire resource | Update |
| `PATCH` | Modify partial resource | Update |
| `DELETE` | Remove data | Delete |

## Request Object (`req`)

```typescript
req.method      // 'GET', 'POST', etc.
req.url         // Full URL with query
req.path        // URL path only
req.params      // Route parameters
req.query       // Query string params
req.body        // Request body (needs middleware)
req.headers     // HTTP headers
req.ip          // Client IP
```

## Response Object (`res`)

```typescript
res.send('text')              // Send text/HTML
res.json({ data })            // Send JSON
res.status(404).send()        // Set status
res.redirect('/login')        // Redirect
res.sendFile('/path/file')    // Send file
res.set('Header', 'value')    // Set header
```

## Type-Safe Requests

```typescript
// Generic order:
Request<Params, ResBody, ReqBody, Query>

// Example:
interface Params { id: string }
interface Body { name: string }
interface Query { page?: string }

app.post('/users/:id', (req: Request<Params, {}, Body, Query>, res) => {
    req.params.id   // typed as string
    req.body.name   // typed as string
    req.query.page  // typed as string | undefined
});
```

## PHP → Express Quick Map

| Laravel | Express |
|---------|---------|
| `Route::get('/path', fn)` | `app.get('/path', fn)` |
| `$request->input('key')` | `req.body.key` |
| `$request->query('key')` | `req.query.key` |
| `$request->route('id')` | `req.params.id` |
| `response()->json($data)` | `res.json(data)` |
| `response()->json($data, 201)` | `res.status(201).json(data)` |
| `redirect('/path')` | `res.redirect('/path')` |

## Common Patterns

### RESTful Routes
```typescript
app.get('/users', listUsers);
app.get('/users/:id', getUser);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
```

### Multiple Handlers
```typescript
app.get('/admin', authenticate, authorize, handleRequest);
```

## Remember

- ✅ Always `return` after sending response
- ✅ Use `res.status(code)` before `json()` or `send()`
- ✅ Type your request with generics
- ❌ Never call `res.send()` or `res.json()` twice
- ❌ Don't forget to end the request (call `res.send()`, `res.json()`, etc.)

## Common Errors

| Error | Fix |
|-------|-----|
| "Cannot set headers after they are sent" | Add `return` before `res.send()` |
| `req.body` is undefined | Add `app.use(express.json())` |
| Route not matching | Check path spelling and HTTP method |
