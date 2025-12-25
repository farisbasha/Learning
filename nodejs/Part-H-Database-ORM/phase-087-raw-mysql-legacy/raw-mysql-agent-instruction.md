# Phase 087: Raw MySQL Driver (Legacy)
## Agent Instructions

**Phase**: 087 | **Part**: H - Database & ORM | **Language**: JavaScript/TypeScript

## Why Learn This (Legacy Foundation)
> Understanding raw drivers helps you understand what ORMs do under the hood.
> You'll encounter this in legacy codebases and when debugging ORM issues.

## Topics
1. `mysql2` package (modern mysql driver)
2. Creating connections
3. Connection configuration
4. Callback-style queries (legacy)
5. Promise-based queries (modern)
6. Parameterized queries (SQL injection prevention)
7. Query results typing
8. Error handling
9. Connection pooling basics
10. Transactions with raw driver
11. PHP comparison: mysqli, PDO

## Example
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myapp'
});

// Type-safe query
interface User {
    id: number;
    email: string;
    name: string;
}

const [rows] = await pool.execute<User[]>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
);
```

## Content Instructions
**Notes**: Raw MySQL driver with type safety
**Summary**: mysql2 API reference
