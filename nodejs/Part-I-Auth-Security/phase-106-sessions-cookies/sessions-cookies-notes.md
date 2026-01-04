# Phase 106: Sessions & Cookies Deep Dive

## Overview

While tokens (JWTs) are popular today, **Sessions** remain the backbone of many security-critical applications. Sessions provide a server-side state that is much easier to manage, revoke, and secure than stateless tokens if handled correctly.

This phase covers how cookies work as the transport layer for sessions, the configuration of the `express-session` middleware, and the use of persistent session stores for production.

---

## 1. What are Cookies?

Cookies are small pieces of data stored by the browser. They are the standard way to persist an ID (Session ID) between requests.

### Cookie Lifecycle
1. **Server sends**: `Set-Cookie: name=value; HttpOnly; Secure`
2. **Browser stores**: The cookie is tied to the domain.
3. **Browser sends back**: Automatically included in the `Cookie` header on every subsequent request to that domain.

### Critical Cookie Attributes (Security)
| Attribute | Purpose | Best Practice |
| :--- | :--- | :--- |
| **HttpOnly** | Prevents client-side JS from reading the cookie. | **REQUIRED** (Prevents session theft via XSS). |
| **Secure** | Only sends cookie over HTTPS. | **REQUIRED** in production. |
| **SameSite** | Controls cross-site cookie sending. | `Lax` or `Strict` (Prevents CSRF). |
| **Max-Age / Expires** | Determines how long the cookie lasts. | Use reasonable defaults (e.g., 24h). |

---

## 2. Implementing Sessions with `express-session`

`express-session` is the go-to middleware for session management in Express.

### Installation
```bash
npm install express-session
npm install -D @types/express-session
```

### Basic Configuration
```typescript
import session from 'express-session';

app.use(session({
    secret: process.env.SESSION_SECRET!, // String used to sign the session ID
    resave: false,                 // Don't save session if it wasn't modified
    saveUninitialized: false,      // Don't create session until something is stored
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
```

---

## 3. Persistent Session Stores

By default, `express-session` uses **MemoryStore**.
- ❌ **Memory leaks**: It doesn't scale and consumes RAM.
- ❌ **No persistence**: If the server restarts, all users are logged out.
- ❌ **No distributed sessions**: If you have multiple server instances (Cluster/Docker), session data isn't shared.

### Production: Redis Store
Redis is the preferred session store for high performance and scalability.

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import session from 'express-session';

// 1. Setup Redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// 2. Setup Session with Redis Store
app.use(session({
    store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));
```

---

## 4. Typing Session Data (TypeScript)

To make `req.session` type-safe, you must extend the `SessionData` interface from `express-session`.

```typescript
// types/session.d.ts
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: string;
        isLoggedIn: boolean;
        role?: 'admin' | 'user';
    }
}

// Usage in controller
app.post('/login', (req, res) => {
    req.session.userId = '123'; // Now typed!
    req.session.isLoggedIn = true;
    res.send('Logged in');
});
```

---

## 5. Security Best Practices

### Session Fixation Attack
This occurs when an attacker sets a session ID *before* the user logs in, then waits for them to authenticate.

**Prevention**: Always regenerate the session ID upon login.
```typescript
app.post('/login', (req, res) => {
    // ... verification logic ...
    
    req.session.regenerate((err) => {
        if (err) next(err);
        
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err) next(err);
            res.redirect('/dashboard');
        });
    });
});
```

### Trust Proxy
If your app is behind a proxy (Nginx, Heroku, Cloudflare), you must trust it so the `secure` cookie attribute works properly.
```typescript
app.set('trust proxy', 1);
```

---

## 6. PHP / Laravel Comparison

### Laravel Sessions
Laravel handles sessions via a unified API regardless of the driver (file, database, redis, cookie).
- **Laravel**: Uses a `laravel_session` cookie containing an encrypted ID.
- **Drivers**: Configured in `.env` via `SESSION_DRIVER`.

In Express, you must manually install the store driver (e.g., `connect-redis` or `connect-pg-simple`) and configure the middleware. Express sessions are simpler but require more manual setup than Laravel's robust "Battery-included" approach.

---

## Key Takeaways

1. **HttpOnly** cookies are fundamental for session security.
2. **MemoryStore** is for development only; use **Redis** or a Database for production.
3. **TypeScript** requires interface extension for session data properties.
4. **Regenerate** your session IDs on login to prevent fixation attacks.
5. **stateless** tokens (JWT) have their place, but server-managed sessions are often safer for web applications.
