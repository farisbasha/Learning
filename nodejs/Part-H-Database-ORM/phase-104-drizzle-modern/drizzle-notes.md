# Phase 104: Drizzle ORM - The Modern TypeScript-First ORM

## Table of Contents

1. [What is Drizzle ORM](#1-what-is-drizzle-orm)
2. [Drizzle vs Prisma Comparison](#2-drizzle-vs-prisma-comparison)
3. [Installation and Setup](#3-installation-and-setup)
4. [Schema Definition in TypeScript](#4-schema-definition-in-typescript)
5. [Database Client Setup](#5-database-client-setup)
6. [CRUD Operations](#6-crud-operations)
7. [Where Clauses and Operators](#7-where-clauses-and-operators)
8. [Relations](#8-relations)
9. [Joins](#9-joins)
10. [Transactions](#10-transactions)
11. [Migrations with Drizzle Kit](#11-migrations-with-drizzle-kit)
12. [When to Use Drizzle vs Prisma](#12-when-to-use-drizzle-vs-prisma)

---

## 1. What is Drizzle ORM

### The Newest Player in TypeScript ORMs (2023+)

Drizzle ORM emerged in 2023 as a fresh approach to database access in TypeScript. It was designed with a radically different philosophy than existing ORMs: **"If you know SQL, you know Drizzle."**

```typescript
// Drizzle feels like writing SQL, but with full TypeScript safety
import { eq, and, gt } from 'drizzle-orm';

// This Drizzle query...
const result = await db
  .select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    gt(users.age, 21)
  ));

// ...maps directly to this SQL
// SELECT * FROM users WHERE role = 'admin' AND age > 21
```

### Core Philosophy: SQL-Like by Design

Unlike ORMs that abstract SQL away, Drizzle embraces SQL concepts:

```typescript
// The API mirrors SQL structure closely
const query = db
  .select({
    id: users.id,
    name: users.name,
    postCount: sql<number>`count(${posts.id})`
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id)
  .having(gt(sql`count(${posts.id})`, 5))
  .orderBy(desc(users.createdAt))
  .limit(10);

// Compare this to Prisma's abstracted approach:
// prisma.user.findMany({
//   select: { id: true, name: true, _count: { select: { posts: true } } },
//   where: { posts: { _count: { gt: 5 } } },
//   orderBy: { createdAt: 'desc' },
//   take: 10
// })
```

### Lightweight Architecture

Drizzle is designed to be **minimal and modular**:

```
Bundle Size Comparison (approximate):
┌────────────────────┬──────────────┬─────────────────────┐
│ ORM                │ Bundle Size  │ Dependencies        │
├────────────────────┼──────────────┼─────────────────────┤
│ Drizzle ORM        │ ~50 KB       │ Minimal             │
│ Prisma Client      │ ~2-3 MB      │ Query Engine binary │
│ TypeORM            │ ~500 KB      │ Reflect-metadata    │
│ Sequelize          │ ~200 KB      │ Multiple deps       │
└────────────────────┴──────────────┴─────────────────────┘
```

**Why size matters:**
- Faster cold starts in serverless
- Works on edge runtimes (Cloudflare Workers, Vercel Edge)
- Smaller memory footprint
- Quicker installation

### Schema Defined in Pure TypeScript

No separate schema language, no code generation required:

```typescript
// schema.ts - This IS your schema, no DSL to learn
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Types are automatically inferred from the schema
type User = typeof users.$inferSelect;  // What you get from SELECT
type NewUser = typeof users.$inferInsert;  // What you INSERT
```

### Key Characteristics

| Feature | Drizzle Approach |
|---------|------------------|
| **Learning Curve** | Low if you know SQL |
| **Type Safety** | Full TypeScript inference |
| **Runtime** | Works everywhere (Node, Edge, Bun) |
| **Schema** | TypeScript objects |
| **Migrations** | SQL files, fully readable |
| **Philosophy** | Embrace SQL, don't hide it |

---

## 2. Drizzle vs Prisma Comparison

### Side-by-Side Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRISMA ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────┤
│  Your Code                                                   │
│      ↓                                                       │
│  Prisma Client (Generated TypeScript)                        │
│      ↓                                                       │
│  Query Engine (Rust Binary - 2-3MB)                          │
│      ↓                                                       │
│  Database                                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   DRIZZLE ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────┤
│  Your Code                                                   │
│      ↓                                                       │
│  Drizzle ORM (Pure TypeScript - ~50KB)                       │
│      ↓                                                       │
│  Database Driver (pg, mysql2, etc.)                          │
│      ↓                                                       │
│  Database                                                    │
└──────────────────────────────────────────────────────────────┘
```

### Bundle Size Deep Dive

```typescript
// What gets included when you import

// Prisma: Requires binary query engine
import { PrismaClient } from '@prisma/client';
// node_modules/@prisma/client/
// ├── index.js            (~500KB)
// ├── schema.prisma
// └── libquery_engine-*   (2-3MB per platform)

// Drizzle: Pure JavaScript, no binaries
import { drizzle } from 'drizzle-orm/node-postgres';
// node_modules/drizzle-orm/
// └── ~50KB total (all dialects included)
```

**Impact on Serverless:**
```typescript
// Cold start times (approximate)
// Prisma: 300-800ms (loading binary engine)
// Drizzle: 50-100ms (pure JS)
```

### Schema Definition Comparison

```typescript
// ╔══════════════════════════════════════════════════════════════╗
// ║                    PRISMA SCHEMA (DSL)                       ║
// ╚══════════════════════════════════════════════════════════════╝

// schema.prisma - Separate file with Prisma DSL
/*
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

enum Role {
  USER
  ADMIN
}
*/

// After npx prisma generate:
import { PrismaClient, User, Post, Role } from '@prisma/client';


// ╔══════════════════════════════════════════════════════════════╗
// ║                  DRIZZLE SCHEMA (TypeScript)                 ║
// ╚══════════════════════════════════════════════════════════════╝

// schema.ts - Pure TypeScript, no code generation needed
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum defined in TypeScript
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: roleEnum('role').default('USER'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Post table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: integer('author_id').references(() => users.id)
});

// Relations (for relational queries)
export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  profile: one(profiles)
}));

// Types are inferred, no generation step
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

### Query Syntax Comparison

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BASIC QUERIES
// ═══════════════════════════════════════════════════════════════

// Find all users
// Prisma:
const users = await prisma.user.findMany();

// Drizzle:
const users = await db.select().from(usersTable);


// ═══════════════════════════════════════════════════════════════
//                    FILTERED QUERIES
// ═══════════════════════════════════════════════════════════════

// Find users with conditions
// Prisma:
const admins = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
    age: { gte: 21 }
  }
});

// Drizzle (SQL-like):
const admins = await db
  .select()
  .from(users)
  .where(and(
    eq(users.role, 'ADMIN'),
    gte(users.age, 21)
  ));


// ═══════════════════════════════════════════════════════════════
//                    SELECT SPECIFIC FIELDS
// ═══════════════════════════════════════════════════════════════

// Prisma:
const userNames = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
});

// Drizzle:
const userNames = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email
  })
  .from(users);


// ═══════════════════════════════════════════════════════════════
//                    RELATIONS / INCLUDES
// ═══════════════════════════════════════════════════════════════

// Prisma (object-based):
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  }
});

// Drizzle (relational query API):
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: desc(posts.createdAt),
      limit: 5
    }
  }
});

// Drizzle (explicit join - more SQL-like):
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(eq(posts.published, true));


// ═══════════════════════════════════════════════════════════════
//                    AGGREGATIONS
// ═══════════════════════════════════════════════════════════════

// Prisma:
const postCounts = await prisma.user.findMany({
  select: {
    name: true,
    _count: {
      select: { posts: true }
    }
  }
});

// Drizzle (raw SQL power):
const postCounts = await db
  .select({
    name: users.name,
    postCount: sql<number>`count(${posts.id})`
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id);
```

### Type Safety Comparison

```typescript
// Both provide excellent type safety, but differently

// ═══════════════════════════════════════════════════════════════
//                    PRISMA TYPE SAFETY
// ═══════════════════════════════════════════════════════════════

// Types are generated from schema.prisma
// Run: npx prisma generate

import { User, Post, Prisma } from '@prisma/client';

// Autocomplete and type checking after generation
const user: User = await prisma.user.findUnique({
  where: { id: 1 }  // TypeScript knows 'id' is valid
});

// Input types are also generated
const createInput: Prisma.UserCreateInput = {
  email: 'user@example.com',
  name: 'John'
  // TypeScript knows exactly what fields are valid/required
};


// ═══════════════════════════════════════════════════════════════
//                    DRIZZLE TYPE SAFETY
// ═══════════════════════════════════════════════════════════════

// Types are inferred directly from schema, no generation step

// Infer types from your schema definition
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// Or use the InferSelectModel helper
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Everything is typed without running any command
const user: User = await db
  .select()
  .from(users)
  .where(eq(users.id, 1))  // TypeScript knows 'id' exists
  .then(rows => rows[0]);

// Insert types know required vs optional fields
const newUser: NewUser = {
  email: 'user@example.com',  // Required
  name: 'John'                 // Optional (allows undefined)
  // id, createdAt - have defaults, not required
};
```

### Performance Characteristics

```typescript
// ═══════════════════════════════════════════════════════════════
//                    QUERY EXECUTION
// ═══════════════════════════════════════════════════════════════

// Prisma: Query Engine processes and optimizes queries
// - Rust-based engine for consistency
// - Query batching (Data Loader pattern)
// - Some overhead from IPC with binary

// Drizzle: Direct SQL generation
// - Minimal overhead
// - Queries are what you write
// - No intermediate layer

// ═══════════════════════════════════════════════════════════════
//                    BENCHMARK EXAMPLE
// ═══════════════════════════════════════════════════════════════

// Simple SELECT query (1000 iterations, average time)
/*
┌──────────────────┬───────────────┬───────────────┐
│ Operation        │ Prisma        │ Drizzle       │
├──────────────────┼───────────────┼───────────────┤
│ Simple SELECT    │ 0.8ms         │ 0.5ms         │
│ With Relations   │ 1.2ms         │ 0.9ms         │
│ Complex JOIN     │ 1.5ms         │ 0.8ms         │
│ Bulk INSERT      │ 2.0ms         │ 1.8ms         │
│ Cold Start       │ 400ms         │ 80ms          │
└──────────────────┴───────────────┴───────────────┘
*/

// Note: Real-world differences are often negligible for typical apps
// The main difference is in cold start time (serverless) and bundle size
```

### Edge Runtime Compatibility

```typescript
// ═══════════════════════════════════════════════════════════════
//                    EDGE RUNTIME SUPPORT
// ═══════════════════════════════════════════════════════════════

// Prisma: Limited edge support
// - Requires Prisma Accelerate or Data Proxy
// - Binary engine doesn't run on Edge
// - Extra service/cost

// Drizzle: Native edge support
// - Pure JavaScript, runs anywhere
// - Works with edge-compatible drivers
// - No external services needed

// Example: Cloudflare Workers with D1 (SQLite)
import { drizzle } from 'drizzle-orm/d1';

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB);  // D1 database binding

    const users = await db
      .select()
      .from(usersTable)
      .limit(10);

    return Response.json(users);
  }
};

