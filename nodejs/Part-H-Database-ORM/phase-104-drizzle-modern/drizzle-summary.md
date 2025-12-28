# Phase 104: Drizzle ORM - Quick Reference Summary

## Drizzle vs Prisma Feature Comparison

| Feature | Drizzle | Prisma |
|---------|---------|--------|
| **Bundle Size** | ~50 KB | ~2-3 MB (with engine) |
| **Cold Start** | 50-100ms | 300-800ms |
| **Edge Runtime** | Native support | Requires Prisma Accelerate |
| **Schema Language** | TypeScript | Prisma DSL (.prisma) |
| **Query Syntax** | SQL-like chaining | Object-based API |
| **Type Safety** | Full inference | Full (after generate) |
| **Code Generation** | Not required | Required (prisma generate) |
| **GUI Tool** | Drizzle Studio | Prisma Studio |
| **Relations API** | Manual + Relational Query | Automatic include/select |
| **Raw SQL** | First-class `sql` tag | `$queryRaw` / `$executeRaw` |
| **Transactions** | `db.transaction()` | `prisma.$transaction()` |
| **Migrations** | SQL files | Prisma Migrate |
| **Database Support** | PostgreSQL, MySQL, SQLite | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server |
| **Serverless** | Excellent | Good (with Accelerate) |
| **Learning Curve** | Low (if SQL-proficient) | Low (abstracted) |
| **Maturity** | 2023+ (newer) | 2019+ (established) |

---

## Quick Installation

```bash
# Core packages
npm install drizzle-orm
npm install -D drizzle-kit

# PostgreSQL
npm install pg && npm install -D @types/pg

# MySQL
npm install mysql2

# SQLite
npm install better-sqlite3 && npm install -D @types/better-sqlite3
```

---

## Schema Definition Quick Reference

### PostgreSQL Column Types

```typescript
import {
  pgTable, pgEnum,
  serial, bigserial,           // Auto-increment
  integer, bigint, smallint,   // Integers
  real, doublePrecision,       // Floats
  numeric,                     // Decimal
  text, varchar, char,         // Strings
  boolean,                     // Boolean
  timestamp, timestamptz,      // Timestamps
  date, time,                  // Date/Time
  uuid,                        // UUID
  json, jsonb                  // JSON
} from 'drizzle-orm/pg-core';
```

### MySQL Column Types

```typescript
import {
  mysqlTable, mysqlEnum,
  serial, int, bigint, tinyint, smallint, mediumint,
  float, double, decimal,
  varchar, char, text,
  boolean,
  datetime, timestamp, date, time, year,
  json
} from 'drizzle-orm/mysql-core';
```

### SQLite Column Types

```typescript
import {
  sqliteTable,
  integer,    // Also for boolean, date (as unix timestamp)
  real,       // Floating point
  text,       // Text and JSON (as string)
  blob        // Binary data
} from 'drizzle-orm/sqlite-core';
```

### Column Modifiers

```typescript
// Constraints
.primaryKey()           // PRIMARY KEY
.notNull()             // NOT NULL
.unique()              // UNIQUE
.default(value)        // DEFAULT value
.defaultNow()          // DEFAULT NOW()
.references(() => table.column)  // FOREIGN KEY

// Foreign Key Options
.references(() => users.id, {
  onDelete: 'cascade',    // 'cascade' | 'set null' | 'restrict' | 'no action'
  onUpdate: 'cascade'
})
```

---

## Database Connection Quick Reference

```typescript
// PostgreSQL (node-postgres)
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// MySQL (mysql2)
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(pool, { schema, mode: 'default' });

// SQLite (better-sqlite3)
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });
```

---

## CRUD Operations Quick Reference

### SELECT

