# Phase 078: Static Files — Cheatsheet

## Basic Usage

```typescript
import path from 'path';

// Serve from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// With prefix
app.use('/static', express.static(path.join(__dirname, 'public')));
```

## Production Config

```typescript
app.use(express.static('public', {
    maxAge: '1y',
    etag: true,
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));
```

## Options

| Option | Purpose | Production Value |
|--------|---------|------------------|
| `maxAge` | Cache duration | `'1y'` |
| `etag` | Enable ETags | `true` |
| `immutable` | Won't change | `true` |
| `dotfiles` | Handle .files | `'deny'` |

## Remember

- ✅ Use absolute paths
- ✅ Cache in production
- ✅ Static before routes
- ✅ Use CDN/nginx in production
- ❌ Don't serve sensitive files
