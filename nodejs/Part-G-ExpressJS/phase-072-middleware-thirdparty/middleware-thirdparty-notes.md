# Phase 072: Third-Party Middleware

## Overview

Third-party middleware are pre-built, community-maintained packages that add specific functionality to your Express application. Instead of writing common features from scratch (CORS, security headers, logging, compression, etc.), you can install and configure battle-tested middleware packages.

Think of middleware as **plugins** that sit in your request-response pipeline and perform specific tasks before your route handlers execute.

---

## The Problem This Solves

### Without Third-Party Middleware (Manual Approach):

```typescript
// Manual CORS handling - error-prone!
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Manual security headers - incomplete!
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    // Missing many other important security headers...
    next();
});

// Manual logging - basic and limited
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

**Problems:**
- ❌ Incomplete implementations
- ❌ Security vulnerabilities
- ❌ Reinventing the wheel
- ❌ Hard to maintain
- ❌ Missing edge cases

### With Third-Party Middleware (Best Practice):

```typescript
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

app.use(cors());      // ✅ Complete CORS handling
app.use(helmet());    // ✅ 15+ security headers
app.use(morgan('dev')); // ✅ Professional logging
```

**Benefits:**
- ✅ Battle-tested by thousands of developers
- ✅ Handles edge cases
- ✅ Actively maintained
- ✅ Well-documented
- ✅ TypeScript support

---

## How Third-Party Middleware Works Internally

### The Middleware Chain:

```typescript
// When you do this:
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Express creates a chain:
Request → cors middleware → helmet middleware → morgan middleware → Your Routes → Response
```

### What Happens Under the Hood:

1. **Request arrives** at Express server
2. **cors middleware** executes:
   - Checks `Origin` header
   - Sets `Access-Control-*` headers
   - Calls `next()` to continue
3. **helmet middleware** executes:
   - Sets security headers (`X-Frame-Options`, `Content-Security-Policy`, etc.)
   - Calls `next()`
4. **morgan middleware** executes:
   - Logs request details
   - Calls `next()`
5. **Your route handler** executes
6. **Response** sent back to client

### Memory and Performance:

- Each middleware adds **minimal overhead** (~0.1-1ms per middleware)
- Middleware runs **synchronously** unless it performs async operations
- Order matters: Security middleware should run **before** route handlers

---

## Key Third-Party Middleware Packages

### 1. CORS (Cross-Origin Resource Sharing)

#### What is CORS?

**CORS** is a browser security mechanism that blocks web pages from making requests to a different domain than the one serving the page.

**Example Scenario:**
- Your frontend: `http://localhost:3000` (React app)
- Your backend: `http://localhost:8080` (Express API)
- Without CORS: Browser **blocks** the request
- With CORS: Server tells browser "it's okay to allow this"

#### Why CORS Middleware is Needed:

Browsers send a **preflight request** (OPTIONS) before the actual request for certain types of requests (POST with JSON, custom headers, etc.). The `cors` middleware handles this automatically.

#### Installation:

```bash
npm install cors
npm install -D @types/cors
```

#### Basic Example:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Allow ALL origins (development only!)
app.use(cors());

app.get('/api/users', (req, res) => {
    res.json([{ id: 1, name: 'John' }]);
});

app.listen(8080);
```

**What happens:**
- Browser sends: `Origin: http://localhost:3000`
- Server responds with: `Access-Control-Allow-Origin: *`
- Browser allows the response

#### Production Configuration:

```typescript
import cors from 'cors';

// Only allow specific origins
app.use(cors({
    origin: 'https://yourdomain.com',  // Only this domain
    credentials: true,                  // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],  // Custom headers frontend can read
    maxAge: 86400  // Cache preflight for 24 hours
}));
```

#### Dynamic Origin (Multiple Domains):

```typescript
const allowedOrigins = [
    'https://yourdomain.com',
    'https://app.yourdomain.com',
    'https://admin.yourdomain.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);  // Allow
        } else {
            callback(new Error('Not allowed by CORS'));  // Block
        }
    },
    credentials: true
}));
```

#### Environment-Based Configuration:

```typescript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
```

