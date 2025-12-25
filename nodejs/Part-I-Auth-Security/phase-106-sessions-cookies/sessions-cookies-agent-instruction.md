# Phase 106: Sessions & Cookies
## Agent Instructions

**Phase**: 106 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. What are cookies — browser storage
2. Cookie attributes: httpOnly, secure, sameSite, maxAge
3. express-session setup
4. Session configuration
5. Typing session data
6. Session stores: memory (dev), Redis, PostgreSQL
7. connect-redis for production
8. Session security best practices
9. Session fixation attacks
10. Laravel comparison: session handling

## Example
```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient();
await redisClient.connect();

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
```

## Content Instructions
**Notes**: Complete session management guide
**Summary**: Session setup checklist
