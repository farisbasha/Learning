# Phase 089: Connection Pooling — Deep Dive into Database Connection Management

## Overview

Connection pooling is one of the most critical concepts for building production-grade Node.js applications. It's the difference between an application that handles 10 requests per second and one that handles 10,000.

**This phase will teach you:**
- WHY connection pooling exists and what problem it solves
- HOW connection pools work internally
- The deep theory behind pool sizing
- Performance implications and trade-offs
- PHP vs Node.js connection handling (very different!)

---

## The Problem: Why Connection Pooling Exists

### What Happens When You Connect to a Database?

Every time you establish a new database connection, there's significant overhead:

**1. TCP Connection (Network Layer)**
```
Client                          Database Server
  |                                    |
  |-------- SYN packet --------------->|  (1st network round trip)
  |<------- SYN-ACK packet ------------|  (2nd network round trip)
  |-------- ACK packet --------------->|  (3rd network round trip)
  |                                    |
  ✓ TCP connection established
```

**Time cost**: 1-50ms depending on network latency
- Localhost: ~1ms
- Same datacenter: ~5ms
- Cross-region: 50-200ms

**2. Authentication Handshake**

Once TCP is established, the database must:
- Receive credentials (username/password)
- Look up user in system catalog
- Verify password (bcrypt/scrypt hashing)
- Check permissions and privileges
- Allocate memory for session state

**Time cost**: 10-100ms depending on database

**3. Session Initialization**

The database server allocates resources:
- Memory for query buffers
- Temporary table space
- Transaction state tracking
- Prepared statement cache
- Session-level settings (timezone, encoding, etc.)

**Memory cost**: 2-10 MB per connection

**4. Application-Level Setup**

Your application might also:
- Set character encoding
- Set timezone
- Initialize search paths (PostgreSQL)
- Run custom session setup queries

---

### The Cost in Numbers

Let's calculate the cost of NOT using connection pooling:

**Scenario**: E-commerce site with 100 requests/second

**Without connection pooling** (create new connection per request):
```
100 requests/sec × 50ms connection time = 5 seconds of connection overhead per second
```

This is IMPOSSIBLE. Your server would spend more time connecting than serving requests.

**With connection pooling** (reuse 20 existing connections):
```
Connection time: 50ms × 20 connections = 1 second (one-time cost at startup)
Per-request overhead: ~0ms (connection already exists)
```

**Result**:
- Without pooling: Application can't work
- With pooling: Application serves 100+ req/sec easily

---

## How PHP Handles This (The Problem Node.js Solves)

### PHP's Traditional Model (Apache + mod_php)

```
REQUEST 1                    REQUEST 2                    REQUEST 3
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Apache  │                │  Apache  │                │  Apache  │
│ Process  │                │ Process  │                │ Process  │
│    #1    │                │    #2    │                │    #3    │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ 1. New connection         │ 1. New connection         │ 1. New connection
     │ 2. Query                  │ 2. Query                  │ 2. Query
     │ 3. Close connection       │ 3. Close connection       │ 3. Close connection
     │                           │                           │
     ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        MySQL Database                       │
│  (receives 3 connections, processes 3 queries, closes all)  │
└─────────────────────────────────────────────────────────────┘
```

**Each PHP request:**
1. Starts a new process (or reuses from pool)
2. Opens a new database connection
3. Executes query
4. Closes connection
5. Process terminates or returns to pool

**Why this works for PHP:**
- Apache has a process pool (not connection pool)
- Each PHP process is independent
- Connection opening cost is amortized across the request

**Why this is SLOW:**
- Still pays connection overhead on every request
- Database has to accept/close many connections
- `max_connections` limit gets hit easily under load

### Laravel's Improvement: Persistent Connections

```php
// config/database.php
'mysql' => [
    'driver' => 'mysql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'persistent' => true,  // ← Persistent connection
],
```

**How Laravel persistent connections work:**

```
REQUEST 1 (Process #1)          REQUEST 2 (Process #1 reused)
┌──────────┐                    ┌──────────┐
│  Apache  │                    │  Apache  │
│ Process  │                    │ Process  │
│    #1    │                    │    #1    │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. Create DB connection       │ 1. Reuse existing connection
     │ 2. Query                      │ 2. Query
     │ 3. Keep connection open       │ 3. Keep connection open
     │                               │
     ▼                               ▼
┌─────────────────────────────────────┐
│          MySQL Database             │
│  (1 connection, 2 queries)          │
└─────────────────────────────────────┘
```

