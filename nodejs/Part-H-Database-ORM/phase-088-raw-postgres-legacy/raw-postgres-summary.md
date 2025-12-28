# Phase 088: Raw PostgreSQL (pg) — Quick Reference

> **Quick Summary**: node-postgres (`pg`) is a low-level PostgreSQL wire protocol driver for Node.js. Unlike ORMs, it provides raw database access with connection pooling, parameterized queries, and PostgreSQL-specific features like JSONB, arrays, and LISTEN/NOTIFY.

---

## Core Concepts

### 1. Driver vs ORM

- **pg is a driver**, not an ORM
- Translates JavaScript ↔ PostgreSQL wire protocol
- No models, migrations, or query builders
- ORMs like Prisma/TypeORM/Sequelize use `pg` internally

```
Prisma/TypeORM (ORM) → pg (driver) → PostgreSQL (database)
```

### 2. PostgreSQL vs MySQL Key Differences

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| **Connection model** | Process-per-connection (10-15MB) | Thread-per-connection (1-2MB) |
| **MVCC** | Tuple versioning | Undo logs |
| **Types** | JSONB, arrays, UUID | Limited (JSON added 5.7) |
| **Placeholders** | `$1, $2` (numbered) | `?` (positional) |
| **Wire protocol** | Binary + text | Text protocol |

**Implication**: PostgreSQL connection pooling is MORE critical due to expensive process forks.

---

## Client vs Pool

### Client (Single Connection)

```typescript
const client = new Client({ /* config */ });
await client.connect();
// Use for: scripts, migrations, long transactions
await client.end();
```

**Use cases**: CLI tools, migrations, dedicated connections

**Anti-pattern**: Creating client per HTTP request (expensive!)

### Pool (Connection Pooling)

```typescript
const pool = new Pool({
  max: 20,  // (CPU cores × 2) + 1
  idleTimeoutMillis: 30000,
});

// For web servers (Express, Fastify)
await pool.query('SELECT * FROM users');
```

**Use cases**: Web servers, long-running apps, concurrent requests

---

## Connection Pooling Theory

### Why Pooling?

Creating a connection is expensive:
1. TCP handshake: 1-2 RTT
2. PostgreSQL process fork: 5-10ms
3. Authentication: SCRAM-SHA-256
4. Total cost: ~50-100ms

**Solution**: Reuse existing connections

### Pool Sizing Formula

```
Optimal pool size = (CPU cores × 2) + 1
```

**Example**: 8-core server → `max: 17`

**Why not more?**
- Context switching overhead
- Lock contention
- Memory pressure
- Diminishing returns (too many = slower)

---

## Wire Protocol Internals

### Connection Flow

```
1. TCP socket → PostgreSQL (port 5432)
2. Startup message (username, database)
3. Authentication (SCRAM-SHA-256)
4. Backend process forked (PID assigned)
5. Parameter status (server_version, timezone)
6. ReadyForQuery
```

### Simple vs Extended Protocol

**Simple Query** (one message):
```typescript
await pool.query('SELECT * FROM users WHERE id = 1');
// ← Q: "SELECT ... WHERE id = 1"
// → DataRow(s)
// → ReadyForQuery
```

**Extended Query** (parse, bind, execute):
```typescript
await pool.query('SELECT * FROM users WHERE id = $1', [1]);
// ← P: Parse "SELECT ... WHERE id = $1"
// ← B: Bind [1] to $1
// ← E: Execute
// → DataRow(s)
// → ReadyForQuery
```

**Why extended?**
- SQL injection prevention (params separate from SQL)
- Binary format (faster)
- Prepared statement caching

---

## Parameterized Queries

### SQL Injection Prevention

**Vulnerable (string concatenation)**:
```typescript
// ❌ NEVER DO THIS
await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
// If userId = "1; DROP TABLE users; --", you're hacked
```

**Safe (parameterized)**:
```typescript
// ✅ SAFE
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
// userId sent in Bind message, treated as data not SQL
```

### How It Works

```
Step 1: Parse (SQL structure locked)
  "SELECT * FROM users WHERE id = $1"

Step 2: Bind (attach parameter as DATA)
  $1 ← "1; DROP TABLE users; --"

Step 3: Execute (parameter is string data, not SQL)
  SELECT * FROM users WHERE id = '1; DROP TABLE users; --'
  (No rows found, but no SQL injection)
```

### Numbered Placeholders

```typescript
// PostgreSQL: Reuse parameters
await pool.query(
  'SELECT * FROM posts WHERE author_id = $1 OR mentioned = $1',
  [userId]  // $1 used twice, passed once
);

// MySQL: Must pass twice
await mysqlPool.query(
  'SELECT * FROM posts WHERE author_id = ? OR mentioned = ?',
  [userId, userId]  // Duplication required
);
```

---

## Transactions & ACID