// Example: Vercel Edge Functions
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

export const config = { runtime: 'edge' };

export default async function handler() {
  const db = drizzle(sql);
  const users = await db.select().from(usersTable);
  return Response.json(users);
}
```

---

## 3. Installation and Setup

### Core Package Installation

```bash
# Core Drizzle ORM package (required)
npm install drizzle-orm

# Drizzle Kit for migrations (dev dependency)
npm install -D drizzle-kit
```

### Database-Specific Packages

```bash
# ═══════════════════════════════════════════════════════════════
#                    POSTGRESQL
# ═══════════════════════════════════════════════════════════════

# Option 1: node-postgres (most common)
npm install pg
npm install -D @types/pg

# Option 2: Postgres.js (modern, TypeScript-first)
npm install postgres

# Option 3: Neon Serverless
npm install @neondatabase/serverless


# ═══════════════════════════════════════════════════════════════
#                    MYSQL
# ═══════════════════════════════════════════════════════════════

# Option 1: mysql2 (recommended)
npm install mysql2

# Option 2: PlanetScale Serverless
npm install @planetscale/database


# ═══════════════════════════════════════════════════════════════
#                    SQLITE
# ═══════════════════════════════════════════════════════════════

# Option 1: better-sqlite3 (synchronous, fast)
npm install better-sqlite3
npm install -D @types/better-sqlite3

# Option 2: libsql (Turso)
npm install @libsql/client

# Option 3: Bun SQLite (built-in)
# No installation needed if using Bun
```

### Project Structure

```
project/
├── src/
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   ├── schema.ts       # Table definitions
│   │   └── relations.ts    # Relation definitions (optional)
│   └── index.ts
├── drizzle/
│   └── migrations/         # Generated migration files
├── drizzle.config.ts       # Drizzle Kit configuration
├── package.json
└── tsconfig.json
```

### Drizzle Kit Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  // Path to your schema file(s)
  schema: './src/db/schema.ts',

  // Output directory for migrations
  out: './drizzle/migrations',

  // Database dialect
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'

  // Database connection for migrations
  dbCredentials: {
    // PostgreSQL
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp',

    // Or use connection string
    // url: process.env.DATABASE_URL
  },

  // Optional: verbose logging
  verbose: true,

  // Optional: strict mode (fail on warnings)
  strict: true
} satisfies Config;


// Alternative configurations for different databases:

// MySQL configuration
export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'myapp'
  }
} satisfies Config;

// SQLite configuration
export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db'  // Path to SQLite file
  }
} satisfies Config;
```

### Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

---

## 4. Schema Definition in TypeScript

### Table Definition Functions by Database

```typescript
// Each database has its own table function with appropriate types

// ═══════════════════════════════════════════════════════════════
//                    POSTGRESQL
// ═══════════════════════════════════════════════════════════════

import {
  pgTable,
  serial,        // auto-incrementing integer
  bigserial,     // auto-incrementing bigint
  text,          // unlimited text
  varchar,       // variable-length string
  char,          // fixed-length string
  integer,       // 4-byte integer
  bigint,        // 8-byte integer
  smallint,      // 2-byte integer
  boolean,       // true/false
  timestamp,     // timestamp without timezone
  timestamptz,   // timestamp with timezone
  date,          // date only
  time,          // time only
  real,          // 4-byte floating point
  doublePrecision, // 8-byte floating point
  numeric,       // arbitrary precision
  uuid,          // UUID type
  json,          // JSON (stored as text)
  jsonb,         // JSONB (binary, indexable)
  pgEnum         // enumerated type
} from 'drizzle-orm/pg-core';


// ═══════════════════════════════════════════════════════════════
//                    MYSQL
// ═══════════════════════════════════════════════════════════════

import {
  mysqlTable,
  serial,        // auto-incrementing
  int,           // integer
  bigint,        // big integer
  tinyint,       // tiny integer (0-255)
  smallint,      // small integer
  mediumint,     // medium integer
  float,         // floating point
  double,        // double precision
  decimal,       // decimal
  varchar,       // variable string
  char,          // fixed string
  text,          // text blob
  boolean,       // boolean (tinyint)
  date,          // date
  datetime,      // datetime
  timestamp,     // timestamp
  time,          // time
  year,          // year
  json,          // JSON
  mysqlEnum      // enumerated type
} from 'drizzle-orm/mysql-core';


// ═══════════════════════════════════════════════════════════════
//                    SQLITE
// ═══════════════════════════════════════════════════════════════

import {
  sqliteTable,
  integer,       // integer (also used for boolean)
  real,          // floating point
  text,          // text
  blob           // binary data
} from 'drizzle-orm/sqlite-core';
```

### Complete Schema Example (PostgreSQL)

```typescript
// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
//                    ENUMS
// ═══════════════════════════════════════════════════════════════

export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived']);

// ═══════════════════════════════════════════════════════════════
//                    USERS TABLE
// ═══════════════════════════════════════════════════════════════

export const users = pgTable('users', {
  // Primary key with auto-increment
  id: serial('id').primaryKey(),

  // UUID alternative for primary key
  // id: uuid('id').defaultRandom().primaryKey(),

  // Required unique field
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Required field
  username: varchar('username', { length: 50 }).notNull(),

  // Optional field (nullable by default)
  name: text('name'),

  // Field with default value
  role: userRoleEnum('role').default('user').notNull(),

  // Boolean with default
  isActive: boolean('is_active').default(true).notNull(),

  // JSON field for flexible data
  preferences: jsonb('preferences').$type<{
    theme: 'light' | 'dark';
    notifications: boolean;
  }>(),

  // Timestamps with defaults
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),

  // Or use SQL for updated_at
  // updatedAt: timestamp('updated_at')
  //   .default(sql`CURRENT_TIMESTAMP`)
  //   .$onUpdate(() => sql`CURRENT_TIMESTAMP`)

}, (table) => ({
  // Additional indexes
  usernameIdx: index('username_idx').on(table.username),
  emailIdx: uniqueIndex('email_idx').on(table.email),

  // Composite index
  roleActiveIdx: index('role_active_idx').on(table.role, table.isActive)
}));

// ═══════════════════════════════════════════════════════════════
//                    POSTS TABLE
// ═══════════════════════════════════════════════════════════════

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),

  title: varchar('title', { length: 255 }).notNull(),

  slug: varchar('slug', { length: 255 }).notNull().unique(),

  content: text('content'),

  excerpt: varchar('excerpt', { length: 500 }),

  status: postStatusEnum('status').default('draft').notNull(),

  // Foreign key reference
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  // Optional foreign key
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),

  viewCount: integer('view_count').default(0).notNull(),

  publishedAt: timestamp('published_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
}, (table) => ({
  authorIdx: index('post_author_idx').on(table.authorId),
  statusIdx: index('post_status_idx').on(table.status),
  slugIdx: uniqueIndex('post_slug_idx').on(table.slug)
}));

// ═══════════════════════════════════════════════════════════════
//                    CATEGORIES TABLE
// ═══════════════════════════════════════════════════════════════

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): any => categories.id)
});

// ═══════════════════════════════════════════════════════════════
//                    TAGS TABLE
// ═══════════════════════════════════════════════════════════════

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique()
});

// ═══════════════════════════════════════════════════════════════
//                    POST_TAGS (Many-to-Many Junction)
// ═══════════════════════════════════════════════════════════════

export const postTags = pgTable('post_tags', {
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: integer('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull()
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.postId, table.tagId] })
}));

// Don't forget to import primaryKey
import { primaryKey } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════════════════════════
//                    COMMENTS TABLE
// ═══════════════════════════════════════════════════════════════

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: integer('parent_id'), // Self-reference for nested comments
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull()
});

// ═══════════════════════════════════════════════════════════════
//                    TYPE INFERENCE
// ═══════════════════════════════════════════════════════════════

// Select types (what you GET from database)
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;

// Insert types (what you SEND to database)
export type NewUser = typeof users.$inferInsert;
export type NewPost = typeof posts.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
export type NewTag = typeof tags.$inferInsert;
export type NewComment = typeof comments.$inferInsert;
```

