# Phase 100: Prisma CRUD Operations - Complete Guide

## Table of Contents

1. [PrismaClient Setup](#prismaclient-setup)
2. [Create Operations](#create-operations)
3. [Read Operations](#read-operations)
4. [Update Operations](#update-operations)
5. [Delete Operations](#delete-operations)
6. [Upsert Operations](#upsert-operations)
7. [Type Safety Magic](#type-safety-magic)
8. [Select Specific Fields](#select-specific-fields)
9. [Include Relations](#include-relations)
10. [Best Practices](#best-practices)

---

## PrismaClient Setup

### The Singleton Pattern (Important!)

Creating multiple PrismaClient instances can exhaust database connections. Use the singleton pattern.

```typescript
// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances during hot reload in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### Why Singleton?

```typescript
// ❌ BAD: Creates new instance every import
// This will cause "Too many connections" errors!
export const prisma = new PrismaClient();

// ✅ GOOD: Reuses single instance
const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Configuration Options

```typescript
const prisma = new PrismaClient({
  // Logging
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],

  // Error formatting
  errorFormat: 'pretty', // 'minimal' | 'colorless' | 'pretty'

  // Datasources (override connection)
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Listen to query events
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Connection Management

```typescript
// Connect explicitly (optional - auto-connects on first query)
await prisma.$connect();

// Disconnect gracefully
await prisma.$disconnect();

// In an Express app
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Graceful shutdown
async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## Create Operations

### create() - Single Record

```typescript
// Basic create
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
  },
});
// Returns: { id: 1, email: 'alice@prisma.io', name: 'Alice', ... }

// Create with all fields
const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    content: 'This is my first post',
    published: true,
    authorId: 1,
  },
});

// Create with enum
const admin = await prisma.user.create({
  data: {
    email: 'admin@prisma.io',
    name: 'Admin',
    role: 'ADMIN', // Enum value
  },
});
```

### create() with Relations (Nested Create)

```typescript
// Create user WITH profile in one query
const userWithProfile = await prisma.user.create({
  data: {
    email: 'bob@prisma.io',
    name: 'Bob',
    profile: {
      create: {
        bio: 'I am a developer',
        avatar: 'https://example.com/avatar.jpg',
      },
    },
  },
  include: {
    profile: true,
  },
});
// Returns user with profile nested!

// Create user WITH multiple posts
const authorWithPosts = await prisma.user.create({
  data: {
    email: 'author@prisma.io',
    name: 'Author',
    posts: {
      create: [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' },
        { title: 'Post 3', content: 'Content 3' },
      ],
    },
  },
  include: {
    posts: true,
  },
});

// Create post with existing author (connect)
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    content: 'Content here',
    author: {
      connect: { id: 1 }, // Connect to existing user with id: 1
    },
  },
  include: {
    author: true,
  },
});

// Create with connectOrCreate
const postWithAuthor = await prisma.post.create({
  data: {
    title: 'Another Post',
    content: 'More content',
    author: {
      connectOrCreate: {
        where: { email: 'writer@prisma.io' },
        create: {
          email: 'writer@prisma.io',
          name: 'Writer',
        },
      },
    },
  },
});
```

### createMany() - Bulk Insert

```typescript
// Insert multiple records efficiently
const result = await prisma.user.createMany({
  data: [
    { email: 'user1@prisma.io', name: 'User 1' },
    { email: 'user2@prisma.io', name: 'User 2' },
    { email: 'user3@prisma.io', name: 'User 3' },
    { email: 'user4@prisma.io', name: 'User 4' },
  ],
});
// Returns: { count: 4 }

// Skip duplicates (useful for idempotent operations)
const result = await prisma.user.createMany({
  data: [
    { email: 'existing@prisma.io', name: 'Existing' },
    { email: 'new@prisma.io', name: 'New' },
  ],
  skipDuplicates: true, // Won't throw if email already exists
});

// NOTE: createMany does NOT support:
// - Returning created records (use create in a loop if needed)
// - Nested creates (relations)
```

### Create with Generated Values

```typescript
// UUID and CUID are auto-generated
const entity = await prisma.entity.create({
  data: {
    // id is auto-generated: @id @default(uuid())
    name: 'Entity Name',
  },
});
// id will be like: "550e8400-e29b-41d4-a716-446655440000"

// Auto-increment is handled automatically
const user = await prisma.user.create({
  data: {
    // id is auto-generated: @id @default(autoincrement())
    email: 'test@test.com',
  },
});

// Timestamps are auto-set
// createdAt: @default(now()) - Set on create
// updatedAt: @updatedAt - Set on every update
```

---

## Read Operations

### findUnique() - Single Record by Unique Field

```typescript
// Find by primary key
const user = await prisma.user.findUnique({
  where: { id: 1 },
});
// Returns: User | null

// Find by any unique field
const userByEmail = await prisma.user.findUnique({
  where: { email: 'alice@prisma.io' },
});

// Find by composite unique key
const teamMember = await prisma.teamMember.findUnique({
  where: {
    teamId_userId: {
      teamId: 1,
      userId: 2,
    },
  },
});

// With relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true,
  },
});
```

### findUniqueOrThrow() - Throw if Not Found

```typescript
// Throws PrismaClientKnownRequestError if not found
try {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: 999 },
  });
  // Use user safely - guaranteed to exist
} catch (error) {
  // Handle not found error
  console.error('User not found');
}
```

### findFirst() - First Matching Record

```typescript
// Find first matching record
const user = await prisma.user.findFirst({
  where: {
    email: { contains: '@company.com' },
  },
});
// Returns: User | null

// With ordering (get most recent)
const latestPost = await prisma.post.findFirst({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
});

// Skip records
const secondUser = await prisma.user.findFirst({
  orderBy: { id: 'asc' },
  skip: 1, // Skip first
});
```

### findFirstOrThrow()

```typescript
const user = await prisma.user.findFirstOrThrow({
  where: { role: 'ADMIN' },
});
// Throws if no admin found
```

### findMany() - Multiple Records

```typescript
// Get all records
const allUsers = await prisma.user.findMany();

// With filtering
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true,
    role: 'USER',
  },
});

// With ordering
const sortedUsers = await prisma.user.findMany({
  orderBy: {
    createdAt: 'desc',
  },
});

// Multiple sort fields
const users = await prisma.user.findMany({
  orderBy: [
    { role: 'asc' },
    { name: 'asc' },
  ],
});

// Pagination
const paginatedUsers = await prisma.user.findMany({
  skip: 20,  // Offset
  take: 10,  // Limit
  orderBy: { id: 'asc' },
});

// Select specific fields only
const userEmails = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
  },
});
// Returns: { id: number; email: string }[]
```

### count() - Count Records

```typescript
// Count all
const totalUsers = await prisma.user.count();

// Count with filter
const activeCount = await prisma.user.count({
  where: { isActive: true },
});

// Count specific field (excludes nulls)
const namedUsers = await prisma.user.count({
  select: {
    _all: true,     // Total count
    name: true,     // Count where name is not null
  },
});
// Returns: { _all: 100, name: 85 }
```

### aggregate() - Aggregations

```typescript
// Aggregate functions
const result = await prisma.product.aggregate({
  _count: { _all: true },
  _avg: { price: true },
  _sum: { quantity: true },
  _min: { price: true },
  _max: { price: true },
});
// Returns: {
//   _count: { _all: 50 },
//   _avg: { price: 29.99 },
//   _sum: { quantity: 1000 },
//   _min: { price: 5.99 },
//   _max: { price: 99.99 }
// }

// With filter
const categoryStats = await prisma.product.aggregate({
  where: { categoryId: 1 },
  _avg: { price: true },
  _count: { _all: true },
});
```

### groupBy() - Group Results

```typescript
// Group by single field
const roleCount = await prisma.user.groupBy({
  by: ['role'],
  _count: { _all: true },
});
// Returns: [
//   { role: 'USER', _count: { _all: 50 } },
//   { role: 'ADMIN', _count: { _all: 5 } },
// ]

// Group by multiple fields
const stats = await prisma.post.groupBy({
  by: ['authorId', 'published'],
  _count: { _all: true },
  orderBy: {
    _count: { id: 'desc' },
  },
});

// With having clause
const prolificAuthors = await prisma.post.groupBy({
  by: ['authorId'],
  _count: { id: true },
  having: {
    id: {
      _count: { gt: 10 },
    },
  },
});
```

---

## Update Operations

### update() - Single Record

```typescript
// Update by unique field
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: 'New Name',
    email: 'newemail@prisma.io',
  },
});
// Returns updated user

// Update by any unique field
const updatedByEmail = await prisma.user.update({
  where: { email: 'old@prisma.io' },
  data: { email: 'new@prisma.io' },
});

// Increment/Decrement numbers
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    viewCount: { increment: 1 },
  },
});

const product = await prisma.product.update({
  where: { id: 1 },
  data: {
    stock: { decrement: 5 },
    sales: { increment: 5 },
  },
});

// Multiply/Divide
const adjusted = await prisma.product.update({
  where: { id: 1 },
  data: {
    price: { multiply: 1.1 }, // 10% increase
    // or: { divide: 2 }
  },
});
```

### update() with Relations

```typescript
// Update nested relation
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      update: {
        bio: 'Updated bio',
      },
    },
  },
  include: { profile: true },
});

// Connect to different relation
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    author: {
      connect: { id: 2 }, // Change author
    },
  },
});

// Disconnect optional relation
const userNoProfile = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      disconnect: true,
    },
  },
});

// Create related record if doesn't exist
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      upsert: {
        create: { bio: 'New bio' },
        update: { bio: 'Updated bio' },
      },
    },
  },
});

// Update many-to-many
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      connect: [{ id: 1 }, { id: 2 }],     // Add tags
      disconnect: [{ id: 3 }],              // Remove tag
      set: [{ id: 1 }, { id: 4 }],         // Replace all tags
    },
  },
});
```

### updateMany() - Bulk Update

```typescript
// Update multiple records
const result = await prisma.post.updateMany({
  where: {
    authorId: 1,
    published: false,
  },
  data: {
    published: true,
    publishedAt: new Date(),
  },
});
// Returns: { count: 5 }

// Update all matching records
const deactivated = await prisma.user.updateMany({
  where: {
    lastLoginAt: {
      lt: new Date('2024-01-01'),
    },
  },
  data: {
    isActive: false,
  },
});

// NOTE: updateMany does NOT support:
// - Returning updated records
// - Nested updates (relations)
```

---

## Delete Operations

### delete() - Single Record

```typescript
// Delete by unique field
const deletedUser = await prisma.user.delete({
  where: { id: 1 },
});
// Returns deleted record

// Delete by any unique field
const deleted = await prisma.user.delete({
  where: { email: 'delete@prisma.io' },
});

// Delete with relations (cascade configured in schema)
// If onDelete: Cascade is set, related records are deleted automatically
const deletedPost = await prisma.post.delete({
  where: { id: 1 },
  // Comments with onDelete: Cascade will be deleted too
});
```

### deleteMany() - Bulk Delete

```typescript
// Delete multiple records
const result = await prisma.post.deleteMany({
  where: {
    published: false,
    createdAt: {
      lt: new Date('2023-01-01'),
    },
  },
});
// Returns: { count: 25 }

// Delete all records in a table
const deleted = await prisma.comment.deleteMany({});
// Returns: { count: 1000 }

// Conditional delete all
const archived = await prisma.notification.deleteMany({
  where: {
    read: true,
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  },
});
```

### Soft Delete Pattern

```typescript
// Instead of deleting, update deletedAt
const softDeleted = await prisma.user.update({
  where: { id: 1 },
  data: {
    deletedAt: new Date(),
  },
});

// Query only non-deleted
const activeUsers = await prisma.user.findMany({
  where: {
    deletedAt: null,
  },
});

// Restore soft-deleted
const restored = await prisma.user.update({
  where: { id: 1 },
  data: {
    deletedAt: null,
  },
});
```

---

## Upsert Operations

Upsert = Update if exists, Insert if not.

### upsert() - Single Record

```typescript
// Basic upsert
const user = await prisma.user.upsert({
  where: { email: 'user@prisma.io' },
  update: {
    name: 'Updated Name',
    lastLoginAt: new Date(),
  },
  create: {
    email: 'user@prisma.io',
    name: 'New User',
  },
});

// Upsert with relations
const userWithProfile = await prisma.user.upsert({
  where: { email: 'user@prisma.io' },
  update: {
    name: 'Updated',
    profile: {
      upsert: {
        create: { bio: 'New bio' },
        update: { bio: 'Updated bio' },
      },
    },
  },
  create: {
    email: 'user@prisma.io',
    name: 'New User',
    profile: {
      create: { bio: 'Initial bio' },
    },
  },
  include: { profile: true },
});
```

### Use Cases for Upsert

```typescript
// 1. Ensure settings exist
const settings = await prisma.userSettings.upsert({
  where: { userId: 1 },
  update: { theme: 'dark' },
  create: {
    userId: 1,
    theme: 'dark',
    notifications: true,
  },
});

// 2. Track page views
const pageView = await prisma.pageView.upsert({
  where: {
    userId_pageUrl: {
      userId: 1,
      pageUrl: '/products/1',
    },
  },
  update: {
    viewCount: { increment: 1 },
    lastViewedAt: new Date(),
  },
  create: {
    userId: 1,
    pageUrl: '/products/1',
    viewCount: 1,
    lastViewedAt: new Date(),
  },
});

// 3. External data sync
const product = await prisma.product.upsert({
  where: { sku: 'ABC-123' },
  update: {
    price: 29.99,
    stock: 100,
    updatedAt: new Date(),
  },
  create: {
    sku: 'ABC-123',
    name: 'Product Name',
    price: 29.99,
    stock: 100,
  },
});
```

---

## Type Safety Magic

This is where Prisma shines - every query is 100% type-safe!

### Return Types Change Based on Query

```typescript
// findUnique returns T | null
const user = await prisma.user.findUnique({ where: { id: 1 } });
// Type: User | null

// findUniqueOrThrow returns T
const userOrThrow = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });
// Type: User

// findMany returns T[]
const users = await prisma.user.findMany();
// Type: User[]

// create returns T
const newUser = await prisma.user.create({ data: { email: 'a@b.com' } });
// Type: User

// count returns number
const count = await prisma.user.count();
// Type: number
```

### Select Changes Return Type

```typescript
// Full user
const user = await prisma.user.findUnique({ where: { id: 1 } });
// Type: { id, email, name, role, createdAt, updatedAt, ... } | null

// Only selected fields
const partial = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
  },
});
// Type: { id: number; email: string } | null

// NO other fields available - TypeScript knows!
partial.name; // ❌ Error: Property 'name' does not exist
```

### Include Changes Return Type

```typescript
// Without include
const user = await prisma.user.findUnique({ where: { id: 1 } });
// Type: User | null (no posts property)

// With include
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});
// Type: (User & { posts: Post[] }) | null

// Access included relation safely
if (userWithPosts) {
  userWithPosts.posts.forEach(post => {
    console.log(post.title); // ✅ TypeScript knows posts exist
  });
}
```

### Compile-Time Validation

```typescript
// ❌ TypeScript catches invalid field names
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    invalidField: true, // Error: Object literal may only specify known properties
  },
});

// ❌ TypeScript catches type mismatches
const user = await prisma.user.create({
  data: {
    email: 123, // Error: Type 'number' is not assignable to type 'string'
  },
});

// ❌ TypeScript catches invalid enum values
const user = await prisma.user.create({
  data: {
    email: 'a@b.com',
    role: 'INVALID', // Error: Type '"INVALID"' is not assignable to type 'Role'
  },
});

// ❌ TypeScript catches missing required fields
const user = await prisma.user.create({
  data: {
    name: 'Name', // Error: Property 'email' is missing
  },
});
```

---

## Select Specific Fields

### Basic Select

```typescript
// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
// Type: { id: number; email: string; name: string | null }[]

// Select with relations
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});
// Type: { id: number; email: string; posts: { id: number; title: string }[] }[]
```

### Select vs Include

```typescript
// INCLUDE: Add relations to the default selection
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true, // Adds posts to all user fields
  },
});
// Returns ALL user fields + posts

// SELECT: Choose exactly which fields to return
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    email: true,
    posts: true, // Can include relations
  },
});
// Returns ONLY email and posts

// SELECT + nested SELECT for relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    email: true,
    posts: {
      select: {
        title: true, // Only title from posts
      },
    },
  },
});
// Returns: { email: string; posts: { title: string }[] }
```

### Cannot Mix Select and Include

```typescript
// ❌ This doesn't work
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { email: true },
  include: { posts: true }, // Error!
});

// ✅ Use select for both
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    email: true,
    posts: true, // This works
  },
});
```

---

## Include Relations

### Basic Include

```typescript
// Include one relation
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    profile: true,
  },
});

// Include multiple relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    profile: true,
    posts: true,
  },
});
```

### Nested Include

```typescript
// Deep nesting
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true,
          },
        },
        tags: true,
      },
    },
  },
});
```

### Include with Filtering

```typescript
// Filter included relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    },
  },
});

// Include with count
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  },
});
// Returns: { ...user, posts: Post[], _count: { posts: 10, followers: 100 } }
```

### Count Relations

```typescript
// Just the count, not the data
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: {
        posts: true,
        comments: true,
      },
    },
  },
});
// Each user has: { ...userFields, _count: { posts: n, comments: m } }

// Filter the count
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: {
        posts: {
          where: { published: true },
        },
      },
    },
  },
});
```

---

## Best Practices

### 1. Use Singleton Pattern

```typescript
// Create once, reuse everywhere
// See "PrismaClient Setup" section
```

### 2. Handle Null Returns

```typescript
// findUnique can return null
const user = await prisma.user.findUnique({ where: { id: 1 } });

// ❌ Unsafe
console.log(user.email); // Could be null!

// ✅ Safe
if (user) {
  console.log(user.email);
}

// ✅ Or use findUniqueOrThrow
const user = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });
console.log(user.email); // Safe - throws if not found
```

### 3. Select Only What You Need

```typescript
// ❌ Fetching unnecessary data
const users = await prisma.user.findMany(); // Gets ALL fields

// ✅ Fetch only needed fields (faster, less memory)
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
  },
});
```

### 4. Paginate Large Results

```typescript
// ❌ Fetching all records
const allPosts = await prisma.post.findMany(); // Could be millions!

// ✅ Paginate
const PAGE_SIZE = 20;
const page = 1;

const posts = await prisma.post.findMany({
  take: PAGE_SIZE,
  skip: (page - 1) * PAGE_SIZE,
  orderBy: { createdAt: 'desc' },
});
```

### 5. Use Transactions for Related Operations

```typescript
// ❌ Separate operations can leave inconsistent state
const user = await prisma.user.create({ data: userData });
await prisma.profile.create({ data: { userId: user.id, ...profileData } });
// If profile creation fails, user exists without profile!

// ✅ Use transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({
    data: { userId: user.id, ...profileData },
  });
  return { user, profile };
});
// All or nothing!
```

### 6. Leverage Type Inference

```typescript
// ✅ Let TypeScript infer types
const user = await prisma.user.findUnique({ where: { id: 1 } });
// user is automatically typed as User | null

// ✅ Use Prisma generated types when needed
import { User, Post, Prisma } from '@prisma/client';

type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true };
}>;

function processUser(user: UserWithPosts) {
  user.posts.forEach(post => console.log(post.title));
}
```

---

## Summary

Prisma CRUD operations provide:

1. **Type Safety**: Every operation is fully typed
2. **Consistency**: Same patterns across all models
3. **Relations**: Easy nested creates, updates, and includes
4. **Flexibility**: Select specific fields, filter relations
5. **Performance**: createMany, updateMany for bulk operations
6. **Convenience**: Upsert for create-or-update patterns

The key difference from other ORMs is that Prisma's return types **change based on your query** - if you select only `email`, TypeScript knows only `email` is available. This prevents entire categories of bugs!