**Better, but still limited:**
- Ties connection to PHP process
- Can't share connections across processes
- Still need as many connections as PHP processes
- Connection count = Apache `MaxRequestWorkers` (often 150+)

---

### Node.js Connection Pooling (The Modern Approach)

```
REQUEST 1                REQUEST 2                REQUEST 3
┌────────┐              ┌────────┐              ┌────────┐
│  HTTP  │              │  HTTP  │              │  HTTP  │
│Request │              │Request │              │Request │
└───┬────┘              └───┬────┘              └───┬────┘
    │                       │                       │
    └───────────┬───────────┴───────────┬───────────┘
                │                       │
                │   All requests go     │
                │   to SINGLE process   │
                ▼                       ▼
        ┌───────────────────────────────────┐
        │        Node.js Process            │
        │                                   │
        │     ┌─────────────────────┐      │
        │     │   Connection Pool   │      │
        │     │                     │      │
        │     │  ┌────┐  ┌────┐    │      │
        │     │  │Conn│  │Conn│    │      │
        │     │  │ #1 │  │ #2 │    │      │
        │     │  └────┘  └────┘    │      │
        │     │                     │      │
        │     │  ┌────┐  ┌────┐    │      │
        │     │  │Conn│  │Conn│    │      │
        │     │  │ #3 │  │ #4 │    │      │
        │     │  └────┘  └────┘    │      │
        │     └─────────────────────┘      │
        └───────────────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────┐
        │    MySQL Database       │
        │  (4 connections total)  │
        └─────────────────────────┘
```

**Key insight**:
- ONE Node.js process handles ALL requests
- Requests SHARE a small pool of connections
- 100 concurrent requests might use only 10-20 connections
- Database only manages 10-20 connections instead of 150+

---

## Connection Pool Architecture: How It Works Internally

### The Pool Lifecycle

```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'myapp',
    connectionLimit: 10,  // Max 10 connections
    waitForConnections: true,
    queueLimit: 0
});
```

**What happens when you create a pool:**

```
┌────────────────────────────────────────────────────┐
│              Pool Created (empty)                   │
│                                                     │
│  Active Connections: []                            │
│  Idle Connections:   []                            │
│  Queue:              []                            │
│                                                     │
│  State: INITIALIZED                                │
└────────────────────────────────────────────────────┘
```

**Pool starts EMPTY** - no connections are created until first query!

This is called **lazy initialization**:
- Avoids startup cost
- Only creates connections when needed
- Better for serverless/ephemeral environments

---

### First Query: Connection Creation

```typescript
// First query ever
const [rows] = await pool.query('SELECT * FROM users LIMIT 10');
```

**What happens internally:**

```
Step 1: Check for idle connection
┌────────────────────────────────────┐
│ Pool: Any idle connections? NO     │
└────────────────────────────────────┘
               │
               ▼
Step 2: Check connection limit
┌────────────────────────────────────┐
│ Active: 0, Limit: 10               │
│ Can create new? YES                │
└────────────────────────────────────┘
               │
               ▼
Step 3: Create new connection
┌────────────────────────────────────┐
│ 1. Open TCP socket                 │
│ 2. MySQL handshake                 │
│ 3. Authenticate                    │
│ 4. Initialize session              │
│ 5. Mark as ACTIVE                  │
└────────────────────────────────────┘
               │
               ▼
Step 4: Execute query
┌────────────────────────────────────┐
│ conn.query('SELECT * FROM users')  │
└────────────────────────────────────┘
               │
               ▼
Step 5: Return connection to pool
┌────────────────────────────────────┐
│ Move connection from ACTIVE to IDLE│
│ Active: []                         │
│ Idle:   [Conn#1]                   │
└────────────────────────────────────┘
```

**Duration**: ~50ms (includes connection creation)

---

### Second Query: Connection Reuse

```typescript
// Second query (milliseconds later)
const [rows] = await pool.query('SELECT * FROM posts LIMIT 10');
```