### Column Constraints Reference

```typescript
import { pgTable, serial, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const examples = pgTable('examples', {
  // ═══════════════════════════════════════════════════════════════
  //                    PRIMARY KEY
  // ═══════════════════════════════════════════════════════════════

  // Auto-incrementing primary key
  id: serial('id').primaryKey(),

  // UUID primary key
  // id: uuid('id').defaultRandom().primaryKey(),


  // ═══════════════════════════════════════════════════════════════
  //                    NOT NULL
  // ═══════════════════════════════════════════════════════════════

  // Required field (not null)
  requiredField: text('required_field').notNull(),

  // Optional field (nullable - default behavior)
  optionalField: text('optional_field'),


  // ═══════════════════════════════════════════════════════════════
  //                    UNIQUE
  // ═══════════════════════════════════════════════════════════════

  // Unique constraint
  email: varchar('email', { length: 255 }).unique(),

  // Unique and not null
  username: varchar('username', { length: 50 }).notNull().unique(),


  // ═══════════════════════════════════════════════════════════════
  //                    DEFAULT VALUES
  // ═══════════════════════════════════════════════════════════════

  // Static default
  status: text('status').default('pending'),

  // Boolean default
  isActive: boolean('is_active').default(true),

  // Number default
  score: integer('score').default(0),

  // Current timestamp default
  createdAt: timestamp('created_at').defaultNow(),

  // SQL expression default
  uuid: uuid('uuid').default(sql`gen_random_uuid()`),

  // Array default (PostgreSQL)
  // tags: text('tags').array().default([]),


  // ═══════════════════════════════════════════════════════════════
  //                    REFERENCES (Foreign Keys)
  // ═══════════════════════════════════════════════════════════════

  // Simple reference
  userId: integer('user_id').references(() => users.id),

  // Reference with onDelete
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' }),

  // Reference with onUpdate
  categoryId: integer('category_id')
    .references(() => categories.id, {
      onDelete: 'set null',
      onUpdate: 'cascade'
    }),


  // ═══════════════════════════════════════════════════════════════
  //                    CHECK CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════

  // Age must be positive (using SQL)
  age: integer('age').check(sql`age >= 0`),

  // Price must be positive
  price: integer('price').check(sql`price > 0`)
});
```

---

## 5. Database Client Setup

### PostgreSQL with node-postgres

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'myapp',

  // Pool configuration
  max: 20,                  // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Fail fast if can't connect
});

// Create Drizzle client with schema for relational queries
export const db = drizzle(pool, { schema });

// Alternative: Single connection (not recommended for production)
// import { Client } from 'pg';
// const client = new Client({ connectionString: process.env.DATABASE_URL });
// await client.connect();
// export const db = drizzle(client, { schema });


// Using connection string
const poolFromUrl = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const dbFromUrl = drizzle(poolFromUrl, { schema });
```

### PostgreSQL with Postgres.js

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres.js connection
const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 20,                   // Connection pool size
  idle_timeout: 20,          // Idle timeout in seconds
  connect_timeout: 10,       // Connection timeout in seconds
  prepare: false             // Disable prepared statements if needed
});

// Create Drizzle client
export const db = drizzle(queryClient, { schema });

// For migrations (needs separate connection)
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const migrationDb = drizzle(migrationClient);
```

### PostgreSQL with Neon Serverless

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// For serverless (HTTP-based, no persistent connection)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });


// Alternative: WebSocket connection for edge
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const dbWs = drizzle(pool, { schema });
```

### MySQL with mysql2

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'myapp',

  // Pool configuration
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Drizzle client
export const db = drizzle(pool, { schema, mode: 'default' });


// Using connection string
const poolFromUrl = mysql.createPool(process.env.DATABASE_URL!);
export const dbFromUrl = drizzle(poolFromUrl, { schema, mode: 'default' });
```

### MySQL with PlanetScale

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import * as schema from './schema';

// Create PlanetScale connection
const connection = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD
});

// Create Drizzle client
export const db = drizzle(connection, { schema });
```

### SQLite with better-sqlite3

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create SQLite database connection
const sqlite = new Database('sqlite.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle client
export const db = drizzle(sqlite, { schema });


// In-memory database for testing
const memoryDb = new Database(':memory:');
export const testDb = drizzle(memoryDb, { schema });
```

### SQLite with LibSQL (Turso)

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create libsql client (for Turso or local SQLite)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Create Drizzle client
export const db = drizzle(client, { schema });


// Local file-based SQLite
const localClient = createClient({
  url: 'file:local.db'
});
export const localDb = drizzle(localClient, { schema });
```

### Bun SQLite (Built-in)

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

// Create Bun SQLite database
const sqlite = new Database('sqlite.db');

// Create Drizzle client
export const db = drizzle(sqlite, { schema });
```

### Cloudflare D1

```typescript
// src/index.ts (Cloudflare Worker)
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

interface Env {
  DB: D1Database;  // D1 binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Create Drizzle client from D1 binding
    const db = drizzle(env.DB, { schema });

    // Use db for queries
    const users = await db.select().from(schema.users);

    return Response.json(users);
  }
};
```

---

## 6. CRUD Operations

### Setting Up for Examples

```typescript
// Assume we have this setup
import { db } from './db';
import { users, posts, comments } from './db/schema';
import { eq, and, or, gt, lt, like, desc, asc, sql } from 'drizzle-orm';

// Types
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type Post = typeof posts.$inferSelect;
type NewPost = typeof posts.$inferInsert;
```

### SELECT Operations

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BASIC SELECT
// ═══════════════════════════════════════════════════════════════

// Select all columns from table
const allUsers = await db.select().from(users);
// SQL: SELECT * FROM users


// ═══════════════════════════════════════════════════════════════
//                    SELECT SPECIFIC COLUMNS
// ═══════════════════════════════════════════════════════════════

// Select specific columns
const userNames = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email
  })
  .from(users);
// SQL: SELECT id, name, email FROM users


// ═══════════════════════════════════════════════════════════════
//                    SELECT WITH ALIAS
// ═══════════════════════════════════════════════════════════════

// Select with custom aliases
const result = await db
  .select({
    oderId: users.id,
    fullName: users.name,
    emailAddress: users.email
  })
  .from(users);


// ═══════════════════════════════════════════════════════════════
//                    SELECT DISTINCT
// ═══════════════════════════════════════════════════════════════

const uniqueRoles = await db
  .selectDistinct({ role: users.role })
  .from(users);
// SQL: SELECT DISTINCT role FROM users


// ═══════════════════════════════════════════════════════════════
//                    WHERE CLAUSE
// ═══════════════════════════════════════════════════════════════

// Simple where
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));
// SQL: SELECT * FROM users WHERE is_active = true


// Multiple conditions with AND
const adminActiveUsers = await db
  .select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    eq(users.isActive, true)
  ));
// SQL: SELECT * FROM users WHERE role = 'admin' AND is_active = true


// Multiple conditions with OR
const specialUsers = await db
  .select()
  .from(users)
  .where(or(
    eq(users.role, 'admin'),
    eq(users.role, 'moderator')
  ));
// SQL: SELECT * FROM users WHERE role = 'admin' OR role = 'moderator'


// ═══════════════════════════════════════════════════════════════
//                    ORDER BY
// ═══════════════════════════════════════════════════════════════

// Single column ordering
const newestFirst = await db
  .select()
  .from(users)
  .orderBy(desc(users.createdAt));
// SQL: SELECT * FROM users ORDER BY created_at DESC


// Multiple column ordering
const sorted = await db
  .select()
  .from(users)
  .orderBy(asc(users.role), desc(users.createdAt));
// SQL: SELECT * FROM users ORDER BY role ASC, created_at DESC


// ═══════════════════════════════════════════════════════════════
//                    LIMIT AND OFFSET (Pagination)
// ═══════════════════════════════════════════════════════════════

// Limit results
const firstTen = await db
  .select()
  .from(users)
  .limit(10);
// SQL: SELECT * FROM users LIMIT 10


// Pagination with offset
const page = 2;
const pageSize = 10;
const paginatedUsers = await db
  .select()
  .from(users)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
// SQL: SELECT * FROM users LIMIT 10 OFFSET 10


// ═══════════════════════════════════════════════════════════════
//                    FIND FIRST / FIND ONE
// ═══════════════════════════════════════════════════════════════

// Get single row (returns array, take first)
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 1))
  .limit(1)
  .then(rows => rows[0] ?? null);

// Using .get() with prepared statements (better-sqlite3)
// const user = db.select().from(users).where(eq(users.id, 1)).get();


// ═══════════════════════════════════════════════════════════════
//                    AGGREGATIONS
// ═══════════════════════════════════════════════════════════════

// Count
const userCount = await db
  .select({ count: sql<number>`count(*)` })
  .from(users);
// SQL: SELECT count(*) FROM users


// Count with condition
const activeCount = await db
  .select({ count: sql<number>`count(*)` })
  .from(users)
  .where(eq(users.isActive, true));


// Multiple aggregations
const stats = await db
  .select({
    total: sql<number>`count(*)`,
    avgAge: sql<number>`avg(age)`,
    maxAge: sql<number>`max(age)`,
    minAge: sql<number>`min(age)`
  })
  .from(users);


// ═══════════════════════════════════════════════════════════════
//                    GROUP BY
// ═══════════════════════════════════════════════════════════════

// Group by with aggregation
const usersByRole = await db
  .select({
    role: users.role,
    count: sql<number>`count(*)`
  })
  .from(users)
  .groupBy(users.role);
// SQL: SELECT role, count(*) FROM users GROUP BY role


