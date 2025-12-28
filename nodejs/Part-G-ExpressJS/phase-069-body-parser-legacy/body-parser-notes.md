# Phase 069: Body-Parser (Legacy Pattern)

## Why Learn This?

> ⚠️ **LEGACY PATTERN**: Before Express 4.16 (2017), you HAD to install `body-parser` as a separate package. You will encounter this in:
> - Older tutorials and documentation
> - Legacy codebases from 2015-2018
> - Stack Overflow answers from that era

Understanding body-parser helps you:
1. Read and maintain older code
2. Understand what `express.json()` is actually doing
3. Know when to use the modern approach

---

## The History

### Express 3.x (2012-2014)
Body parsing was bundled with Express. You could use middleware like `express.bodyParser()`.

### Express 4.x (2014)
Express removed all bundled middleware! You had to install them separately:
- `body-parser` for request bodies
- `cookie-parser` for cookies
- `express-session` for sessions
- etc.

### Express 4.16+ (2017)
Body-parser was **re-bundled** into Express! Now you can use:
- `express.json()` instead of `bodyParser.json()`
- `express.urlencoded()` instead of `bodyParser.urlencoded()`

---

## Legacy Pattern (Pre-4.16)

### Installation
```bash
npm install body-parser
```

### Usage
```javascript
// ❌ OLD WAY - you'll see this in legacy code
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies (form data)
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
    console.log(req.body);  // Parsed body
    res.json({ received: req.body });
});
```

---

## Modern Pattern (4.16+)

### No Installation Needed!
`express.json()` and `express.urlencoded()` are built-in.

### Usage
```typescript
// ✅ MODERN WAY - use this!
import express from 'express';

const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
    console.log(req.body);  // Works the same!
    res.json({ received: req.body });
});
```

---

## Side-by-Side Comparison

```javascript
// ╔════════════════════════════════════════════════════════════╗
// ║               LEGACY (pre-4.16)                            ║
// ╠════════════════════════════════════════════════════════════╣
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: 'application/octet-stream' }));
app.use(bodyParser.text({ type: 'text/plain' }));

// ╔════════════════════════════════════════════════════════════╗
// ║               MODERN (4.16+)                               ║
// ╠════════════════════════════════════════════════════════════╣
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream' }));
app.use(express.text({ type: 'text/plain' }));
```

**They are functionally identical!** Express just re-exports body-parser.

---

## What Body Parsers Actually Do

### Without Parsing

```typescript
// Request: POST /data
// Headers: Content-Type: application/json
// Body: {"name": "John"}

app.post('/data', (req, res) => {
    console.log(req.body);  // undefined!
    
    // You'd have to manually parse:
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
        const parsed = JSON.parse(data);
        console.log(parsed);  // { name: 'John' }
    });
});
```

### With Parsing

```typescript
app.use(express.json());

app.post('/data', (req, res) => {
    console.log(req.body);  // { name: 'John' } - Already parsed!
});
```

### How It Works Internally

```typescript
// Simplified version of what express.json() does:
function jsonParser(req, res, next) {
    // Only process JSON content-type
    if (!req.is('application/json')) {
        return next();
    }
    
    let data = '';
    
    req.on('data', (chunk) => {
        data += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            req.body = JSON.parse(data);
            next();
        } catch (err) {
            res.status(400).json({ error: 'Invalid JSON' });
        }
    });
}
```

---

## Configuration Options

### `express.json()` Options

```typescript
app.use(express.json({
    // Max body size (default: '100kb')
    limit: '10mb',
    
    // Only parse when Content-Type matches
    type: 'application/json',
    
    // Strict mode: only accept arrays and objects
    strict: true,
    
    // Custom reviver function (like JSON.parse reviver)
    reviver: (key, value) => value
}));
```

### `express.urlencoded()` Options

```typescript
app.use(express.urlencoded({
    // Use qs library for rich objects (default: true)
    // false = querystring library (simpler)
    extended: true,
    
    // Max body size
    limit: '1mb',
    
    // Max number of parameters
    parameterLimit: 1000
}));
```

