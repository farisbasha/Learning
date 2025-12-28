# Phase 080: Sessions in Express.js

## Overview

HTTP is **stateless**. Every request is independent. To remember a user across multiple requests (for login, shopping carts, etc.), we need **Sessions**. 

In Express, `express-session` is the most common way to handle this. It works by:
1. Creating a unique **Session ID**.
2. Storing that ID in a **Cookie** on the client.
3. Storing the associated data in a **Store** on the server.

---

## 1. How Sessions Work (Internals)

1. **Client**: Sends login credentials.
2. **Server**: Verifies credentials, generates a random `sid` (Session ID).
3. **Server**: Sets a cookie `connect.sid=...` in the response header.
4. **Server**: Saves `{ userId: 1, role: 'admin' }` in the database/memory database indexed by the `sid`.
5. **Client**: Every subsequent request automatically includes the `connect.sid` cookie.
6. **Server middleware**: Sees the cookie, looks up the data in the store, and attaches it to `req.session`.

---

## 2. Basic Implementation

### Installation
```bash
npm install express-session
npm install -D @types/express-session
```

### Configuration
```typescript
import session from 'express-session';

app.use(session({
    secret: 'my-super-secret-key', // Used to sign the session ID cookie
    resave: false,                 // Don't save session if it wasn't modified
    saveUninitialized: false,      // Don't create session until something is stored
    cookie: { 
        secure: false,             // Set to true in production (requires HTTPS)
        httpOnly: true,            // Prevents client-side JS from reading cookie
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));
```

### Usage
```typescript
app.post('/login', (req, res) => {
    // Verified user...
    req.session.userId = user.id;
    req.session.isLoggedIn = true;
    res.send('Logged in!');
});

app.get('/dashboard', (req, res) => {
    if (req.session.isLoggedIn) {
        res.send(`Welcome user ${req.session.userId}`);
    } else {
        res.status(401).send('Please login');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.send('Logged out');
    });
});
```

---

## 3. The "Store" Problem

By default, `express-session` uses **MemoryStore**. This is dangerous for production because:
1. It leaks memory over time.
2. If you restart your server, everyone is logged out.
3. Sessions cannot be shared across multiple server instances (Cluster/Docker).

### Shared Session with Redis (Recommended)
```bash
npm install redis connect-redis
```

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// 1. Setup Redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// 2. Setup Session with Redis Store
app.use(session({
    store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
```

---

## 4. Security Best Practices

### The Secret
Never hardcode the secret. Use environment variables.
```typescript
secret: process.env.SESSION_SECRET
```

### Cookie Flags
- `httpOnly: true`: Mandatory. Protects against XSS attacks stealing the session.
- `secure: true`: Mandatory in production. Cookies only sent over HTTPS.
- `sameSite: 'lax'`: Protects against CSRF (Cross-Site Request Forgery).

### Regenerating Session ID
To prevent **Session Fixation** attacks, always regenerate the ID after login.
```typescript
app.post('/login', (req, res) => {
    const { user } = req.body;
    req.session.regenerate((err) => {
        req.session.userId = user.id;
        res.send('Logged in with new ID!');
    });
});
```

---

## 5. Session vs. JWT (JSON Web Tokens)

| Feature | Session | JWT |
| :--- | :--- | :--- |
| **Storage** | Server-side (Store) | Client-side (Encoded string) |
| **Size** | Small (just the ID) | Larger (contains payload) |
| **Revocation** | Easy (delete from store) | Hard (must wait to expire) |
| **State** | Stateful | Stateless |

**Session is better for**: Traditional web apps, Admin panels, apps requiring instant logouts.
**JWT is better for**: Microservices, Mobile apps, purely stateless APIs.

---

## 6. PHP / Laravel Comparison

### PHP (Traditional)
In PHP, sessions are initialized with `session_start()`. Data is usually stored in `/tmp` as files.
```php
session_start();
$_SESSION['id'] = 1;
```

### Laravel
Laravel uses a very powerful Session manager that supports many drivers (file, cookie, database, redis, memcached).
```php
$request->session()->put('key', 'value');
```
Laravel includes CSRF protection for sessions by default. In Express, you need an extra package like `csurf` or `helmet`.

---

## 7. Typing the Session

In TypeScript, `req.session` doesn't know about your custom properties (like `userId`). You need to extend the interface.

```typescript
// types/express-session.d.ts
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        isLoggedIn: boolean;
        theme: 'dark' | 'light';
    }
}
```

---

## 8. Common Mistakes

1. **Using Default MemoryStore**: Leads to data loss and crashes in production.
2. **Missing `resave: false`**: Causes unnecessary writes to the session store on every request.
3. **Not Setting `secure: true` in Production**: Allows session hijacking over insecure networks.
4. **Trusting Proxy**: If your app is behind Nginx/Heroku, you must set `app.set('trust proxy', 1)` for cookies to work correctly with `secure: true`.