// Group by with HAVING
const popularRoles = await db
  .select({
    role: users.role,
    count: sql<number>`count(*)`
  })
  .from(users)
  .groupBy(users.role)
  .having(gt(sql`count(*)`, 5));
// SQL: SELECT role, count(*) FROM users GROUP BY role HAVING count(*) > 5
```

### INSERT Operations

```typescript
// ═══════════════════════════════════════════════════════════════
//                    INSERT SINGLE ROW
// ═══════════════════════════════════════════════════════════════

// Basic insert
await db.insert(users).values({
  email: 'john@example.com',
  username: 'johndoe',
  name: 'John Doe'
});
// SQL: INSERT INTO users (email, username, name) VALUES ('john@example.com', 'johndoe', 'John Doe')


// Insert with returning (PostgreSQL, SQLite)
const [newUser] = await db
  .insert(users)
  .values({
    email: 'jane@example.com',
    username: 'janedoe',
    name: 'Jane Doe'
  })
  .returning();
// SQL: INSERT INTO users (...) VALUES (...) RETURNING *

console.log(newUser.id);  // Auto-generated ID


// Return specific columns
const [{ id, email }] = await db
  .insert(users)
  .values({
    email: 'bob@example.com',
    username: 'bobsmith',
    name: 'Bob Smith'
  })
  .returning({
    id: users.id,
    email: users.email
  });


// ═══════════════════════════════════════════════════════════════
//                    INSERT MULTIPLE ROWS
// ═══════════════════════════════════════════════════════════════

// Bulk insert
await db.insert(users).values([
  { email: 'user1@example.com', username: 'user1', name: 'User One' },
  { email: 'user2@example.com', username: 'user2', name: 'User Two' },
  { email: 'user3@example.com', username: 'user3', name: 'User Three' }
]);


// Bulk insert with returning
const newUsers = await db
  .insert(users)
  .values([
    { email: 'a@example.com', username: 'usera' },
    { email: 'b@example.com', username: 'userb' }
  ])
  .returning();


// ═══════════════════════════════════════════════════════════════
//                    ON CONFLICT (Upsert)
// ═══════════════════════════════════════════════════════════════

// PostgreSQL: Insert or update on conflict
await db
  .insert(users)
  .values({
    email: 'john@example.com',
    username: 'johndoe',
    name: 'John Updated'
  })
  .onConflictDoUpdate({
    target: users.email,
    set: {
      name: 'John Updated',
      updatedAt: new Date()
    }
  });
// SQL: INSERT INTO users (...) VALUES (...)
//      ON CONFLICT (email) DO UPDATE SET name = 'John Updated', updated_at = NOW()


// Insert or ignore on conflict
await db
  .insert(users)
  .values({
    email: 'existing@example.com',
    username: 'existinguser'
  })
  .onConflictDoNothing();
// SQL: INSERT INTO users (...) VALUES (...) ON CONFLICT DO NOTHING


// On conflict with WHERE clause
await db
  .insert(users)
  .values({
    email: 'john@example.com',
    username: 'johndoe',
    name: 'John Doe'
  })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: 'John Updated' },
    where: eq(users.isActive, true)
  });


// ═══════════════════════════════════════════════════════════════
//                    INSERT WITH SUBQUERY
// ═══════════════════════════════════════════════════════════════

// Insert using values from another table (raw SQL)
await db.execute(sql`
  INSERT INTO archived_users (id, email, name)
  SELECT id, email, name FROM users WHERE is_active = false
`);
```

### UPDATE Operations

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BASIC UPDATE
// ═══════════════════════════════════════════════════════════════

// Update single row
await db
  .update(users)
  .set({ name: 'John Updated' })
  .where(eq(users.id, 1));
// SQL: UPDATE users SET name = 'John Updated' WHERE id = 1


// Update multiple fields
await db
  .update(users)
  .set({
    name: 'Jane Updated',
    isActive: false,
    updatedAt: new Date()
  })
  .where(eq(users.id, 2));


// ═══════════════════════════════════════════════════════════════
//                    UPDATE WITH RETURNING
// ═══════════════════════════════════════════════════════════════

// Get updated row(s) back
const [updatedUser] = await db
  .update(users)
  .set({ name: 'Updated Name' })
  .where(eq(users.id, 1))
  .returning();

console.log(updatedUser);  // Full updated user object


// Return specific columns
const [{ id, name }] = await db
  .update(users)
  .set({ name: 'New Name' })
  .where(eq(users.id, 1))
  .returning({ id: users.id, name: users.name });


// ═══════════════════════════════════════════════════════════════
//                    UPDATE MULTIPLE ROWS
// ═══════════════════════════════════════════════════════════════

// Update all matching rows
await db
  .update(users)
  .set({ isActive: false })
  .where(lt(users.lastLoginAt, new Date('2023-01-01')));
// SQL: UPDATE users SET is_active = false WHERE last_login_at < '2023-01-01'


// Update based on multiple conditions
await db
  .update(users)
  .set({ role: 'inactive' })
  .where(and(
    eq(users.isActive, false),
    lt(users.createdAt, new Date('2022-01-01'))
  ));


// ═══════════════════════════════════════════════════════════════
//                    INCREMENT / DECREMENT
// ═══════════════════════════════════════════════════════════════

// Increment a value
await db
  .update(posts)
  .set({
    viewCount: sql`${posts.viewCount} + 1`
  })
  .where(eq(posts.id, 1));
// SQL: UPDATE posts SET view_count = view_count + 1 WHERE id = 1


// Decrement with floor at 0
await db
  .update(products)
  .set({
    stock: sql`GREATEST(${products.stock} - 1, 0)`
  })
  .where(eq(products.id, 1));


// ═══════════════════════════════════════════════════════════════
//                    CONDITIONAL UPDATE
// ═══════════════════════════════════════════════════════════════

// Update with SQL CASE expression
await db
  .update(users)
  .set({
    role: sql`CASE
      WHEN ${users.postCount} > 100 THEN 'power_user'
      WHEN ${users.postCount} > 10 THEN 'active_user'
      ELSE 'new_user'
    END`
  });
```

### DELETE Operations

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BASIC DELETE
// ═══════════════════════════════════════════════════════════════

// Delete single row
await db
  .delete(users)
  .where(eq(users.id, 1));
// SQL: DELETE FROM users WHERE id = 1


// Delete with multiple conditions
await db
  .delete(users)
  .where(and(
    eq(users.isActive, false),
    lt(users.createdAt, new Date('2022-01-01'))
  ));


// ═══════════════════════════════════════════════════════════════
//                    DELETE WITH RETURNING
// ═══════════════════════════════════════════════════════════════

// Get deleted row(s) back
const [deletedUser] = await db
  .delete(users)
  .where(eq(users.id, 1))
  .returning();

console.log(`Deleted user: ${deletedUser.email}`);


// Delete and return specific columns
const deleted = await db
  .delete(users)
  .where(eq(users.isActive, false))
  .returning({ id: users.id, email: users.email });

console.log(`Deleted ${deleted.length} users`);


// ═══════════════════════════════════════════════════════════════
//                    DELETE ALL
// ═══════════════════════════════════════════════════════════════

// Delete all rows (be careful!)
await db.delete(users);
// SQL: DELETE FROM users


// ═══════════════════════════════════════════════════════════════
//                    SOFT DELETE PATTERN
// ═══════════════════════════════════════════════════════════════

// Instead of deleting, mark as deleted
await db
  .update(users)
  .set({
    deletedAt: new Date(),
    isActive: false
  })
  .where(eq(users.id, 1));

// Query excludes soft-deleted records
const activeUsers = await db
  .select()
  .from(users)
  .where(isNull(users.deletedAt));
```

### Query Chaining Pattern

```typescript
// ═══════════════════════════════════════════════════════════════
//                    COMPLETE QUERY EXAMPLE
// ═══════════════════════════════════════════════════════════════

// Complex query with all clauses
const result = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    postCount: sql<number>`count(${posts.id})`
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(and(
    eq(users.isActive, true),
    gt(users.createdAt, new Date('2023-01-01'))
  ))
  .groupBy(users.id, users.name, users.email)
  .having(gt(sql`count(${posts.id})`, 5))
  .orderBy(desc(sql`count(${posts.id})`))
  .limit(10)
  .offset(0);

// SQL equivalent:
// SELECT id, name, email, count(posts.id)
// FROM users
// LEFT JOIN posts ON users.id = posts.author_id
// WHERE users.is_active = true AND users.created_at > '2023-01-01'
// GROUP BY users.id, users.name, users.email
// HAVING count(posts.id) > 5
// ORDER BY count(posts.id) DESC
// LIMIT 10 OFFSET 0
```

---

## 7. Where Clauses and Operators

### Comparison Operators

```typescript
import {
  eq,           // Equal
  ne,           // Not equal
  gt,           // Greater than
  gte,          // Greater than or equal
  lt,           // Less than
  lte,          // Less than or equal
  isNull,       // IS NULL
  isNotNull,    // IS NOT NULL
  like,         // LIKE pattern
  ilike,        // ILIKE (case-insensitive, PostgreSQL)
  notLike,      // NOT LIKE
  notIlike,     // NOT ILIKE
  inArray,      // IN (...)
  notInArray,   // NOT IN (...)
  between,      // BETWEEN
  notBetween,   // NOT BETWEEN
  exists,       // EXISTS
  notExists,    // NOT EXISTS
  and,          // AND
  or,           // OR
  not,          // NOT
  sql           // Raw SQL
} from 'drizzle-orm';


// ═══════════════════════════════════════════════════════════════
//                    EQUALITY OPERATORS
// ═══════════════════════════════════════════════════════════════

