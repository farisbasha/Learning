# Phase 089: Connection Pooling
## Agent Instructions

**Phase**: 089 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. What is connection pooling — why it's critical
2. Single connection vs pool
3. Pool configuration options
4. `min` and `max` connections
5. Idle timeout
6. Connection acquisition
7. Pool events and monitoring
8. Pool sizing for production
9. Connection limits and errors
10. Pool per database vs shared pool
11. Laravel comparison: Database connections

## Example
```typescript
// MySQL pool
const mysqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// PostgreSQL pool
const pgPool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

## Content Instructions
**Notes**: Connection pooling strategies for production
**Summary**: Pool configuration checklist
