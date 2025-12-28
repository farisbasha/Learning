# Phase 086: Database Concepts — Quick Reference

## Database Types Comparison

| Feature | SQL (MySQL/PostgreSQL) | Document (MongoDB) | Key-Value (Redis) | Graph (Neo4j) |
|---------|------------------------|-------------------|-------------------|---------------|
| **Schema** | Fixed, enforced | Flexible/optional | No schema | Flexible nodes |
| **Data Model** | Tables with rows | JSON-like documents | Key-value pairs | Nodes + edges |
| **ACID** | Full ACID | Eventual consistency | Limited | ACID |
| **Relationships** | JOINs (efficient) | Embedded or references | None | Native (efficient) |
| **Scalability** | Vertical (scale up) | Horizontal (scale out) | Horizontal | Horizontal |
| **Best For** | Structured data, transactions | Rapid development, flexible data | Caching, sessions | Social networks, recommendations |

## SQL Databases Comparison

| Feature | MySQL | PostgreSQL | SQLite |
|---------|-------|------------|--------|
| **Type** | Server | Server | Embedded (file) |
| **Strengths** | Fast reads, huge community | Advanced features, SQL standards | Zero config, portable |
| **Weaknesses** | Fewer features | Steeper learning curve | Single writer, no replication |
| **JSON Support** | Basic JSON | JSONB (indexable) | JSON functions |
| **When to Use** | Read-heavy apps, existing infra | Complex queries, data integrity critical | Dev/test, embedded systems |

---

## Abstraction Levels

```
Raw Driver → Query Builder → ORM → Active Record
(mysql2)     (Knex)         (TypeORM) (Sequelize)
Low ←─────────────────────────────────────→ High
```

### Raw Driver (mysql2, pg)
```typescript
const [users] = await connection.execute(
  'SELECT * FROM users WHERE age > ?',
  [25]
);
```
- **Pros**: Full control, no overhead, learn SQL properly
- **Cons**: SQL injection risk, database-specific, verbose
- **Use**: Learning, performance-critical, complex queries

### Query Builder (Knex, Kysely)
```typescript
const users = await knex('users')
  .where('age', '>', 25)
  .select('*');
```
- **Pros**: Database-agnostic, type-safe, SQL injection safe, migrations
- **Cons**: Learning curve, some overhead
- **Use**: Database portability, TypeScript projects, medium complexity

### ORM (TypeORM, Prisma, Sequelize)
```typescript
const users = await userRepository.find({
  where: { age: MoreThan(25) },
  relations: ['posts']
});
```
- **Pros**: Productivity, type safety, automatic JOINs, migrations
- **Cons**: Performance overhead, N+1 problem, debugging harder
- **Use**: Large apps, rapid development, TypeScript projects

---

## SQL vs NoSQL: Core Differences

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| **Schema** | Fixed (defined upfront) | Flexible (schema-less or optional) |
| **Data Integrity** | Enforced (types, constraints) | Application-level (not enforced) |
| **Relationships** | Foreign keys + JOINs | Embedded documents or references |
| **Normalization** | Normalized (no redundancy) | Denormalized (embed data) |
| **Transactions** | ACID (strong consistency) | Eventual consistency (weaker) |
| **Scaling** | Vertical (bigger server) | Horizontal (more servers) |
| **Query Language** | SQL (standardized) | Database-specific APIs |
| **Use Case** | Structured data, complex queries | Flexible data, high scalability |

---

## ACID Explained

```
Atomicity: All-or-nothing (no partial updates)
Consistency: Data always valid (constraints enforced)
Isolation: Transactions don't interfere
Durability: Committed data survives crashes
```

**Example (Bank Transfer):**
```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```
- If crash before COMMIT: Both updates rolled back (no money lost)
- After COMMIT: Both updates permanent (survives crash)

---

## Connection Strings

```
protocol://username:password@host:port/database?options
```

**Examples:**
```bash
# MySQL
mysql://root:password@localhost:3306/myapp

# PostgreSQL
postgresql://postgres:password@localhost:5432/myapp?sslmode=require

# MongoDB
mongodb://user:pass@localhost:27017/myapp?authSource=admin

# Redis
redis://localhost:6379/0
```

---

## Node.js vs PHP/Laravel

| Feature | Laravel | Node.js |
|---------|---------|---------|
| **Philosophy** | Convention over configuration | Flexibility, choose tools |
| **Database Config** | Built-in (config/database.php) | DIY or library (dotenv) |
| **ORM** | Eloquent (built-in) | Choose: TypeORM, Prisma, Sequelize |
| **Query Builder** | DB facade (built-in) | Choose: Knex, Kysely |
| **Migrations** | php artisan migrate | Library-specific (Knex, Prisma, TypeORM) |
| **Async** | Synchronous (blocks) | Asynchronous (non-blocking) |
| **Connection Pooling** | Less critical (per-request process) | CRITICAL (long-running process) |

