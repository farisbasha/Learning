# Phase 106: Session Setup Checklist

## 1. Installation
```bash
npm install express-session connect-redis redis
```

## 2. Essential Configuration
- [ ] **Secret**: Use a strong, unique environment variable.
- [ ] **HttpOnly**: Set to `true` to block XSS access.
- [ ] **Secure**: Set to `true` in production (requires HTTPS).
- [ ] **Resave**: Set to `false` for better performance.
- [ ] **SaveUninitialized**: Set to `false` to avoid filling store with empty sessions.

## 3. Session Store Selection

| Environment | Store | Why? |
| :--- | :--- | :--- |
| **Development** | MemoryStore | Included, zero setup. |
| **Production (Fast)** | Redis | High speed, scalable, transient. |
| **Production (Persistent)** | PostgreSQL/MongoDB | Stronger persistence, reuse existing DB. |

## 4. Security Snippet (The "Secure" Way)

```typescript
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true, // Only over HTTPS
        sameSite: 'lax', // Protect vs CSRF
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

## 5. Laravel vs Express Session

| Feature | Laravel | Express |
| :--- | :--- | :--- |
| Initial Setup | Automatic | Manual (`npm install`) |
| Configuration | `config/session.php` | `app.use(session({...}))` |
| Default Store | File | Memory (Dangerous for Prod) |
| Multi-server | Supported via Redis/DB | Supported via Store libs |
| CSRF Protection | Built-in | Requires `csurf` or similar |