### `extended: true` vs `extended: false`

```typescript
// extended: true (uses qs library)
// Can parse nested objects:
// POST body: user[name]=John&user[age]=30
// req.body = { user: { name: 'John', age: '30' } }

// extended: false (uses querystring library)
// Only flat objects:
// POST body: user[name]=John
// req.body = { 'user[name]': 'John' }
```

---

## Different Content Types

### JSON (application/json)
```typescript
app.use(express.json());

// Handles: { "name": "John" }
// Result: req.body = { name: 'John' }
```

### URL-Encoded (application/x-www-form-urlencoded)
```typescript
app.use(express.urlencoded({ extended: true }));

// Handles: name=John&age=30
// Result: req.body = { name: 'John', age: '30' }
```

### Raw (application/octet-stream)
```typescript
app.use(express.raw({ type: 'application/octet-stream' }));

// Handles: binary data
// Result: req.body = <Buffer ...>
```

### Text (text/plain)
```typescript
app.use(express.text({ type: 'text/plain' }));

// Handles: Hello World
// Result: req.body = 'Hello World'
```

### Multipart (multipart/form-data)
```typescript
// ⚠️ NOT handled by express.json() or urlencoded()!
// Use multer for file uploads
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file);  // File info
    console.log(req.body);  // Other form fields
});
```

---

## Error Handling

### JSON Parse Errors

```typescript
app.use(express.json());

// If client sends invalid JSON:
// { "name": "John  <- missing closing brace

// Express returns 400 Bad Request automatically
// You can customize with error middleware:

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next(err);
});
```

### Body Size Exceeded

```typescript
app.use(express.json({ limit: '1kb' }));

// If body exceeds limit:
// Express returns 413 Payload Too Large
```

---

## PHP/Laravel Comparison

```php
// Laravel - body parsing is automatic!
public function store(Request $request)
{
    $name = $request->input('name');  // Works for JSON and form data
    $all = $request->all();
}
```

```typescript
// Express - need middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/store', (req, res) => {
    const name = req.body.name;
    const all = req.body;
});
```

**Key difference**: Laravel handles this automatically, Express requires explicit middleware.

---

## Migration Guide

### Migrating Legacy Code

```javascript
// ❌ OLD
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ NEW - just remove the import and change the calls
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Options remain the same!
app.use(express.json({ limit: '10mb' }));
```

### When You Still Need body-parser

The standalone `body-parser` package has some features not in Express's built-in versions:
- `bodyParser.raw()` with more options
- `bodyParser.text()` with more options
- Custom verify functions

But for 99% of use cases, Express's built-in methods are sufficient.

---

## Common Mistakes

### 1. Middleware After Routes

```typescript
// ❌ Wrong - body parser after route
app.post('/users', (req, res) => {
    console.log(req.body);  // undefined!
});
app.use(express.json());  // Too late!

// ✅ Correct - body parser before routes
app.use(express.json());
app.post('/users', (req, res) => {
    console.log(req.body);  // Works!
});
```

### 2. Wrong Content-Type

```typescript
app.use(express.json());

// Client sends: Content-Type: text/plain
// Body: {"name":"John"}

// req.body = undefined! (JSON parser ignored it)

// Solution: Ensure client sends Content-Type: application/json
```

### 3. Missing urlencoded for Forms

```typescript
app.use(express.json());  // Only JSON!

// HTML form submission uses application/x-www-form-urlencoded
// req.body = undefined for form posts!

// Fix: Add urlencoded parser too
app.use(express.urlencoded({ extended: true }));
```

---

## Key Takeaways

1. **Use Express built-in methods** — `express.json()` and `express.urlencoded()`
2. **No need for body-parser package** — It's built into Express 4.16+
3. **Middleware order matters** — Body parser BEFORE routes
4. **Content-Type matters** — Parser only handles matching content types
5. **For file uploads** — Use `multer`, not body-parser
6. **Recognize legacy code** — `require('body-parser')` is outdated
