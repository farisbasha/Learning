# Phase 097: Knex Query Builder - Complete Deep Dive

## Table of Contents

1. [What is Knex?](#what-is-knex)
2. [Why Use a Query Builder?](#why-use-a-query-builder)
3. [Installation and Configuration](#installation-and-configuration)
4. [Knex with TypeScript](#knex-with-typescript)
5. [CRUD Operations](#crud-operations)
6. [Where Clauses](#where-clauses)
7. [Joins](#joins)
8. [Transactions](#transactions)
9. [Migrations](#migrations)
10. [Seeds](#seeds)
11. [Raw Queries](#raw-queries)
12. [Knex vs ORM Comparison](#knex-vs-orm-comparison)

---

## What is Knex?

Knex.js is a **SQL query builder** for Node.js that sits between raw SQL and a full ORM (Object-Relational Mapper). It provides a fluent, chainable interface for building SQL queries programmatically while maintaining direct control over the SQL being generated.

### The Database Abstraction Spectrum

```
Raw SQL  <------>  Query Builder (Knex)  <------>  ORM (Sequelize/Prisma)
                          ↑
                    You are here
```

### Key Characteristics

```typescript
// Raw SQL - Full control, but string-based and error-prone
const result = await db.query('SELECT * FROM users WHERE age > 18 AND status = ?', ['active']);

// Knex Query Builder - Chainable, typed, but still SQL-focused
const result = await knex('users')
  .where('age', '>', 18)
  .andWhere('status', 'active');

// ORM - Object-oriented, but abstracts SQL completely
const result = await User.findAll({
  where: {
    age: { [Op.gt]: 18 },
    status: 'active'
  }
});
```

### What Knex Is

1. **SQL Query Builder**: Constructs SQL queries programmatically
2. **Database-Agnostic**: Same code works with PostgreSQL, MySQL, SQLite, MSSQL
3. **Migration System**: Schema versioning built-in
4. **Seed System**: Database seeding for development/testing
5. **Connection Pooling**: Manages database connections efficiently
6. **Promise-Based**: Fully async/await compatible

### What Knex Is NOT

1. **Not an ORM**: No models, no relations, no active record pattern
2. **No Schema Validation**: You manage data integrity yourself
3. **No Model Lifecycle**: No hooks like beforeCreate, afterUpdate
4. **No Auto-Relations**: You write joins manually

---

## Why Use a Query Builder?

### The Problem with Raw SQL

```typescript
// String concatenation - SQL injection vulnerable!
const query = `SELECT * FROM users WHERE name = '${userInput}'`; // DANGEROUS!

// Parameterized - safe but verbose
const query = 'SELECT u.*, p.name as profile_name FROM users u ' +
              'LEFT JOIN profiles p ON u.id = p.user_id ' +
              'WHERE u.status = $1 AND u.created_at > $2 ' +
              'ORDER BY u.created_at DESC LIMIT $3 OFFSET $4';
const result = await db.query(query, [status, date, limit, offset]);

// Complex queries become unreadable strings
// No auto-completion or type checking
// Database-specific syntax (PostgreSQL vs MySQL)
```

### The Problem with Full ORMs

```typescript
// Sequelize - abstracts too much, complex for joins
const users = await User.findAll({
  include: [{
    model: Profile,
    required: false,
    include: [{
      model: Address,
      where: { city: 'NYC' }
    }]
  }],
  where: {
    status: 'active',
    [Op.or]: [
      { role: 'admin' },
      { department: { [Op.in]: ['IT', 'HR'] } }
    ]
  }
});

// Issues:
// 1. Generates suboptimal SQL sometimes
// 2. Complex include syntax for joins
// 3. Hidden N+1 queries
// 4. Abstraction leaks when you need raw SQL
```

### Knex: The Sweet Spot

```typescript
// Clear, readable, SQL-like syntax
const users = await knex('users as u')
  .leftJoin('profiles as p', 'u.id', 'p.user_id')
  .leftJoin('addresses as a', 'p.id', 'a.profile_id')
  .where('u.status', 'active')
  .where(function() {
    this.where('u.role', 'admin')
      .orWhereIn('u.department', ['IT', 'HR']);
  })
  .where('a.city', 'NYC')
  .select('u.*', 'p.name as profile_name');

// Benefits:
// 1. You see the SQL structure
// 2. Full control over joins
// 3. Database-agnostic
// 4. Type-safe with TypeScript
// 5. Easy to debug - call .toString() to see SQL
```

### When to Use Knex

| Use Case | Knex | Full ORM |
|----------|------|----------|
| Complex reporting queries | ✅ | ❌ |
| Microservices (light footprint) | ✅ | ❌ |
| Team knows SQL well | ✅ | ❌ |
| Performance-critical queries | ✅ | ❌ |
| Rapid prototyping | ❌ | ✅ |
| Complex domain models | ❌ | ✅ |
| Need model validation | ❌ | ✅ |
| Auto-relations/eager loading | ❌ | ✅ |

---

## Installation and Configuration

### Installation

```bash
# Install Knex
npm install knex

# Install database driver (choose one)
npm install pg              # PostgreSQL
npm install mysql2          # MySQL/MariaDB
npm install better-sqlite3  # SQLite (recommended over sqlite3)
npm install tedious         # Microsoft SQL Server
npm install oracledb        # Oracle

# For TypeScript
npm install -D @types/better-sqlite3
```

### Basic Configuration

```typescript
// knexfile.ts - Knex configuration file
import type { Knex } from 'knex';
import path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'myapp_dev',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
  },

  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // For cloud databases
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
  },
};

export default config;
```

### Database Instance Setup

```typescript
// db/index.ts - Database singleton
import Knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';

// Create Knex instance
const knex = Knex(config[environment]);

// Verify connection on startup
async function testConnection(): Promise<void> {
  try {
    await knex.raw('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function closeConnection(): Promise<void> {
  await knex.destroy();
  console.log('Database connection closed');
}

export { knex, testConnection, closeConnection };
export default knex;
```

### SQLite Configuration (Development/Testing)

```typescript
// knexfile.ts - SQLite configuration
const config: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true, // Required for SQLite
  migrations: {
    directory: './migrations',
  },
};
```

### Connection URL Format

```typescript
// PostgreSQL
'postgresql://user:password@localhost:5432/database'

// MySQL
'mysql://user:password@localhost:3306/database'

// You can parse URLs
import { parse } from 'pg-connection-string';

const config: Knex.Config = {
  client: 'pg',
  connection: parse(process.env.DATABASE_URL!),
};
```

---

## Knex with TypeScript

### Type Definitions

```typescript
// types/database.ts - Define your table types
export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
}

// For inserts (omit auto-generated fields)
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

// For updates (all fields optional)
export type UserUpdate = Partial<UserInsert>;
export type PostUpdate = Partial<PostInsert>;
```

### Extending Knex Types

```typescript
// types/knex.d.ts - Extend Knex with your tables
import { Knex } from 'knex';
import { User, Post, Comment, UserInsert, PostInsert } from './database';

declare module 'knex/types/tables' {
  interface Tables {
    // This enables type-safe queries: knex('users').select()
    users: User;
    users_composite: Knex.CompositeTableType<
      User,        // Base type for SELECT
      UserInsert,  // Type for INSERT
      UserUpdate   // Type for UPDATE
    >;

    posts: Post;
    posts_composite: Knex.CompositeTableType<Post, PostInsert, PostUpdate>;

    comments: Comment;
  }
}
```

### Type-Safe Queries

```typescript
import knex from './db';
import { User, UserInsert, Post } from './types/database';

// Type-safe SELECT
async function getActiveUsers(): Promise<User[]> {
  return knex<User>('users')
    .where('is_active', true)
    .orderBy('created_at', 'desc');
}

// Type-safe SELECT with specific columns
async function getUserEmails(): Promise<Pick<User, 'id' | 'email'>[]> {
  return knex<User>('users')
    .select('id', 'email')
    .where('is_active', true);
}

// Type-safe INSERT
async function createUser(userData: UserInsert): Promise<User> {
  const [user] = await knex<User>('users')
    .insert(userData)
    .returning('*');
  return user;
}

// Type-safe UPDATE
async function updateUser(
  id: number,
  updates: Partial<UserInsert>
): Promise<User | undefined> {
  const [user] = await knex<User>('users')
    .where('id', id)
    .update({ ...updates, updated_at: new Date() })
    .returning('*');
  return user;
}

// Complex query with explicit typing
interface UserWithPostCount extends User {
  post_count: number;
}

async function getUsersWithPostCount(): Promise<UserWithPostCount[]> {
  return knex<User>('users as u')
    .leftJoin('posts as p', 'u.id', 'p.author_id')
    .select('u.*')
    .count('p.id as post_count')
    .groupBy('u.id')
    .orderBy('post_count', 'desc') as unknown as Promise<UserWithPostCount[]>;
}
```

---

## CRUD Operations

### SELECT Operations

```typescript
// Select all columns
const allUsers = await knex('users');
const allUsers2 = await knex('users').select('*');
const allUsers3 = await knex.select('*').from('users');

// Select specific columns
const userNames = await knex('users').select('id', 'name', 'email');

// Select with alias
const users = await knex('users')
  .select('id', 'email as userEmail', 'name as fullName');

// First record only
const firstUser = await knex('users')
  .where('is_active', true)
  .first(); // Returns single object or undefined

// Pluck single column (returns array of values)
const emails = await knex('users').pluck('email');
// Result: ['user1@email.com', 'user2@email.com', ...]

// Distinct values
const uniqueRoles = await knex('users').distinct('role');

// Count
const count = await knex('users').where('is_active', true).count('id');
const count2 = await knex('users').count('* as total').first();
```

### INSERT Operations

```typescript
// Insert single record
const [userId] = await knex('users')
  .insert({
    email: 'newuser@example.com',
    name: 'New User',
    password_hash: 'hashed_password',
    role: 'user',
    is_active: true,
  })
  .returning('id');

// Insert and return full record
const [newUser] = await knex('users')
  .insert({
    email: 'another@example.com',
    name: 'Another User',
    password_hash: 'hashed_password',
    role: 'user',
    is_active: true,
  })
  .returning('*');

// Insert multiple records
const [user1Id, user2Id] = await knex('users')
  .insert([
    { email: 'user1@example.com', name: 'User 1', password_hash: 'hash1', role: 'user', is_active: true },
    { email: 'user2@example.com', name: 'User 2', password_hash: 'hash2', role: 'user', is_active: true },
  ])
  .returning('id');

// Insert with ON CONFLICT (upsert) - PostgreSQL
await knex('users')
  .insert({
    email: 'user@example.com',
    name: 'Updated Name',
    password_hash: 'hash',
    role: 'user',
    is_active: true,
  })
  .onConflict('email')
  .merge(); // Updates all columns except the conflict column

// Insert with ON CONFLICT - selective merge
await knex('users')
  .insert({
    email: 'user@example.com',
    name: 'Updated Name',
    password_hash: 'hash',
    role: 'user',
    is_active: true,
  })
  .onConflict('email')
  .merge(['name']); // Only update name

// Insert ignore (MySQL)
await knex('users')
  .insert({ email: 'user@example.com', name: 'User' })
  .onConflict('email')
  .ignore();
```

### UPDATE Operations

```typescript
// Update by condition
const updatedCount = await knex('users')
  .where('id', 1)
  .update({
    name: 'Updated Name',
    updated_at: new Date(),
  });
// Returns number of affected rows

// Update and return updated record
const [updatedUser] = await knex('users')
  .where('id', 1)
  .update({
    name: 'New Name',
    updated_at: new Date(),
  })
  .returning('*');

// Update multiple records
const count = await knex('users')
  .where('is_active', false)
  .where('created_at', '<', new Date('2024-01-01'))
  .update({ role: 'archived' });

// Increment/Decrement
await knex('posts')
  .where('id', postId)
  .increment('view_count', 1);

await knex('products')
  .where('id', productId)
  .decrement('stock', 5);

// Update with subquery
await knex('posts')
  .whereIn('author_id', function() {
    this.select('id')
      .from('users')
      .where('is_active', false);
  })
  .update({ published: false });
```

### DELETE Operations

```typescript
// Delete by condition
const deletedCount = await knex('users')
  .where('id', 1)
  .delete();
// Returns number of deleted rows

// Delete and return deleted records
const [deletedUser] = await knex('users')
  .where('id', 1)
  .delete()
  .returning('*');

// Delete multiple
await knex('sessions')
  .where('expires_at', '<', new Date())
  .delete();

// Truncate table (delete all, reset auto-increment)
await knex('logs').truncate();

// Delete with join (PostgreSQL)
await knex('comments')
  .whereIn('post_id', function() {
    this.select('id')
      .from('posts')
      .where('author_id', userId);
  })
  .delete();
```

---

## Where Clauses

### Basic Where

```typescript
// Equality
knex('users').where('id', 1);
knex('users').where('id', '=', 1);  // Explicit operator
knex('users').where({ id: 1 });     // Object syntax
knex('users').where({ id: 1, is_active: true }); // Multiple conditions (AND)

// Comparison operators
knex('users').where('age', '>', 18);
knex('users').where('age', '>=', 18);
knex('users').where('age', '<', 65);
knex('users').where('age', '<=', 65);
knex('users').where('role', '!=', 'admin');
knex('users').where('role', '<>', 'admin'); // Same as !=

// LIKE
knex('users').where('name', 'like', '%John%');
knex('users').where('email', 'like', '%@gmail.com');
knex('users').where('name', 'ilike', '%john%'); // Case-insensitive (PostgreSQL)
```

### Chaining Where Clauses

```typescript
// AND (default)
knex('users')
  .where('is_active', true)
  .where('role', 'admin')
  .where('created_at', '>', '2024-01-01');

// Explicit AND
knex('users')
  .where('is_active', true)
  .andWhere('role', 'admin');

// OR
knex('users')
  .where('role', 'admin')
  .orWhere('role', 'moderator');

// Complex grouping with nested functions
knex('users')
  .where('is_active', true)
  .where(function() {
    this.where('role', 'admin')
      .orWhere('role', 'moderator');
  });
// SQL: WHERE is_active = true AND (role = 'admin' OR role = 'moderator')

// Multiple OR groups
knex('products')
  .where(function() {
    this.where('category', 'electronics')
      .andWhere('price', '<', 1000);
  })
  .orWhere(function() {
    this.where('category', 'books')
      .andWhere('price', '<', 50);
  });
// SQL: WHERE (category = 'electronics' AND price < 1000)
//      OR (category = 'books' AND price < 50)
```

### Special Where Methods

```typescript
// WHERE IN
knex('users').whereIn('id', [1, 2, 3, 4, 5]);
knex('users').whereIn('role', ['admin', 'moderator']);

// WHERE NOT IN
knex('users').whereNotIn('status', ['banned', 'suspended']);

// WHERE IN with subquery
knex('posts').whereIn('author_id', function() {
  this.select('id').from('users').where('is_verified', true);
});

// WHERE NULL
knex('users').whereNull('deleted_at');
knex('users').whereNotNull('email_verified_at');

// WHERE BETWEEN
knex('products').whereBetween('price', [10, 100]);
knex('users').whereBetween('created_at', ['2024-01-01', '2024-12-31']);
knex('orders').whereNotBetween('total', [0, 10]);

// WHERE EXISTS
knex('users').whereExists(function() {
  this.select('*')
    .from('posts')
    .whereRaw('posts.author_id = users.id');
});

// WHERE RAW (for complex conditions)
knex('users').whereRaw('LOWER(email) = ?', ['user@example.com']);
knex('products').whereRaw('price * quantity > ?', [1000]);
knex('posts').whereRaw('DATE(created_at) = CURRENT_DATE');

// WHERE JSON (PostgreSQL)
knex('users').whereJsonObject('metadata', { premium: true });
knex('users').whereRaw("metadata->>'plan' = ?", ['pro']);
```

### Column Comparison

```typescript
// Compare two columns
knex('orders').whereColumn('shipped_at', '>', 'created_at');

// Multiple column conditions
knex('transfers')
  .whereColumn([
    ['source_account', '!=', 'destination_account'],
    ['amount', '>', 'minimum_amount'],
  ]);
```

---

## Joins

### Inner Join

```typescript
// Basic INNER JOIN
knex('users')
  .join('posts', 'users.id', 'posts.author_id')
  .select('users.*', 'posts.title');

// With operator
knex('users')
  .join('posts', 'users.id', '=', 'posts.author_id')
  .select('users.name', 'posts.title');

// Multiple join conditions
knex('users')
  .join('posts', function() {
    this.on('users.id', '=', 'posts.author_id')
      .andOn('posts.published', '=', knex.raw('?', [true]));
  })
  .select('users.name', 'posts.title');

// Join with table alias
knex('users as u')
  .join('posts as p', 'u.id', 'p.author_id')
  .join('comments as c', 'p.id', 'c.post_id')
  .select('u.name', 'p.title', 'c.content');
```

### Left Join

```typescript
// LEFT JOIN - includes all users even without posts
knex('users')
  .leftJoin('posts', 'users.id', 'posts.author_id')
  .select('users.*', knex.raw('COUNT(posts.id) as post_count'))
  .groupBy('users.id');

// LEFT JOIN with conditions
knex('users')
  .leftJoin('posts', function() {
    this.on('users.id', '=', 'posts.author_id')
      .andOn('posts.published', '=', knex.raw('?', [true]));
  })
  .select('users.*', 'posts.title');

// Multiple LEFT JOINs
knex('orders')
  .leftJoin('order_items', 'orders.id', 'order_items.order_id')
  .leftJoin('products', 'order_items.product_id', 'products.id')
  .leftJoin('users', 'orders.user_id', 'users.id')
  .select(
    'orders.id',
    'users.name as customer',
    'products.name as product',
    'order_items.quantity'
  );
```

### Right Join

```typescript
// RIGHT JOIN - includes all posts even without authors (rare)
knex('users')
  .rightJoin('posts', 'users.id', 'posts.author_id')
  .select('users.name', 'posts.*');
```

### Full Outer Join

```typescript
// FULL OUTER JOIN (PostgreSQL, not supported in MySQL)
knex('users')
  .fullOuterJoin('posts', 'users.id', 'posts.author_id')
  .select('users.name', 'posts.title');
```

### Cross Join

```typescript
// CROSS JOIN - Cartesian product
knex('sizes')
  .crossJoin('colors')
  .select('sizes.name as size', 'colors.name as color');
```

### Self Join

```typescript
// Self join - employees with their managers
knex('employees as e')
  .leftJoin('employees as m', 'e.manager_id', 'm.id')
  .select(
    'e.name as employee',
    'e.title',
    'm.name as manager'
  );
```

### Complex Join Example

```typescript
// E-commerce order report with multiple joins
interface OrderReport {
  order_id: number;
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  order_total: number;
  order_date: Date;
}

async function getOrderReport(startDate: Date, endDate: Date): Promise<OrderReport[]> {
  return knex('orders as o')
    .join('users as u', 'o.user_id', 'u.id')
    .join('order_items as oi', 'o.id', 'oi.order_id')
    .join('products as p', 'oi.product_id', 'p.id')
    .leftJoin('discounts as d', 'o.discount_id', 'd.id')
    .select(
      'o.id as order_id',
      'u.name as customer_name',
      'u.email as customer_email',
      'p.name as product_name',
      'oi.quantity',
      'oi.unit_price',
      knex.raw('oi.quantity * oi.unit_price as line_total'),
      'o.total as order_total',
      'o.created_at as order_date'
    )
    .whereBetween('o.created_at', [startDate, endDate])
    .where('o.status', 'completed')
    .orderBy('o.created_at', 'desc') as unknown as Promise<OrderReport[]>;
}
```

---

## Transactions

Transactions ensure that a series of database operations either all succeed or all fail together (atomicity).

### Basic Transaction

```typescript
// Using transaction callback
const result = await knex.transaction(async (trx) => {
  // All operations use the transaction object 'trx'

  // Create user
  const [user] = await trx('users')
    .insert({
      email: 'user@example.com',
      name: 'New User',
      password_hash: 'hash',
      role: 'user',
      is_active: true,
    })
    .returning('*');

  // Create profile
  const [profile] = await trx('profiles')
    .insert({
      user_id: user.id,
      bio: 'Hello!',
      avatar_url: null,
    })
    .returning('*');

  // Create initial settings
  await trx('user_settings')
    .insert({
      user_id: user.id,
      notifications_enabled: true,
      theme: 'light',
    });

  // Return value becomes the result of the transaction
  return { user, profile };
});
// If any query fails, ALL changes are rolled back
```

### Manual Transaction Control

```typescript
// For more control over commit/rollback
const trx = await knex.transaction();

try {
  // Deduct from source account
  await trx('accounts')
    .where('id', sourceAccountId)
    .decrement('balance', amount);

  // Check if source has sufficient funds
  const [source] = await trx('accounts')
    .where('id', sourceAccountId)
    .select('balance');

  if (source.balance < 0) {
    throw new Error('Insufficient funds');
  }

  // Add to destination account
  await trx('accounts')
    .where('id', destAccountId)
    .increment('balance', amount);

  // Create transfer record
  await trx('transfers')
    .insert({
      from_account_id: sourceAccountId,
      to_account_id: destAccountId,
      amount,
      status: 'completed',
    });

  // Commit if everything succeeded
  await trx.commit();

} catch (error) {
  // Rollback on any error
  await trx.rollback();
  throw error;
}
```

### Transaction with Savepoints

```typescript
await knex.transaction(async (trx) => {
  // Insert order
  const [order] = await trx('orders')
    .insert({ user_id: userId, status: 'pending' })
    .returning('*');

  // Create savepoint for order items
  await trx.savepoint(async (itemsTrx) => {
    for (const item of items) {
      // Check stock
      const [product] = await itemsTrx('products')
        .where('id', item.productId)
        .select('stock');

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      await itemsTrx('order_items').insert({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
      });

      await itemsTrx('products')
        .where('id', item.productId)
        .decrement('stock', item.quantity);
    }
  });

  // Update order status
  await trx('orders')
    .where('id', order.id)
    .update({ status: 'confirmed' });

  return order;
});
```

### Real-World Transaction Example

```typescript
interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

interface TransferResult {
  transfer: Transfer;
  sourceBalance: number;
  destBalance: number;
}

async function processTransfer(request: TransferRequest): Promise<TransferResult> {
  const { fromAccountId, toAccountId, amount, description } = request;

  if (amount <= 0) {
    throw new Error('Transfer amount must be positive');
  }

  if (fromAccountId === toAccountId) {
    throw new Error('Cannot transfer to the same account');
  }

  return knex.transaction(async (trx) => {
    // Lock rows for update (prevents race conditions)
    const accounts = await trx('accounts')
      .whereIn('id', [fromAccountId, toAccountId])
      .forUpdate()  // PostgreSQL row-level lock
      .select('*');

    const sourceAccount = accounts.find(a => a.id === fromAccountId);
    const destAccount = accounts.find(a => a.id === toAccountId);

    if (!sourceAccount) throw new Error('Source account not found');
    if (!destAccount) throw new Error('Destination account not found');
    if (sourceAccount.balance < amount) throw new Error('Insufficient funds');

    // Perform transfer
    await trx('accounts')
      .where('id', fromAccountId)
      .update({ balance: sourceAccount.balance - amount });

    await trx('accounts')
      .where('id', toAccountId)
      .update({ balance: destAccount.balance + amount });

    // Create transfer record
    const [transfer] = await trx('transfers')
      .insert({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        description: description || 'Transfer',
        status: 'completed',
        completed_at: new Date(),
      })
      .returning('*');

    // Create audit log entries
    await trx('transaction_logs').insert([
      {
        account_id: fromAccountId,
        type: 'debit',
        amount,
        balance_after: sourceAccount.balance - amount,
        transfer_id: transfer.id,
        description: `Transfer to account ${toAccountId}`,
      },
      {
        account_id: toAccountId,
        type: 'credit',
        amount,
        balance_after: destAccount.balance + amount,
        transfer_id: transfer.id,
        description: `Transfer from account ${fromAccountId}`,
      },
    ]);

    return {
      transfer,
      sourceBalance: sourceAccount.balance - amount,
      destBalance: destAccount.balance + amount,
    };
  });
}
```

---

## Migrations

Migrations provide version control for your database schema.

### Create Migration

```bash
# Create a new migration file
npx knex migrate:make create_users_table --env development

# With TypeScript
npx knex migrate:make create_users_table --env development -x ts
```

### Migration File Structure

```typescript
// migrations/20240115120000_create_users_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if table exists first (idempotent)
  const exists = await knex.schema.hasTable('users');
  if (exists) return;

  await knex.schema.createTable('users', (table) => {
    // Primary key
    table.increments('id').primary();

    // String fields
    table.string('email', 255).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('password_hash', 255).notNullable();

    // Enum (stores as string by default)
    table.enum('role', ['admin', 'user', 'moderator']).defaultTo('user');

    // Boolean
    table.boolean('is_active').defaultTo(true);

    // Timestamps
    table.timestamp('email_verified_at').nullable();
    table.timestamps(true, true); // created_at, updated_at with defaults

    // Soft delete
    table.timestamp('deleted_at').nullable();

    // Indexes
    table.index('email');
    table.index('role');
    table.index(['is_active', 'role']); // Composite index
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
```

### Common Column Types

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    // Auto-increment primary key
    table.increments('id');
    table.bigIncrements('big_id'); // For large tables

    // UUID primary key (alternative)
    // table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Integers
    table.integer('stock').defaultTo(0);
    table.bigInteger('views').defaultTo(0);
    table.tinyint('priority'); // -128 to 127
    table.smallint('year');    // -32768 to 32767

    // Decimals (for money!)
    table.decimal('price', 10, 2).notNullable(); // 10 digits, 2 decimal places
    table.float('rating');

    // Strings
    table.string('name', 255);
    table.string('sku', 50).unique();
    table.text('description');       // Unlimited text
    table.specificType('tags', 'text[]'); // PostgreSQL array

    // Boolean
    table.boolean('is_published').defaultTo(false);

    // Dates and times
    table.date('release_date');
    table.time('available_from');
    table.dateTime('sale_ends_at');
    table.timestamp('published_at');

    // JSON (PostgreSQL/MySQL 5.7+)
    table.json('metadata');
    table.jsonb('settings'); // PostgreSQL JSONB (indexed)

    // Binary
    table.binary('thumbnail');

    // Foreign key
    table.integer('category_id').unsigned();
    table.foreign('category_id')
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');

    // Timestamps
    table.timestamps(true, true);
  });

  // Create index after table
  await knex.schema.alterTable('products', (table) => {
    table.index(['category_id', 'is_published']);
  });
}
```

### Alter Table Migration

```typescript
// migrations/20240116120000_add_phone_to_users.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    // Add columns
    table.string('phone', 20).nullable().after('email');
    table.string('avatar_url', 500).nullable();
    table.jsonb('preferences').defaultTo('{}');

    // Add index
    table.index('phone');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('phone');
    table.dropColumn('phone');
    table.dropColumn('avatar_url');
    table.dropColumn('preferences');
  });
}
```

### Relations Migration

```typescript
// migrations/20240117120000_create_posts_and_comments.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Posts table
  await knex.schema.createTable('posts', (table) => {
    table.increments('id');
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('content').notNullable();
    table.boolean('published').defaultTo(false);
    table.timestamp('published_at').nullable();

    // Foreign key to users
    table.integer('author_id').unsigned().notNullable();
    table.foreign('author_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // Delete posts when user is deleted

    table.timestamps(true, true);

    table.index(['author_id', 'published']);
    table.index('published_at');
  });

  // Comments table
  await knex.schema.createTable('comments', (table) => {
    table.increments('id');
    table.text('content').notNullable();

    // Foreign keys
    table.integer('post_id').unsigned().notNullable();
    table.foreign('post_id')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Self-reference for nested comments
    table.integer('parent_id').unsigned().nullable();
    table.foreign('parent_id')
      .references('id')
      .inTable('comments')
      .onDelete('CASCADE');

    table.timestamps(true, true);

    table.index('post_id');
    table.index('user_id');
    table.index('parent_id');
  });

  // Many-to-many: posts_tags
  await knex.schema.createTable('tags', (table) => {
    table.increments('id');
    table.string('name', 50).notNullable().unique();
    table.string('slug', 50).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('post_tags', (table) => {
    table.integer('post_id').unsigned().notNullable();
    table.integer('tag_id').unsigned().notNullable();

    table.foreign('post_id')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');

    table.foreign('tag_id')
      .references('id')
      .inTable('tags')
      .onDelete('CASCADE');

    table.primary(['post_id', 'tag_id']); // Composite primary key
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse order (foreign key constraints)
  await knex.schema.dropTableIfExists('post_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('posts');
}
```

### Running Migrations

```bash
# Run all pending migrations
npx knex migrate:latest --env development

# Rollback last batch
npx knex migrate:rollback --env development

# Rollback all migrations
npx knex migrate:rollback --all --env development

# Run next migration
npx knex migrate:up --env development

# Rollback last migration
npx knex migrate:down --env development

# Check migration status
npx knex migrate:status --env development

# List completed migrations
npx knex migrate:list --env development
```

---

## Seeds

Seeds populate your database with initial or test data.

### Create Seed

```bash
npx knex seed:make 01_users --env development -x ts
```

### Seed File Structure

```typescript
// seeds/01_users.ts
import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries (careful in production!)
  await knex('users').del();

  // Insert seed entries
  await knex('users').insert([
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password_hash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      is_active: true,
    },
    {
      email: 'user@example.com',
      name: 'Regular User',
      password_hash: await bcrypt.hash('user123', 10),
      role: 'user',
      is_active: true,
    },
    {
      email: 'moderator@example.com',
      name: 'Moderator',
      password_hash: await bcrypt.hash('mod123', 10),
      role: 'moderator',
      is_active: true,
    },
  ]);
}
```

### Seed with Dependencies

```typescript
// seeds/02_posts.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Get user IDs
  const users = await knex('users').select('id', 'email');
  const adminUser = users.find(u => u.email === 'admin@example.com')!;
  const regularUser = users.find(u => u.email === 'user@example.com')!;

  // Clear existing posts
  await knex('posts').del();

  // Insert posts
  await knex('posts').insert([
    {
      title: 'Welcome to Our Blog',
      slug: 'welcome-to-our-blog',
      content: 'This is our first blog post. Welcome!',
      author_id: adminUser.id,
      published: true,
      published_at: new Date(),
    },
    {
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
      content: 'Here is how to get started with our platform...',
      author_id: adminUser.id,
      published: true,
      published_at: new Date(),
    },
    {
      title: 'My First Post',
      slug: 'my-first-post',
      content: 'Hello, this is my first post!',
      author_id: regularUser.id,
      published: true,
      published_at: new Date(),
    },
    {
      title: 'Draft Post',
      slug: 'draft-post',
      content: 'This is a draft that is not published yet.',
      author_id: regularUser.id,
      published: false,
      published_at: null,
    },
  ]);
}
```

### Seed with Faker (Realistic Data)

```typescript
// seeds/03_realistic_data.ts
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping fake data seed in production');
    return;
  }

  // Generate 50 fake users
  const fakeUsers = Array.from({ length: 50 }, () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password_hash: '$2b$10$fakehashforseeding',
    role: faker.helpers.arrayElement(['user', 'user', 'user', 'moderator']),
    is_active: faker.datatype.boolean({ probability: 0.9 }),
    created_at: faker.date.past({ years: 2 }),
    updated_at: new Date(),
  }));

  await knex('users').insert(fakeUsers);

  // Get all user IDs
  const userIds = await knex('users').pluck('id');

  // Generate 200 fake posts
  const fakePosts = Array.from({ length: 200 }, () => {
    const title = faker.lorem.sentence();
    const published = faker.datatype.boolean({ probability: 0.7 });

    return {
      title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      content: faker.lorem.paragraphs(5),
      author_id: faker.helpers.arrayElement(userIds),
      published,
      published_at: published ? faker.date.past({ years: 1 }) : null,
      created_at: faker.date.past({ years: 1 }),
      updated_at: new Date(),
    };
  });

  await knex('posts').insert(fakePosts);
}
```

### Running Seeds

```bash
# Run all seed files
npx knex seed:run --env development

# Run specific seed file
npx knex seed:run --specific=01_users.ts --env development
```

---

## Raw Queries

When Knex's query builder isn't enough, use raw SQL.

### Basic Raw Query

```typescript
// Simple raw query
const result = await knex.raw('SELECT * FROM users WHERE id = ?', [userId]);
// PostgreSQL returns { rows: [...], rowCount: n }
// MySQL returns [rows, fields]

// Extract rows
const users = result.rows; // PostgreSQL
const [users] = result;    // MySQL

// Raw query with named bindings
const users = await knex.raw(
  'SELECT * FROM users WHERE email = :email AND role = :role',
  { email: 'user@example.com', role: 'admin' }
);
```

### Raw Within Query Builder

```typescript
// Raw in select
const users = await knex('users')
  .select(
    'id',
    'name',
    knex.raw('UPPER(email) as upper_email'),
    knex.raw('EXTRACT(YEAR FROM created_at) as signup_year')
  );

// Raw in where
const users = await knex('users')
  .whereRaw('LOWER(email) = ?', ['user@example.com'])
  .whereRaw('created_at > NOW() - INTERVAL ? DAY', [30]);

// Raw in orderBy
const posts = await knex('posts')
  .select('*')
  .orderByRaw('RANDOM()') // PostgreSQL random order
  .limit(10);

// Raw in join
const results = await knex('orders')
  .joinRaw('LEFT JOIN products ON products.id = orders.product_id AND products.active = ?', [true])
  .select('orders.*', 'products.name');

// Raw in groupBy/having
const stats = await knex('orders')
  .select('user_id')
  .sum('total as total_spent')
  .groupBy('user_id')
  .havingRaw('SUM(total) > ?', [1000]);
```

### Complex Raw Queries

```typescript
// Window functions
const rankedProducts = await knex.raw(`
  SELECT
    id,
    name,
    category,
    price,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank
  FROM products
  WHERE active = true
`);

// CTE (Common Table Expression)
const activeUsersWithStats = await knex.raw(`
  WITH active_users AS (
    SELECT id, name, email
    FROM users
    WHERE is_active = true
  ),
  user_stats AS (
    SELECT
      author_id as user_id,
      COUNT(*) as post_count,
      SUM(CASE WHEN published THEN 1 ELSE 0 END) as published_count
    FROM posts
    GROUP BY author_id
  )
  SELECT
    au.*,
    COALESCE(us.post_count, 0) as post_count,
    COALESCE(us.published_count, 0) as published_count
  FROM active_users au
  LEFT JOIN user_stats us ON au.id = us.user_id
  ORDER BY us.post_count DESC NULLS LAST
`);

// Recursive CTE (hierarchical data)
const categoryTree = await knex.raw(`
  WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_id, 1 as level, ARRAY[name] as path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: child categories
    SELECT c.id, c.name, c.parent_id, ct.level + 1, ct.path || c.name
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM category_tree ORDER BY path
`);
```

### Raw for Performance

```typescript
// Bulk upsert with ON CONFLICT (PostgreSQL)
async function bulkUpsertProducts(products: Product[]): Promise<void> {
  const values = products.map(p => `(${p.sku}, ${knex.raw('?', [p.name])}, ${p.price})`).join(',');

  await knex.raw(`
    INSERT INTO products (sku, name, price)
    VALUES ${values}
    ON CONFLICT (sku) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      updated_at = NOW()
  `);
}

// Bulk update with CASE
async function bulkUpdatePrices(updates: { id: number; price: number }[]): Promise<void> {
  const cases = updates.map(u => `WHEN ${u.id} THEN ${u.price}`).join(' ');
  const ids = updates.map(u => u.id).join(',');

  await knex.raw(`
    UPDATE products
    SET price = CASE id ${cases} END,
        updated_at = NOW()
    WHERE id IN (${ids})
  `);
}
```

---

## Knex vs ORM Comparison

### Feature Comparison

| Feature | Knex | Sequelize | TypeORM | Prisma |
|---------|------|-----------|---------|--------|
| **Query Style** | SQL-like | OOP/Active Record | OOP/Data Mapper | Schema-first |
| **Type Safety** | Manual | Weak | Strong | Excellent |
| **Learning Curve** | Low (if you know SQL) | Medium | Medium-High | Low |
| **Relations** | Manual joins | Automatic | Automatic | Automatic |
| **Migrations** | ✅ | ✅ | ✅ | ✅ |
| **Raw Query Support** | Excellent | Good | Good | Good |
| **Performance** | High | Medium | Medium | High |
| **Bundle Size** | Small | Large | Large | Medium |

### Code Comparison

```typescript
// ============================================
// KNEX - You write SQL-like queries
// ============================================
const userWithPosts = await knex('users as u')
  .leftJoin('posts as p', 'u.id', 'p.author_id')
  .where('u.id', userId)
  .select('u.*', 'p.title as post_title', 'p.id as post_id');

// Manual aggregation needed
const result = userWithPosts.reduce((acc, row) => {
  if (!acc.user) {
    acc.user = { id: row.id, name: row.name, email: row.email };
    acc.posts = [];
  }
  if (row.post_id) {
    acc.posts.push({ id: row.post_id, title: row.post_title });
  }
  return acc;
}, { user: null, posts: [] });


// ============================================
// SEQUELIZE - OOP with models
// ============================================
const user = await User.findByPk(userId, {
  include: [{
    model: Post,
    as: 'posts',
  }],
});
// user.posts is automatically an array


// ============================================
// TYPEORM - Data mapper pattern
// ============================================
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['posts'],
});
// user.posts is automatically an array


// ============================================
// PRISMA - Modern type-safe approach
// ============================================
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true },
});
// user.posts is automatically typed array
```

### When to Choose Knex

**Choose Knex when:**
1. Your team knows SQL well and prefers SQL-like syntax
2. You need fine-grained control over query optimization
3. You're building data-heavy applications (analytics, reporting)
4. You want a lightweight solution (microservices)
5. You're migrating from raw SQL and want incremental improvement
6. Complex queries are common (multiple joins, aggregations)

**Don't choose Knex when:**
1. You want automatic relation handling
2. You need model validation and lifecycle hooks
3. Your team prefers working with objects over SQL
4. You want maximum type safety with minimal setup

### Performance Characteristics

```typescript
// Knex generates optimal SQL
const knexQuery = knex('users')
  .join('posts', 'users.id', 'posts.author_id')
  .where('posts.published', true)
  .select('users.name', knex.raw('COUNT(posts.id) as post_count'))
  .groupBy('users.id')
  .having('post_count', '>', 5);