**What happens internally:**

```
Step 1: Check for idle connection
┌────────────────────────────────────┐
│ Idle: [Conn#1]                     │
│ Found idle connection! ✓           │
└────────────────────────────────────┘
               │
               ▼
Step 2: Move to active
┌────────────────────────────────────┐
│ Active: [Conn#1]                   │
│ Idle:   []                         │
└────────────────────────────────────┘
               │
               ▼
Step 3: Execute query (IMMEDIATELY)
┌────────────────────────────────────┐
│ Conn#1.query('SELECT * FROM posts')│
│ No connection overhead! ✓          │
└────────────────────────────────────┘
               │
               ▼
Step 4: Return to idle
┌────────────────────────────────────┐
│ Active: []                         │
│ Idle:   [Conn#1]                   │
└────────────────────────────────────┘
```

**Duration**: ~5ms (NO connection creation overhead!)

**Performance gain**: 10x faster than first query

---

### Concurrent Queries: Pool Expansion

```typescript
// 5 queries arrive at the exact same time
const promises = [
    pool.query('SELECT * FROM users'),
    pool.query('SELECT * FROM posts'),
    pool.query('SELECT * FROM comments'),
    pool.query('SELECT * FROM categories'),
    pool.query('SELECT * FROM tags')
];

await Promise.all(promises);
```

**What happens internally:**

```
Initial State:
┌────────────────────────────────────┐
│ Active: []                         │
│ Idle:   [Conn#1]                   │
│ Queue:  []                         │
└────────────────────────────────────┘

Query 1 arrives:
┌────────────────────────────────────┐
│ Active: [Conn#1]  ← Uses existing  │
│ Idle:   []                         │
└────────────────────────────────────┘

Query 2 arrives (0.1ms later):
┌────────────────────────────────────┐
│ Active: [Conn#1, Conn#2 (creating)]│
│ Idle:   []                         │
│ Note: Creating new connection      │
└────────────────────────────────────┘

Query 3, 4, 5 arrive (almost same time):
┌────────────────────────────────────┐
│ Active: [Conn#1, Conn#2, Conn#3,   │
│          Conn#4, Conn#5]           │
│ Idle:   []                         │
│ Total:  5/10 connections           │
└────────────────────────────────────┘

All queries complete:
┌────────────────────────────────────┐
│ Active: []                         │
│ Idle:   [Conn#1, Conn#2, Conn#3,   │
│          Conn#4, Conn#5]           │
│ Note: 5 connections ready for reuse│
└────────────────────────────────────┘
```

**Key insight**: Pool grows to meet demand, up to `connectionLimit`

---

### Pool Saturation: What Happens When Pool is Full?

```typescript
// 15 queries arrive, but pool max = 10
const promises = Array.from({ length: 15 }, (_, i) =>
    pool.query(`SELECT * FROM users WHERE id = ${i}`)
);

await Promise.all(promises);
```

**What happens:**

```
Queries 1-10:
┌────────────────────────────────────┐
│ Active: [Conn#1...Conn#10] (FULL)  │
│ Idle:   []                         │
│ Queue:  []                         │
└────────────────────────────────────┘

Queries 11-15 arrive:
┌────────────────────────────────────┐
│ Active: [Conn#1...Conn#10] (FULL)  │
│ Idle:   []                         │
│ Queue:  [Query#11, Query#12,       │
│          Query#13, Query#14,       │
│          Query#15]                 │
│                                    │
│ ⏳ Waiting for available connection│
└────────────────────────────────────┘

Connection #1 finishes:
┌────────────────────────────────────┐
│ Conn#1 → Query#11 (dequeued)       │
│ Active: [Conn#1...Conn#10]         │
│ Queue:  [Query#12, Query#13,       │
│          Query#14, Query#15]       │
└────────────────────────────────────┘

Eventually all complete:
┌────────────────────────────────────┐
│ Active: []                         │
│ Idle:   [Conn#1...Conn#10]         │
│ Queue:  []                         │
└────────────────────────────────────┘
```

**This is GOOD behavior:**
- Queries wait instead of creating more connections
- Protects database from overload
- FIFO queue ensures fairness

