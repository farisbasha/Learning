# Phase 118: Rate Limiting
## Agent Instructions

**Phase**: 118 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. Why rate limiting — preventing abuse
2. `express-rate-limit` package
3. Window-based limiting
4. Sliding window
5. Rate limit by IP
6. Rate limit by user/API key
7. Different limits for different routes
8. Redis store for distributed apps
9. Rate limit headers
10. Handling rate limit errors gracefully

## Example
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Basic rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts
    skipSuccessfulRequests: true
});

app.use('/api', limiter);
app.use('/auth/login', authLimiter);
```

## Content Instructions
**Notes**: Rate limiting implementation guide
**Summary**: Rate limit configurations
