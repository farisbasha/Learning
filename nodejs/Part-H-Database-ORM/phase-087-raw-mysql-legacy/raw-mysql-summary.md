# Phase 087: Raw MySQL Driver (mysql2) — API Reference Cheatsheet

## Installation

```bash
npm install mysql2
```

## Import Patterns

```typescript
// Promise-based (RECOMMENDED)
import mysql from 'mysql2/promise';

// Callback-based (legacy)
import mysql from 'mysql2';

// Specific imports
import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
```

## Connection vs Pool

```typescript
// Single connection (for scripts)
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myapp'
});

// Connection pool (for apps - ALWAYS use this)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myapp',
    connectionLimit: 10,
    waitForConnections: true
});
```

## Basic Operations

### SELECT

```typescript
// Return type: [rows, fields]
const [users] = await pool.query('SELECT * FROM users');
const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [1]);

// With typing
interface User extends RowDataPacket { id: number; email: string; }
const [users] = await pool.query<User[]>('SELECT * FROM users');
```

### INSERT

```typescript
const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, name) VALUES (?, ?)',
    ['john@example.com', 'John']
);

console.log(result.insertId);      // Auto-increment ID
console.log(result.affectedRows);  // Should be 1
```

### UPDATE

```typescript
const [result] = await pool.query<ResultSetHeader>(
    'UPDATE users SET name = ? WHERE id = ?',
    ['New Name', 1]
);

console.log(result.affectedRows);  // Rows changed
console.log(result.changedRows);   // Rows actually modified
```

### DELETE

```typescript
const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM users WHERE id = ?',
    [1]
);

console.log(result.affectedRows);  // Rows deleted
```

## Parameterized Queries

```typescript
// Single parameter
await pool.query('SELECT * FROM users WHERE id = ?', [1]);

// Multiple parameters
await pool.query('SELECT * FROM users WHERE role = ? AND active = ?', ['admin', true]);

// IN clause
await pool.query('SELECT * FROM users WHERE id IN (?)', [[1, 2, 3]]);

// LIKE pattern
await pool.query('SELECT * FROM users WHERE name LIKE ?', ['%john%']);

// Named parameters (with execute)
await pool.execute('SELECT * FROM users WHERE email = :email', { email: 'john@example.com' });
```

## Transactions

```typescript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();

    await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1]);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2]);

    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();  // Always release!
}
```

## Pool Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `connectionLimit` | number | 10 | Max simultaneous connections |
| `waitForConnections` | boolean | true | Queue when pool exhausted |
| `queueLimit` | number | 0 | Max queue size (0 = unlimited) |
| `acquireTimeout` | number | 10000 | Wait time for connection (ms) |
| `connectTimeout` | number | 10000 | Connection timeout (ms) |
| `enableKeepAlive` | boolean | false | Enable TCP keep-alive |

## TypeScript Types

```typescript
import {
    Pool,
    PoolConnection,
    Connection,
    RowDataPacket,      // For SELECT results
    ResultSetHeader,    // For INSERT/UPDATE/DELETE
    FieldPacket         // Column metadata
} from 'mysql2/promise';

// Custom row type
interface User extends RowDataPacket {
    id: number;
    email: string;
    name: string;
    created_at: Date;
}

// Typed query
const [users] = await pool.query<User[]>('SELECT * FROM users');
const [result] = await pool.query<ResultSetHeader>('INSERT INTO users...');
```

## Error Codes

| Code | Meaning | Handling |
|------|---------|----------|
| `ER_DUP_ENTRY` | Duplicate unique key | Conflict error |
| `ER_NO_REFERENCED_ROW_2` | Foreign key violation | Bad request |
| `ER_DATA_TOO_LONG` | Value exceeds column size | Validation error |
| `ER_ACCESS_DENIED_ERROR` | Auth failure | Config error |
| `ECONNREFUSED` | Server not reachable | Retry/fail |
| `ETIMEDOUT` | Connection timeout | Retry |
| `PROTOCOL_CONNECTION_LOST` | Connection dropped | Retry |

## PHP/PDO Comparison

| PHP PDO | mysql2 |
|---------|--------|
| `new PDO($dsn)` | `mysql.createPool(config)` |
| `$pdo->prepare($sql)` | `pool.execute(sql, params)` |
| `$stmt->execute([$val])` | `pool.query(sql, [val])` |
| `$stmt->fetchAll()` | `const [rows] = await query()` |
| `$pdo->beginTransaction()` | `conn.beginTransaction()` |
| `$pdo->commit()` | `conn.commit()` |
| `$pdo->rollBack()` | `conn.rollback()` |

## Common Patterns

### Get or Create

```typescript
async function getOrCreate(email: string, name: string): Promise<User> {
    const [existing] = await pool.query<User[]>(
        'SELECT * FROM users WHERE email = ?', [email]
    );

    if (existing.length > 0) return existing[0];

    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (email, name) VALUES (?, ?)',
        [email, name]
    );

    const [created] = await pool.query<User[]>(
        'SELECT * FROM users WHERE id = ?', [result.insertId]
    );

    return created[0];
}
```

### Pagination

```typescript
async function paginate(page: number, perPage: number = 20) {
    const offset = (page - 1) * perPage;

    const [[{ total }]] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users'
    );

    const [users] = await pool.query<User[]>(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [perPage, offset]
    );

    return {
        data: users,
        meta: {
            total,
            page,
            perPage,
            lastPage: Math.ceil(total / perPage)
        }
    };
}
```

## Quick Reference

```typescript
// Setup
const pool = mysql.createPool({ host, user, password, database, connectionLimit: 10 });

// Query
const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [1]);

// Insert
const [{ insertId }] = await pool.query<ResultSetHeader>('INSERT INTO users (email) VALUES (?)', [email]);

// Update
const [{ affectedRows }] = await pool.query<ResultSetHeader>('UPDATE users SET name = ? WHERE id = ?', [name, id]);

// Delete
const [{ affectedRows }] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);

// Transaction
const conn = await pool.getConnection();
try {
    await conn.beginTransaction();
    await conn.query(...);
    await conn.commit();
} catch (e) {
    await conn.rollback();
    throw e;
} finally {
    conn.release();
}

// Cleanup
await pool.end();
```

## Remember

- Use `mysql2/promise` for async/await
- Always use parameterized queries (`?` placeholders)
- Always use connection pools for applications
- Always release connections in `finally` block
- Type your queries with `<User[]>` or `<ResultSetHeader>`
- Handle specific error codes for better UX
