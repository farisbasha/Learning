# Phase 078: Static File Serving

## Overview

Static files are assets that don't change dynamically: images, CSS, JavaScript, fonts, PDFs, etc. Express provides `express.static()` middleware to serve these files efficiently.

---

## Basic Usage

```typescript
import express from 'express';
import path from 'path';

const app = express();

// Serve files from 'public' directory
app.use(express.static('public'));

// Files accessible at:
// public/style.css → http://localhost:3000/style.css
// public/images/logo.png → http://localhost:3000/images/logo.png
// public/js/app.js → http://localhost:3000/js/app.js
```

### Directory Structure

```
project/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── images/
│   │   ├── logo.png
│   │   └── banner.jpg
│   └── index.html
└── src/
    └── app.ts
```

---

## With URL Prefix

```typescript
// Add '/static' prefix
app.use('/static', express.static('public'));

// Now accessed via:
// public/style.css → http://localhost:3000/static/style.css
// public/logo.png → http://localhost:3000/static/logo.png
```

---

## Absolute Paths (Recommended)

```typescript
import path from 'path';

// ❌ Relative path - can break depending on where you run from
app.use(express.static('public'));

// ✅ Absolute path - always works
app.use(express.static(path.join(__dirname, 'public')));

// For project root
app.use(express.static(path.join(process.cwd(), 'public')));
```

---

## Multiple Static Directories

```typescript
// Order matters - first match wins
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'assets')));

// If file exists in multiple directories, first one is served
```

---

## Configuration Options

### Basic Options

```typescript
app.use(express.static('public', {
    // Index file (default: 'index.html')
    index: 'index.html',
    
    // Redirect to trailing slash for directories
    redirect: true,
    
    // Set custom headers
    setHeaders: (res, filePath, stat) => {
        res.set('X-Custom-Header', 'value');
    }
}));
```

### Caching Options

```typescript
app.use(express.static('public', {
    // Cache control max age (milliseconds or string)
    maxAge: '1d',  // or 86400000
    
    // Enable ETag generation
    etag: true,
    
    // Enable Last-Modified header
    lastModified: true,
    
    // Mark as immutable (won't change)
    immutable: true
}));
```

### Security Options

```typescript
app.use(express.static('public', {
    // Handle dotfiles (.env, .gitignore, etc.)
    dotfiles: 'ignore',  // 'allow', 'deny', 'ignore'
    
    // Pass to next handler if file not found
    fallthrough: true,
    
    // Extensions to try if file not found
    extensions: ['html', 'htm']
}));
```

---

## Production Configuration

### Development

```typescript
if (process.env.NODE_ENV === 'development') {
    app.use(express.static('public', {
        maxAge: 0,  // No caching
        etag: false
    }));
}
```

### Production

```typescript
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public', {
        maxAge: '1y',      // Cache for 1 year
        etag: true,
        immutable: true,   // Won't change
        setHeaders: (res, filePath) => {
            // Different caching for different file types
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}
```

---

## Custom Headers

```typescript
app.use(express.static('public', {
    setHeaders: (res, filePath, stat) => {
        // Security headers
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        
        // CORS for fonts
        if (filePath.match(/\.(woff|woff2|ttf|eot)$/)) {
            res.set('Access-Control-Allow-Origin', '*');
        }
        
        // Force download for PDFs
        if (filePath.endsWith('.pdf')) {
            res.set('Content-Disposition', 'attachment');
        }
        
        // Custom caching
        if (filePath.includes('/images/')) {
            res.set('Cache-Control', 'public, max-age=604800'); // 1 week
        }
    }
}));
```

---

## Serving SPA (Single Page Application)

```typescript
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Catch-all for SPA routing (must be last!)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

---

## Virtual Path Prefix

```typescript
// Serve from 'public' but prefix URLs with '/assets'
app.use('/assets', express.static('public'));

// public/style.css → http://localhost:3000/assets/style.css
```

---

## Conditional Static Serving

```typescript
// Only serve static files in development
if (process.env.NODE_ENV === 'development') {
    app.use(express.static('public'));
} else {
    // In production, use CDN or nginx
    console.log('Static files served by CDN');
}
```

---

## Security Considerations

### 1. Prevent Directory Listing

```typescript
// ❌ Don't do this - allows directory browsing
app.use(express.static('public', { index: false }));

// ✅ Do this - serve index.html or 404
app.use(express.static('public', { index: 'index.html' }));
```

### 2. Hide Sensitive Files

```typescript
app.use(express.static('public', {
    dotfiles: 'deny'  // Block .env, .git, etc.
}));
```

### 3. Restrict File Types

```typescript
app.use((req, res, next) => {
    // Only allow specific extensions
    const allowedExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.svg'];
    const ext = path.extname(req.path);
    
    if (req.path.startsWith('/static/') && !allowedExtensions.includes(ext)) {
        return res.status(403).send('Forbidden');
    }
    
    next();
});

app.use('/static', express.static('public'));
```

---

## PHP/Laravel Comparison

### Laravel

```php
// public/ directory is automatically served
// Files in public/ are accessible directly

// In views:
<img src="{{ asset('images/logo.png') }}">
<link rel="stylesheet" href="{{ asset('css/app.css') }}">

// Generates: http://localhost/images/logo.png
```

### Express

```typescript
app.use(express.static('public'));

// In HTML:
<img src="/images/logo.png">
<link rel="stylesheet" href="/css/app.css">

// Or with prefix:
app.use('/assets', express.static('public'));
<img src="/assets/images/logo.png">
```

---

## CDN Integration

### Development: Local Files

```typescript
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
    app.use('/static', express.static('public'));
}

// In templates:
const CDN_URL = isDev ? '' : 'https://cdn.example.com';
<img src="${CDN_URL}/images/logo.png">
```

### Production: CDN

In production, upload static files to CDN (Cloudflare, AWS CloudFront) and don't serve from Express.

---

## Performance Tips

### 1. Use Nginx for Static Files (Production)

```nginx
# nginx.conf
location /static/ {
    alias /var/www/app/public/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    proxy_pass http://localhost:3000;
}
```

### 2. Compress Files

```typescript
import compression from 'compression';

app.use(compression());
app.use(express.static('public'));
```

### 3. Use HTTP/2

HTTP/2 multiplexing makes serving multiple static files more efficient.

---

## Common Mistakes

### 1. Serving After Routes

```typescript
// ❌ Wrong - static middleware after routes
app.get('/api/users', getUsers);
app.use(express.static('public'));  // Too late!

// ✅ Correct - static before routes
app.use(express.static('public'));
app.get('/api/users', getUsers);
```

### 2. No Caching in Production

```typescript
// ❌ Wrong - no caching
app.use(express.static('public'));

// ✅ Correct - cache in production
app.use(express.static('public', {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0
}));
```

### 3. Exposing Sensitive Files

```typescript
// ❌ Wrong - serves everything including .env
app.use(express.static('.'));

// ✅ Correct - only serve public directory
app.use(express.static('public'));
```

---

## Key Takeaways

1. **Use absolute paths** — `path.join(__dirname, 'public')`
2. **Cache in production** — `maxAge: '1y'` for static assets
3. **Use CDN in production** — Don't serve from Express
4. **Security first** — Block dotfiles, restrict extensions
5. **Static before routes** — Middleware order matters
6. **Different caching per file type** — HTML vs images vs JS
7. **Use nginx for production** — Better performance than Express
