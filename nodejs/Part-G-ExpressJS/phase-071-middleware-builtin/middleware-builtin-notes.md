# Phase 071: Built-in Middleware

## Overview

Express comes with several built-in middleware functions that handle common tasks. Understanding these is essential because you'll use them in every Express application.

---

## Express Built-in Middleware

| Middleware | Purpose | Added In |
|------------|---------|----------|
| `express.json()` | Parse JSON bodies | 4.16.0 |
| `express.urlencoded()` | Parse URL-encoded bodies | 4.16.0 |
| `express.static()` | Serve static files | Always |
| `express.raw()` | Parse raw binary | 4.17.0 |
| `express.text()` | Parse plain text | 4.17.0 |
| `express.Router()` | Create modular routers | Always |

---

## `express.json()` — JSON Body Parser

### Basic Usage

```typescript
app.use(express.json());

// Now handles: Content-Type: application/json
app.post('/api/users', (req, res) => {
    console.log(req.body); // Parsed JSON object
});
```

### Configuration Options

```typescript
app.use(express.json({
    // Maximum body size
    limit: '10mb',  // default: '100kb'
    
    // Only parse when Content-Type matches
    type: 'application/json',  // default
    
    // Strict mode: only accept arrays and objects
    strict: true,  // default: true
    
    // Custom inflate function for compressed bodies
    inflate: true,  // default: true
    
    // Custom JSON reviver (like JSON.parse)
    reviver: (key, value) => {
        // Convert date strings to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
        }
        return value;
    },
    
    // Verify function (for signatures, etc.)
    verify: (req, res, buf, encoding) => {
        // Access raw body buffer before parsing
        (req as any).rawBody = buf;
    }
}));
```

### Real-World Configuration

```typescript
// For API servers
app.use(express.json({ 
    limit: '1mb',
    strict: true 
}));

// For webhook receivers (need raw body for signature verification)
app.use('/webhook', express.json({
    verify: (req, res, buf) => {
        (req as any).rawBody = buf.toString();
    }
}));
```

---

## `express.urlencoded()` — Form Data Parser

### Basic Usage

```typescript
app.use(express.urlencoded({ extended: true }));

// Handles: Content-Type: application/x-www-form-urlencoded
// Example: name=John&age=30
```

### Extended vs Non-Extended

```typescript
// extended: true (uses 'qs' library)
// Supports nested objects and arrays
app.use(express.urlencoded({ extended: true }));

// POST: user[name]=John&user[email]=john@test.com&tags[]=a&tags[]=b
// Result: { user: { name: 'John', email: 'john@test.com' }, tags: ['a', 'b'] }

// extended: false (uses 'querystring' library)
// Only flat key-value pairs
app.use(express.urlencoded({ extended: false }));

// POST: user[name]=John
// Result: { 'user[name]': 'John' }  // Not nested!
```

### Configuration Options

```typescript
app.use(express.urlencoded({
    extended: true,
    
    // Maximum body size
    limit: '1mb',  // default: '100kb'
    
    // Maximum number of parameters
    parameterLimit: 1000,  // default: 1000
    
    // Content-Type to match
    type: 'application/x-www-form-urlencoded'
}));
```

### When to Use Each

| Use Case | extended |
|----------|----------|
| Simple forms | `false` |
| Complex nested data | `true` |
| HTML form inputs | `true` (recommended) |
| Legacy compatibility | `false` |

---

## `express.static()` — Static File Server

### Basic Usage

```typescript
// Serve files from 'public' directory
app.use(express.static('public'));

// Files accessible:
// public/style.css → http://localhost:3000/style.css
// public/images/logo.png → http://localhost:3000/images/logo.png
```

### With URL Prefix

```typescript
// Add path prefix
app.use('/static', express.static('public'));

// Now accessed via:
// public/style.css → http://localhost:3000/static/style.css
```

### With Absolute Path (Recommended)

```typescript
import path from 'path';

// Use absolute path for reliability
app.use(express.static(path.join(__dirname, 'public')));

// Or for project root
app.use(express.static(path.join(process.cwd(), 'public')));
```

### Configuration Options

