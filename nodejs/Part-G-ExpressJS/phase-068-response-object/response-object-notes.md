# Phase 068: Response Object Deep Dive

## Overview

The `Response` object (`res`) is how you send data back to the client. Express enhances Node's raw `ServerResponse` with convenient methods for sending JSON, HTML, files, redirects, and more.

---

## How the Response Object Works

### Node.js Foundation

```typescript
// What Node gives you:
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ data: 'hello' }));

// What Express gives you:
res.json({ data: 'hello' }); // One line!
```

### Response Enhancement

Express wraps Node's `http.ServerResponse` with helper methods:

```typescript
interface Response extends http.ServerResponse {
    // Sending data
    send(body: any): this;
    json(body: any): this;
    
    // Status
    status(code: number): this;
    sendStatus(code: number): this;
    
    // Headers
    set(field: string, value: string): this;
    get(field: string): string;
    
    // Redirects
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    
    // Files
    sendFile(path: string): void;
    download(path: string, filename?: string): void;
    
    // Cookies
    cookie(name: string, value: string, options?: CookieOptions): this;
    clearCookie(name: string): this;
    
    // And more...
}
```

---

## Sending Responses

### `res.send()` — Universal Sender

Automatically sets Content-Type based on input:

```typescript
// String → text/html
res.send('Hello World');

// Object/Array → application/json
res.send({ message: 'Hello' });

// Buffer → application/octet-stream
res.send(Buffer.from('binary data'));
```

### `res.json()` — JSON Specifically

Use for JSON responses (more explicit):

```typescript
res.json({ success: true, data: users });
res.json([1, 2, 3]);
res.json(null);  // Sends "null" as valid JSON
```

### `send()` vs `json()` Differences

```typescript
// For objects, both work:
res.send({ name: 'John' });  // Works
res.json({ name: 'John' });  // Works

// But for null:
res.send(null);   // Sends empty response!
res.json(null);   // Sends "null" as JSON

// Recommendation: Use json() for JSON data
```

### `res.sendStatus()` — Status with Default Body

```typescript
res.sendStatus(200); // Same as: res.status(200).send('OK')
res.sendStatus(404); // Same as: res.status(404).send('Not Found')
res.sendStatus(500); // Same as: res.status(500).send('Internal Server Error')
```

---

## Status Codes

### Setting Status

```typescript
// Chain with response
res.status(201).json({ id: 1, created: true });
res.status(400).json({ error: 'Bad request' });
res.status(404).json({ error: 'Not found' });

// Multiple chains
res
    .status(201)
    .set('Location', '/users/1')
    .json({ id: 1 });
```

### Common Status Codes

```typescript
// Success
res.status(200).json({ data });     // OK
res.status(201).json({ created });  // Created
res.status(204).send();             // No Content (delete usually)

// Redirect
res.status(301).redirect('/new');   // Moved Permanently
res.status(302).redirect('/temp');  // Found (temp redirect)

// Client Errors
res.status(400).json({ error: 'Bad Request' });
res.status(401).json({ error: 'Unauthorized' });
res.status(403).json({ error: 'Forbidden' });
res.status(404).json({ error: 'Not Found' });
res.status(409).json({ error: 'Conflict' });
res.status(422).json({ error: 'Validation Error' });
res.status(429).json({ error: 'Too Many Requests' });

// Server Errors
res.status(500).json({ error: 'Internal Server Error' });
res.status(503).json({ error: 'Service Unavailable' });
```

---

## Headers

### Setting Headers

```typescript
// Single header
res.set('Content-Type', 'text/plain');
res.set('X-Request-Id', '12345');

// Multiple headers
res.set({
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value',
    'Cache-Control': 'no-cache'
});

// Aliases
res.header('X-Custom', 'value');  // Same as res.set()
```

### Common Headers

```typescript
// Content
res.set('Content-Type', 'application/json');
res.set('Content-Disposition', 'attachment; filename="report.pdf"');

// Caching
res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
res.set('Cache-Control', 'public, max-age=3600');
res.set('ETag', '"abc123"');

// CORS (use cors middleware instead)
res.set('Access-Control-Allow-Origin', '*');

// Security
res.set('X-Content-Type-Options', 'nosniff');
res.set('X-Frame-Options', 'DENY');
```

### Helper Methods

```typescript
// Set Content-Type
res.type('json');          // application/json
res.type('html');          // text/html
res.type('application/xml');

// Get header (can read back)
const contentType = res.get('Content-Type');
```

---

## Redirects

### Basic Redirects

```typescript
// Default 302 (temporary)
res.redirect('/login');

// With explicit status
res.redirect(301, '/new-url');  // Permanent
res.redirect(302, '/temp-url'); // Temporary
res.redirect(303, '/see-other'); // See Other (after POST)

// Back to referrer
res.redirect('back');

// External redirect
res.redirect('https://google.com');
```

### Post-Redirect-Get Pattern

```typescript
app.post('/users', async (req, res) => {
    const user = await createUser(req.body);
    
    // Redirect after successful creation
    res.redirect(303, `/users/${user.id}`);
});
```

---

## Sending Files

### `res.sendFile()` — Send for Display