**.env:**
```
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

#### Edge Cases & Gotchas:

**❌ Common Mistake:**
```typescript
// This WON'T work for credentials
app.use(cors({
    origin: '*',
    credentials: true  // ❌ Browser rejects this combination
}));
```

**✅ Correct:**
```typescript
app.use(cors({
    origin: 'https://yourdomain.com',  // Specific origin
    credentials: true  // ✅ Now it works
}));
```

---

### 2. Helmet (Security Headers)

#### What is Helmet?

Helmet sets **HTTP security headers** to protect your app from common web vulnerabilities:
- **XSS** (Cross-Site Scripting)
- **Clickjacking**
- **MIME sniffing**
- **DNS prefetch control**
- And more...

#### Why It Matters:

Without security headers, browsers are more vulnerable to attacks. Helmet sets **15+ headers** with one line of code.

#### Installation:

```bash
npm install helmet
```

#### Basic Example:

```typescript
import helmet from 'helmet';

app.use(helmet());
```

**Headers Helmet Sets:**

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS by controlling resource loading |
| `X-DNS-Prefetch-Control` | Controls browser DNS prefetching |
| `X-Frame-Options` | Prevents clickjacking (iframe embedding) |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-Download-Options` | Prevents IE from executing downloads |
| `X-Permitted-Cross-Domain-Policies` | Controls Adobe Flash/PDF behavior |

#### Real-World Example (Production):

```typescript
import helmet from 'helmet';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],  // Only load resources from same origin
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            connectSrc: ["'self'", 'https://api.yourdomain.com']
        }
    },
    hsts: {
        maxAge: 31536000,        // 1 year
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'  // Prevent iframe embedding
    }
}));
```

#### For APIs (Relaxed CSP):

```typescript
// APIs don't need strict CSP since they don't serve HTML
app.use(helmet({
    contentSecurityPolicy: false  // Disable CSP for API-only apps
}));
```

#### Edge Cases & Gotchas:

**Problem:** Helmet blocks inline styles/scripts by default

```typescript
// ❌ This won't work with default Helmet
res.send('<script>alert("Hello")</script>');
```

**Solution:** Allow unsafe-inline (not recommended) or use external scripts

```typescript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            scriptSrc: ["'self'", "'unsafe-inline'"]  // Allow inline scripts
        }
    }
}));
```

---

### 3. Morgan (HTTP Request Logging)

#### What is Morgan?

Morgan is a **request logger** that logs HTTP requests in various formats. Essential for debugging and monitoring.

#### Why Logging Matters:

- **Debugging**: See what requests are hitting your server
- **Monitoring**: Track response times and status codes
- **Auditing**: Keep logs for security analysis

#### Installation:

```bash
npm install morgan
npm install -D @types/morgan
```

#### Basic Example:

```typescript
import morgan from 'morgan';

// Development: Colored, concise output
app.use(morgan('dev'));
```

**Output:**
```
GET /api/users 200 15.234 ms - 1024
POST /api/users 201 45.123 ms - 256
```

#### Predefined Formats:

| Format | Use Case | Output Example |
|--------|----------|----------------|
| `'dev'` | Development | `GET /users 200 15ms` |
| `'combined'` | Production (Apache style) | `::1 - - [01/Jan/2024:12:00:00 +0000] "GET /users HTTP/1.1" 200 1024` |
| `'common'` | Standard Apache | Similar to combined, less verbose |
| `'short'` | Shorter than default | `::1 - GET /users HTTP/1.1 200 1024 - 15ms` |
| `'tiny'` | Minimal | `GET /users 200 1024 - 15ms` |

#### Real-World Example (Log to File):

```typescript
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../logs/access.log'),
    { flags: 'a' }  // Append mode
);

// Log to file in production
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    app.use(morgan('dev'));  // Console in development
}
```

#### Custom Format:

```typescript
// Custom format string
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Output: GET /users 200 15.234 ms - 1024
```

#### Advanced: Custom Tokens:

```typescript
import morgan from 'morgan';

// Define custom token
morgan.token('user-id', (req: any) => {
    return req.user?.id || 'anonymous';
});

// Use it
app.use(morgan(':method :url :status :response-time ms - User: :user-id'));

// Output: GET /users 200 15ms - User: 123
```

#### Skip Logging for Certain Requests:

```typescript
app.use(morgan('dev', {
    skip: (req, res) => {
        // Don't log health checks
        return req.url === '/health';
    }
}));
```

---

### 4. Compression (Gzip Compression)

#### What is Compression?

Compression middleware compresses response bodies using **gzip** or **deflate**, reducing bandwidth usage and improving load times.

#### Why It Matters:

**Without compression:**
- JSON response: 100 KB
- Transfer time: 2 seconds on slow connection

**With compression:**
- Compressed size: 15 KB (85% reduction!)
- Transfer time: 0.3 seconds