console.log(knexQuery.toString());
// SELECT users.name, COUNT(posts.id) as post_count
// FROM users
// INNER JOIN posts ON users.id = posts.author_id
// WHERE posts.published = true
// GROUP BY users.id
// HAVING post_count > 5

// ORM might generate suboptimal queries for complex scenarios
// Knex lets you write the exact SQL you need
```

---

## Best Practices

### 1. Use TypeScript Types

```typescript
// Always define types for your tables
interface User {
  id: number;
  email: string;
  name: string;
}

// Use generic type with Knex
const users = await knex<User>('users').where('is_active', true);
```

### 2. Create a Query Builder Layer

```typescript
// repositories/userRepository.ts
import knex from '../db';
import { User, UserInsert, UserUpdate } from '../types';

export const userRepository = {
  findById(id: number): Promise<User | undefined> {
    return knex<User>('users').where('id', id).first();
  },

  findByEmail(email: string): Promise<User | undefined> {
    return knex<User>('users').where('email', email).first();
  },

  create(data: UserInsert): Promise<User> {
    return knex<User>('users').insert(data).returning('*').then(rows => rows[0]);
  },

  update(id: number, data: UserUpdate): Promise<User | undefined> {
    return knex<User>('users')
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*')
      .then(rows => rows[0]);
  },

  delete(id: number): Promise<boolean> {
    return knex('users').where('id', id).delete().then(count => count > 0);
  },
};
```

### 3. Debug Queries

```typescript
// Log the SQL that will be generated
const query = knex('users').where('is_active', true);
console.log(query.toString());
// SELECT * FROM "users" WHERE "is_active" = true

// Enable query logging globally
knex.on('query', (data) => {
  console.log('SQL:', data.sql);
  console.log('Bindings:', data.bindings);
});
```

### 4. Handle Connections Properly

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  await knex.destroy();
  process.exit(0);
});

// In tests - close after each test suite
afterAll(async () => {
  await knex.destroy();
});
```

---

## Summary

Knex provides the perfect balance between raw SQL and full ORMs:

- **SQL Knowledge**: Leverages your SQL skills with a cleaner interface
- **Type Safety**: Full TypeScript support with proper typing
- **Flexibility**: Drop to raw SQL when needed
- **Migrations**: Built-in schema versioning
- **Lightweight**: Smaller footprint than full ORMs
- **Control**: You see exactly what SQL is generated

For new projects where you want maximum type safety and developer experience, consider Prisma. But for projects needing fine-grained SQL control or teams comfortable with SQL, Knex remains an excellent choice.
