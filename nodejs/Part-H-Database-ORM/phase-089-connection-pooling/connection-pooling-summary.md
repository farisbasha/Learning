# Phase 089: Connection Pooling — Cheatsheet

## The Core Problem

**Opening a database connection is expensive:**
- TCP handshake: 1-50ms
- Authentication: 10-100ms
- Session initialization: 2-10 MB memory
- **Total cost**: ~50-150ms + memory

**Connection pooling solves this by reusing connections.**

---

## Pool vs Single Connection

| Aspect | Single Connection (Client) | Connection Pool (Pool) |
|--------|---------------------------|------------------------|
| **Use case** | Scripts, migrations | Web servers, APIs |
| **Concurrency** | 1 query at a time | N queries (pool size) |
| **Performance** | Blocks on each query | Non-blocking |
| **Memory** | ~5 MB | ~5 MB × pool size |
| **Startup** | Connect every time | Connect once, reuse |

---

## PHP vs Node.js Connection Models

### Traditional PHP (Apache + mod_php)
```
Each request:
1. New PHP process (or reuse from pool)
2. New database connection
3. Execute query
4. Close connection
5. End request

Connections needed = PHP-FPM workers (50-150)
```

### Laravel Octane (Modern PHP)
```
Persistent workers:
1. Worker stays alive
2. Database connection persists
3. Reuses connection across requests

Connections needed = Octane workers (4-20)
```

### Node.js
```
Single process:
1. One Node.js process
2. Small pool of connections (10-50)
3. All requests share pool

Connections needed = Pool size (10-50)
```

**Key insight**: Node.js needs 5-10x fewer connections than traditional PHP!

---

## How Pooling Works Internally

```
Initial state (empty pool):
┌────────────────────┐
│ Active:  []        │
│ Idle:    []        │
│ Queue:   []        │
└────────────────────┘

First query arrives:
┌────────────────────┐
│ Active:  [Conn#1]  │  ← Creates new connection
│ Idle:    []        │
│ Queue:   []        │
└────────────────────┘

Query completes:
┌────────────────────┐
│ Active:  []        │
│ Idle:    [Conn#1]  │  ← Connection ready for reuse
│ Queue:   []        │
└────────────────────┘

Second query arrives:
┌────────────────────┐
│ Active:  [Conn#1]  │  ← Reuses existing (FAST!)
│ Idle:    []        │
│ Queue:   []        │
└────────────────────┘

Pool full (10/10), 11th query arrives:
┌────────────────────┐
│ Active:  [Conn#1...Conn#10] (FULL) │
│ Idle:    []                         │
│ Queue:   [Query#11] ⏳ Waiting      │
└─────────────────────────────────────┘
```

---

## Configuration Quick Reference

### MySQL (mysql2)

```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'myapp',

    // POOL SIZE
    connectionLimit: 10,        // Max connections

    // TIMEOUTS
    waitForConnections: true,   // Queue when full (recommended)
    queueLimit: 0,              // Unlimited queue
    acquireTimeout: 10000,      // Max wait for connection (10s)

    // CONNECTION BEHAVIOR
    enableKeepAlive: true,      // Prevent firewall timeouts

    // CHARSET
    charset: 'utf8mb4',         // Full Unicode (emojis!)
    timezone: '+00:00'          // Store dates in UTC
});
```

### PostgreSQL (pg)

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    database: 'myapp',

    // POOL SIZE
    max: 20,                    // Max connections
    min: 2,                     // Min idle connections

    // TIMEOUTS
    idleTimeoutMillis: 30000,   // Close idle after 30s
    connectionTimeoutMillis: 2000,  // Fail if can't connect in 2s
    statement_timeout: 30000,   // Kill long queries (30s)

    // BEHAVIOR
    allowExitOnIdle: true,      // Let Node exit when idle (serverless)

    // SSL
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : false
});
```

---

## Pool Sizing Formula

### Basic Formula (PostgreSQL docs)
```
Pool size = (CPU cores × 2) + Effective spindle count