```typescript
// All rows
await db.select().from(users);

// Specific columns
await db.select({ id: users.id, name: users.name }).from(users);

// With WHERE
await db.select().from(users).where(eq(users.id, 1));

// With ORDER BY
await db.select().from(users).orderBy(desc(users.createdAt));

// With LIMIT/OFFSET
await db.select().from(users).limit(10).offset(20);

// With GROUP BY
await db.select({
  role: users.role,
  count: sql<number>`count(*)`
}).from(users).groupBy(users.role);

// Find first
await db.select().from(users).where(eq(users.id, 1)).limit(1).then(r => r[0]);
```

### INSERT

```typescript
// Single insert
await db.insert(users).values({ email: 'a@b.com', name: 'Test' });

// With returning
const [newUser] = await db.insert(users).values({ ... }).returning();

// Bulk insert
await db.insert(users).values([
  { email: 'a@b.com', name: 'A' },
  { email: 'b@b.com', name: 'B' }
]);

// Upsert (on conflict)
await db.insert(users).values({ ... })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: 'Updated' }
  });
```

### UPDATE

```typescript
// Basic update
await db.update(users).set({ name: 'New Name' }).where(eq(users.id, 1));

// With returning
const [updated] = await db.update(users).set({ ... }).where(eq(users.id, 1)).returning();

// Increment
await db.update(posts).set({
  viewCount: sql`${posts.viewCount} + 1`
}).where(eq(posts.id, 1));
```

### DELETE

```typescript
// Basic delete
await db.delete(users).where(eq(users.id, 1));

// With returning
const [deleted] = await db.delete(users).where(eq(users.id, 1)).returning();

// Delete all
await db.delete(users);
```

---

## Operators Quick Reference

### Comparison Operators

```typescript
import {
  eq, ne,                    // Equal, Not equal
  gt, gte, lt, lte,         // Greater/Less than
  isNull, isNotNull,        // NULL checks
  like, ilike,              // Pattern matching
  notLike, notIlike,
  inArray, notInArray,      // IN operator
  between, notBetween,      // BETWEEN
  exists, notExists,        // EXISTS subquery
  and, or, not,             // Logical operators
  sql                       // Raw SQL
} from 'drizzle-orm';
```

### Usage Examples

```typescript
// Equality
.where(eq(users.role, 'admin'))
.where(ne(users.status, 'deleted'))

// Comparison
.where(gt(users.age, 18))
.where(gte(posts.views, 100))
.where(lt(orders.total, 50))
.where(lte(items.stock, 10))

// NULL checks
.where(isNull(users.deletedAt))
.where(isNotNull(users.email))

// Pattern matching
.where(like(users.email, '%@gmail.com'))
.where(ilike(users.name, '%john%'))  // Case-insensitive (PostgreSQL)

// IN operator
.where(inArray(users.id, [1, 2, 3]))
.where(notInArray(users.role, ['admin', 'mod']))

// BETWEEN
.where(between(users.age, 18, 65))
.where(between(orders.date, startDate, endDate))

// Logical operators
.where(and(
  eq(users.role, 'admin'),
  eq(users.isActive, true)
))

.where(or(
  eq(users.role, 'admin'),
  gt(users.postCount, 100)
))

.where(not(eq(users.role, 'banned')))

// Raw SQL
.where(sql`${users.createdAt} > NOW() - INTERVAL '7 days'`)
```

---

## Joins Quick Reference

```typescript
// INNER JOIN
await db.select().from(users)
  .innerJoin(posts, eq(users.id, posts.authorId));

// LEFT JOIN
await db.select().from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// RIGHT JOIN
await db.select().from(users)
  .rightJoin(posts, eq(users.id, posts.authorId));

// FULL OUTER JOIN
await db.select().from(users)
  .fullJoin(posts, eq(users.id, posts.authorId));

// Multiple joins
await db.select().from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .leftJoin(comments, eq(posts.id, comments.postId));

// Self join (with alias)
import { alias } from 'drizzle-orm/pg-core';
const managers = alias(employees, 'managers');
await db.select().from(employees)
  .leftJoin(managers, eq(employees.managerId, managers.id));
```

---

## Relations Quick Reference