**Alternative (BAD)**: No limit → 1000 connections → database crashes

---

## Configuration Deep Dive

### MySQL (`mysql2`) Pool Configuration

```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({
    // Connection settings
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'myapp',

    // ========================================
    // POOL CONFIGURATION (most important)
    // ========================================

    connectionLimit: 10,
    // Maximum number of connections to create
    // Default: 10
    // Production: 20-50 (depends on server specs)
    // Rule: (available RAM - app memory) / (memory per connection)
    //       Example: (16GB - 2GB) / 10MB = 1400 max theoretical
    //                But realistically: 20-100

    waitForConnections: true,
    // If pool is full, should queries wait?
    // true  = Queue queries (RECOMMENDED)
    // false = Reject immediately with error
    // Default: true

    queueLimit: 0,
    // Max queries to queue when pool is full
    // 0 = unlimited queue (RECOMMENDED for most apps)
    // N = reject after N queries in queue
    // Use case for limiting: Prevent memory issues if database is down

    // ========================================
    // TIMEOUT CONFIGURATION
    // ========================================

    acquireTimeout: 10000,
    // Max time to wait for connection (ms)
    // If pool is full and query waits > 10s, throw error
    // Default: 10000 (10s)
    // Protects against hung queries

    timeout: 60000,
    // Socket timeout (connection idle time)
    // Close connection if inactive for 60s
    // Default: 0 (no timeout)

    // ========================================
    // CONNECTION BEHAVIOR
    // ========================================

    enableKeepAlive: true,
    // Send TCP keepalive packets
    // Prevents firewalls from closing idle connections
    // Default: false
    // RECOMMENDED: true for production

    keepAliveInitialDelay: 10000,
    // Wait 10s before first keepalive packet
    // Default: 0

    // ========================================
    // CHARSET & TIMEZONE
    // ========================================

    charset: 'utf8mb4',
    // Use utf8mb4 for full Unicode support (emojis!)
    // utf8 in MySQL is NOT full UTF-8 (3 bytes max)
    // utf8mb4 is TRUE UTF-8 (4 bytes, supports emojis)

    timezone: '+00:00',
    // Store all dates in UTC
    // '+00:00' or 'Z' for UTC
    // Alternative: 'local' (NOT RECOMMENDED)

    // ========================================
    // DEBUGGING
    // ========================================

    debug: false,
    // Log all queries (verbose!)
    // true = log everything
    // ['ComQueryPacket'] = log only queries
    // Default: false
});
```

---

### PostgreSQL (`pg`) Pool Configuration

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    // Connection settings
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'myapp',

    // ========================================
    // POOL SIZE
    // ========================================

    max: 20,
    // Maximum connections in pool
    // Default: 10
    // Production: 20-50

    min: 2,
    // Minimum idle connections to keep open
    // Added in pg 8.0
    // Default: 0 (no minimum)
    // RECOMMENDED: 2-5 for faster startup
    // Ensures some connections are always ready

    // ========================================
    // TIMEOUTS
    // ========================================

    idleTimeoutMillis: 30000,
    // Close idle connections after 30s
    // Default: 10000 (10s)
    // RECOMMENDED: 30000-60000 (30-60s)
    // Too low: Connection churn (expensive)
    // Too high: Waste database resources

    connectionTimeoutMillis: 2000,
    // Max time to wait for connection
    // Default: 0 (no timeout - waits forever!)
    // RECOMMENDED: 2000-5000 (2-5s)
    // Protects against hung database

    statement_timeout: 30000,
    // Max time for query execution (PostgreSQL setting)
    // Kills long-running queries
    // Default: 0 (no limit)
    // RECOMMENDED: 30000-60000 (30-60s)

    query_timeout: 30000,
    // Client-side query timeout
    // Similar to statement_timeout but enforced by pg driver
    // Default: 0

    // ========================================
    // CONNECTION BEHAVIOR
    // ========================================

    allowExitOnIdle: true,
    // Allow Node.js to exit if pool is idle
    // true = Don't keep process alive if pool is idle
    // false = Keep process alive
    // Default: false
    // RECOMMENDED: true for Lambda/serverless

    // ========================================
    // SSL
    // ========================================

    ssl: process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: true,
            ca: fs.readFileSync('/path/to/ca-cert.crt').toString(),
        }
        : false,
    // Production: ALWAYS use SSL
    // Development: Can disable for localhost

    // ========================================
    // APPLICATION IDENTIFICATION
    // ========================================

    application_name: 'myapp-api',
    // Shows in PostgreSQL's pg_stat_activity view
    // Helpful for debugging:
    // SELECT * FROM pg_stat_activity WHERE application_name = 'myapp-api';
});
```

---

## Pool Sizing Theory: How Many Connections?

This is THE most important decision. Too few = slow. Too many = database crash.

### The Math Behind Pool Sizing

**Formula 1: Connection Count = (Core Count × 2) + Effective Spindle Count**

This is from PostgreSQL's official documentation.

**Example calculation for typical web server:**
```
Server specs:
- 4 CPU cores
- SSD storage (not spinning disks)