Example (4-core server with SSD):
= (4 × 2) + 1
= 9 connections

Recommended: 10-12
```

### Real-World Formula
```
Pool size = (Queries per second × Average query duration)

Example:
- 100 req/sec
- Average query: 50ms (0.05s)
- Pool size = 100 × 0.05 = 5 connections

Recommended: 10 (with buffer)
```

### Multi-Instance Planning
```
Database max_connections: 150
Reserved for admin: 10
Available: 140

App instances: 10
Per-instance pool: 140 / 10 = 14

Recommended: 10-12 per instance (leave buffer)
```

---

## Pool Sizing by Scenario

| Scenario | Pool Size | Reasoning |
|----------|-----------|-----------|
| **Development** | 5-10 | Simple, local queries |
| **Single instance** | 10-20 | Standard web app |
| **3-5 instances** | 10-15 each | 30-75 total |
| **10+ instances** | 5-10 each | Prevent DB overload |
| **Serverless (Lambda)** | 1-2 | Each invocation isolated |
| **Background jobs** | 2-5 | Long queries, low concurrency |
| **Analytics** | 1-3 | Very long queries |

---

## Pool Monitoring Code

### Check Pool Status

```typescript
// PostgreSQL
function logPoolStatus() {
    console.log({
        total: pool.totalCount,      // Total connections
        idle: pool.idleCount,        // Available
        waiting: pool.waitingCount   // Queued queries
    });

    // Alert if saturated
    if (pool.idleCount === 0 && pool.waitingCount > 0) {
        console.warn('⚠️ Pool saturated!');
    }
}

setInterval(logPoolStatus, 10000);
```

### Health Check Endpoint

```typescript
app.get('/health/database', async (req, res) => {
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        const duration = Date.now() - start;

        const isHealthy =
            duration < 100 &&           // Fast response
            pool.waitingCount === 0;    // No queue

        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'degraded',
            responseTime: `${duration}ms`,
            pool: {
                total: pool.totalCount,
                idle: pool.idleCount,
                active: pool.totalCount - pool.idleCount,
                waiting: pool.waitingCount,
                utilization: `${Math.round(((pool.totalCount - pool.idleCount) / pool.options.max) * 100)}%`
            }
        });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});
```

---

## Common Patterns

### Pattern 1: Create Pool Once (Global)

```typescript
// ✅ CORRECT - database.ts
import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20
});

// app.ts
import { pool } from './database';

app.get('/users', async (req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});
```

### Pattern 2: Transaction Helper

```typescript
async function withTransaction<T>(
    pool: Pool,
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();  // ✅ ALWAYS release
    }
}

