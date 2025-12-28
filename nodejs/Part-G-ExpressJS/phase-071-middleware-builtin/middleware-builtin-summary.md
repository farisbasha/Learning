# Phase 071: Built-in Middleware — Cheatsheet

## Overview

| Middleware | Purpose | Content-Type |
|------------|---------|--------------|
| `express.json()` | Parse JSON body | `application/json` |
| `express.urlencoded()` | Parse form data | `application/x-www-form-urlencoded` |
| `express.static()` | Serve static files | Any |
| `express.raw()` | Raw binary buffer | `application/octet-stream` |
| `express.text()` | Plain text | `text/plain` |

## Standard Setup

```typescript
import express from 'express';
import path from 'path';

const app = express();

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes...
```

## express.json() Options

```typescript
app.use(express.json({
    limit: '10mb',        // Max body size
    strict: true,         // Only arrays/objects
    type: 'application/json'
}));
```

## express.urlencoded() Options

```typescript
app.use(express.urlencoded({
    extended: true,       // Parse nested objects
    limit: '1mb',
    parameterLimit: 1000
}));
```

### extended: true vs false

| `extended: true` | `extended: false` |
|------------------|-------------------|
| Parse nested objects | Flat only |
| Uses `qs` library | Uses `querystring` |
| `user[name]=John` → `{ user: { name: 'John' }}` | `{ 'user[name]': 'John' }` |

## express.static() Options

```typescript
app.use('/static', express.static('public', {
    maxAge: '1d',         // Cache duration
    etag: true,           // Enable ETags
    index: 'index.html',
    dotfiles: 'ignore'    // Hide .files
}));
```

## Correct Order

```typescript
// 1. Body parsers (FIRST)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Static files
app.use(express.static('public'));

// 3. Routes
app.use('/api', routes);

// 4. Error handler (LAST)
app.use(errorHandler);
```

## Webhook Pattern (Raw Body)

```typescript
// For Stripe, GitHub, etc.
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
    const rawBody = req.body;  // Buffer
    // Verify signature...
});
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| Automatic body parsing | `express.json()` |
| public/ directory | `express.static('public')` |
| `asset()` helper | Direct URL path |
| `$request->all()` | `req.body` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Body parser after routes | Move parsers to top |
| Relative path in static | Use `path.join(__dirname, ...)` |
| Missing extended option | Add `extended: true` |
| Large files rejected | Increase `limit` option |

## Remember

- ✅ Put body parsers before routes
- ✅ Use absolute paths for static
- ✅ Set `extended: true` for forms
- ✅ Configure caching for production
- ❌ Don't use static for private files
