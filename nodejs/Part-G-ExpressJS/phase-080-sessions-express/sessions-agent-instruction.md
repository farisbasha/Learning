# Phase 080: Sessions in Express
## Agent Instructions

**Phase**: 080 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. HTTP is stateless — why sessions exist
2. `express-session` package
3. Session configuration options
4. Session secret and security
5. Typing session data
6. Extending Express.Session interface
7. Session stores: memory, Redis, database
8. `connect-redis` for production
9. Session vs JWT (when to use which)
10. Cookie options: `httpOnly`, `secure`, `sameSite`
11. Laravel comparison: `session()` helper

## Example
```typescript
import session from 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        cart: string[];
    }
}

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true }
}));

app.post('/login', (req, res) => {
    req.session.userId = 123;
    res.json({ success: true });
});
```

## Content Instructions
**Notes**: Session management with type safety
**Summary**: Session configuration checklist
