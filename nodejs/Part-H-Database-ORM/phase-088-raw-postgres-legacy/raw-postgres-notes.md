# Phase 088: Raw PostgreSQL Driver (pg) — Deep Theory & node-postgres Internals

## Table of Contents
1. [What is node-postgres and Why Does it Exist?](#what-is-node-postgres-and-why-does-it-exist)
2. [PostgreSQL vs MySQL: Architectural Differences](#postgresql-vs-mysql-architectural-differences)
3. [Wire Protocol & Connection Internals](#wire-protocol-connection-internals)
4. [Client vs Pool: Deep Architectural Dive](#client-vs-pool-deep-architectural-dive)
5. [Connection Pooling Theory & Memory Management](#connection-pooling-theory-memory-management)
6. [Query Execution: Text vs Binary Protocol](#query-execution-text-vs-binary-protocol)
7. [Parameterized Queries & SQL Injection Prevention](#parameterized-queries-sql-injection-prevention)
8. [Transaction Theory: ACID & Isolation Levels](#transaction-theory-acid-isolation-levels)
9. [PostgreSQL-Specific Features Deep Dive](#postgresql-specific-features-deep-dive)
10. [PHP/Laravel PDO vs Node.js pg Comparison](#php-laravel-pdo-vs-nodejs-pg-comparison)
11. [Error Handling & PostgreSQL Error Codes](#error-handling-postgresql-error-codes)
12. [Production Best Practices](#production-best-practices)
13. [Code Examples](#code-examples)

---

## What is node-postgres and Why Does it Exist?

### Historical Context

The `pg` package (also called **node-postgres**) was created by Brian Carlson in 2010 as one of the first PostgreSQL drivers for Node.js. At the time:

- Node.js was brand new (released May 2009)
- JavaScript was not yet async-first (Promises came in ES6/2015, async/await in ES8/2017)
- PostgreSQL 8.4 was the current version
- Most database drivers were synchronous, blocking code

**Why it matters**: Understanding that `pg` predates Promises helps explain why it still supports both callback and Promise APIs.

```
Timeline of node-postgres Evolution:
├── 2010: Initial release (callback-based)
├── 2014: Promise support added
├── 2016: ES6 compatibility improvements
├── 2018: TypeScript type definitions added
├── 2020: Modern async/await patterns become standard
└── 2024: Still maintained, battle-tested in production
```

### Why PostgreSQL Needs a Driver

Databases don't speak JavaScript. They use **wire protocols** — binary formats for sending queries and receiving results over TCP. A database driver:

1. **Translates JavaScript to PostgreSQL wire protocol**
2. **Manages TCP connections** (opening, maintaining, closing)
3. **Handles authentication** (password hashing, SCRAM-SHA-256, SSL)
4. **Parses result sets** (binary data → JavaScript objects)
5. **Manages connection state** (transactions, prepared statements)

**Comparison to other environments:**

| Environment | PostgreSQL Driver |
|-------------|-------------------|
| PHP | PDO (generic), pgsql extension (native) |
| Python | psycopg2, asyncpg |
| Java | JDBC (java.sql package) |
| Ruby | pg gem |
| Node.js | **pg** (node-postgres) |

### What node-postgres Does NOT Do

- **No ORM features**: No model definitions, no migrations
- **No schema validation**: Assumes your schema exists
- **No automatic mapping**: Results are plain objects
- **No query builder**: You write raw SQL
- **No connection management** (beyond pooling)

This is intentional — `pg` is a **low-level driver**. ORMs like Prisma, TypeORM, and Sequelize all use `pg` under the hood.

```
Abstraction Levels (Highest → Lowest):
┌────────────────────────────────────┐
│   Prisma, TypeORM, Sequelize       │ ← ORMs (high abstraction)
│   (models, migrations, relations)   │
├────────────────────────────────────┤
│   pg (node-postgres)                │ ← Driver (low abstraction)
│   (wire protocol, pooling)          │
├────────────────────────────────────┤
│   PostgreSQL Server                 │ ← Database engine
│   (query execution, ACID)           │
└────────────────────────────────────┘
```

---

## PostgreSQL vs MySQL: Architectural Differences

Before diving into `pg`, it's critical to understand **why PostgreSQL is different from MySQL** at a protocol and architectural level.

### 1. Process Model vs Thread Model

**PostgreSQL (Process-per-connection)**:
- Each connection spawns a **separate OS process** (`postgres` backend)
- Each process has its own memory space (isolated)
- More memory overhead per connection (~10-15MB per connection)
- Better isolation (one crashed connection doesn't affect others)
- More expensive to fork new processes

**MySQL (Thread-per-connection)**:
- Each connection spawns a **thread** within the same `mysqld` process
- Threads share memory (less overhead)
- Lower memory footprint (~1-2MB per connection)
- Slightly faster connection establishment
- Shared memory = potential for cross-connection interference

**Implication for Node.js**:
PostgreSQL's process model makes **connection pooling** more critical. Creating a new connection is expensive (process fork + memory allocation). MySQL can afford more connections, but pooling is still best practice.

### 2. MVCC (Multi-Version Concurrency Control)

**PostgreSQL**:
- Uses **MVCC with tuple versioning**
- Each row update creates a **new version** of the tuple
- Old versions remain until `VACUUM` cleans them
- Readers never block writers, writers never block readers
- Requires `VACUUM` to reclaim dead tuples

**MySQL (InnoDB)**:
- Uses **MVCC with undo logs**
- Updates are in-place with undo log for rollback
- Less storage overhead for frequent updates
- `PURGE` thread cleans undo logs automatically

**Implication for Node.js**:
PostgreSQL's MVCC means you can run long-running read queries without blocking writes. However, you must monitor `VACUUM` to prevent bloat.

### 3. Data Type System

**PostgreSQL**:
- **Rich type system**: JSONB, arrays, ranges, UUID, ENUM, custom types
- Native support for JSONB indexing (GIN indexes)
- Arrays are first-class citizens (`INTEGER[]`, `TEXT[]`)
- Custom types via `CREATE TYPE`

**MySQL**:
- **Simpler types**: JSON (not binary-indexed like JSONB), no arrays
- JSON support added in 5.7 but not as performant as JSONB
- No native array type (use comma-separated strings or JSON)

**Implication for Node.js**:
PostgreSQL + `pg` allows you to store JavaScript arrays/objects natively. MySQL + `mysql2` requires manual JSON serialization.

### 4. Wire Protocol Differences

**PostgreSQL Wire Protocol (v3)**:
- **Binary and text formats** for data
- **Extended query protocol** (separate parse, bind, execute steps)
- **Prepared statement caching** server-side
- **COPY protocol** for bulk imports

**MySQL Wire Protocol**:
- **Text protocol** (default) or binary protocol
- **Prepared statements** (binary protocol)
- Less sophisticated than PostgreSQL's extended protocol

**Implication for Node.js**:
`pg` can send parameters in **binary format** (faster, no string conversion). `mysql2` defaults to text protocol.

### 5. SQL Dialect Differences

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| **Placeholders** | `$1, $2` (numbered) | `?` (positional) |
| **String concat** | `\|\|` operator | `CONCAT()` function |
| **Case sensitivity** | Identifiers folded to lowercase | Depends on OS |
| **Boolean type** | `BOOLEAN` | `TINYINT(1)` |
| **RETURNING clause** | `INSERT ... RETURNING *` | Not supported (use `LAST_INSERT_ID()`) |
| **CTEs** | `WITH` (recursive supported) | `WITH` (MySQL 8.0+) |
| **Window functions** | Fully supported | MySQL 8.0+ |

**Implication for Node.js**:
Switching from MySQL to PostgreSQL requires query rewrites, especially for placeholders and RETURNING.

---

## Wire Protocol & Connection Internals

### PostgreSQL Wire Protocol v3

When you call `client.connect()` or `pool.query()`, here's what happens under the hood:

```
1. TCP Connection Establishment
   ├── Node.js creates TCP socket to PostgreSQL (default port 5432)
   └── Three-way TCP handshake (SYN, SYN-ACK, ACK)

2. Startup Message
   ├── Client sends: protocol version, database name, username
   └── Server responds: authentication request

3. Authentication (SCRAM-SHA-256)
   ├── Client sends: password hash (not plaintext)
   ├── Server verifies against pg_authid
   └── Server responds: AuthenticationOk

4. Backend Process Forked
   ├── PostgreSQL master process forks a backend process
   ├── Backend process owns this connection exclusively
   └── Process ID (PID) returned to client

5. Parameter Status
   ├── Server sends: server_version, server_encoding, timezone, etc.
   └── Client stores these in connection state

6. Ready for Query
   └── Server sends: ReadyForQuery (transaction status: idle)
```

**Code representation:**

```typescript
// What happens when you call client.connect()
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'postgres',
  password: 'secret',
});

await client.connect();
// Behind the scenes:
// 1. TCP socket created
// 2. Startup message sent
// 3. SCRAM-SHA-256 authentication
// 4. Backend process forked (e.g., PID 12345)
// 5. Parameter status received
// 6. ReadyForQuery received
```

### Message Types in Wire Protocol

PostgreSQL uses **message-based communication**. Each message has:
- **Type code** (1 byte): Identifies message type
- **Length** (4 bytes): Message payload size
- **Payload**: Actual data

Common message types:

| Code | Type | Sent By | Purpose |
|------|------|---------|---------|
| `Q` | Query | Client | Simple query (text protocol) |
| `P` | Parse | Client | Prepare statement (extended protocol) |
| `B` | Bind | Client | Bind parameters to prepared statement |
| `E` | Execute | Client | Execute bound statement |
| `D` | DataRow | Server | Result row |
| `C` | CommandComplete | Server | Query finished |
| `Z` | ReadyForQuery | Server | Ready for next command |
| `E` | ErrorResponse | Server | Error occurred |

### Simple vs Extended Query Protocol

**Simple Query Protocol** (single message):

```typescript
// Simple query: everything in one message
await client.query('SELECT * FROM users WHERE id = 1');
// Wire protocol:
// ← Q: "SELECT * FROM users WHERE id = 1"
// → DataRow, DataRow, ...
// → CommandComplete
// → ReadyForQuery
```

**Extended Query Protocol** (separate parse, bind, execute):

```typescript
// Parameterized query: uses extended protocol
await client.query('SELECT * FROM users WHERE id = $1', [1]);
// Wire protocol:
// ← P: Parse "SELECT * FROM users WHERE id = $1"
// ← B: Bind [1] to parameter $1
// ← E: Execute
// → DataRow, DataRow, ...
// → CommandComplete
// → ReadyForQuery
```

**Why extended protocol?**

1. **SQL injection prevention**: Parameters sent separately from SQL
2. **Type safety**: Server knows parameter types
3. **Prepared statement caching**: Server caches the parsed query plan
4. **Binary format**: Parameters can be sent in binary (faster)

---

## Client vs Pool: Deep Architectural Dive

### Client: Single Dedicated Connection

**Architecture:**

```
┌─────────────────────────────────────┐
│     Your Node.js Application        │
│                                     │
│   const client = new Client();     │
│   await client.connect();           │
│                                     │
│   ┌───────────────────────┐         │
│   │  Client Instance      │         │
│   │  - connection state   │         │
│   │  - TCP socket         │         │
│   │  - transaction state  │         │
│   └───────────┬───────────┘         │
│               │                     │
└───────────────┼─────────────────────┘
                │ TCP (port 5432)
                ▼
┌───────────────────────────────────────┐
│      PostgreSQL Server                │
│                                       │
│   Backend Process (PID 12345)         │
│   - Owns this connection exclusively  │
│   - 10-15MB memory per process        │
│   - Dies when connection closes       │
└───────────────────────────────────────┘
```

**Memory implications:**
- **Client-side**: ~1MB for `Client` instance
- **Server-side**: ~10-15MB for backend process + shared buffers

**Use cases:**
- **CLI scripts**: One-off operations, exits after completion
- **Migrations**: Need consistent transaction state
- **Long-running transactions**: Hold locks across multiple queries
- **Background workers**: Dedicated connection per worker

**Anti-pattern:**

```typescript
// ❌ DON'T: Create new client for every request
app.get('/users', async (req, res) => {
  const client = new Client(config);
  await client.connect(); // Expensive! Process fork every time
  const result = await client.query('SELECT * FROM users');
  await client.end();
  res.json(result.rows);
});
```

### Pool: Connection Pooling

**Architecture:**

```
┌──────────────────────────────────────────────────────┐
│          Your Node.js Application (Express)          │
│                                                      │
│  Request 1 ──┐                                       │
│  Request 2 ──┼──► await pool.query(...)              │
│  Request 3 ──┘                                       │
│                                                      │
│         ┌────────────────────────────┐               │
│         │      Pool Manager          │               │
│         │                            │               │
│         │  Available: [C1, C2]       │               │
│         │  In-use:    [C3]           │               │
│         │  Waiting:   [Req4, Req5]   │               │
│         └────────┬───────────────────┘               │
│                  │                                   │
│         ┌────────┴───────────┐                       │
│         │ C1   C2   C3       │ ← Idle connections    │
│         └────────┬───────────┘                       │
└──────────────────┼──────────────────────────────────┘
                   │ TCP connections (multiplexed)
                   ▼
┌────────────────────────────────────────────────────┐
│           PostgreSQL Server                        │
│                                                    │
│  Backend 1 (PID 101) ──► Serves Request 1          │
│  Backend 2 (PID 102) ──► Serves Request 2          │
│  Backend 3 (PID 103) ──► Serves Request 3          │
│                                                    │
│  max_connections = 100 (server config)             │
└────────────────────────────────────────────────────┘
```

**Pool lifecycle:**

```typescript
// Pool initialization (once at app startup)
const pool = new Pool({
  max: 20,         // Maximum 20 connections
  min: 2,          // Always keep 2 connections open
  idleTimeoutMillis: 30000,  // Close idle after 30s
});

// Behind the scenes:
// 1. Pool creates 2 connections immediately (min: 2)
// 2. These connections stay open even when idle

// First query
await pool.query('SELECT * FROM users');
// 1. Pool checks for available connection
// 2. Finds C1 in available queue
// 3. Moves C1 to in-use queue
// 4. Executes query on C1
// 5. Returns C1 to available queue

// 21st concurrent query (pool size = 20)
await pool.query('SELECT * FROM users');
// 1. No available connections
// 2. All 20 connections in use
// 3. Query added to waiting queue
// 4. Waits for a connection to be released
// 5. Times out after connectionTimeoutMillis (default: none)
```

**Memory calculations:**

```typescript
// Pool configuration
const pool = new Pool({ max: 20 });

// Memory breakdown:
// Client-side (Node.js process):
//   - Pool manager: ~500KB
//   - 20 Client instances: ~20MB (1MB each)
//   - Query result buffers: varies (could be 100s of MB)
//
// Server-side (PostgreSQL):
//   - 20 backend processes: ~200-300MB (10-15MB each)
//   - Shared buffers: configured separately (e.g., 128MB)
//   - Total: ~400MB just for this pool

// With 10 Node.js servers, each with max: 20 pool
// Total PostgreSQL connections: 10 × 20 = 200 connections
// Total PostgreSQL memory: ~2-3GB just for backends
```

### Pool Events & Lifecycle

```typescript
const pool = new Pool({ max: 10 });

// Event: New connection created
pool.on('connect', (client) => {
  console.log('New connection established');
  console.log('Backend PID:', client.processID);

  // Good place to set session-level config
  client.query('SET timezone = "UTC"');
  client.query('SET search_path = public');
});

// Event: Connection acquired from pool
pool.on('acquire', (client) => {
  console.log('Connection acquired from pool');
  console.log('Available:', pool.idleCount);
  console.log('In-use:', pool.totalCount - pool.idleCount);
});

// Event: Connection returned to pool
pool.on('release', (err, client) => {
  console.log('Connection released back to pool');
  console.log('Available:', pool.idleCount);
});

// Event: Error on idle connection
pool.on('error', (err, client) => {
  console.error('Idle client error:', err);
  // Connection will be removed from pool
  // Pool will create a new one if below min
});

// Event: Connection removed from pool
pool.on('remove', (client) => {
  console.log('Connection removed from pool');
  console.log('Reason: idle timeout or error');
});
```

---

## Connection Pooling Theory & Memory Management

### Why Pooling Exists

**Problem**: Creating a new PostgreSQL connection is expensive:

1. **TCP handshake**: 1-2 RTT (round-trip time)
2. **PostgreSQL process fork**: 5-10ms on Linux
3. **Memory allocation**: 10-15MB per backend
4. **Authentication**: SCRAM-SHA-256 hashing
5. **Session initialization**: SET commands

**Total cost**: ~50-100ms per connection

For a web server handling 100 req/s, creating connections per-request would:
- Waste 5-10 seconds/sec just on connection overhead
- Fork 100 processes/sec (unsustainable)
- Thrash PostgreSQL's process table

**Solution**: Connection pooling reuses existing connections.

### Pool Sizing: The Math

**Rule of thumb**:
```
pool_size = ((core_count * 2) + effective_spindle_count)
```

For modern SSDs with many cores, this formula is outdated. Better formula:

```
pool_size = (number_of_cpu_cores * 2) + 1
```

**Example**:
- Server has 8 CPU cores
- Recommended pool size: (8 × 2) + 1 = 17

**Why not more?**

1. **Context switching overhead**: More connections = more processes competing for CPU
2. **Lock contention**: PostgreSQL has internal locks (e.g., on pg_stat_activity)
3. **Memory pressure**: Each connection = 10-15MB
4. **Diminishing returns**: Beyond optimal, adding connections decreases throughput

**Empirical data** (PostgreSQL 15, 8-core server):
- 10 connections: 5,000 QPS
- 20 connections: 8,000 QPS
- 50 connections: 7,500 QPS (worse!)
- 100 connections: 5,000 QPS (context switching kills performance)

### Connection Pool Starvation

**Scenario**: All connections are in-use, new request arrives

```typescript
const pool = new Pool({ max: 10, connectionTimeoutMillis: 5000 });

// 10 slow queries holding all connections
for (let i = 0; i < 10; i++) {
  pool.query('SELECT pg_sleep(30)'); // 30 second query
}

// 11th query waits
try {
  await pool.query('SELECT * FROM users'); // Waits...
} catch (err) {
  // After 5 seconds: "timeout acquiring connection"
}
```

**Solutions**:

1. **Increase pool size** (if you have headroom)
2. **Optimize slow queries** (use EXPLAIN ANALYZE)
3. **Implement query timeout** (prevent runaway queries)
4. **Use statement_timeout** (PostgreSQL config)

```typescript
const pool = new Pool({
  max: 20,
  connectionTimeoutMillis: 3000,  // Fail fast
  statement_timeout: 10000,       // Kill queries after 10s
});
```

### Memory Management & Garbage Collection

**Node.js side**:

```typescript
// Each query result is a JavaScript object
const result = await pool.query('SELECT * FROM large_table');
// result.rows is an array of objects
// If table has 100,000 rows × 1KB/row = ~100MB in memory

// This memory is eligible for GC after result goes out of scope
processResults(result.rows);
// After this function, result.rows can be GC'd
```

**PostgreSQL side**:

```typescript
// PostgreSQL caches query plans
await pool.query('SELECT * FROM users WHERE id = $1', [1]);
// First execution: Parse SQL, build query plan, cache it
await pool.query('SELECT * FROM users WHERE id = $1', [2]);
// Second execution: Reuse cached plan (faster)

// Prepared statements are per-connection
// If connection closes, cached plans are lost
// This is why long-lived pooled connections are efficient
```

**Monitoring memory usage**:

```typescript
import os from 'os';

setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log({
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    poolConnections: pool.totalCount,
    poolIdle: pool.idleCount,
  });
}, 10000); // Log every 10 seconds
```

---

## Query Execution: Text vs Binary Protocol

### Text Protocol (Simple Query)

**How it works**:

```typescript
// Text protocol: SQL and parameters sent as strings
await pool.query("SELECT * FROM users WHERE age > 18");
```

**Wire protocol (text format)**:

```
← Q: "SELECT * FROM users WHERE age > 18"
→ RowDescription: [name: "id", type: INT4], [name: "age", type: INT4], ...
→ DataRow: ["1", "25"]  ← All values as strings
→ DataRow: ["2", "30"]
→ CommandComplete: "SELECT 2"
→ ReadyForQuery
```

**Parsing cost**:
- `"1"` (string) → `1` (number): requires parseInt
- `"25"` (string) → `25` (number): requires parseInt
- For 10,000 rows × 10 columns = 100,000 parse operations

### Binary Protocol (Extended Query)

**How it works**:

```typescript
// Binary protocol: parameters sent in binary format
await pool.query('SELECT * FROM users WHERE age > $1', [18]);
```

**Wire protocol (binary format)**:

```
← P: Parse "SELECT * FROM users WHERE age > $1"
← B: Bind [0x00, 0x00, 0x00, 0x12]  ← 18 in binary (4 bytes)
← E: Execute
→ RowDescription: [name: "id", type: INT4], ...
→ DataRow: [0x00, 0x00, 0x00, 0x01]  ← 1 in binary
→ DataRow: [0x00, 0x00, 0x00, 0x02]  ← 2 in binary
→ CommandComplete: "SELECT 2"
→ ReadyForQuery
```

**Parsing cost**: Binary integers are already numbers, no parsing needed.

### Performance Comparison

**Benchmark** (10,000 rows, 5 integer columns):

| Protocol | Time | CPU Usage |
|----------|------|-----------|
| Text     | 45ms | High (string parsing) |
| Binary   | 28ms | Low (binary copy) |

**When `pg` uses binary**:
- By default, `pg` sends parameters in binary format
- Result rows are still text format (for compatibility)
- To get binary results, use `rowMode: 'binary'` (rarely needed)

---

## Parameterized Queries & SQL Injection Prevention

### Why Parameterized Queries?

**Vulnerable code (string concatenation)**:

```typescript
// ❌ NEVER DO THIS
const userId = req.params.id;
await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
// If userId = "1; DROP TABLE users; --"
// Actual query: SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

**Safe code (parameterized)**:

```typescript
// ✅ SAFE
const userId = req.params.id;
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
// userId is sent separately in Bind message
// PostgreSQL treats it as data, not SQL
```

### How Parameterization Prevents SQL Injection

**Under the hood**:

```
Step 1: Parse (without parameters)
  Client sends: "SELECT * FROM users WHERE id = $1"
  Server parses SQL into abstract syntax tree (AST)
  $1 is a placeholder node in AST

Step 2: Bind (attach parameters)
  Client sends: [value: "1; DROP TABLE users; --"]
  Server treats this as STRING data for $1
  Server does NOT re-parse SQL

Step 3: Execute
  SQL structure is locked from Parse step
  Parameter value is escaped and inserted as data
  No way to inject SQL syntax
```

**Visual comparison**:

```
String Concatenation (Vulnerable):
┌─────────────────────────────────────────┐
│  "SELECT * FROM users WHERE id = "      │
│  + userId                               │ ← userId can contain SQL
└─────────────────────────────────────────┘
         ↓
SQL Parser sees: SELECT * FROM users WHERE id = 1; DROP TABLE users; --
         ↓
Executes TWO statements:
  1. SELECT * FROM users WHERE id = 1
  2. DROP TABLE users

Parameterized Query (Safe):
┌─────────────────────────────────────────┐
│  "SELECT * FROM users WHERE id = $1"    │ ← Parsed first (structure locked)
└─────────────────────────────────────────┘
         ↓
SQL Parser sees: SELECT * FROM users WHERE id = [PLACEHOLDER]
         ↓
Bind parameters: $1 ← "1; DROP TABLE users; --" (as STRING data)
         ↓
Executes ONE statement:
  SELECT * FROM users WHERE id = '1; DROP TABLE users; --'
  (No rows match this weird ID, but no SQL injection)
```

### Numbered Placeholders ($1, $2) vs MySQL's ?

**PostgreSQL (numbered)**:

```typescript
await pool.query(
  'SELECT * FROM posts WHERE author_id = $1 OR mentioned IN ($1)',
  [userId]
);
// Parameter reuse: $1 used twice, only passed once
```

**MySQL (positional)**:

```typescript
await mysqlPool.query(
  'SELECT * FROM posts WHERE author_id = ? OR mentioned = ?',
  [userId, userId]
);
// Must pass userId twice
```

**Why PostgreSQL uses $1, $2**:

1. **Parameter reuse**: Can reference $1 multiple times
2. **Clarity**: Easy to see which value goes where
3. **Named variants**: Some drivers support `:name` syntax (converted to $n)

---

## Transaction Theory: ACID & Isolation Levels

### ACID Guarantees

**Atomicity**: All-or-nothing execution

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  await client.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
  await client.query('UPDATE accounts SET balance = balance + 100 WHERE id = 2');

  await client.query('COMMIT');
  // Both updates succeed, or both fail (rollback)
} catch (err) {
  await client.query('ROLLBACK');
  // If any query fails, all changes are undone
} finally {
  client.release();
}
```

**Consistency**: Database goes from valid state to valid state

```sql
-- Constraint: balance >= 0
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- If this violates constraint, transaction aborts
```

**Isolation**: Concurrent transactions don't interfere

```typescript
// Transaction 1 (T1)
await client1.query('BEGIN');
await client1.query('UPDATE accounts SET balance = 500 WHERE id = 1');
// Not yet committed

// Transaction 2 (T2) on different connection
await client2.query('SELECT balance FROM accounts WHERE id = 1');
// Sees old value (100), not 500
// Isolation level determines what T2 sees
```

**Durability**: Committed changes survive crashes

```typescript
await client.query('COMMIT');
// After COMMIT returns, changes are on disk
// Even if PostgreSQL crashes 1 second later, changes persist
```

### PostgreSQL Isolation Levels

PostgreSQL supports 4 isolation levels (from weakest to strongest):

| Isolation Level | Dirty Reads | Non-Repeatable Reads | Phantom Reads | Serialization Anomalies |
|----------------|-------------|---------------------|---------------|------------------------|
| Read Uncommitted* | ❌ | ✅ | ✅ | ✅ |
| Read Committed | ❌ | ✅ | ✅ | ✅ |
| Repeatable Read | ❌ | ❌ | ❌ | ✅ |
| Serializable | ❌ | ❌ | ❌ | ❌ |

*PostgreSQL treats Read Uncommitted as Read Committed.

**Default**: Read Committed

#### Read Committed (Default)

```typescript
// Transaction 1
await client1.query('BEGIN');
const result1 = await client1.query('SELECT balance FROM accounts WHERE id = 1');
console.log(result1.rows[0].balance); // 100

// Transaction 2 (different connection)
await client2.query('UPDATE accounts SET balance = 200 WHERE id = 1');
await client2.query('COMMIT');

// Back to Transaction 1
const result2 = await client1.query('SELECT balance FROM accounts WHERE id = 1');
console.log(result2.rows[0].balance); // 200 ← Changed! (Non-repeatable read)

await client1.query('COMMIT');
```

**Use case**: Most applications (default for a reason)

#### Repeatable Read

```typescript
// Transaction 1
await client1.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
const result1 = await client1.query('SELECT balance FROM accounts WHERE id = 1');
console.log(result1.rows[0].balance); // 100

// Transaction 2
await client2.query('UPDATE accounts SET balance = 200 WHERE id = 1');
await client2.query('COMMIT');

// Back to Transaction 1
const result2 = await client1.query('SELECT balance FROM accounts WHERE id = 1');
console.log(result2.rows[0].balance); // 100 ← Still! (Repeatable)

await client1.query('COMMIT');
```

**Use case**: When you need consistent snapshot across multiple queries

#### Serializable

```typescript
// Transaction 1 (T1)
await client1.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
const result1 = await client1.query('SELECT COUNT(*) FROM users WHERE status = \'active\'');
const count1 = result1.rows[0].count; // 10

// Transaction 2 (T2)
await client2.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
await client2.query('INSERT INTO users (status) VALUES (\'active\')');
await client2.query('COMMIT');

// Back to T1
const result2 = await client1.query('SELECT COUNT(*) FROM users WHERE status = \'active\'');
const count2 = result2.rows[0].count; // Still 10 (T2's insert not visible)

// T1 tries to update based on count
await client1.query('UPDATE summary SET active_count = $1', [count2]);
await client1.query('COMMIT');
// ERROR: could not serialize access due to concurrent update
```

**Use case**: Financial transactions, inventory management (where anomalies are unacceptable)

### Deadlock Detection

**Scenario**: Two transactions waiting for each other

```typescript
// Transaction 1
await client1.query('BEGIN');
await client1.query('UPDATE accounts SET balance = balance - 10 WHERE id = 1');
// Locks row 1

// Transaction 2
await client2.query('BEGIN');
await client2.query('UPDATE accounts SET balance = balance - 10 WHERE id = 2');
// Locks row 2

// Transaction 1 tries to lock row 2
await client1.query('UPDATE accounts SET balance = balance + 10 WHERE id = 2');
// Waits for T2 to release row 2...

// Transaction 2 tries to lock row 1
await client2.query('UPDATE accounts SET balance = balance + 10 WHERE id = 1');
// Waits for T1 to release row 1...

// DEADLOCK! Both waiting forever

// PostgreSQL detects this and aborts one transaction:
// ERROR: deadlock detected
```

**PostgreSQL's deadlock detector** runs every `deadlock_timeout` (default: 1 second) and aborts one transaction to break the cycle.

---

## PostgreSQL-Specific Features Deep Dive

### JSONB (Binary JSON)

**Why JSONB exists**: Store semi-structured data efficiently

**JSONB vs JSON**:
- **JSON**: Stored as text, re-parsed on every access
- **JSONB**: Stored in binary format, no parsing needed

**Example**:

```typescript
// Create table with JSONB column
await pool.query(`
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    attributes JSONB
  )
`);

// Insert JSONB data
await pool.query(
  'INSERT INTO products (name, attributes) VALUES ($1, $2)',
  ['Widget', { color: 'red', sizes: ['S', 'M', 'L'], inStock: true }]
);
// pg automatically serializes JavaScript object to JSONB

// Query JSONB fields
const result = await pool.query(`
  SELECT name, attributes->>'color' AS color
  FROM products
  WHERE attributes @> '{"inStock": true}'
`);
// @> is containment operator
// ->> extracts as text

// JSONB operators:
// -> : Get JSON object field
// ->> : Get JSON object field as text
// @> : Contains
// <@ : Contained by
// ? : Key exists
// ?| : Any key exists
// ?& : All keys exist

// Update nested JSONB
await pool.query(`
  UPDATE products
  SET attributes = jsonb_set(attributes, '{inStock}', 'false')
  WHERE id = 1
`);
```

**JSONB indexing (GIN)**:

```typescript
// Create GIN index for fast JSONB queries
await pool.query(`
  CREATE INDEX idx_products_attributes ON products USING GIN (attributes)
`);

// Now this query is fast (uses index):
await pool.query(`
  SELECT * FROM products WHERE attributes @> '{"color": "red"}'
`);
```

### Array Columns

```typescript
// Create table with array column
await pool.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT,
    roles TEXT[] DEFAULT '{}'
  )
`);

// Insert array
await pool.query(
  'INSERT INTO users (email, roles) VALUES ($1, $2)',
  ['admin@example.com', ['admin', 'moderator']]
);
// pg automatically converts JS array to PostgreSQL array

// Query array contains element
const admins = await pool.query(`
  SELECT * FROM users WHERE 'admin' = ANY(roles)
`);

// Array overlap (has any of these roles)
const result = await pool.query(`
  SELECT * FROM users WHERE roles && $1
`, [['admin', 'superuser']]);

// Append to array
await pool.query(`
  UPDATE users
  SET roles = array_append(roles, $1)
  WHERE id = $2
`, ['viewer', 1]);
```

### LISTEN/NOTIFY (Pub/Sub)

**Use case**: Real-time notifications without polling

```typescript
// Subscriber (listener)
const subscriber = new Client(config);
await subscriber.connect();

await subscriber.query('LISTEN new_orders');

subscriber.on('notification', (msg) => {
  console.log('Channel:', msg.channel); // "new_orders"
  console.log('Payload:', msg.payload); // JSON string

  const order = JSON.parse(msg.payload);
  console.log('New order:', order.id);
});

// Publisher (notifier)
const publisher = new Client(config);
await publisher.connect();

await publisher.query(
  `SELECT pg_notify('new_orders', $1)`,
  [JSON.stringify({ id: 123, total: 99.99 })]
);
```

**Trigger-based notifications**:

```sql
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_orders', json_build_object(
    'id', NEW.id,
    'total', NEW.total,
    'created_at', NEW.created_at
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
```

Now every `INSERT INTO orders` automatically notifies all listeners!

---

## PHP/Laravel PDO vs Node.js pg Comparison

### Connection Model

**PHP (request-scoped)**:

```php
// Each HTTP request creates a new PDO connection
$pdo = new PDO('pgsql:host=localhost;dbname=myapp', 'user', 'pass');
$stmt = $pdo->query('SELECT * FROM users');
// Connection closed at end of request (automatic)
```

**Node.js (long-lived pool)**:

```typescript
// Pool created once at app startup
const pool = new Pool({ /* config */ });

// Connections reused across requests
app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});
// Connection returned to pool (not closed)
```

**Why different?**

- PHP: Process-per-request model (PHP-FPM), connection per request is fine
- Node.js: Single-process event loop, must reuse connections

### Prepared Statements

**PHP PDO**:

```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => 1]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
```

**Node.js pg**:

```typescript
// Automatic prepared statement (named)
const result = await pool.query({
  name: 'get-user',
  text: 'SELECT * FROM users WHERE id = $1',
  values: [1],
});
// First call: prepares statement
// Subsequent calls: reuses prepared plan
```

### Transaction Syntax

**PHP Laravel**:

```php
DB::transaction(function () {
    DB::update('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
    DB::update('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
});
// Auto-commit if no exception, auto-rollback if exception
```

**Node.js pg**:

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
  client.release();
}
```

---

## Error Handling & PostgreSQL Error Codes

### Common Error Codes

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
        throw new BadRequestError(`Missing required field: ${err.column}`);

      case '22P02': // invalid_text_representation
        throw new BadRequestError('Invalid data format');

      case '42P01': // undefined_table
        throw new InternalError('Database schema error');

      case '57014': // query_canceled
        throw new TimeoutError('Query timed out');

      default:
        console.error('Database error:', err);
        throw new InternalError('Database operation failed');
    }
  }
  throw err;
}
```

**PostgreSQL error code structure**:
- **Class** (first 2 digits): Error category
  - `23xxx`: Constraint violations
  - `42xxx`: Syntax/schema errors
  - `57xxx`: System errors
- **Specific** (last 3 digits): Exact error

---

## Production Best Practices

### 1. Pool Sizing

```typescript
const pool = new Pool({
  // Rule: (CPU cores × 2) + 1
  max: 17, // For 8-core server

  // Keep minimum connections for fast startup
  min: 2,

  // Close idle connections to reduce memory
  idleTimeoutMillis: 30000,

  // Fail fast if pool exhausted
  connectionTimeoutMillis: 3000,
});
```

### 2. Statement Timeout

```typescript
const pool = new Pool({
  // Kill runaway queries
  statement_timeout: 30000, // 30 seconds

  // Or set per-query
});

await pool.query('SET statement_timeout = 10000'); // 10s for this session
```

### 3. Connection Health Checks

```typescript
pool.on('error', (err, client) => {
  console.error('Idle client error:', err);
  // Pool removes bad connection and creates new one
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});
```

### 4. Monitoring

```typescript
setInterval(() => {
  console.log({
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
  });
}, 60000);
```

---

## Code Examples

See existing code examples in the original file (lines 225-1106) for:
- Client vs Pool usage
- Connection configuration
- Parameterized queries
- Type-safe queries
- Transactions
- JSONB operations
- Array operations
- LISTEN/NOTIFY
- Error handling
- Complete service layer

---

## Key Takeaways

1. **node-postgres is a wire protocol driver** — It translates JavaScript to PostgreSQL binary protocol, not an ORM.

2. **PostgreSQL uses process-per-connection** — Unlike MySQL's threads, each connection = OS process = 10-15MB memory.

3. **Always use Pool for web servers** — Client is for scripts/migrations only.

4. **Pool sizing matters** — Too many connections = context switching overhead. Formula: (cores × 2) + 1.

5. **Extended protocol prevents SQL injection** — Parameters sent separately from SQL in Bind message.

6. **PostgreSQL has rich types** — JSONB, arrays, LISTEN/NOTIFY are first-class features.

7. **Read Committed is default isolation** — Use Repeatable Read or Serializable for stricter consistency.

8. **Monitor pool health** — Track totalCount, idleCount, waitingCount to prevent starvation.

---

## What's Next?

- **Phase 089**: Connection Pooling Deep Dive (already completed)
- **Phase 090**: Sequelize Introduction (ORM built on top of pg)