Optimal pool size:
= (4 cores × 2) + 1 (SSD has no spindles, so ~1)
= 9 connections

Round up: 10-12 connections per pool
```

**Why this works:**
- Each core can handle ~2 concurrent I/O operations
- Database is I/O bound (waiting on disk)
- More connections than this = context switching overhead

---

### The REAL Formula: It Depends

The formula above is a starting point. Actual optimal size depends on:

**1. Query Duration**

```
Fast queries (1-10ms):
┌────────┐┌────────┐┌────────┐
│ Query  ││ Query  ││ Query  │
│ 5ms    ││ 5ms    ││ 5ms    │
└────────┘└────────┘└────────┘
 Conn#1    Conn#1    Conn#1    ← Same connection handles 3 queries in 15ms

200 queries/sec → Need ~1 connection!

Slow queries (100-500ms):
┌────────────────────────────────────┐
│          Query 500ms               │
└────────────────────────────────────┘
              Conn#1

200 queries/sec → Need ~100 connections! (200 × 0.5s = 100)
```

**Formula**: Connections needed = (Queries per second × Average query time)

**Example**:
- 100 req/sec
- Average query time: 50ms (0.05s)
- Connections needed = 100 × 0.05 = 5 connections

**Rule**: Optimize queries FIRST, then add connections

---

**2. Application Architecture**

```
SINGLE DATABASE:
┌──────────────────┐
│   Node.js App    │
│   Pool: max=20   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  MySQL Database  │
│  Max: 151        │
└──────────────────┘

Total connections: 20
Simple to reason about.


MULTIPLE APP INSTANCES:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   App Instance   │  │   App Instance   │  │   App Instance   │
│   #1             │  │   #2             │  │   #3             │
│   Pool: max=20   │  │   Pool: max=20   │  │   Pool: max=20   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────────┬──────┴──────────────┬──────┘
                        ▼                     ▼
                ┌──────────────────────────────────┐
                │       MySQL Database             │
                │       Max: 151                   │
                │       Used: 60 (20×3 instances)  │
                └──────────────────────────────────┘

Total connections: 60
Need to plan for scaling!
```

**Calculation for multi-instance**:
```
Database max_connections: 150 (MySQL default)
Reserve for admin/monitoring: 10
Available for apps: 140

Expected app instances: 10
Per-instance pool size: 140 / 10 = 14 connections

RECOMMENDED: Set max = 10-12 per instance (leave buffer)
```

---

**3. Database Server Specs**

**Memory constraint**:
```
Database server RAM: 16GB
OS overhead: 2GB
MySQL base memory: 2GB
Available for connections: 12GB

Memory per connection: ~10MB (typical)
Max theoretical connections: 12000MB / 10MB = 1200

Practical limit (50% safety): 600 connections
```

**CPU constraint**:
```
Database server CPUs: 8 cores

Optimal connections (PostgreSQL formula):
= (8 × 2) + 1
= 17 connections per application

