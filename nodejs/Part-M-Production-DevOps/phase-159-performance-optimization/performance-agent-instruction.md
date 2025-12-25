# Phase 159: Performance Optimization
## Agent Instructions

**Phase**: 159 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Identifying bottlenecks
2. Profiling Node.js
3. Memory leaks detection
4. CPU profiling
5. Async best practices
6. Avoiding blocking operations
7. Connection pooling
8. Response compression
9. Caching strategies
10. Load testing with k6

## Example
```typescript
// Enable compression
import compression from 'compression';
app.use(compression());

// Efficient database queries
const users = await prisma.user.findMany({
    select: { id: true, email: true }, // Only needed fields
    take: 100
});

// Avoid memory leaks
const cache = new Map();
setInterval(() => {
    // Clear old entries
    cache.clear();
}, 60 * 60 * 1000);

// Use streams for large data
import { pipeline } from 'stream/promises';

app.get('/export', async (req, res) => {
    const cursor = prisma.user.findManyCursor();
    res.setHeader('Content-Type', 'application/json');
    
    await pipeline(
        cursor,
        new Transform({ ... }),
        res
    );
});
```

## Content Instructions
**Notes**: Node.js performance optimization guide
**Summary**: Performance checklist