### Basic Transaction

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
  await client.query('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();  // ALWAYS release!
}
```

### Isolation Levels

| Level | Default | Non-Repeatable Reads | Phantoms | Serialization Anomalies |
|-------|---------|---------------------|----------|------------------------|
| **Read Committed** | ✅ | Allowed | Allowed | Allowed |
| **Repeatable Read** | | Prevented | Prevented | Allowed |
| **Serializable** | | Prevented | Prevented | Prevented |

```typescript
// Set isolation level
await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
```

**Use cases**:
- Read Committed: Most applications
- Repeatable Read: Consistent snapshot across queries
- Serializable: Financial transactions, inventory

---

## PostgreSQL-Specific Features

### JSONB (Binary JSON)

```typescript
// Create table
await pool.query(`
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    attributes JSONB
  )
`);

// Insert (auto-serialized)
await pool.query(
  'INSERT INTO products (attributes) VALUES ($1)',
  [{ color: 'red', inStock: true }]
);

// Query with JSONB operators
await pool.query(`
  SELECT * FROM products
  WHERE attributes @> '{"color": "red"}'  -- Contains
    AND attributes->>'inStock' = 'true'   -- Extract as text
`);

// GIN index for fast queries
await pool.query(`
  CREATE INDEX idx_attributes ON products USING GIN (attributes)
`);
```

**JSONB Operators**:
- `->`: Get JSON field
- `->>`: Get JSON field as text
- `@>`: Contains
- `?`: Key exists

### Array Columns

```typescript
// Create table
await pool.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    roles TEXT[]
  )
`);

// Insert array
await pool.query(
  'INSERT INTO users (roles) VALUES ($1)',
  [['admin', 'moderator']]
);

// Query
await pool.query(`
  SELECT * FROM users
  WHERE 'admin' = ANY(roles)        -- Contains element
    OR roles && $1                  -- Array overlap
`, [['admin', 'superuser']]);
```

### LISTEN/NOTIFY (Pub/Sub)

```typescript
// Subscriber
const subscriber = new Client(config);
await subscriber.connect();
await subscriber.query('LISTEN new_orders');

subscriber.on('notification', (msg) => {
  console.log('Channel:', msg.channel);
  console.log('Payload:', JSON.parse(msg.payload));
});

// Publisher
await pool.query(
  `SELECT pg_notify('new_orders', $1)`,
  [JSON.stringify({ orderId: 123 })]
);
```

---

## Error Handling

### PostgreSQL Error Codes

```typescript
import { DatabaseError } from 'pg';

try {
  await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);
} catch (err) {
  if (err instanceof DatabaseError) {
    switch (err.code) {
      case '23505': // unique_violation
        throw new ConflictError('Email already exists');
      case '23503': // foreign_key_violation
        throw new BadRequestError('Referenced record not found');
      case '23502': // not_null_violation
        throw new BadRequestError('Missing required field');
      case '57014': // query_canceled
        throw new TimeoutError('Query timed out');
    }
  }
}
```

**Error code structure**:
- `23xxx`: Constraint violations
- `42xxx`: Syntax/schema errors
- `57xxx`: System errors

---

## PHP/Laravel vs Node.js

### Connection Model

**PHP (request-scoped)**:
```php
$pdo = new PDO('pgsql:host=localhost;dbname=myapp', 'user', 'pass');
// Connection closed at end of request
```

**Node.js (long-lived pool)**:
```typescript
const pool = new Pool({ /* config */ });
// Pool lives for entire app lifetime
```

**Why different?** PHP uses process-per-request (PHP-FPM), Node.js uses single-process event loop.

### Transaction Syntax

**Laravel**:
```php
DB::transaction(function () {
    DB::update('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
    DB::update('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
});
// Auto-commit/rollback
```

**Node.js pg**:
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... queries
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}
```

---

## Production Best Practices

### 1. Pool Configuration

```typescript
const pool = new Pool({
  max: 17,  // (8 cores × 2) + 1
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,  // Fail fast
  statement_timeout: 30000,  // Kill runaway queries
});
```

### 2. Health Monitoring

```typescript
pool.on('error', (err, client) => {
  console.error('Idle client error:', err);
});

setInterval(() => {
  console.log({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
}, 60000);
```

### 3. Query Timeout

```typescript
// Global
const pool = new Pool({ statement_timeout: 30000 });

// Per-session
await client.query('SET statement_timeout = 10000');
```

---

## Key Takeaways

1. **pg is a driver, not an ORM** — Low-level wire protocol translator
2. **Always use Pool for web servers** — Client is for scripts only
3. **Pool sizing formula**: (cores × 2) + 1
4. **PostgreSQL = process-per-connection** — More expensive than MySQL threads
5. **Extended protocol prevents SQL injection** — Parameters sent separately
6. **PostgreSQL has rich types** — JSONB, arrays, LISTEN/NOTIFY
7. **Default isolation: Read Committed** — Use Repeatable Read/Serializable for stricter consistency
8. **Monitor pool health** — Track totalCount, idleCount, waitingCount

---

## Common Patterns

### Type-Safe Query Helper

```typescript
async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

const users = await query<User>('SELECT * FROM users');
```

### Transaction Helper

```typescript
async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

## What's Next?

- **Phase 089**: Connection Pooling Deep Dive (already completed)
- **Phase 090**: Sequelize Introduction (ORM layer on top of pg)