With 10 app instances:
Total optimal: 170 connections
```

**Rule**: Lower of memory limit and CPU optimal

---

### Production Pool Sizing Recommendations

| Scenario | Pool Size | Reasoning |
|----------|-----------|-----------|
| **Development (localhost)** | 5-10 | Small, simple queries |
| **Small app (1 instance)** | 10-20 | Standard web app |
| **Medium app (3-5 instances)** | 10-15 per instance | 30-75 total to database |
| **Large app (10+ instances)** | 5-10 per instance | Prevents database overload |
| **Serverless (Lambda)** | 1-2 | Each function instance gets own pool |
| **Background jobs** | 2-5 | Long-running, low concurrency |
| **Analytics queries** | 1-3 | Very long queries, low concurrency |

---

## Pool Monitoring and Events

### MySQL Pool Monitoring

```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// ========================================
// MONITORING POOL STATE
// ========================================

function logPoolStatus() {
    const poolInfo = {
        // Total connections (active + idle)
        totalConnections: pool.pool._allConnections.length,

        // Idle connections (available)
        idleConnections: pool.pool._freeConnections.length,

        // Active connections (in use)
        activeConnections: pool.pool._allConnections.length - pool.pool._freeConnections.length,

        // Queued queries (waiting for connection)
        queuedQueries: pool.pool._connectionQueue.length,

        // Configuration
        limit: pool.pool.config.connectionLimit,
    };

    console.log('Pool Status:', poolInfo);

    // Alert if pool is saturated
    if (poolInfo.activeConnections >= poolInfo.limit * 0.8) {
        console.warn('⚠️ Pool is 80% saturated!');
    }

    if (poolInfo.queuedQueries > 0) {
        console.warn(`⚠️ ${poolInfo.queuedQueries} queries waiting!`);
    }

    return poolInfo;
}

// Log pool status every 10 seconds
setInterval(logPoolStatus, 10000);

// ========================================
// POOL EVENTS (mysql2)
// ========================================

// Connection acquired from pool
pool.pool.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId);
});

// Connection released back to pool
pool.pool.on('release', (connection) => {
    console.log('Connection %d released', connection.threadId);
});

// New connection created
pool.pool.on('connection', (connection) => {
    console.log('New connection created: %d', connection.threadId);

    // Set session-level settings
    connection.query('SET SESSION sql_mode = "TRADITIONAL"');
    connection.query('SET SESSION time_zone = "+00:00"');
});

// Query enqueued (pool is full)
pool.pool.on('enqueue', () => {
    console.log('⏳ Query enqueued - pool is full');
});
```

---

### PostgreSQL Pool Monitoring

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// ========================================
// MONITORING POOL STATE
// ========================================

function logPoolStatus() {
    const poolInfo = {
        // Total connections in pool
        totalCount: pool.totalCount,

        // Idle connections (available)
        idleCount: pool.idleCount,

        // Queries waiting for connection
        waitingCount: pool.waitingCount,

        // Configuration
        maxConnections: pool.options.max,
    };

    console.log('Pool Status:', poolInfo);

    // Calculate active connections
    const activeCount = poolInfo.totalCount - poolInfo.idleCount;

    // Alerts
    if (activeCount >= poolInfo.maxConnections * 0.8) {
        console.warn('⚠️ Pool 80% utilized!');
    }

    if (poolInfo.waitingCount > 0) {
        console.warn(`⚠️ ${poolInfo.waitingCount} queries waiting!`);
    }

    return poolInfo;
}

setInterval(logPoolStatus, 10000);

// ========================================
// POOL EVENTS (pg)
// ========================================

// Connection acquired
pool.on('acquire', (client) => {
    console.log('Connection acquired from pool');
});

// Connection returned to pool
pool.on('release', (client) => {
    console.log('Connection released to pool');
});

// New connection created
pool.on('connect', (client) => {
    console.log('New connection created');

    // Set session defaults
    client.query('SET timezone = "UTC"');
    client.query('SET statement_timeout = 30000');
});

// Connection removed from pool
pool.on('remove', (client) => {
    console.log('Connection removed from pool');
});

// Error on idle client (IMPORTANT)
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client:', err);
    // Don't crash the app - pool handles reconnection
    // But you should log this to monitoring
});
```

---

## Advanced Patterns

### Pattern 1: Express Middleware for Pool Monitoring

