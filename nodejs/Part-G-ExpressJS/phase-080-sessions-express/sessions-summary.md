# Phase 080: Sessions Summary

## Quick Setup: express-session

```typescript
import session from 'express-session';

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 Day
    }
}));
```

## Key Configuration Options

- **`secret`**: String to sign the session ID cookie.
- **`resave`**: Should session be saved back to store even if not modified? (Recommended: `false`).
- **`saveUninitialized`**: Should a "guess" session be created? (Recommended: `false` for login apps).
- **`store`**: Where to save data (Memory by default, Redis/Mongo recommended for Production).
- **`cookie`**: Settings for the `sid` cookie.

## Essential Operations

- **Set**: `req.session.key = value;`
- **Get**: `const val = req.session.key;`
- **Delete Key**: `delete req.session.key;`
- **Destroy Session**: `req.session.destroy((err) => { ... });`
- **Regenerate ID**: `req.session.regenerate((err) => { ... });` (Crucial for login).

## Production Stores

| Type | Library | Use Case |
| :--- | :--- | :--- |
| **Redis** | `connect-redis` | High performance, transient data. |
| **MongoDB** | `connect-mongodb-session` | Persistence across restarts, scalable. |
| **PostgreSQL**| `connect-pg-simple` | If already using SQL, easy to manage. |

## Comparison

- **Session vs Cookie**: Session holds data on server; Cookie holds the ID on client.
- **Session vs JWT**: Session is stateful (can logout instantly); JWT is stateless (hard to revoke).
- **Laravel comparison**: `req.session` is equivalent to `$request->session()`.