// Usage
const user = await withTransaction(pool, async (client) => {
    const { rows: [user] } = await client.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING *',
        ['test@example.com']
    );
    await client.query(
        'INSERT INTO profiles (user_id) VALUES ($1)',
        [user.id]
    );
    return user;
});
```

### Pattern 3: Graceful Shutdown

```typescript
async function gracefulShutdown(signal: string) {
    console.log(`${signal} received, closing pool...`);

    server.close(() => {
        console.log('HTTP server closed');
    });

    await pool.end();
    console.log('Pool closed');
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## Common Mistakes

### ❌ Mistake 1: Pool Per Request

```typescript
// ❌ WRONG
app.get('/users', async (req, res) => {
    const pool = new Pool({ max: 10 });  // Creates 10 connections!
    const result = await pool.query('SELECT * FROM users');
    await pool.end();
    res.json(result.rows);
});

// ✅ CORRECT
const pool = new Pool({ max: 10 });  // Global

app.get('/users', async (req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});
```

### ❌ Mistake 2: Not Releasing Connections

```typescript
// ❌ WRONG - Connection leak!
const client = await pool.connect();
await client.query('BEGIN');
await client.query('INSERT INTO users (email) VALUES ($1)', ['test@test.com']);
await client.query('COMMIT');
// Missing: client.release()

// ✅ CORRECT
const client = await pool.connect();
try {
    await client.query('BEGIN');
    await client.query('INSERT INTO users (email) VALUES ($1)', ['test@test.com']);
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();  // ✅ ALWAYS runs
}
```

### ❌ Mistake 3: Pool Size = DB Max Connections

```typescript
// ❌ WRONG - Doesn't account for multiple instances
const pool = new Pool({ max: 150 });  // MySQL max_connections

// Deploy 10 instances:
// 10 × 150 = 1500 connections needed
// MySQL max = 151
// CRASH!

// ✅ CORRECT - Plan for scaling
const pool = new Pool({ max: 10 });
// 10 instances × 10 = 100 connections (well under 151)
```

### ❌ Mistake 4: No Timeouts

```typescript
// ❌ WRONG - Hangs forever if DB is down
const pool = new Pool({ max: 20 });

// ✅ CORRECT - Fail fast
const pool = new Pool({
    max: 20,
    connectionTimeoutMillis: 2000,  // Fail after 2s
    statement_timeout: 30000        // Kill slow queries
});
```

---

## Pool Events

### MySQL (mysql2)

```typescript
pool.pool.on('connection', (connection) => {
    console.log('New connection:', connection.threadId);
    // Set session defaults
    connection.query('SET SESSION time_zone = "+00:00"');
});

pool.pool.on('acquire', (connection) => {
    console.log('Connection acquired:', connection.threadId);
});

pool.pool.on('release', (connection) => {
    console.log('Connection released:', connection.threadId);
});

pool.pool.on('enqueue', () => {
    console.warn('⏳ Query enqueued - pool is full!');
});
```

### PostgreSQL (pg)

```typescript
pool.on('connect', (client) => {
    console.log('New connection created');
    client.query('SET timezone = "UTC"');
});

pool.on('acquire', (client) => {
    console.log('Connection acquired from pool');
});

pool.on('release', (client) => {
    console.log('Connection returned to pool');
});

pool.on('remove', (client) => {
    console.log('Connection removed from pool');
});

pool.on('error', (err, client) => {
    console.error('Unexpected pool error:', err);
    // Log to monitoring, don't crash
});
```

---

## Quick Decision Tree

**Q: How many connections do I need?**

1. **Start with formula**: `(CPU cores × 2) + 1`
   - 4 cores → 10 connections

2. **Adjust for query speed**:
   - Fast queries (<10ms) → Use fewer
   - Slow queries (>100ms) → Use more

3. **Plan for multiple instances**:
   - Pool size × instances < DB max × 0.8
   - Example: 10 instances → 10 conn each = 100 total

4. **Monitor in production**:
   - If `waitingCount > 0` often → Increase pool
   - If `idleCount = max` always → Decrease pool

---

## Remember

- ✅ Create pool **once** (global singleton)
- ✅ Always **release** connections (use `finally`)
- ✅ Set **timeouts** (connection, idle, statement)
- ✅ Plan for **multiple instances**
- ✅ **Monitor** pool saturation
- ✅ Graceful **shutdown** on SIGTERM
- ❌ Never create pool per request
- ❌ Never set pool size = database max
- ❌ Never forget to release in transactions

---

## Performance Impact

```
Without pooling (new connection per request):
- Connection time: 50ms
- Query time: 5ms
- Total: 55ms per request
- Max throughput: ~18 req/sec

With pooling (connection reuse):
- Connection time: 0ms (already connected)
- Query time: 5ms
- Total: 5ms per request
- Max throughput: ~200 req/sec

11x performance improvement!
```

---

## Next Steps

- **Phase 090**: Sequelize ORM (uses pooling internally)
- **Phase 095**: TypeORM (connection pool configuration)
- **Phase 097**: Prisma (modern pooling with PgBouncer)

Understanding pooling helps you configure ORMs correctly!
