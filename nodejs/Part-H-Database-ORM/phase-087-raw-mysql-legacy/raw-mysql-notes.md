# Phase 087: Raw MySQL Driver (mysql2) — The Foundation Layer

## Overview

**Why learn raw drivers when ORMs exist?**

Understanding raw database drivers is like understanding manual transmission before driving automatic. Even if you'll mostly use ORMs (automatic), knowing the foundation layer helps you:

1. **Debug ORM-generated queries** (see what's actually sent to database)
2. **Optimize performance-critical code** (when ORM overhead matters)
3. **Know when to drop below the abstraction** (complex queries ORMs can't generate)
4. **Appreciate what ORMs do for you** (connection pooling, query building, type safety)
5. **Work with legacy codebases** (many production apps use raw drivers)

The `mysql2` package is the **modern MySQL driver** for Node.js. It's a complete rewrite of the original `mysql` package with native Promise support and better performance.

---

## Part 1: Why mysql2 Exists (The History)

### The Problem with the Original `mysql` Package

**Timeline:**

```
2010: 'mysql' package released
- Callback-based only
- Good for its time
- Became the standard

2013: Promises become popular
- ES6 promises specification
- Developers want async/await

2014: 'mysql2' created as rewrite
- Native Promise support
- Better performance (C++ bindings)
- Server-side prepared statements
- Backwards compatible API

2024: mysql2 is the standard
- 10x more downloads than 'mysql'
- Used by major ORMs (Sequelize, TypeORM, Drizzle)
- Original 'mysql' in maintenance mode
```

### Feature Comparison

| Feature | mysql (legacy) | mysql2 (modern) |
|---------|---------------|-----------------|
| **Promise support** | No (callback only) | Yes (native) |
| **Async/await** | No (must promisify) | Yes (built-in) |
| **Prepared statements** | Emulated (client-side) | Server-side (faster, safer) |
| **Performance** | Good | **Better** (C++ bindings) |
| **TypeScript** | Community types (`@types/mysql`) | Built-in types |
| **Maintained** | Minimally | Actively |
| **Streaming** | Yes | Yes (improved) |
| **Binary protocol** | Limited | Full support |

**Always use `mysql2`** — it's backwards compatible with `mysql` but better in every way.

---

## Part 2: How mysql2 Works Internally

### Architecture Overview

```
Your Application
       │
       ▼
┌─────────────────────────────────────┐
│   mysql2 JavaScript Layer           │
│   - Connection pooling              │
│   - Query building                  │
│   - Result parsing                  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Native C++ Bindings (optional)    │
│   - Binary protocol parsing         │
│   - Performance optimization        │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   TCP Connection (socket)           │
│   - MySQL Wire Protocol             │
│   - Packets: command → response     │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   MySQL Server                      │
│   - Query parser                    │
│   - Query optimizer                 │
│   - Storage engine (InnoDB)         │
└─────────────────────────────────────┘
```

### What Happens When You Run a Query

```typescript
// Your code
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [1]);
```

**Step-by-step internals:**

```
1. Pool Management (JavaScript):
   ┌────────────────────────────────────────┐
   │ pool.execute() called                  │
   │ - Check if connection available in pool│
   │ - If yes: Reuse existing connection    │
   │ - If no: Create new (if under limit)   │
   │   OR wait in queue                     │
   └────────────────────────────────────────┘

2. Query Preparation (JavaScript → C++):
   ┌────────────────────────────────────────┐
   │ Build MySQL protocol packet:           │
   │ - Command type: COM_STMT_PREPARE       │
   │ - SQL: "SELECT * FROM users WHERE id=?"│
   │ - Parameters: [1]                      │
   └────────────────────────────────────────┘

3. Network Transmission (TCP):
   ┌────────────────────────────────────────┐
   │ Send packet to MySQL server:           │
   │ - TCP socket write                     │
   │ - Binary protocol (not plain text!)    │
   └────────────────────────────────────────┘

4. MySQL Server Processing:
   ┌────────────────────────────────────────┐
   │ Server receives packet:                │
   │ 1. Parse SQL syntax                    │
   │ 2. Check permissions                   │
   │ 3. Optimize query (use indexes?)       │
   │ 4. Execute on storage engine (InnoDB)  │
   │ 5. Fetch results                       │
   │ 6. Serialize results to binary format  │
   │ 7. Send response packet                │
   └────────────────────────────────────────┘

5. Result Parsing (C++ → JavaScript):
   ┌────────────────────────────────────────┐
   │ mysql2 receives response:              │
   │ 1. Parse binary protocol               │
   │ 2. Convert MySQL types to JS types:    │
   │    - TINYINT → number                  │
   │    - VARCHAR → string                  │
   │    - TIMESTAMP → Date                  │
   │ 3. Build result arrays/objects         │
   └────────────────────────────────────────┘

6. Connection Return:
   ┌────────────────────────────────────────┐
   │ Return connection to pool:             │
   │ - Mark as "available"                  │
   │ - If queue has waiting requests,       │
   │   give to next waiter                  │
   └────────────────────────────────────────┘

Total time: ~5-10ms (network + processing)
```

### MySQL Wire Protocol (The Communication Format)

**What is sent over the network:**

```
Plain text SQL (old drivers):
  "SELECT * FROM users WHERE id = 1"
  Problem: Server must parse entire string every time

Binary protocol (mysql2 with prepared statements):
  Packet 1 (prepare): "SELECT * FROM users WHERE id = ?"
  Server response: Statement ID = 42

  Packet 2 (execute): Statement ID 42, Params: [1 (INT)]
  Server response: [Row1 data, Row2 data...]

Benefits:
- Server caches prepared statement (faster re-execution)
- Parameters sent as binary (no string parsing)
- SQL injection impossible (params separate from SQL)
```

---

## Part 3: Installation and Configuration

### Package Installation

```bash
# Install mysql2 (preferred)
npm install mysql2

# For TypeScript (types included in mysql2)
npm install -D @types/node  # Only for Node.js built-in types
```

**Why NOT mysql?**

```bash
# ❌ DON'T: Old package
npm install mysql

# Problems:
# 1. No native Promise support
# 2. Slower performance
# 3. Callback hell
# 4. Not actively maintained
```

---

### Configuration Options (Deep Dive)

```typescript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  // =========================================
  // BASIC CONNECTION
  // =========================================

  host: 'localhost',
  // Default: 'localhost'
  // What it does: DNS hostname or IP address
  // Example: 'db.example.com' or '192.168.1.100'

  port: 3306,
  // Default: 3306 (MySQL default port)
  // What it does: TCP port number
  // When to change: Running MySQL on non-standard port

  user: 'root',
  // Required: MySQL username
  // Security: NEVER use 'root' in production!
  // Best practice: Create app-specific user with minimal permissions

  password: 'password',
  // Required: MySQL password
  // Security: NEVER hardcode! Use environment variables

  database: 'myapp',
  // Optional: Default database
  // What it does: Equivalent to "USE myapp;" after connection
  // Can switch databases later with connection.changeUser()

  // =========================================
  // CHARACTER SET & ENCODING
  // =========================================

  charset: 'utf8mb4',
  // Default: 'utf8mb4' (recommended)
  // What it does: Character encoding
  // Why utf8mb4: Supports emoji and full Unicode (utf8 = 3-byte, utf8mb4 = 4-byte)
  // MySQL 'utf8' is NOT real UTF-8 (only supports 3-byte characters)

  // =========================================
  // TIMEZONE
  // =========================================

  timezone: 'Z',
  // Default: 'local'
  // Options:
  //   'Z' = UTC (recommended for consistency)
  //   'local' = Server's timezone
  //   '+00:00' = Specific offset
  // What it does: How TIMESTAMP/DATETIME are converted
  // Best practice: Always use 'Z' (UTC) and convert in application

  // =========================================
  // CONNECTION TIMEOUTS
  // =========================================

  connectTimeout: 10000,
  // Default: 10000 (10 seconds)
  // What it does: Max time to wait for initial connection
  // When connection fails: Error after this timeout
  // Use case: Fail fast if database is down

  // =========================================
  // SECURITY
  // =========================================

  multipleStatements: false,
  // Default: false (recommended)
  // What it does: Allow multiple SQL statements in one query
  // Example: "SELECT * FROM users; DROP TABLE users;"
  // Why disabled: SQL injection protection
  // Only enable if you REALLY need it (migrations, scripts)

  // =========================================
  // SSL/TLS
  // =========================================

  ssl: {
    rejectUnauthorized: false  // For self-signed certificates (dev only)
    // For production:
    // ca: fs.readFileSync('/path/to/ca.pem'),
    // cert: fs.readFileSync('/path/to/client-cert.pem'),
    // key: fs.readFileSync('/path/to/client-key.pem')
  },
  // When needed: Connecting to remote MySQL server over internet
  // Why: Encrypt traffic (prevent man-in-the-middle attacks)
});
```

### What Happens Internally During Connection

```
1. DNS Resolution:
   - Resolve 'localhost' to IP (127.0.0.1)
   - Skip if IP provided directly

2. TCP Handshake (3-way):
   - SYN → (client to server)
   - SYN-ACK ← (server to client)
   - ACK → (client to server)
   - Connection established

3. MySQL Handshake:
   Server sends:
   - Protocol version
   - Server version
   - Thread ID
   - Authentication challenge (random salt)

   Client sends:
   - Username
   - Encrypted password (using salt)
   - Database name
   - Character set

   Server responds:
   - OK (if auth succeeds)
   - ERROR (if auth fails)

4. Character Set Setup:
   - SET NAMES 'utf8mb4'
   - SET character_set_connection = utf8mb4
   - SET character_set_results = utf8mb4

5. Timezone Setup:
   - SET time_zone = '+00:00' (if timezone: 'Z')

Total handshake time: ~5-15ms
```

---

## Part 4: Single Connection vs Connection Pool

### Single Connection (Don't Use in Production!)

```typescript
// ❌ BAD FOR PRODUCTION: Single connection
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'myapp'
});

// Problems:
// 1. Only ONE query at a time (blocking)
// 2. If connection dies, entire app breaks
// 3. Must manually manage connection lifecycle
// 4. No request concurrency

// Use case: Scripts, one-off tasks, learning
```

**Why single connections are bad for servers:**

```
Scenario: 10 concurrent requests
┌─────────────────────────────────────────┐
│ Request 1: Query takes 100ms            │
│ Request 2: WAITS for Request 1 (100ms)  │
│ Request 3: WAITS for Request 2 (200ms)  │
│ ...                                      │
│ Request 10: WAITS (900ms!)              │
└─────────────────────────────────────────┘

Total time for all requests: 1 second (sequential)
With pool of 10: 100ms (parallel)
```

---

### Connection Pool (ALWAYS Use This)

```typescript
// ✅ GOOD FOR PRODUCTION: Connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp',

  // Pool-specific options
  connectionLimit: 10,
  // Max number of connections in pool
  // Default: 10
  // How to choose:
  //   - Too low: Requests queue up (slower)
  //   - Too high: MySQL max_connections limit reached
  //   - Rule of thumb: 10-20 per application server

  waitForConnections: true,
  // Default: true
  // What it does:
  //   true: Queue requests when pool full (wait for available connection)
  //   false: Return error immediately when pool full
  // Use case: true for most apps, false for fast-fail systems

  queueLimit: 0,
  // Default: 0 (unlimited)
  // Max number of queued requests
  // What happens:
  //   0: Unlimited queue (can cause memory issues)
  //   N: Error after N queued requests
  // Recommended: Set to 100-1000 (prevent memory leak)

  enableKeepAlive: true,
  // Default: false
  // What it does: Send TCP keepalive packets
  // Why: Prevent firewall/router from closing idle connections
  // Recommended: true (especially with cloud databases)

  keepAliveInitialDelay: 0
  // Default: 0 (immediate)
  // Delay before first keepalive packet (ms)
});
```

### Connection Pool Internals

```
Initial state (limit = 3):
┌────────────────────────────────────────┐
│ Pool: [Conn1, Conn2, Conn3]            │
│ In-use: []                             │
│ Queue: []                              │
└────────────────────────────────────────┘

Request A arrives:
┌────────────────────────────────────────┐
│ Pool: [Conn2, Conn3]                   │
│ In-use: [Conn1 → Request A]            │
│ Queue: []                              │
└────────────────────────────────────────┘

Requests B, C, D arrive (D has to wait):
┌────────────────────────────────────────┐
│ Pool: []                               │
│ In-use: [                              │
│   Conn1 → Request A,                   │
│   Conn2 → Request B,                   │
│   Conn3 → Request C                    │
│ ]                                      │
│ Queue: [Request D]  ← WAITING          │
└────────────────────────────────────────┘

Request A finishes:
┌────────────────────────────────────────┐
│ Pool: []                               │
│ In-use: [                              │
│   Conn1 → Request D,  ← Given to D     │
│   Conn2 → Request B,                   │
│   Conn3 → Request C                    │
│ ]                                      │
│ Queue: []                              │
└────────────────────────────────────────┘
```

**Memory implications:**

```
Each MySQL connection:
- TCP socket: ~8KB
- MySQL thread: ~256KB
- Buffers: ~16KB
- Total: ~280KB per connection

Pool of 10 connections = ~2.8MB
Pool of 100 connections = ~28MB

MySQL server max_connections:
- Default: 151
- If you have 10 app servers with 10 connections each = 100 total
- Leave headroom for admin connections
```

---

## Part 5: Running Queries

### Basic Query (execute)

```typescript
// execute() - For parameterized queries (ALWAYS use this)
const [rows, fields] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// What 'execute' does:
// 1. Sends COM_STMT_PREPARE to server
// 2. Server parses SQL, returns statement ID
// 3. Sends COM_STMT_EXECUTE with params
// 4. Server executes prepared statement
// 5. Returns results
```

**Return value structure:**

```typescript
const [rows, fields] = await pool.execute('SELECT * FROM users');

// rows: Array of result objects
[
  { id: 1, email: 'john@example.com', name: 'John' },
  { id: 2, email: 'jane@example.com', name: 'Jane' }
]

// fields: Metadata about columns
[
  {
    name: 'id',
    type: 3,  // MySQL type code (3 = INT)
    length: 11,
    flags: 16899  // PRIMARY_KEY | NOT_NULL | AUTO_INCREMENT
  },
  {
    name: 'email',
    type: 253,  // MySQL type code (253 = VARCHAR)
    length: 765,  // 255 * 3 (utf8mb4)
    flags: 4097  // NOT_NULL
  },
  // ...
]
```

---

### Query vs Execute (IMPORTANT!)

```typescript
// query() - Text protocol (less safe)
const [rows] = await pool.query(
  'SELECT * FROM users WHERE id = ' + userId  // ❌ SQL INJECTION RISK!
);

// What 'query' does:
// 1. Sends SQL as plain text
// 2. Server parses every time (slower)
// 3. No protection against SQL injection

// =========================================

// execute() - Binary protocol (safe, faster)
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// What 'execute' does:
// 1. Prepares statement (server-side parsing)
// 2. Sends params separately (SQL injection impossible)
// 3. Cached by server (faster re-execution)
```

**Performance comparison:**

```
Test: Run same query 1000 times

query():
- SQL parsed 1000 times by server
- Each parse: ~0.1ms
- Total overhead: 100ms

execute():
- SQL parsed ONCE
- Cached with statement ID
- Subsequent calls: ~0.01ms each
- Total overhead: 10ms

execute() is 10x faster for repeated queries!
```

---

### Parameterized Queries (SQL Injection Prevention)

```typescript
// ❌ NEVER DO THIS (SQL injection vulnerable)
const userId = req.body.userId;  // User input: "1 OR 1=1"
const [rows] = await pool.query(
  'SELECT * FROM users WHERE id = ' + userId
);
// Resulting SQL:
// SELECT * FROM users WHERE id = 1 OR 1=1
// Returns ALL users! (security breach)

// =========================================

// ✅ ALWAYS DO THIS (safe)
const userId = req.body.userId;  // User input: "1 OR 1=1"
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
// Params sent separately, treated as literal value
// "1 OR 1=1" is seen as a string, not SQL
// No rows returned (id is INT, can't match string)
```

**How parameterized queries work internally:**

```
Your code:
  execute('SELECT * FROM users WHERE id = ?', [5])

What mysql2 sends to server:
  Packet 1: PREPARE "SELECT * FROM users WHERE id = ?"
  Server: Statement ID = 42

  Packet 2: EXECUTE statement 42, params: [5 (INT)]
  - Type: INT (binary)
  - Value: 0x00000005 (binary representation)

Server processing:
  - Knows param is INT (not SQL code)
  - Impossible to interpret as SQL
  - Safe from injection

If attacker sends "1 OR 1=1":
  - Sent as VARCHAR type
  - Server tries INT conversion
  - Fails (invalid INT)
  - No rows returned
```

---

### Type Safety with TypeScript

```typescript
// Define result type
interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

// Type-safe query
const [rows] = await pool.execute<User[]>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// TypeScript knows rows is User[]
rows[0].email;  // ✅ Autocomplete works
rows[0].foo;    // ❌ Type error: Property 'foo' does not exist

// =========================================

// Runtime type validation (mysql2 doesn't do this!)
const [rows] = await pool.execute<User[]>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// mysql2 returns plain objects - NO runtime validation
// TypeScript type is just a hint (compile-time only)
// You still need to validate at runtime:

import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.date()
});

const validated = rows.map(row => UserSchema.parse(row));
// Throws if database schema doesn't match
```

---

## Part 6: Common Query Patterns

### INSERT

```typescript
// Single insert
const [result] = await pool.execute(
  'INSERT INTO users (email, name) VALUES (?, ?)',
  ['john@example.com', 'John Doe']
);

console.log(result);
// {
//   fieldCount: 0,
//   affectedRows: 1,
//   insertId: 42,  // ← AUTO_INCREMENT value
//   info: '',
//   serverStatus: 2,
//   warningStatus: 0
// }

const newUserId = result.insertId;  // Use this ID
```

**What happens internally:**

```
1. mysql2 sends:
   PREPARE "INSERT INTO users (email, name) VALUES (?, ?)"

2. Server responds:
   Statement ID = 10

3. mysql2 sends:
   EXECUTE statement 10
   Params: ["john@example.com" (VARCHAR), "John Doe" (VARCHAR)]

4. Server:
   - Validates data types
   - Inserts row
   - Generates AUTO_INCREMENT id (42)
   - Returns result metadata

5. mysql2 returns:
   { affectedRows: 1, insertId: 42, ... }
```

---

### UPDATE

```typescript
const [result] = await pool.execute(
  'UPDATE users SET name = ? WHERE id = ?',
  ['Jane Doe', 42]
);

console.log(result.affectedRows);  // Number of rows changed
// 0 = No matching rows (or value already same)
// 1+ = Rows updated

// Check if update succeeded
if (result.affectedRows === 0) {
  throw new Error('User not found or no changes');
}
```

---

### DELETE

```typescript
const [result] = await pool.execute(
  'DELETE FROM users WHERE id = ?',
  [42]
);

console.log(result.affectedRows);  // Number of deleted rows
// 0 = No matching rows
// 1+ = Rows deleted

// Soft delete (recommended)
const [result] = await pool.execute(
  'UPDATE users SET deleted_at = NOW() WHERE id = ?',
  [42]
);
// Better: Can recover data, maintain referential integrity
```

---

### SELECT with Multiple Rows

```typescript
const [rows] = await pool.execute<User[]>(
  'SELECT * FROM users WHERE age > ? ORDER BY created_at DESC LIMIT ?',
  [25, 10]
);

// rows is array (empty array if no results)
if (rows.length === 0) {
  console.log('No users found');
}

rows.forEach(user => {
  console.log(user.email);
});
```

---

### SELECT Single Row

```typescript
const [rows] = await pool.execute<User[]>(
  'SELECT * FROM users WHERE id = ? LIMIT 1',
  [userId]
);

const user = rows[0];  // Could be undefined!

if (!user) {
  throw new Error('User not found');
}

console.log(user.email);  // Safe to access
```

---

## Part 7: Transactions

**What is a transaction?**

A transaction is a sequence of database operations that must ALL succeed or ALL fail (atomicity).

### Basic Transaction

```typescript
// Get connection from pool
const connection = await pool.getConnection();

try {
  // Start transaction
  await connection.beginTransaction();

  // Perform multiple operations
  await connection.execute(
    'UPDATE accounts SET balance = balance - ? WHERE id = ?',
    [100, 1]
  );

  await connection.execute(
    'UPDATE accounts SET balance = balance + ? WHERE id = ?',
    [100, 2]
  );

  // If we get here, commit
  await connection.commit();
  console.log('Transaction successful');

} catch (error) {
  // If any error, rollback ALL changes
  await connection.rollback();
  console.error('Transaction failed, rolled back:', error);
  throw error;

} finally {
  // ALWAYS release connection back to pool
  connection.release();
}
```

**What happens internally:**

```
1. beginTransaction():
   mysql2 sends: "START TRANSACTION"
   Server: OK (transaction started)

2. First UPDATE:
   - Changes written to transaction log (not disk yet)
   - Row locked (other connections can't modify)

3. Second UPDATE:
   - More changes in transaction log
   - Another row locked

4. commit():
   mysql2 sends: "COMMIT"
   Server:
   - Writes transaction log to disk (durable)
   - Applies changes to data files
   - Releases locks
   - Returns: OK

If rollback():
   mysql2 sends: "ROLLBACK"
   Server:
   - Discards transaction log
   - Reverts changes (data unchanged)
   - Releases locks
   - Returns: OK
```

### Transaction Isolation Levels

```typescript
// Set isolation level for this transaction
await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
await connection.beginTransaction();
// ... queries ...
await connection.commit();
```

**Isolation levels explained:**

```
READ UNCOMMITTED (fastest, least safe):
- Can read uncommitted changes from other transactions
- Dirty reads possible
- Use case: Rarely (analytics where accuracy doesn't matter)

READ COMMITTED (PostgreSQL default):
- Only reads committed data
- Non-repeatable reads possible (data changes between reads)
- Use case: Most web applications

REPEATABLE READ (MySQL default):
- Same data on repeated reads (snapshot)
- Phantom reads possible (new rows appear)
- Use case: MySQL default, works well

SERIALIZABLE (slowest, safest):
- Transactions run as if serial (one after another)
- No concurrency issues, but slow
- Use case: Financial systems requiring strict consistency
```

---

## Part 8: Error Handling

```typescript
try {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
} catch (error: any) {
  // mysql2 errors have specific properties

  console.error('Error code:', error.code);
  // Common codes:
  // - 'ER_DUP_ENTRY': Duplicate key (UNIQUE constraint)
  // - 'ER_NO_SUCH_TABLE': Table doesn't exist
  // - 'ER_BAD_FIELD_ERROR': Column doesn't exist
  // - 'ECONNREFUSED': Can't connect to MySQL
  // - 'ER_ACCESS_DENIED_ERROR': Wrong credentials

  console.error('Error number:', error.errno);
  // MySQL error number (e.g., 1062 for duplicate entry)

  console.error('SQL state:', error.sqlState);
  // Standard SQL state code

  console.error('SQL message:', error.sqlMessage);
  // Human-readable error from MySQL

  console.error('SQL:', error.sql);
  // The SQL that caused error (if available)

  // Handle specific errors
  if (error.code === 'ER_DUP_ENTRY') {
    throw new Error('Email already exists');
  } else if (error.code === 'ECONNREFUSED') {
    throw new Error('Database is down');
  } else {
    throw error;  // Re-throw unknown errors
  }
}
```

---

## Part 9: PHP/Laravel Comparison

### MySQLi (PHP Object-Oriented)

```php
// PHP (MySQLi)
$mysqli = new mysqli("localhost", "root", "password", "myapp");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Prepared statement
$stmt = $mysqli->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);  // 'i' = integer
$stmt->execute();
$result = $stmt->get_result();
$users = $result->fetch_all(MYSQLI_ASSOC);

$stmt->close();
$mysqli->close();
```

```typescript
// Node.js (mysql2) equivalent
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp'
});

const [users] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// No close() needed (pool manages connections)
```

**Key differences:**

| Feature | PHP MySQLi | Node.js mysql2 |
|---------|-----------|----------------|
| **Connection** | New per request (automatic) | Pool (manual setup) |
| **Async** | Synchronous (blocks) | Asynchronous (non-blocking) |
| **Type binding** | Manual (`bind_param('iss', ...)`) | Automatic |
| **Connection close** | Must close manually | Pool handles it |
| **Error handling** | Return false + check error | Throws exceptions (with await) |

---

### PDO (PHP Data Objects)

```php
// PHP (PDO)
$pdo = new PDO('mysql:host=localhost;dbname=myapp', 'root', 'password');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Prepared statement
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $userId]);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

```typescript
// Node.js (mysql2) equivalent (same as above)
const [users] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

**PDO vs mysql2:**

| Feature | PHP PDO | Node.js mysql2 |
|---------|---------|----------------|
| **Database-agnostic** | Yes (MySQL, PostgreSQL, SQLite) | No (MySQL only) |
| **Named params** | Yes (`:id`) | No (only `?`) |
| **Fetch modes** | Many (FETCH_ASSOC, FETCH_OBJ, etc.) | Always array of objects |
| **Connection pooling** | No (new per request) | Yes (required) |

---

### Laravel Eloquent vs mysql2

```php
// Laravel
$users = User::where('age', '>', 25)->get();
```

```typescript
// Node.js mysql2 (raw SQL)
const [users] = await pool.execute(
  'SELECT * FROM users WHERE age > ?',
  [25]
);
```

Laravel Eloquent = ORM (abstraction over PDO)
mysql2 = Raw driver (equivalent to PDO, not Eloquent)

**To get Laravel-like experience in Node.js:**
- Use Prisma, TypeORM, or Sequelize (covered in later phases)

---

## Part 10: Connection Lifecycle Best Practices

### Application Startup

```typescript
// config/database.ts
import mysql from 'mysql2/promise';

// Create pool ONCE at startup
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// Test connection at startup
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);  // Exit if database unavailable
  }
}
```

```typescript
// server.ts
import { pool, initDatabase } from './config/database';

async function start() {
  // Connect to database FIRST
  await initDatabase();

  // Then start server
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

start();
```

---

### Graceful Shutdown

```typescript
// server.ts
import { pool } from './config/database';

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing gracefully...');

  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close database pool
  await pool.end();
  console.log('Database connections closed');

  process.exit(0);
});
```

**Why graceful shutdown matters:**

```
Without graceful shutdown:
1. SIGTERM received (e.g., Kubernetes pod termination)
2. Process exits immediately
3. Active queries interrupted
4. Data corruption possible
5. Connection leaks in MySQL server

With graceful shutdown:
1. SIGTERM received
2. Stop accepting new HTTP requests
3. Wait for active queries to finish
4. Close all pool connections properly
5. MySQL server sees proper disconnects
6. Exit cleanly
```

---

## Conclusion

You now understand:

1. **Why mysql2 exists** (history, improvements over mysql)
2. **How it works internally** (wire protocol, binary vs text, connection lifecycle)
3. **Connection pooling** (why critical in Node.js vs PHP)
4. **Query execution** (execute vs query, parameterized queries, SQL injection prevention)
5. **Transactions** (ACID, isolation levels, error handling)
6. **Type safety** (TypeScript, runtime validation)
7. **PHP comparison** (MySQLi, PDO, Laravel differences)
8. **Production best practices** (startup, shutdown, error handling)

**When to use mysql2:**
- ✅ Learning SQL and database fundamentals
- ✅ Performance-critical queries (ORMs add overhead)
- ✅ Complex queries ORMs can't generate
- ✅ Legacy codebases

**When NOT to use mysql2:**
- ❌ Large applications with many tables (use ORM for productivity)
- ❌ When team has varying SQL skills (ORM provides consistency)
- ❌ When you need migrations, seeds, etc. (use ORM with tooling)

**Next steps:**
- Phase 088: Raw PostgreSQL (pg driver)
- Phase 089: Connection Pooling (deep dive)
- Phase 090-093: Sequelize ORM (Active Record pattern)
- Phase 095-095d: TypeORM (Data Mapper pattern)
- Phase 097-103: Prisma (Modern ORM, recommended)