// Equal to
const admins = await db
  .select()
  .from(users)
  .where(eq(users.role, 'admin'));
// SQL: WHERE role = 'admin'


// Not equal to
const nonAdmins = await db
  .select()
  .from(users)
  .where(ne(users.role, 'admin'));
// SQL: WHERE role != 'admin'


// ═══════════════════════════════════════════════════════════════
//                    COMPARISON OPERATORS
// ═══════════════════════════════════════════════════════════════

// Greater than
const experiencedUsers = await db
  .select()
  .from(users)
  .where(gt(users.postCount, 100));
// SQL: WHERE post_count > 100


// Greater than or equal
const adults = await db
  .select()
  .from(users)
  .where(gte(users.age, 18));
// SQL: WHERE age >= 18


// Less than
const newUsers = await db
  .select()
  .from(users)
  .where(lt(users.postCount, 10));
// SQL: WHERE post_count < 10


// Less than or equal
const recentPosts = await db
  .select()
  .from(posts)
  .where(lte(posts.createdAt, new Date()));
// SQL: WHERE created_at <= NOW()


// ═══════════════════════════════════════════════════════════════
//                    NULL CHECKS
// ═══════════════════════════════════════════════════════════════

// Is null
const usersWithoutName = await db
  .select()
  .from(users)
  .where(isNull(users.name));
// SQL: WHERE name IS NULL


// Is not null
const usersWithName = await db
  .select()
  .from(users)
  .where(isNotNull(users.name));
// SQL: WHERE name IS NOT NULL


// ═══════════════════════════════════════════════════════════════
//                    PATTERN MATCHING
// ═══════════════════════════════════════════════════════════════

// LIKE (case-sensitive)
const gmailUsers = await db
  .select()
  .from(users)
  .where(like(users.email, '%@gmail.com'));
// SQL: WHERE email LIKE '%@gmail.com'


// ILIKE (case-insensitive, PostgreSQL only)
const johnUsers = await db
  .select()
  .from(users)
  .where(ilike(users.name, '%john%'));
// SQL: WHERE name ILIKE '%john%'


// Pattern matching examples
// Starts with
.where(like(users.name, 'John%'))           // Starts with 'John'
.where(like(users.email, '%@example.com'))   // Ends with '@example.com'
.where(like(users.name, '%John%'))           // Contains 'John'
.where(like(users.code, 'A_B'))              // A, any char, B (e.g., 'A1B', 'AXB')


// NOT LIKE
const nonGmailUsers = await db
  .select()
  .from(users)
  .where(notLike(users.email, '%@gmail.com'));


// ═══════════════════════════════════════════════════════════════
//                    IN / NOT IN
// ═══════════════════════════════════════════════════════════════

// In array
const specificUsers = await db
  .select()
  .from(users)
  .where(inArray(users.id, [1, 2, 3, 4, 5]));
// SQL: WHERE id IN (1, 2, 3, 4, 5)


// In array with strings
const staffUsers = await db
  .select()
  .from(users)
  .where(inArray(users.role, ['admin', 'moderator', 'support']));
// SQL: WHERE role IN ('admin', 'moderator', 'support')


// Not in array
const regularUsers = await db
  .select()
  .from(users)
  .where(notInArray(users.role, ['admin', 'moderator']));
// SQL: WHERE role NOT IN ('admin', 'moderator')


// Dynamic array from variable
const selectedIds = [1, 5, 10, 15];
const selectedUsers = await db
  .select()
  .from(users)
  .where(inArray(users.id, selectedIds));


// ═══════════════════════════════════════════════════════════════
//                    BETWEEN
// ═══════════════════════════════════════════════════════════════

// Between numbers
const middleAgedUsers = await db
  .select()
  .from(users)
  .where(between(users.age, 30, 50));
// SQL: WHERE age BETWEEN 30 AND 50


// Between dates
const thisMonthPosts = await db
  .select()
  .from(posts)
  .where(between(
    posts.createdAt,
    new Date('2024-01-01'),
    new Date('2024-01-31')
  ));
// SQL: WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'


// Not between
const outsideRange = await db
  .select()
  .from(products)
  .where(notBetween(products.price, 100, 500));
// SQL: WHERE price NOT BETWEEN 100 AND 500


// ═══════════════════════════════════════════════════════════════
//                    LOGICAL OPERATORS
// ═══════════════════════════════════════════════════════════════

// AND - all conditions must be true
const activeAdmins = await db
  .select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    eq(users.isActive, true),
    isNotNull(users.lastLoginAt)
  ));
// SQL: WHERE role = 'admin' AND is_active = true AND last_login_at IS NOT NULL


// OR - any condition can be true
const specialUsers = await db
  .select()
  .from(users)
  .where(or(
    eq(users.role, 'admin'),
    eq(users.role, 'moderator'),
    gt(users.postCount, 1000)
  ));
// SQL: WHERE role = 'admin' OR role = 'moderator' OR post_count > 1000


// NOT - negate a condition
const notAdmin = await db
  .select()
  .from(users)
  .where(not(eq(users.role, 'admin')));
// SQL: WHERE NOT (role = 'admin')


// Complex nested conditions
const complexQuery = await db
  .select()
  .from(users)
  .where(and(
    eq(users.isActive, true),
    or(
      and(
        eq(users.role, 'admin'),
        gte(users.postCount, 10)
      ),
      and(
        eq(users.role, 'user'),
        gte(users.postCount, 100)
      )
    )
  ));
// SQL: WHERE is_active = true AND (
//        (role = 'admin' AND post_count >= 10) OR
//        (role = 'user' AND post_count >= 100)
//      )


// ═══════════════════════════════════════════════════════════════
//                    SUBQUERIES
// ═══════════════════════════════════════════════════════════════

// Exists subquery
const usersWithPosts = await db
  .select()
  .from(users)
  .where(
    exists(
      db.select().from(posts).where(eq(posts.authorId, users.id))
    )
  );
// SQL: WHERE EXISTS (SELECT 1 FROM posts WHERE posts.author_id = users.id)


// Not exists
const usersWithoutPosts = await db
  .select()
  .from(users)
  .where(
    notExists(
      db.select().from(posts).where(eq(posts.authorId, users.id))
    )
  );


// In with subquery
const activeAuthors = await db
  .select()
  .from(users)
  .where(
    inArray(
      users.id,
      db.select({ id: posts.authorId })
        .from(posts)
        .where(eq(posts.status, 'published'))
    )
  );
// SQL: WHERE id IN (SELECT author_id FROM posts WHERE status = 'published')


// ═══════════════════════════════════════════════════════════════
//                    RAW SQL CONDITIONS
// ═══════════════════════════════════════════════════════════════

// When operators aren't enough, use raw SQL
const customCondition = await db
  .select()
  .from(users)
  .where(sql`${users.email} ~* '[a-z]+@example\\.com'`);
// SQL: WHERE email ~* '[a-z]+@example\.com'


// Raw SQL with parameters
const threshold = 100;
const highActivity = await db
  .select()
  .from(users)
  .where(sql`${users.postCount} + ${users.commentCount} > ${threshold}`);
// SQL: WHERE post_count + comment_count > 100


// Full-text search (PostgreSQL)
const searchResults = await db
  .select()
  .from(posts)
  .where(sql`to_tsvector('english', ${posts.content}) @@ to_tsquery('english', ${searchTerm})`);
```

### Dynamic Where Clauses

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BUILDING DYNAMIC QUERIES
// ═══════════════════════════════════════════════════════════════

interface UserFilters {
  role?: string;
  isActive?: boolean;
  minAge?: number;
  maxAge?: number;
  search?: string;
}

async function findUsers(filters: UserFilters) {
  const conditions = [];

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(users.isActive, filters.isActive));
  }

  if (filters.minAge) {
    conditions.push(gte(users.age, filters.minAge));
  }

  if (filters.maxAge) {
    conditions.push(lte(users.age, filters.maxAge));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`)
      )
    );
  }

  // If no conditions, return all users
  const whereClause = conditions.length > 0
    ? and(...conditions)
    : undefined;

  return db
    .select()
    .from(users)
    .where(whereClause);
}

// Usage
const results = await findUsers({
  role: 'admin',
  isActive: true,
  minAge: 21
});
```

---

## 8. Relations

### Defining Relations

Relations in Drizzle are defined separately from tables, enabling the relational query API.

```typescript
// src/db/schema.ts
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
//                    TABLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name')
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  userId: integer('user_id').references(() => users.id).notNull().unique()
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id).notNull()
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull()
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique()
});

// Junction table for many-to-many
export const postTags = pgTable('post_tags', {
  postId: integer('post_id').references(() => posts.id).notNull(),
  tagId: integer('tag_id').references(() => tags.id).notNull()
});


// ═══════════════════════════════════════════════════════════════
//                    RELATION DEFINITIONS
// ═══════════════════════════════════════════════════════════════

// One-to-One: User <-> Profile
export const usersRelations = relations(users, ({ one, many }) => ({
  // One user has one profile
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId]
  }),

  // One user has many posts
  posts: many(posts),

  // One user has many comments
  comments: many(comments)
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  // One profile belongs to one user
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id]
  })
}));

// One-to-Many: User -> Posts
export const postsRelations = relations(posts, ({ one, many }) => ({
  // Each post belongs to one author (user)
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),

  // Each post has many comments
  comments: many(comments),

  // Each post has many postTags (junction)
  postTags: many(postTags)
}));

// Comments relations
export const commentsRelations = relations(comments, ({ one }) => ({
  // Each comment belongs to one post
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id]
  }),

  // Each comment belongs to one author
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  })
}));