#### Installation:

```bash
npm install compression
npm install -D @types/compression
```

#### Basic Example:

```typescript
import compression from 'compression';

app.use(compression());
```

**What happens:**
1. Client sends: `Accept-Encoding: gzip, deflate`
2. Server compresses response
3. Server sends: `Content-Encoding: gzip`
4. Client decompresses automatically

#### Production Configuration:

```typescript
import compression from 'compression';

app.use(compression({
    level: 6,  // Compression level (0-9, default: 6)
               // Higher = better compression, slower
               // Lower = faster, less compression
    
    threshold: 1024,  // Only compress if response > 1KB
    
    filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }
        
        // Use default filter function
        return compression.filter(req, res);
    }
}));
```

#### When NOT to Compress:

```typescript
app.use(compression({
    filter: (req, res) => {
        // Don't compress images (already compressed)
        if (res.getHeader('Content-Type')?.toString().startsWith('image/')) {
            return false;
        }
        
        // Don't compress small responses
        const contentLength = res.getHeader('Content-Length');
        if (contentLength && parseInt(contentLength.toString()) < 1024) {
            return false;
        }
        
        return compression.filter(req, res);
    }
}));
```

#### Performance Considerations:

- **CPU vs Bandwidth trade-off**: Compression uses CPU to save bandwidth
- **Level 6** is a good balance (default)
- **Level 9** = maximum compression, but slower
- **Level 1** = fast, but less compression

---

### 5. Cookie Parser

#### What is Cookie Parser?

Parses `Cookie` header and populates `req.cookies` object.

#### Installation:

```bash
npm install cookie-parser
npm install -D @types/cookie-parser
```

#### Basic Example:

```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser());

app.get('/profile', (req, res) => {
    console.log(req.cookies);  // { sessionId: 'abc123', theme: 'dark' }
    
    const sessionId = req.cookies.sessionId;
    res.json({ sessionId });
});
```

#### Signed Cookies (Secure):

```typescript
import cookieParser from 'cookie-parser';

// Use a secret to sign cookies
app.use(cookieParser('your-secret-key'));

// Set a signed cookie
app.get('/login', (req, res) => {
    res.cookie('userId', '123', { signed: true });
    res.send('Logged in');
});

// Read signed cookie
app.get('/profile', (req, res) => {
    const userId = req.signedCookies.userId;  // '123'
    
    if (!userId) {
        return res.status(401).send('Invalid session');
    }
    
    res.json({ userId });
});
```

---

### 6. Express Rate Limit

#### What is Rate Limiting?

Limits the number of requests a client can make in a time window. Prevents:
- **DDoS attacks**
- **Brute force attacks** (login attempts)
- **API abuse**

#### Installation:

```bash
npm install express-rate-limit
```

#### Basic Example:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,  // Max 100 requests per window per IP
    message: 'Too many requests, please try again later',
    standardHeaders: true,  // Return rate limit info in headers
    legacyHeaders: false    // Disable X-RateLimit-* headers
});

// Apply to all routes
app.use(limiter);
```

**Response Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

#### Real-World Example (Stricter for Auth):

```typescript
import rateLimit from 'express-rate-limit';

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Strict limiter for login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,  // Only 5 login attempts per 15 minutes
    skipSuccessfulRequests: true,  // Don't count successful logins
    message: 'Too many login attempts, please try again later'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

#### Custom Key Generator (Rate Limit by User):

```typescript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => {
        // Rate limit by user ID instead of IP
        return req.user?.id || req.ip;
    }
});
```

#### Skip Certain IPs:

```typescript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (req) => {
        // Don't rate limit admin IPs
        const adminIPs = ['192.168.1.100', '10.0.0.5'];
        return adminIPs.includes(req.ip);
    }
});
```

---

### 7. HPP (HTTP Parameter Pollution Protection)

#### What is HPP?

Protects against **HTTP Parameter Pollution** attacks where attackers send duplicate parameters.

**Attack Example:**
```
GET /api/users?id=1&id=2&id=3
```

Without protection, this might cause unexpected behavior.

#### Installation:

```bash
npm install hpp
```

#### Basic Example:

```typescript
import hpp from 'hpp';

app.use(hpp());

// Now duplicate params are handled safely
app.get('/api/users', (req, res) => {
    console.log(req.query.id);  // Only the last value: '3'
});
```

#### Whitelist Certain Parameters:

