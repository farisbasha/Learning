# Phase 068: Response Object — Cheatsheet

## Response Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `res.json(data)` | Send JSON | `res.json({ users: [] })` |
| `res.send(data)` | Send any type | `res.send('Hello')` |
| `res.status(code)` | Set status | `res.status(201)` |
| `res.sendStatus(code)` | Status + default body | `res.sendStatus(404)` |
| `res.redirect(url)` | Redirect | `res.redirect('/login')` |
| `res.sendFile(path)` | Send file | `res.sendFile('/path/file')` |
| `res.download(path)` | Download file | `res.download('/path/file')` |
| `res.set(key, val)` | Set header | `res.set('X-Custom', 'val')` |
| `res.cookie(name, val)` | Set cookie | `res.cookie('id', '123')` |

## Common Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Standard success |
| 201 | Created | After POST creates resource |
| 204 | No Content | After DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource missing |
| 422 | Unprocessable | Validation failed |
| 500 | Server Error | Unexpected error |

## Response Chaining

```typescript
res
    .status(201)
    .set('X-Custom', 'value')
    .cookie('flash', 'Created!')
    .json({ id: 1 });
```

## Sending Responses

```typescript
// JSON (recommended for APIs)
res.json({ success: true, data: users });

// With status
res.status(201).json({ id: 1 });
res.status(404).json({ error: 'Not found' });

// No content
res.status(204).send();

// HTML
res.send('<h1>Hello</h1>');
```

## Headers

```typescript
// Single
res.set('Content-Type', 'text/plain');

// Multiple
res.set({
    'X-Request-Id': '123',
    'Cache-Control': 'no-cache'
});

// Set content type
res.type('json');     // application/json
res.type('html');     // text/html
```

## Cookies

```typescript
// Set
res.cookie('token', 'abc', {
    httpOnly: true,
    secure: true,
    maxAge: 3600000,  // 1 hour
    sameSite: 'strict'
});

// Clear
res.clearCookie('token');
```

## Files

```typescript
import path from 'path';

// Display file
res.sendFile(path.join(__dirname, 'file.pdf'));

// Download file
res.download('/path/file.pdf', 'custom-name.pdf');
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `response()->json($data)` | `res.json(data)` |
| `response()->json($data, 201)` | `res.status(201).json(data)` |
| `redirect('/path')` | `res.redirect('/path')` |
| `redirect()->back()` | `res.redirect('back')` |
| `response()->download($path)` | `res.download(path)` |
| `->header('X', 'Y')` | `res.set('X', 'Y')` |
| `Cookie::queue('n', 'v')` | `res.cookie('n', 'v')` |

## Response Pattern

```typescript
// Success helper
const sendSuccess = <T>(res: Response, data: T, status = 200) => {
    res.status(status).json({ success: true, data });
};

// Error helper
const sendError = (res: Response, error: string, status = 400) => {
    res.status(status).json({ success: false, error });
};

// Usage
sendSuccess(res, { user });
sendError(res, 'User not found', 404);
```

## Remember

- ✅ Use `res.json()` for JSON responses
- ✅ Chain: `res.status(201).json({})`
- ✅ Return after sending: `return res.json({})`
- ✅ Use absolute paths for `sendFile()`
- ❌ Don't send multiple responses
- ❌ Don't forget to send a response