```typescript
app.use(express.static('public', {
    // Set Content-Type based on extension
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.json')) {
            res.set('Content-Type', 'application/json');
        }
    },
    
    // Index file name
    index: 'index.html',  // default
    
    // Allow directory browsing
    redirect: true,  // default: true
    
    // Serve dotfiles (.env, .gitignore)
    dotfiles: 'ignore',  // 'allow', 'deny', 'ignore'
    
    // ETag generation
    etag: true,  // default: true
    
    // Cache control
    maxAge: '1d',  // or milliseconds
    immutable: false,
    
    // Follow symlinks
    fallthrough: true,  // Pass to next handler if not found
    
    // File extensions to try
    extensions: ['html', 'htm']
}));
```

### Multiple Static Directories

```typescript
// Order matters - first match wins
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('assets'));
```

### Production Configuration

```typescript
// Development
app.use(express.static('public'));

// Production with caching
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public', {
        maxAge: '1y',  // Cache for 1 year
        etag: true,
        immutable: true  // Won't change
    }));
}
```

---

## `express.raw()` — Raw Body Parser

### Use Case: Webhooks

Many services (Stripe, GitHub) require the raw body for signature verification.

```typescript
// Parse raw body for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body;  // Buffer!
    
    // Verify signature with raw body
    const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
    );
});
```

### Configuration

```typescript
app.use(express.raw({
    // Content-Type to match
    type: 'application/octet-stream',  // default
    
    // Also accept JSON as raw
    type: ['application/octet-stream', 'application/json'],
    
    // Maximum size
    limit: '5mb'
}));
```

---

## `express.text()` — Text Body Parser

### Use Case: Plain Text APIs

```typescript
app.use(express.text({ type: 'text/plain' }));

app.post('/log', (req, res) => {
    const logEntry = req.body;  // String!
    console.log('Log:', logEntry);
    res.status(201).send('Logged');
});
```

### Configuration

```typescript
app.use(express.text({
    type: 'text/plain',
    limit: '1mb',
    defaultCharset: 'utf-8'
}));
```

---

## Middleware Order

### The Correct Order

```typescript
import express from 'express';

const app = express();

// 1. Basic middleware (logging, CORS)
app.use(cors());
app.use(helmet());

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static files
app.use(express.static('public'));

// 4. Session/Authentication
app.use(session({ ... }));
app.use(passport.initialize());

// 5. Custom middleware
app.use(requestLogger);
app.use(rateLimiter);

// 6. Routes
app.use('/api', apiRouter);

// 7. 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// 8. Error handler (ALWAYS LAST)
app.use(errorHandler);
```

### Why Order Matters

```typescript
// ❌ Wrong - static before body parser causes issues
app.use(express.static('public'));  // Might try to parse API routes as files
app.use(express.json());

// ❌ Wrong - routes before body parser
app.post('/api/users', handler);  // req.body undefined!
app.use(express.json());

// ✅ Correct
app.use(express.json());
app.use(express.static('public'));
app.post('/api/users', handler);
```

---

## PHP/Laravel Comparison

### Body Parsing
```php
// Laravel - automatic!
$data = $request->all();
$name = $request->input('name');
```

```typescript
// Express - need middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then access
const data = req.body;
const name = req.body.name;
```

### Static Files
```php
// Laravel - use public/ directory + asset() helper
<img src="{{ asset('images/logo.png') }}">
```

```typescript
// Express
app.use(express.static('public'));
// Access: http://localhost:3000/images/logo.png
```

---

## Common Patterns

### Conditional Body Parsing

```typescript
// Only parse JSON for API routes
app.use('/api', express.json());

// Parse urlencoded for form routes
app.use('/form', express.urlencoded({ extended: true }));

// Raw for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));
```

### Environment-Based Configuration

```typescript
const isDev = process.env.NODE_ENV !== 'production';

// Static files with dev/prod settings
app.use(express.static('public', {
    maxAge: isDev ? 0 : '1y',
    etag: !isDev
}));

// Larger limits in development
app.use(express.json({ 
    limit: isDev ? '50mb' : '1mb' 
}));
```

---

## Key Takeaways

1. **`express.json()` for JSON APIs** — Use with appropriate limit
2. **`express.urlencoded({ extended: true })`** — For HTML forms
3. **`express.static()` with absolute paths** — Use `path.join(__dirname, 'public')`
4. **Middleware order matters** — Parsers before routes, error handler last
5. **Use `express.raw()` for webhooks** — When you need the raw body buffer
6. **Configure for production** — Add caching headers for static files