// Many-to-Many: Posts <-> Tags (through postTags)
export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags)
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id]
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id]
  })
}));
```

### Relational Query API

The relational query API (like Prisma's `include`) requires passing schema to drizzle:

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// IMPORTANT: Pass schema for relational queries
export const db = drizzle(pool, { schema });
```

### Querying with Relations

```typescript
// ═══════════════════════════════════════════════════════════════
//                    FIND MANY WITH RELATIONS
// ═══════════════════════════════════════════════════════════════

// Get users with their profiles
const usersWithProfiles = await db.query.users.findMany({
  with: {
    profile: true
  }
});
// Returns: [{ id, email, name, profile: { id, bio, avatarUrl, userId } }]


// Get users with posts and comments
const usersWithContent = await db.query.users.findMany({
  with: {
    posts: true,
    comments: true
  }
});


// ═══════════════════════════════════════════════════════════════
//                    NESTED RELATIONS
// ═══════════════════════════════════════════════════════════════

// Get posts with author and comments (with comment authors)
const postsWithDetails = await db.query.posts.findMany({
  with: {
    author: true,
    comments: {
      with: {
        author: true
      }
    }
  }
});
// Returns: [{
//   id, title, content,
//   author: { id, email, name },
//   comments: [{
//     id, content,
//     author: { id, email, name }
//   }]
// }]


// ═══════════════════════════════════════════════════════════════
//                    SELECT SPECIFIC COLUMNS
// ═══════════════════════════════════════════════════════════════

// Only select specific columns
const usersPartial = await db.query.users.findMany({
  columns: {
    id: true,
    name: true
    // email excluded
  },
  with: {
    profile: {
      columns: {
        bio: true
        // avatarUrl, userId excluded
      }
    }
  }
});


// Exclude specific columns
const usersExcluding = await db.query.users.findMany({
  columns: {
    password: false  // Exclude password
  }
});


// ═══════════════════════════════════════════════════════════════
//                    FILTERING RELATIONS
// ═══════════════════════════════════════════════════════════════

// Filter the parent
const activeUsers = await db.query.users.findMany({
  where: eq(users.isActive, true),
  with: {
    posts: true
  }
});


// Filter related records
const usersWithPublishedPosts = await db.query.users.findMany({
  with: {
    posts: {
      where: eq(posts.status, 'published'),
      orderBy: desc(posts.createdAt),
      limit: 5
    }
  }
});


// ═══════════════════════════════════════════════════════════════
//                    ORDERING RELATIONS
// ═══════════════════════════════════════════════════════════════

const usersOrdered = await db.query.users.findMany({
  orderBy: desc(users.createdAt),
  with: {
    posts: {
      orderBy: [desc(posts.createdAt), asc(posts.title)]
    }
  }
});


// ═══════════════════════════════════════════════════════════════
//                    FIND FIRST
// ═══════════════════════════════════════════════════════════════

// Get single user with relations
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    profile: true,
    posts: {
      limit: 10,
      orderBy: desc(posts.createdAt),
      with: {
        comments: {
          limit: 5
        }
      }
    }
  }
});


// ═══════════════════════════════════════════════════════════════
//                    MANY-TO-MANY THROUGH JUNCTION
// ═══════════════════════════════════════════════════════════════

// Get posts with their tags
const postsWithTags = await db.query.posts.findMany({
  with: {
    postTags: {
      with: {
        tag: true
      }
    }
  }
});

// Map to cleaner structure
const postsWithTagsCleaned = postsWithTags.map(post => ({
  ...post,
  tags: post.postTags.map(pt => pt.tag)
}));


// ═══════════════════════════════════════════════════════════════
//                    EXTRAS (Computed Fields)
// ═══════════════════════════════════════════════════════════════

const usersWithExtras = await db.query.users.findMany({
  extras: {
    // Add computed field
    fullName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('full_name')
  },
  with: {
    posts: true
  }
});
```

### Comparison: Relations vs Joins

```typescript
// ═══════════════════════════════════════════════════════════════
//  RELATIONAL QUERY (like Prisma include) - Separate queries
// ═══════════════════════════════════════════════════════════════

// Returns nested structure, multiple queries executed
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true
  }
});
// Returns: [{ id, email, posts: [{ id, title }, ...] }]


// ═══════════════════════════════════════════════════════════════
//  JOINS (SQL-like) - Single query, flat result
// ═══════════════════════════════════════════════════════════════

// Returns flat structure, single query
const usersJoinedPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));
// Returns: [{ userId, userName, postId, postTitle }, ...]


// Use relational queries when:
// - You want nested object structure
// - You're fetching many related records
// - You want Prisma-like syntax

// Use joins when:
// - You need aggregations
// - You want flat result
// - You need complex join conditions
// - Performance is critical (single query)
```

---

## 9. Joins

### Join Types

```typescript
// ═══════════════════════════════════════════════════════════════
//                    INNER JOIN
// ═══════════════════════════════════════════════════════════════

// Only returns rows that have matches in both tables
const usersWithPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title
  })
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId));

// SQL: SELECT users.id, users.name, posts.id, posts.title
//      FROM users
//      INNER JOIN posts ON users.id = posts.author_id

// Users without posts are NOT included


// ═══════════════════════════════════════════════════════════════
//                    LEFT JOIN
// ═══════════════════════════════════════════════════════════════

// Returns all rows from left table, matched rows from right (or NULL)
const allUsersWithPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// SQL: SELECT ... FROM users LEFT JOIN posts ON users.id = posts.author_id

// Users without posts ARE included (postId and postTitle will be null)


// ═══════════════════════════════════════════════════════════════
//                    RIGHT JOIN
// ═══════════════════════════════════════════════════════════════

// Returns all rows from right table, matched rows from left (or NULL)
const allPostsWithUsers = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title
  })
  .from(users)
  .rightJoin(posts, eq(users.id, posts.authorId));

// SQL: SELECT ... FROM users RIGHT JOIN posts ON users.id = posts.author_id


// ═══════════════════════════════════════════════════════════════
//                    FULL OUTER JOIN
// ═══════════════════════════════════════════════════════════════

// Returns all rows from both tables
const fullJoin = await db
  .select()
  .from(users)
  .fullJoin(posts, eq(users.id, posts.authorId));

// SQL: SELECT ... FROM users FULL OUTER JOIN posts ON users.id = posts.author_id
```

### Multiple Joins

```typescript
// ═══════════════════════════════════════════════════════════════
//                    CHAINING MULTIPLE JOINS
// ═══════════════════════════════════════════════════════════════

// Join users with posts and comments
const fullData = await db
  .select({
    userId: users.id,
    userName: users.name,
    postId: posts.id,
    postTitle: posts.title,
    commentId: comments.id,
    commentContent: comments.content
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .leftJoin(comments, eq(posts.id, comments.postId));

// SQL:
// SELECT ...
// FROM users
// LEFT JOIN posts ON users.id = posts.author_id
// LEFT JOIN comments ON posts.id = comments.post_id


// ═══════════════════════════════════════════════════════════════
//                    SELF JOIN
// ═══════════════════════════════════════════════════════════════

// For hierarchical data (e.g., employees with managers)
const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name'),
  managerId: integer('manager_id').references((): any => employees.id)
});

// Alias for self-join
import { alias } from 'drizzle-orm/pg-core';

const managers = alias(employees, 'managers');

const employeesWithManagers = await db
  .select({
    employeeId: employees.id,
    employeeName: employees.name,
    managerId: managers.id,
    managerName: managers.name
  })
  .from(employees)
  .leftJoin(managers, eq(employees.managerId, managers.id));


// ═══════════════════════════════════════════════════════════════
//                    MANY-TO-MANY JOIN
// ═══════════════════════════════════════════════════════════════

// Posts with tags through junction table
const postsWithTags = await db
  .select({
    postId: posts.id,
    postTitle: posts.title,
    tagId: tags.id,
    tagName: tags.name
  })
  .from(posts)
  .innerJoin(postTags, eq(posts.id, postTags.postId))
  .innerJoin(tags, eq(postTags.tagId, tags.id));


// ═══════════════════════════════════════════════════════════════
//                    JOIN WITH AGGREGATION
// ═══════════════════════════════════════════════════════════════

// Count posts per user
const userPostCounts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postCount: sql<number>`count(${posts.id})`
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id, users.name)
  .orderBy(desc(sql`count(${posts.id})`));


// ═══════════════════════════════════════════════════════════════
//                    COMPLEX JOIN CONDITIONS
// ═══════════════════════════════════════════════════════════════

// Join with multiple conditions
const activeUserPosts = await db
  .select()
  .from(users)
  .innerJoin(
    posts,
    and(
      eq(users.id, posts.authorId),
      eq(posts.status, 'published'),
      gt(posts.createdAt, new Date('2024-01-01'))
    )
  );

// SQL:
// SELECT * FROM users
// INNER JOIN posts ON
//   users.id = posts.author_id
//   AND posts.status = 'published'
//   AND posts.created_at > '2024-01-01'


// ═══════════════════════════════════════════════════════════════
//                    JOIN WITH SUBQUERY
// ═══════════════════════════════════════════════════════════════

// Join with a subquery
const recentPostsSubquery = db
  .select()
  .from(posts)
  .where(gt(posts.createdAt, new Date('2024-01-01')))
  .as('recent_posts');

const usersWithRecentPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postTitle: recentPostsSubquery.title
  })
  .from(users)
  .innerJoin(recentPostsSubquery, eq(users.id, recentPostsSubquery.authorId));
```

### Practical Join Examples

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BLOG POST FEED
// ═══════════════════════════════════════════════════════════════

