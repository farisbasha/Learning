# Phase 118: Rate Limiting

## Overview

A secure API is not just about identifying users; it's about protecting the server from being overwhelmed. **Rate Limiting** is the practice of restricting the number of requests a user (or IP address) can make within a specific time window. 

This phase covers building rate limiters to prevent Brute Force attacks on login routes and abuse of public API endpoints.

---

## 1. Why Rate Limit?

1. **Prevent Brute Force**: Stop attackers from trying thousands of passwords on your `/login` route.
2. **Prevent DoS/DDoS**: Stop single users from flooding your server with millions of requests.
3. **Cost Control**: If your API calls expensive third-party services (like OpenAI or Stripe), rate limiting prevents a single user from running up your bill.
4. **Fair Use**: Ensure that no single client hogs all the server's resources.

---

## 2. Implementing `express-rate-limit`

This is the standard middleware for basic rate limiting across Express apps.

### Installation
```bash
npm install express-rate-limit
```

### Basic Global Limiter
```typescript
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
});

app.use('/api/', globalLimiter);
```

---

## 3. Targeted Limiting (Route Specific)

You should apply different limits to different types of endpoints.

### 🛡️ Strict: Login & Password Reset
```typescript
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 Hour
    max: 5,                   // Only 5 failed attempts per hour
    message: "Too many login attempts. Please try again in an hour.",
    skipSuccessfulRequests: true // Don't count successful logins against the quota
});

app.post('/api/auth/login', authLimiter, (req, res) => { ... });
```

### 🔓 Relaxed: Public Read Routes
```typescript
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 Minute
    max: 50                  // 50 searches per minute
});

app.get('/api/search', searchLimiter, (req, res) => { ... });
```

---

## 4. Distributed Rate Limiting (Redis)

By default, `express-rate-limit` stores counters in **Memory**. 
- ❌ **Reset on restart**: If the server restarts, all counters go back to zero.
- ❌ **No sharing**: If you have 3 server instances, a user could make 100 requests to EACH instance (Total 300).

**Solution**: Use a Redis store to share counters across all server instances.

### Installation
```bash
npm install rate-limit-redis
```

### Setup
```typescript
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient();
await client.connect();

const redisLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
});
```

---

## 5. Identifying the Client

By default, rate limiting is done by **IP Address**. However, in a multi-tenant or complex app, you might want to limit by:
- `userId` (for logged-in users).
- `apiKey` (for developers).

```typescript
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: (req) => {
        return req.user?.id || req.ip; // Priority to User ID
    }
});
```

---

## 6. PHP / Laravel Comparison

### Laravel Rate Limiting
Laravel has a powerful, built-in rate limiting system defined in the `RouteServiceProvider`.
- **Laravel**: Uses the `RateLimiter` facade. Defined in code: `RateLimiter::for('api', ...)` and applied via middleware `throttle:60,1`.
- **Express**: Handled entirely via the `express-rate-limit` middleware.

Laravel's system is more integrated into the routing core, but Express's middleware approach is highly flexible and easy to customize for specific headers and response formats.

---

## Key Takeaways

1. **Login routes** need strict limits (e.g., 5 attempts / hour).
2. **Standard API routes** need moderate limits (e.g., 100 / 15 mins).
3. **Memory Storage** is for dev; **Redis** is for production.
4. Always send **429 Too Many Requests** status code.
5. Use **`RateLimit-*` headers** to inform the client of their remaining quota.
6. **Trust Proxy**: Just like sessions, if behind a proxy, set `app.set('trust proxy', 1)` so the limiter gets the correct client IP.
