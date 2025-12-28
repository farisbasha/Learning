# Phase 069: Body-Parser — Cheatsheet

## Legacy vs Modern

```javascript
// ❌ LEGACY (pre-Express 4.16)
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ MODERN (Express 4.16+)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## Body Parser Types

| Parser | Content-Type | Result |
|--------|--------------|--------|
| `express.json()` | `application/json` | `req.body = { ... }` |
| `express.urlencoded()` | `application/x-www-form-urlencoded` | `req.body = { ... }` |
| `express.raw()` | `application/octet-stream` | `req.body = Buffer` |
| `express.text()` | `text/plain` | `req.body = 'string'` |
| `multer` (separate) | `multipart/form-data` | Files + fields |

## Common Options

```typescript
// JSON parser
app.use(express.json({
    limit: '10mb',        // Max body size
    strict: true          // Only arrays/objects
}));

// URL-encoded parser
app.use(express.urlencoded({
    extended: true,       // Rich object parsing
    limit: '1mb',
    parameterLimit: 1000
}));
```

## Extended Option

```typescript
// extended: true (qs library)
// Body: user[name]=John&user[age]=30
// Result: { user: { name: 'John', age: '30' } }

// extended: false (querystring)
// Body: user[name]=John
// Result: { 'user[name]': 'John' }
```

## Standard Setup

```typescript
import express from 'express';

const app = express();

// Order matters - parsers first!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then routes
app.post('/api/users', (req, res) => {
    console.log(req.body);  // Parsed!
});
```

## PHP Comparison

| PHP/Laravel | Express |
|-------------|---------|
| Automatic (built-in) | Need middleware |
| `$request->all()` | `req.body` |
| `$request->input('key')` | `req.body.key` |
| `$request->json()` | `express.json()` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `req.body` undefined | Add `express.json()` before routes |
| Form data not parsed | Add `express.urlencoded()` |
| File upload fails | Use `multer`, not body-parser |
| Still using body-parser package | Use built-in `express.json()` |

## Remember

- ✅ Use `express.json()` and `express.urlencoded()`
- ✅ Put body parsers BEFORE routes
- ✅ Client must send correct Content-Type header
- ❌ Don't install body-parser separately (since 4.16)
- ❌ Don't use for file uploads (use multer)