```typescript
app.use(hpp({
    whitelist: ['filter', 'sort']  // Allow duplicates for these
}));

// Now this is allowed:
// GET /api/users?filter=active&filter=verified
```

---

## PHP/Laravel Comparison

### Middleware in Laravel:

```php
// Laravel Middleware
class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        $response->header('Access-Control-Allow-Origin', '*');
        return $response;
    }
}

// Register in Kernel.php
protected $middleware = [
    \App\Http\Middleware\CorsMiddleware::class,
];
```

### Same in Express (with third-party):

```typescript
import cors from 'cors';

app.use(cors());  // ✅ Much simpler!
```

### Key Differences:

| Laravel | Express |
|---------|---------|
| Middleware classes | Middleware functions |
| Register in `Kernel.php` | `app.use()` |
| Manual CORS handling | `cors` package |
| Manual rate limiting | `express-rate-limit` |
| Built-in session support | `express-session` package |

---

## Complete Production Middleware Stack

### Recommended Order:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';

const app = express();

// 1. Security (first!)
app.use(helmet());

// 2. CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
}));

// 3. Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Compression
app.use(compression());

// 5. Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// 6. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 7. Cookie parsing
app.use(cookieParser(process.env.COOKIE_SECRET));

// 8. HPP protection
app.use(hpp());

// 9. Your routes
app.use('/api', routes);

// 10. Error handling
app.use(errorHandler);

export default app;
```

### Why This Order Matters:

1. **Security first** (helmet) - Set headers before anything else
2. **CORS** - Handle preflight before other middleware
3. **Logging** - Log all requests
4. **Compression** - Compress responses
5. **Rate limiting** - Block abusers early
6. **Body parsing** - Parse request bodies
7. **Cookie parsing** - Parse cookies
8. **HPP** - Sanitize parameters
9. **Routes** - Your application logic
10. **Error handling** - Catch all errors

---

## Performance Considerations

### Middleware Overhead:

| Middleware | Overhead | When to Use |
|------------|----------|-------------|
| `cors` | ~0.1ms | Always in production |
| `helmet` | ~0.2ms | Always in production |
| `morgan` | ~0.5ms | Always (log to file in prod) |
| `compression` | ~5-20ms | For large responses (>1KB) |
| `rate-limit` | ~0.3ms | Always in production |

### Total Overhead:

- **~1-2ms** for security stack (negligible)
- **Worth it** for the protection and features

### Optimization Tips:

1. **Don't compress small responses** (< 1KB)
2. **Use compression level 6** (default, good balance)
3. **Log to file in production** (not console)
4. **Use Redis for rate limiting** in distributed systems

---

## Common Mistakes

### 1. Wrong Middleware Order

**❌ Wrong:**
```typescript
app.use(routes);  // Routes first
app.use(helmet());  // Security headers won't apply!
```

**✅ Correct:**
```typescript
app.use(helmet());  // Security first
app.use(routes);
```

### 2. CORS with Credentials

**❌ Wrong:**
```typescript
app.use(cors({
    origin: '*',
    credentials: true  // ❌ Browser rejects this
}));
```

**✅ Correct:**
```typescript
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true  // ✅ Works
}));
```

### 3. Not Using Helmet in Production

**❌ Wrong:**
```typescript
// No security headers!
app.use(cors());
app.use(routes);
```

**✅ Correct:**
```typescript
app.use(helmet());  // ✅ Always use helmet
app.use(cors());
app.use(routes);
```

### 4. Logging to Console in Production

**❌ Wrong:**
```typescript
app.use(morgan('dev'));  // ❌ Logs to console, slows down app
```

**✅ Correct:**
```typescript
const accessLogStream = fs.createWriteStream('./logs/access.log', { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
```

---

## Key Takeaways

1. **Use third-party middleware** instead of reinventing the wheel
2. **Security stack**: `helmet()` + `cors()` + `hpp()` + `rate-limit`
3. **Order matters**: Security → Logging → Compression → Parsing → Routes → Errors
4. **Production config**: Specific origins, log to file, use environment variables
5. **TypeScript**: Install `@types/*` packages for type safety
6. **Performance**: Middleware overhead is negligible (~1-2ms total)
7. **CORS**: Required for frontend-backend communication across origins
8. **Rate limiting**: Essential for preventing abuse
9. **Compression**: Saves bandwidth, improves load times
10. **Helmet**: Sets 15+ security headers with one line

---

## Further Reading

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [CORS MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Morgan Documentation](https://github.com/expressjs/morgan)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