```typescript
import path from 'path';

// Must use absolute path!
res.sendFile(path.join(__dirname, 'files', 'image.png'));

// With options
res.sendFile('/path/to/file.pdf', {
    headers: {
        'Content-Type': 'application/pdf'
    }
});
```

### `res.download()` — Trigger Download

```typescript
// Downloads with original filename
res.download('/path/to/report.pdf');

// Downloads with custom filename
res.download('/path/to/file-123.pdf', 'quarterly-report.pdf');

// With callback for error handling
res.download('/path/to/file.pdf', 'report.pdf', (err) => {
    if (err) {
        res.status(500).json({ error: 'Download failed' });
    }
});
```

### `res.attachment()` — Set Download Header

```typescript
// Just sets Content-Disposition header
res.attachment('report.pdf');
res.send(fileBuffer);

// Or use with sendFile
res.attachment('report.pdf');
res.sendFile('/path/to/file.pdf');
```

---

## Cookies

### Setting Cookies

```typescript
// Basic cookie
res.cookie('sessionId', 'abc123');

// With options
res.cookie('token', 'xyz789', {
    httpOnly: true,      // Not accessible via JavaScript
    secure: true,        // Only sent over HTTPS
    maxAge: 3600000,     // 1 hour in milliseconds
    sameSite: 'strict',  // CSRF protection
    path: '/',           // Available on all paths
    domain: '.example.com'  // Available on subdomains
});
```

### Clearing Cookies

```typescript
res.clearCookie('sessionId');

// Must match options used to set it
res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    path: '/'
});
```

### Signed Cookies

```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser('secret-key'));

// Set signed cookie
res.cookie('auth', 'value', { signed: true });

// Read in next request: req.signedCookies.auth
```

---

## Response Chaining

Express methods return `this` for chaining:

```typescript
res
    .status(201)
    .set('Location', '/users/1')
    .set('X-Created-By', 'API')
    .cookie('flash', 'User created!')
    .json({
        success: true,
        data: { id: 1 }
    });
```

---

## Typed Responses

### Basic Typing

```typescript
interface User {
    id: number;
    email: string;
}

app.get('/users/:id', (req, res: Response<User>) => {
    res.json({ id: 1, email: 'test@test.com' });
    // TypeScript checks the shape!
});
```

### Response Wrapper Pattern

```typescript
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        page: number;
        total: number;
    };
}

// Helper functions
function sendSuccess<T>(res: Response, data: T, status = 200) {
    res.status(status).json({
        success: true,
        data
    });
}

function sendError(res: Response, error: string, status = 400) {
    res.status(status).json({
        success: false,
        error
    });
}

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

## PHP/Laravel Comparison

```php
// Laravel
return response()->json(['data' => $data]);
return response()->json(['data' => $data], 201);
return redirect('/login');
return response()->download($path, 'filename.pdf');
return response('Hello', 200)->header('X-Custom', 'value');
return Cookie::queue('name', 'value', 60);
```

```typescript
// Express
res.json({ data });
res.status(201).json({ data });
res.redirect('/login');
res.download(path, 'filename.pdf');
res.set('X-Custom', 'value').send('Hello');
res.cookie('name', 'value', { maxAge: 60000 });
```

| Laravel | Express |
|---------|---------|
| `response()->json($data)` | `res.json(data)` |
| `response()->json($data, 201)` | `res.status(201).json(data)` |
| `redirect('/path')` | `res.redirect('/path')` |
| `download($path)` | `res.download(path)` |
| `->header('X', 'Y')` | `res.set('X', 'Y')` |
| `Cookie::queue()` | `res.cookie()` |
| `Cookie::forget()` | `res.clearCookie()` |

---

## Common Mistakes

### 1. Sending Multiple Responses

```typescript
// ❌ Error: Cannot send headers after sent
app.get('/test', (req, res) => {
    res.json({ first: true });
    res.json({ second: true });  // Error!
});

// ✅ Use return to prevent continuation
app.get('/test', (req, res) => {
    if (error) {
        return res.status(400).json({ error: 'Bad' });
    }
    res.json({ success: true });
});
```

### 2. Forgetting Return

```typescript
// ❌ Code continues after response
app.get('/admin', (req, res) => {
    if (!isAdmin) {
        res.status(403).json({ error: 'Forbidden' });
        // Continues executing!
    }
    res.json(sensitiveData);  // Still runs!
});

// ✅ Return after response
app.get('/admin', (req, res) => {
    if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(sensitiveData);
});
```

### 3. Not Sending Any Response

```typescript
// ❌ Client waits forever
app.get('/bad', (req, res) => {
    const data = fetchData();
    // Forgot to send response!
});

// ✅ Always send something
app.get('/good', (req, res) => {
    const data = fetchData();
    res.json(data);
});
```

---

## Key Takeaways

1. **Use `res.json()` for JSON** — More explicit than `res.send()`
2. **Chain responses** — `res.status(201).json({})` 
3. **Return after sending** — Prevents double-response errors
4. **Set status before body** — `res.status(404).json({})`
5. **Use helpers for consistency** — Create `sendSuccess`/`sendError` helpers
6. **Absolute paths for files** — `res.sendFile()` needs absolute path
