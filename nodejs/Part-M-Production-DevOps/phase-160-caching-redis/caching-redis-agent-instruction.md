# Phase 160: Caching with Redis
## Agent Instructions

**Phase**: 160 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Why Redis for caching
2. ioredis package
3. Basic operations: get, set, del
4. TTL (expiration)
5. Cache patterns: aside, through
6. Caching database queries
7. Session storage
8. Rate limiting with Redis
9. Pub/Sub
10. Redis best practices

## Example
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache-aside pattern
async function getUser(id: string) {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Fetch from database
    const user = await prisma.user.findUnique({ where: { id } });
    
    // Cache for 1 hour
    if (user) {
        await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);
    }
    
    return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: UpdateUserDto) {
    const user = await prisma.user.update({ where: { id }, data });
    await redis.del(`user:${id}`);
    return user;
}
```

## Content Instructions
**Notes**: Redis caching strategies
**Summary**: Redis caching patterns