```typescript
import express from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({ max: 20 });

// Middleware to log pool status on each request
app.use((req, res, next) => {
    const { totalCount, idleCount, waitingCount } = pool;

    console.log(`[${req.method} ${req.path}] Pool: ${idleCount}/${totalCount} idle, ${waitingCount} waiting`);

    // Add to response headers (helpful for debugging)
    res.set('X-DB-Pool-Total', totalCount.toString());
    res.set('X-DB-Pool-Idle', idleCount.toString());
    res.set('X-DB-Pool-Waiting', waitingCount.toString());

    next();
});

app.get('/api/users', async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    res.json(users.rows);
});

app.listen(3000);
```

---

### Pattern 2: Health Check Endpoint

```typescript
app.get('/health/database', async (req, res) => {
    try {
        // Check if database is reachable
        const start = Date.now();
        await pool.query('SELECT 1');
        const duration = Date.now() - start;

        // Get pool status
        const { totalCount, idleCount, waitingCount } = pool;

        // Determine health
        const isHealthy =
            duration < 100 &&           // Query fast
            waitingCount === 0 &&       // No queue
            totalCount > 0;             // Has connections

        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'degraded',
            database: {
                responseTime: `${duration}ms`,
                pool: {
                    total: totalCount,
                    idle: idleCount,
                    active: totalCount - idleCount,
                    waiting: waitingCount,
                    utilization: `${Math.round(((totalCount - idleCount) / pool.options.max) * 100)}%`
                }
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});
```

**Example response**:
```json
{
  "status": "healthy",
  "database": {
    "responseTime": "12ms",
    "pool": {
      "total": 8,
      "idle": 5,
      "active": 3,
      "waiting": 0,
      "utilization": "15%"
    }
  }
}
```

---

### Pattern 3: Graceful Shutdown

```typescript
const pool = new Pool({ max: 20 });

// Handle shutdown signals
async function gracefulShutdown(signal: string) {
    console.log(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new requests
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Close database pool
    try {
        await pool.end();
        console.log('Database pool closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing pool:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

**What this does:**
1. Receives shutdown signal (Ctrl+C, Docker stop, etc.)
2. Stops accepting NEW HTTP requests
3. Waits for in-flight requests to complete
4. Closes all pool connections gracefully
5. Exits process

**Why it matters:**
- Prevents "connection lost" errors
- Gives database time to finish transactions
- Kubernetes/Docker best practice

---

## PHP/Laravel vs Node.js Connection Pooling

### Laravel Database Connections

```php
// config/database.php
'mysql' => [
    'driver' => 'mysql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    'strict' => true,
    'engine' => null,

    // NO CONNECTION POOLING CONFIG!
    // Each request gets its own connection
],
```

**How Laravel handles connections**:
```php
// Request 1
Route::get('/users', function () {
    $users = DB::table('users')->get(); // Opens connection
    return $users;                      // Closes connection after request
});

// Request 2 (separate PHP process)
Route::get('/posts', function () {
    $posts = DB::table('posts')->get(); // Opens NEW connection
    return $posts;                      // Closes connection after request
});
```

**Connection lifetime**:
- Opens at first query
- Closes when request ends
- Each PHP-FPM worker has its own connection
- 50 PHP-FPM workers = 50 database connections

---

### Laravel Octane (Modern Approach)

Laravel Octane uses Swoole/RoadRunner to keep PHP in memory:

```php
// config/octane.php
'swoole' => [
    'options' => [
        'max_requests' => 500,
        'task_workers' => 20,
        'worker_num' => 4,  // 4 workers = 4 persistent connections
    ],
],
```

**How Octane works**:
```
Traditional Laravel:          Laravel Octane:
┌─────────────┐              ┌─────────────────────┐
│   Request   │              │    Swoole Worker    │
│      │      │              │    (persistent)     │
│      ▼      │              │                     │
│  New PHP    │              │  Handles 500 req    │
│  Process    │              │  Keeps DB conn      │
│      │      │              │  alive              │
│   New DB    │              │                     │
│   Connection│              │  1 connection/worker│
│      │      │              └─────────────────────┘
│   Close DB  │
│      │      │              4 workers = 4 DB connections
│   Terminate │              (vs 50+ in traditional)
└─────────────┘
```

**This is closer to Node.js model!**

---

### Comparison Table

| Feature | PHP (traditional) | Laravel Octane | Node.js |
|---------|------------------|----------------|---------|
| Process model | New per request | Persistent workers | Single process |
| Connection reuse | No (unless persistent) | Yes (per worker) | Yes (shared pool) |
| Connections needed | = PHP-FPM workers | = Octane workers | = Pool size |
| Typical connection count | 50-150 | 4-20 | 10-50 |
| Memory efficiency | Low | Medium | High |
| Connection sharing | No | Within worker only | Across all requests |
| Scaling | Vertical (more workers) | Vertical (more workers) | Horizontal (more instances) |

**Key insight**: Node.js needs FAR fewer database connections than PHP for the same traffic!

---

## Common Mistakes and Pitfalls

### Mistake 1: Creating Pool Per Request

```typescript
// ❌ WRONG - Creates new pool on every request
app.get('/users', async (req, res) => {
    const pool = new Pool({ max: 10 });  // DON'T DO THIS!
    const result = await pool.query('SELECT * FROM users');
    await pool.end();
    res.json(result.rows);
});
```

**Why this is terrible:**
- Creates 10 connections per request
- No connection reuse
- High memory usage
- Slower than not using pool at all!

```typescript
// ✅ CORRECT - Create pool once, reuse forever
const pool = new Pool({ max: 10 });  // Global, outside route handlers