### Defining Relations

```typescript
import { relations } from 'drizzle-orm';

// One-to-One
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId]
  })
}));

// One-to-Many
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}));

// Many-to-Many (through junction)
export const postsRelations = relations(posts, ({ many }) => ({
  postTags: many(postTags)
}));
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] })
}));
```

### Querying Relations

```typescript
// With relations (requires schema in drizzle())
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true
  }
});

// Nested relations
await db.query.posts.findMany({
  with: {
    author: true,
    comments: {
      with: { author: true }
    }
  }
});

// Filter and order relations
await db.query.users.findMany({
  with: {
    posts: {
      where: eq(posts.status, 'published'),
      orderBy: desc(posts.createdAt),
      limit: 5
    }
  }
});

// Select specific columns
await db.query.users.findMany({
  columns: { id: true, name: true },
  with: {
    posts: { columns: { title: true } }
  }
});
```

---

## Transactions Quick Reference

```typescript
// Basic transaction
const result = await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ ... }).returning();
  await tx.insert(profiles).values({ userId: user.id, ... });
  return user;
});

// With error handling
try {
  await db.transaction(async (tx) => {
    // Operations...
    if (error) tx.rollback();
  });
} catch (e) {
  console.error('Transaction failed:', e);
}

// With isolation level (PostgreSQL)
await db.transaction(async (tx) => {
  // Operations...
}, { isolationLevel: 'serializable' });
```

---

## Migrations Quick Reference

### Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema directly (dev only)
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio

# Introspect existing database
npx drizzle-kit introspect
```

### Configuration (drizzle.config.ts)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
```

### Programmatic Migration

```typescript
import { migrate } from 'drizzle-orm/node-postgres/migrator';

await migrate(db, { migrationsFolder: './drizzle/migrations' });
```

---

## Type Inference

```typescript
// From table definition
type User = typeof users.$inferSelect;    // SELECT result type
type NewUser = typeof users.$inferInsert;  // INSERT input type

// Using helpers
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;
```

---

## Common Patterns

### Pagination

```typescript
const page = 1;
const pageSize = 20;

const results = await db.select().from(users)
  .orderBy(desc(users.createdAt))
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

### Dynamic Filters

```typescript
function buildQuery(filters: { role?: string; active?: boolean }) {
  const conditions = [];
  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (filters.active !== undefined) conditions.push(eq(users.isActive, filters.active));

  return db.select().from(users)
    .where(conditions.length ? and(...conditions) : undefined);
}
```

### Soft Delete

```typescript
// Mark as deleted
await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, 1));

// Query excludes deleted
await db.select().from(users).where(isNull(users.deletedAt));
```

### Count Total

```typescript
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(users)
  .where(eq(users.isActive, true));
```

---

## When to Choose

| Choose Drizzle | Choose Prisma |
|----------------|---------------|
| Serverless / Edge functions | Traditional servers |
| Bundle size matters | Bundle size not critical |
| SQL-proficient team | Team prefers abstraction |
| TypeScript-only schema | Like Prisma DSL |
| Maximum control | Convenience over control |
| Minimal dependencies | Rich ecosystem wanted |
| Rapid prototyping | Need Prisma Studio |

---

## Essential Imports

```typescript
// Core
import { drizzle } from 'drizzle-orm/node-postgres';  // or mysql2, better-sqlite3
import { eq, and, or, gt, lt, gte, lte, like, ilike, inArray, isNull, sql, desc, asc } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// PostgreSQL schema
import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

// MySQL schema
import { mysqlTable, serial, varchar, int, boolean, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';

// SQLite schema
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
```

---

## Quick Start Template

```typescript
// schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// usage.ts
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

// Create
const [user] = await db.insert(users).values({ email: 'a@b.com' }).returning();

// Read
const allUsers = await db.select().from(users);
const oneUser = await db.select().from(users).where(eq(users.id, 1));

// Update
await db.update(users).set({ name: 'New' }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```