---

## Connection Pooling (Critical in Node.js)

**Why critical?**
- PHP: New process per request → new connection (acceptable)
- Node.js: Long-running process → reuse connections (required)

```typescript
// ❌ BAD: New connection per request
app.get('/users', async (req, res) => {
  const conn = await mysql.createConnection({...});  // 5-10ms overhead!
});

// ✅ GOOD: Connection pool
const pool = mysql.createPool({
  connectionLimit: 10  // Reuse 10 connections
});

app.get('/users', async (req, res) => {
  const conn = await pool.getConnection();  // <1ms (reuse)
});
```

---

## Embed vs Reference (MongoDB)

### Embed When:
- Data read together (1-to-few)
- Child data small (<1KB per item)
- Child data doesn't change often
- Total size <1MB

```javascript
{
  order_number: "ORD-123",
  items: [  // Embed (always read with order)
    { product: "Laptop", price: 1200 }
  ]
}
```

### Reference When:
- Data read separately (1-to-many, many-to-many)
- Child data large or unbounded
- Data changes frequently
- Data shared across documents

```javascript
// User document
{ user_id: 1, username: "john" }

// Posts collection (separate)
{ post_id: 1, user_id: 1, title: "..." }
```

---

## Normal Forms (Quick Reference)

**1NF (First Normal Form):**
- Atomic values (no arrays in column)
- Each row unique (primary key)

**2NF (Second Normal Form):**
- In 1NF + no partial dependencies
- Non-key columns depend on ENTIRE key

**3NF (Third Normal Form):**
- In 2NF + no transitive dependencies
- Non-key columns depend ONLY on primary key

---

## Performance Tips

1. **Use indexes** (B-tree for lookups: O(log n) vs O(n))
2. **Avoid N+1 queries** (use JOINs or eager loading)
3. **Use connection pooling** (Node.js: REQUIRED)
4. **Cache hot data** (Redis for frequently accessed data)
5. **Denormalize for read-heavy** (data warehouses, analytics)
6. **Normalize for write-heavy** (transactional apps)

---

## Evolution Timeline

```
1970s: Relational databases (SQL)
1990s: Raw SQL queries
2000s: Query builders (database-agnostic)
2000s: NoSQL databases (MongoDB, Redis)
2010s: Traditional ORMs (TypeORM, Sequelize)
2020s: Modern ORMs (Prisma, Drizzle)
```

---

## Environment Variables

```bash
# .env (NOT committed to Git)
DATABASE_URL=mysql://user:pass@localhost:3306/myapp

# .gitignore
.env
.env.local
```

```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Use in connection
const pool = mysql.createPool(process.env.DATABASE_URL);
```

---

## Quick Decision Guide

**Choose SQL when:**
- Data is structured and relational
- Need strong consistency (ACID)
- Complex queries (JOINs, aggregations)
- Data integrity critical

**Choose NoSQL when:**
- Schema changes frequently
- Need horizontal scaling
- Unstructured data (JSON, logs)
- Read/write heavy (millions of ops/sec)

**Choose Redis when:**
- Need <1ms latency
- Caching layer
- Session storage
- Real-time counters/analytics

---

## Key Takeaways

1. **Understand trade-offs**: No "best" database (depends on use case)
2. **Start simple**: Raw SQL or query builder → add ORM when needed
3. **Connection pooling**: CRITICAL in Node.js (not PHP)
4. **Type safety**: Use TypeScript + modern ORM (Prisma) or query builder (Kysely)
5. **Migrations**: Use library (Knex, Prisma, TypeORM) - no standard in Node.js
6. **Laravel vs Node.js**: Convention vs flexibility (both valid approaches)

---

## Next Steps

- **Phase 087**: Raw MySQL (mysql2 driver hands-on)
- **Phase 088**: Raw PostgreSQL (pg driver)
- **Phase 089**: Connection Pooling (deep dive)
- **Phase 090-093**: Sequelize ORM (legacy Active Record)
- **Phase 095-095d**: TypeORM (modern Data Mapper)
- **Phase 096**: Knex (query builder)
- **Phase 096-096d**: Mongoose (MongoDB ORM)
- **Phase 097-103**: Prisma (modern ORM, recommended)
- **Phase 104**: Drizzle (newest, TypeScript-first)