const blogFeed = await db
  .select({
    id: posts.id,
    title: posts.title,
    excerpt: posts.excerpt,
    publishedAt: posts.publishedAt,
    authorName: users.name,
    authorEmail: users.email,
    commentCount: sql<number>`count(distinct ${comments.id})`,
    viewCount: posts.viewCount
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .leftJoin(comments, eq(posts.id, comments.postId))
  .where(eq(posts.status, 'published'))
  .groupBy(posts.id, users.id)
  .orderBy(desc(posts.publishedAt))
  .limit(20);


// ═══════════════════════════════════════════════════════════════
//                    USER DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════

const userId = 1;

const dashboardData = await db
  .select({
    userId: users.id,
    userName: users.name,
    totalPosts: sql<number>`count(distinct ${posts.id})`,
    totalComments: sql<number>`count(distinct ${comments.id})`,
    publishedPosts: sql<number>`count(distinct case when ${posts.status} = 'published' then ${posts.id} end)`,
    totalViews: sql<number>`sum(${posts.viewCount})`
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .leftJoin(comments, eq(users.id, comments.authorId))
  .where(eq(users.id, userId))
  .groupBy(users.id);


// ═══════════════════════════════════════════════════════════════
//                    SEARCH WITH RELEVANCE
// ═══════════════════════════════════════════════════════════════

const searchTerm = 'javascript';

const searchResults = await db
  .select({
    id: posts.id,
    title: posts.title,
    excerpt: posts.excerpt,
    authorName: users.name,
    relevance: sql<number>`
      ts_rank(
        to_tsvector('english', ${posts.title} || ' ' || ${posts.content}),
        plainto_tsquery('english', ${searchTerm})
      )
    `
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(sql`
    to_tsvector('english', ${posts.title} || ' ' || ${posts.content})
    @@ plainto_tsquery('english', ${searchTerm})
  `)
  .orderBy(desc(sql`ts_rank(...)`))
  .limit(20);
```

---

## 10. Transactions

### Basic Transactions

```typescript
// ═══════════════════════════════════════════════════════════════
//                    BASIC TRANSACTION
// ═══════════════════════════════════════════════════════════════

// Transaction with automatic commit/rollback
const result = await db.transaction(async (tx) => {
  // All operations use 'tx' instead of 'db'

  const [newUser] = await tx
    .insert(users)
    .values({
      email: 'new@example.com',
      name: 'New User'
    })
    .returning();

  await tx
    .insert(profiles)
    .values({
      userId: newUser.id,
      bio: 'Hello, I am new!'
    });

  await tx
    .insert(posts)
    .values({
      title: 'My First Post',
      content: 'Hello World!',
      authorId: newUser.id
    });

  // Return value from transaction
  return newUser;
});

// If any operation fails, all are rolled back
console.log('Created user:', result.id);


// ═══════════════════════════════════════════════════════════════
//                    TRANSACTION WITH ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

try {
  await db.transaction(async (tx) => {
    // Deduct from sender
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} - 100` })
      .where(eq(accounts.id, senderId));

    // Add to receiver
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + 100` })
      .where(eq(accounts.id, receiverId));

    // Verify sender has sufficient balance
    const [sender] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, senderId));

    if (sender.balance < 0) {
      throw new Error('Insufficient balance');
    }
  });

  console.log('Transfer successful');
} catch (error) {
  console.error('Transfer failed, rolled back:', error.message);
}


// ═══════════════════════════════════════════════════════════════
//                    MANUAL ROLLBACK
// ═══════════════════════════════════════════════════════════════

await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email: 'test@example.com', name: 'Test' })
    .returning();

  const validated = await validateUserExternally(user);

  if (!validated) {
    // Rollback by calling tx.rollback()
    tx.rollback();
    return;  // This return is never reached
  }

  // Continue if validation passed
  await tx
    .insert(profiles)
    .values({ userId: user.id, bio: 'Validated user' });
});
```

### Nested Transactions (Savepoints)

```typescript
// ═══════════════════════════════════════════════════════════════
//                    NESTED TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

await db.transaction(async (tx) => {
  // Outer transaction
  await tx.insert(users).values({ email: 'outer@example.com', name: 'Outer' });

  try {
    // Nested transaction (creates savepoint)
    await tx.transaction(async (tx2) => {
      await tx2.insert(users).values({ email: 'inner@example.com', name: 'Inner' });

      // This will fail (duplicate email)
      await tx2.insert(users).values({ email: 'outer@example.com', name: 'Duplicate' });
    });
  } catch (error) {
    // Inner transaction rolled back to savepoint
    // Outer transaction continues
    console.log('Inner transaction failed:', error.message);
  }

  // This still executes
  await tx.insert(posts).values({ title: 'Post', authorId: 1 });
});
```

### Transaction Isolation Levels

```typescript
// ═══════════════════════════════════════════════════════════════
//                    ISOLATION LEVELS (PostgreSQL)
// ═══════════════════════════════════════════════════════════════

// Default: Read Committed
await db.transaction(async (tx) => {
  // ... operations
});

// With specific isolation level
await db.transaction(async (tx) => {
  // ... operations
}, {
  isolationLevel: 'serializable'
});

// Available isolation levels:
// - 'read uncommitted'
// - 'read committed' (default)
// - 'repeatable read'
// - 'serializable'

// Example: Prevent concurrent modifications
await db.transaction(async (tx) => {
  const [item] = await tx
    .select()
    .from(inventory)
    .where(eq(inventory.id, productId))
    .for('update');  // Lock the row

  if (item.quantity < requestedQuantity) {
    throw new Error('Insufficient stock');
  }

  await tx
    .update(inventory)
    .set({ quantity: sql`${inventory.quantity} - ${requestedQuantity}` })
    .where(eq(inventory.id, productId));
}, {
  isolationLevel: 'serializable'
});
```

### Practical Transaction Patterns

```typescript
// ═══════════════════════════════════════════════════════════════
//                    CREATE USER WITH RELATED DATA
// ═══════════════════════════════════════════════════════════════

async function createUserWithProfile(userData: NewUser, profileData: NewProfile) {
  return db.transaction(async (tx) => {
    // Create user
    const [user] = await tx
      .insert(users)
      .values(userData)
      .returning();

    // Create profile linked to user
    const [profile] = await tx
      .insert(profiles)
      .values({ ...profileData, userId: user.id })
      .returning();

    // Create default settings
    await tx
      .insert(userSettings)
      .values({
        userId: user.id,
        theme: 'light',
        notifications: true
      });

    return { user, profile };
  });
}


// ═══════════════════════════════════════════════════════════════
//                    BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════

async function importUsers(userDataList: NewUser[]) {
  return db.transaction(async (tx) => {
    const results = [];

    for (const userData of userDataList) {
      try {
        const [user] = await tx
          .insert(users)
          .values(userData)
          .returning();
        results.push({ success: true, user });
      } catch (error) {
        // Log but continue (or throw to rollback all)
        results.push({ success: false, error: error.message, data: userData });
      }
    }

    // Check if too many failures
    const failures = results.filter(r => !r.success);
    if (failures.length > userDataList.length * 0.1) {
      throw new Error(`Too many failures: ${failures.length}/${userDataList.length}`);
    }

    return results;
  });
}


// ═══════════════════════════════════════════════════════════════
//                    RETRY PATTERN
// ═══════════════════════════════════════════════════════════════

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Check if retryable error (e.g., serialization failure)
      if (error.code === '40001') { // PostgreSQL serialization failure
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }

      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const result = await withRetry(() =>
  db.transaction(async (tx) => {
    // Critical operation that might face contention
    const [item] = await tx
      .select()
      .from(inventory)
      .where(eq(inventory.id, productId));

    await tx
      .update(inventory)
      .set({ quantity: item.quantity - 1 })
      .where(eq(inventory.id, productId));

    return item;
  }, { isolationLevel: 'serializable' })
);
```

---

## 11. Migrations with Drizzle Kit

### Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Schema location
  schema: './src/db/schema.ts',

  // Migration output directory
  out: './drizzle/migrations',

  // Database dialect
  dialect: 'postgresql',

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },

  // Optional settings
  verbose: true,
  strict: true
});
```

### Drizzle Kit Commands

```bash
# ═══════════════════════════════════════════════════════════════
#                    GENERATE MIGRATIONS
# ═══════════════════════════════════════════════════════════════

# Generate migration files from schema changes
npx drizzle-kit generate

# Output:
# drizzle/migrations/
# ├── 0000_initial.sql
# ├── 0001_add_posts_table.sql
# └── meta/
#     ├── _journal.json
#     └── 0000_snapshot.json


# ═══════════════════════════════════════════════════════════════
#                    RUN MIGRATIONS
# ═══════════════════════════════════════════════════════════════

# Apply migrations to database
npx drizzle-kit migrate

# Or run migrations programmatically (see below)


# ═══════════════════════════════════════════════════════════════
#                    PUSH (Like Prisma db push)
# ═══════════════════════════════════════════════════════════════

# Push schema directly to database (no migration files)
# Good for prototyping, NOT for production
npx drizzle-kit push

# This syncs your schema to the database without creating migration files


# ═══════════════════════════════════════════════════════════════
#                    STUDIO (Database GUI)
# ═══════════════════════════════════════════════════════════════

# Open Drizzle Studio (web-based database browser)
npx drizzle-kit studio

# Opens at https://local.drizzle.studio


# ═══════════════════════════════════════════════════════════════
#                    OTHER COMMANDS
# ═══════════════════════════════════════════════════════════════

# Check migration status
npx drizzle-kit check

# Pull schema from existing database (introspection)
npx drizzle-kit introspect

# Drop all tables and migrations (dangerous!)
npx drizzle-kit drop
```

