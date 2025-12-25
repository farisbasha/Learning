# Phase 088: Raw PostgreSQL Driver (Legacy)
## Agent Instructions

**Phase**: 088 | **Part**: H - Database & ORM | **Language**: JavaScript/TypeScript

## Topics
1. `pg` package (node-postgres)
2. Client vs Pool
3. Connection configuration
4. Parameterized queries ($1, $2 syntax)
5. Pool configuration
6. Query result typing
7. Transactions with `pool.query`
8. Prepared statements
9. LISTEN/NOTIFY for real-time
10. PostgreSQL-specific features (JSONB, arrays)
11. Error handling

## Example
```typescript
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20
});

interface User {
    id: number;
    email: string;
    metadata: Record<string, any>; // JSONB
}

const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
);
const user = result.rows[0];
```

## Content Instructions
**Notes**: Raw PostgreSQL driver with TypeScript
**Summary**: pg package API reference