app.get('/users', async (req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});
```

---

### Mistake 2: Not Releasing Connections in Transactions

```typescript
// ❌ WRONG - Connection never released!
app.post('/transfer', async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
    await client.query('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
    await client.query('COMMIT');
    // BUG: client.release() missing!
    res.json({ success: true });
});
```

**What happens:**
- After 10 requests, pool is exhausted
- All subsequent requests hang forever
- Application appears frozen

```typescript
// ✅ CORRECT - Always release in finally block
app.post('/transfer', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
        await client.query('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();  // ✅ ALWAYS runs
    }
});
```

---

### Mistake 3: Pool Size = Database Max Connections

```typescript
// ❌ WRONG - Each instance uses ALL available connections
const pool = new Pool({
    max: 150  // MySQL max_connections default
});
```

**Scenario**: Deploy 10 app instances
```
10 instances × 150 connections = 1500 connections needed
MySQL max_connections = 151

Result: Application cannot start!
```

**Rule**: Pool size × Instances < Database max_connections × 0.8

```typescript
// ✅ CORRECT - Leave headroom for multiple instances
const pool = new Pool({
    max: 10  // 10 instances × 10 connections = 100 (well under 151)
});
```

---

### Mistake 4: No Connection Timeout

```typescript
// ❌ WRONG - Waits forever if database is down
const pool = new Pool({
    max: 20
    // No connectionTimeoutMillis!
});
```

**What happens if database is down:**
```
Request arrives → Pool tries to connect → Waits forever → Request times out after 30s
Next request → Same thing → Another 30s wait
Result: All requests hang, application appears frozen
```

```typescript
// ✅ CORRECT - Fail fast if database is unreachable
const pool = new Pool({
    max: 20,
    connectionTimeoutMillis: 2000  // Fail after 2s
});
```

---

## Key Takeaways

1. **Connection pooling is CRITICAL** - It's the difference between 10 req/sec and 10,000 req/sec

2. **Node.js needs fewer connections than PHP** - Thanks to single-process model and async I/O

3. **Create pool ONCE** - Global singleton, never per-request

4. **Always release connections** - Especially in transactions (use `finally` block)

5. **Pool size formula** - Start with `(cores × 2) + 1`, adjust based on query duration

6. **Monitor pool saturation** - Log idle/active/waiting counts

7. **Set timeouts** - `connectionTimeoutMillis`, `idleTimeoutMillis`, `statement_timeout`

8. **Plan for multiple instances** - Pool size × instances < database max × 0.8

9. **Use health checks** - Monitor pool status in production

10. **Graceful shutdown** - Close pool on SIGTERM/SIGINT

---

## What's Next?

In the next phases, you'll learn:
- **Phase 090**: Sequelize ORM (legacy but still widely used)
- **Phase 095**: TypeORM (modern TypeScript ORM)
- **Phase 097**: Prisma (newest, most modern ORM)

Understanding connection pooling will help you configure ORMs correctly, as they all use connection pools internally!