### Generated Migration Files

```sql
-- drizzle/migrations/0000_initial.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" text,
  "role" "user_role" DEFAULT 'user' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text,
  "status" "post_status" DEFAULT 'draft' NOT NULL,
  "author_id" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id")
    REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "post_author_idx" ON "posts" ("author_id");

-- drizzle/migrations/0001_add_comments.sql
CREATE TABLE IF NOT EXISTS "comments" (
  "id" serial PRIMARY KEY NOT NULL,
  "content" text NOT NULL,
  "post_id" integer NOT NULL,
  "author_id" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id")
    REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id")
    REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);
```

### Running Migrations Programmatically

```typescript
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const db = drizzle(pool);

  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: './drizzle/migrations'
  });

  console.log('Migrations complete!');

  await pool.end();
}

runMigrations().catch(console.error);


// For different database drivers:

// PostgreSQL with postgres.js
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql);
await migrate(db, { migrationsFolder: './drizzle/migrations' });
await sql.end();


// MySQL with mysql2
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);
await migrate(db, { migrationsFolder: './drizzle/migrations' });
await connection.end();


// SQLite with better-sqlite3
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle/migrations' });
```

### Custom Migration Scripts

```typescript
// drizzle/migrations/custom/seed.ts
import { db } from '../../src/db';
import { users, posts } from '../../src/db/schema';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    })
    .returning();

  // Create sample posts
  await db.insert(posts).values([
    { title: 'Welcome Post', content: 'Hello World!', authorId: admin.id, status: 'published' },
    { title: 'Draft Post', content: 'Work in progress...', authorId: admin.id, status: 'draft' }
  ]);

  console.log('Seeding complete!');
}

seed().catch(console.error);
```

### Migration Best Practices

```typescript
// ═══════════════════════════════════════════════════════════════
//                    WORKFLOW
// ═══════════════════════════════════════════════════════════════

// 1. Development: Use push for rapid iteration
// npx drizzle-kit push

// 2. Before commit: Generate migration
// npx drizzle-kit generate

// 3. Review the generated SQL file

// 4. Commit migration files to version control

// 5. Production: Run migrations
// npx drizzle-kit migrate


// ═══════════════════════════════════════════════════════════════
//                    CI/CD INTEGRATION
// ═══════════════════════════════════════════════════════════════

// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:migrate:prod": "NODE_ENV=production tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx drizzle/migrations/custom/seed.ts"
  }
}


// GitHub Actions example
/*
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run db:migrate:prod
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - run: npm run build
      - run: npm run deploy
*/
```

---

## 12. When to Use Drizzle vs Prisma

### Decision Matrix

```
┌────────────────────────────┬──────────────────────┬──────────────────────┐
│ Factor                     │ Choose Drizzle       │ Choose Prisma        │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Bundle Size                │ ✅ Critical          │ Not a concern        │
│ Cold Start Time            │ ✅ Serverless focus  │ Traditional servers  │
│ Edge Runtime               │ ✅ Required          │ Use Prisma Accelerate│
│ SQL Experience             │ ✅ Strong SQL skills │ Less SQL experience  │
│ Schema Language            │ ✅ TypeScript only   │ Like Prisma DSL      │
│ Tooling / GUI              │ Basic needs          │ ✅ Prisma Studio     │
│ Ecosystem Maturity         │ Newer (2023+)        │ ✅ Established       │
│ Complex Relations          │ Manual joins         │ ✅ Automatic handling│
│ Learning Resources         │ Growing              │ ✅ Extensive docs    │
│ Migration Safety           │ Readable SQL         │ ✅ More guardrails   │
└────────────────────────────┴──────────────────────┴──────────────────────┘
```

### Use Drizzle When

```typescript
// ═══════════════════════════════════════════════════════════════
//                    1. SERVERLESS / EDGE
// ═══════════════════════════════════════════════════════════════

// Cloudflare Workers, Vercel Edge, Deno Deploy
// Drizzle's small size and no binary makes it perfect

// Cloudflare Worker example
import { drizzle } from 'drizzle-orm/d1';

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB);
    // Fast cold starts, small bundle
    return Response.json(await db.select().from(users));
  }
};


// ═══════════════════════════════════════════════════════════════
//                    2. SQL-HEAVY APPLICATIONS
// ═══════════════════════════════════════════════════════════════

// Complex analytics, reporting, data warehousing
// When you need fine-grained SQL control

const complexAnalytics = await db
  .select({
    period: sql`date_trunc('month', ${orders.createdAt})`,
    revenue: sql<number>`sum(${orders.total})`,
    orderCount: sql<number>`count(*)`,
    avgOrderValue: sql<number>`avg(${orders.total})`,
    topProduct: sql`mode() WITHIN GROUP (ORDER BY ${orderItems.productId})`
  })
  .from(orders)
  .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
  .where(gte(orders.createdAt, new Date('2024-01-01')))
  .groupBy(sql`date_trunc('month', ${orders.createdAt})`)
  .having(gt(sql`sum(${orders.total})`, 10000));


// ═══════════════════════════════════════════════════════════════
//                    3. MONOREPO / SHARED SCHEMA
// ═══════════════════════════════════════════════════════════════

// Schema is just TypeScript, easy to share across packages
// packages/shared/src/db/schema.ts
export const users = pgTable('users', { /* ... */ });

// packages/api/src/index.ts
import { users } from '@myapp/shared/db/schema';

// packages/worker/src/index.ts
import { users } from '@myapp/shared/db/schema';


// ═══════════════════════════════════════════════════════════════
//                    4. MINIMAL DEPENDENCIES
// ═══════════════════════════════════════════════════════════════

// When you want to minimize node_modules size
// Drizzle: ~50KB
// No binary dependencies
// Faster npm install
```

### Use Prisma When

```typescript
// ═══════════════════════════════════════════════════════════════
//                    1. RAPID DEVELOPMENT
// ═══════════════════════════════════════════════════════════════

// Prisma's conventions speed up development
// Less boilerplate for common operations

// Prisma makes this very clean
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true
          }
        }
      }
    }
  }
});


// ═══════════════════════════════════════════════════════════════
//                    2. TEAM WITH MIXED SQL EXPERIENCE
// ═══════════════════════════════════════════════════════════════

// Prisma's abstraction helps less experienced developers
// Schema is declarative and readable
// GUI tools for data exploration


// ═══════════════════════════════════════════════════════════════
//                    3. COMPLEX RELATION HANDLING
// ═══════════════════════════════════════════════════════════════

// Prisma handles nested creates/updates automatically
const newPost = await prisma.post.create({
  data: {
    title: 'New Post',
    author: {
      connect: { id: userId }
    },
    tags: {
      create: [
        { name: 'typescript' },
        { name: 'database' }
      ]
    },
    comments: {
      create: {
        content: 'First comment!',
        author: { connect: { id: commenterId } }
      }
    }
  },
  include: {
    author: true,
    tags: true,
    comments: true
  }
});


// ═══════════════════════════════════════════════════════════════
//                    4. ESTABLISHED PROJECT
// ═══════════════════════════════════════════════════════════════

// Prisma has more ecosystem integrations
// More Stack Overflow answers
// More tutorials and courses
// Prisma Studio for data browsing
```

### Side-by-Side Comparison

```typescript
// ═══════════════════════════════════════════════════════════════
//                    SAME TASK, DIFFERENT APPROACHES
// ═══════════════════════════════════════════════════════════════

// Task: Get user by email with their published posts and comments

// --- PRISMA ---
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    posts: {
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    }
  }
});


// --- DRIZZLE (Relational Query) ---
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
  with: {
    posts: {
      where: eq(posts.status, 'published'),
      orderBy: desc(posts.createdAt),
      with: {
        comments: {
          orderBy: desc(comments.createdAt),
          limit: 5
        }
      }
    }
  }
});


// --- DRIZZLE (SQL-like with joins) ---
const userData = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'))
  .limit(1)
  .then(rows => rows[0]);

const userPosts = await db
  .select()
  .from(posts)
  .leftJoin(comments, eq(posts.id, comments.postId))
  .where(and(
    eq(posts.authorId, userData.id),
    eq(posts.status, 'published')
  ))
  .orderBy(desc(posts.createdAt));
```

### Final Recommendations

```
For NEW projects in 2024+:
├── Serverless/Edge focused → Drizzle
├── Traditional server + rapid dev → Prisma
├── SQL-heavy analytics → Drizzle
├── Team prefers TypeScript for everything → Drizzle
├── Team prefers abstraction → Prisma
└── Want both? → Start with Drizzle, it's easier to switch later

Migration path:
├── Prisma → Drizzle: Straightforward (schema conversion)
└── Drizzle → Prisma: Also straightforward (schema conversion)

Both are excellent choices. The "wrong" choice won't ruin your project.
Choose based on your team's preferences and project requirements.
```

---

## Summary

Drizzle ORM represents a new generation of TypeScript ORMs that embrace SQL rather than hiding it. Its key strengths are:

1. **Lightweight** - ~50KB bundle size vs Prisma's 2-3MB
2. **SQL-like syntax** - If you know SQL, you know Drizzle
3. **Pure TypeScript** - Schema defined in TypeScript, types inferred automatically
4. **Edge-compatible** - Works on Cloudflare Workers, Vercel Edge, Deno Deploy
5. **No code generation** - No `prisma generate` step needed

For developers comfortable with SQL who want a lightweight, type-safe database layer that doesn't abstract away the underlying SQL, Drizzle is an excellent choice. For teams that prefer more abstraction and richer tooling, Prisma remains a solid option.

The best ORM is the one that matches your team's skills and project requirements.
