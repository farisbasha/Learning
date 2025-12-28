# Prisma CRUD - Quick Reference

## PrismaClient Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## CREATE

### create() - Single Record

```typescript
// Basic create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'User',
  },
});

// With nested relation (create related)
const userWithProfile = await prisma.user.create({
  data: {
    email: 'user@example.com',
    profile: { create: { bio: 'Hello' } },
  },
  include: { profile: true },
});

// Connect to existing relation
const post = await prisma.post.create({
  data: {
    title: 'Title',
    author: { connect: { id: 1 } },
  },
});

// Connect or create
const post = await prisma.post.create({
  data: {
    title: 'Title',
    author: {
      connectOrCreate: {
        where: { email: 'author@example.com' },
        create: { email: 'author@example.com', name: 'Author' },
      },
    },
  },
});
```

### createMany() - Bulk Insert

```typescript
const result = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com' },
    { email: 'user2@example.com' },
  ],
  skipDuplicates: true, // Optional
});
// Returns: { count: 2 }
```

---

## READ

### findUnique() - By Unique Field

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
});
// Returns: User | null

const userByEmail = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Composite unique
const member = await prisma.teamMember.findUnique({
  where: {
    teamId_userId: { teamId: 1, userId: 2 },
  },
});
```

### findUniqueOrThrow() - Throws if Not Found

```typescript
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
// Returns: User (throws if not found)
```

### findFirst() - First Match

```typescript
const user = await prisma.user.findFirst({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
});
// Returns: User | null
```

### findMany() - Multiple Records

```typescript
// All records
const users = await prisma.user.findMany();

// With filtering
const users = await prisma.user.findMany({
  where: { isActive: true },
  orderBy: { name: 'asc' },
  skip: 0,
  take: 10,
});

// Select specific fields
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

### count()

```typescript
const total = await prisma.user.count();
const active = await prisma.user.count({ where: { isActive: true } });
```

### aggregate()

```typescript
const stats = await prisma.product.aggregate({
  _count: { _all: true },
  _avg: { price: true },
  _sum: { quantity: true },
  _min: { price: true },
  _max: { price: true },
});
```

### groupBy()

```typescript
const grouped = await prisma.user.groupBy({
  by: ['role'],
  _count: { _all: true },
});
```

---

## UPDATE

### update() - Single Record

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'New Name' },
});

// Increment/Decrement
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    views: { increment: 1 },
    stock: { decrement: 1 },
  },
});

// Update relation
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: { update: { bio: 'Updated' } },
  },
});

// Change relation
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    author: { connect: { id: 2 } },
  },
});

// Disconnect relation
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: { disconnect: true },
  },
});

// Many-to-many operations
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      connect: [{ id: 1 }, { id: 2 }],    // Add
      disconnect: [{ id: 3 }],             // Remove
      set: [{ id: 1 }, { id: 4 }],        // Replace all
    },
  },
});
```

### updateMany() - Bulk Update

```typescript
const result = await prisma.post.updateMany({
  where: { authorId: 1 },
  data: { published: true },
});
// Returns: { count: 5 }
```

---

## DELETE

### delete() - Single Record

```typescript
const user = await prisma.user.delete({
  where: { id: 1 },
});
// Returns deleted record
```

### deleteMany() - Bulk Delete

```typescript
const result = await prisma.post.deleteMany({
  where: { published: false },
});
// Returns: { count: 10 }

// Delete all
await prisma.comment.deleteMany({});
```

---

## UPSERT

```typescript
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: {
    name: 'Updated Name',
    lastLogin: new Date(),
  },
  create: {
    email: 'user@example.com',
    name: 'New User',
  },
});
```

---

## SELECT vs INCLUDE

### select - Choose Specific Fields

```typescript
// Only selected fields returned
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    posts: { select: { title: true } },
  },
});
// Type: { id: number; email: string; posts: { title: string }[] }
```

### include - Add Relations to Default

```typescript
// All fields + relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true,
  },
});
// Type: User & { posts: Post[]; profile: Profile | null }
```

### include with Filtering

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
    _count: {
      select: { posts: true },
    },
  },
});
```

---

## Common Patterns

### Pagination

```typescript
const PAGE_SIZE = 20;
const page = 1;

const [users, total] = await Promise.all([
  prisma.user.findMany({
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    orderBy: { id: 'asc' },
  }),
  prisma.user.count(),
]);

const totalPages = Math.ceil(total / PAGE_SIZE);
```

### Soft Delete

```typescript
// Delete
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
});

// Query active only
const users = await prisma.user.findMany({
  where: { deletedAt: null },
});

// Restore
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: null },
});
```

### Check Existence

```typescript
const exists = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  select: { id: true },
});

if (exists) {
  // User exists
}
```

---

## Return Types

| Method | Returns |
|--------|---------|
| `findUnique` | `T \| null` |
| `findUniqueOrThrow` | `T` |
| `findFirst` | `T \| null` |
| `findFirstOrThrow` | `T` |
| `findMany` | `T[]` |
| `create` | `T` |
| `createMany` | `{ count: number }` |
| `update` | `T` |
| `updateMany` | `{ count: number }` |
| `delete` | `T` |
| `deleteMany` | `{ count: number }` |
| `upsert` | `T` |
| `count` | `number` |
| `aggregate` | `AggregateResult` |
| `groupBy` | `GroupByResult[]` |

---

## Type Utilities

```typescript
import { Prisma, User, Post } from '@prisma/client';

// Get payload type with relations
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true };
}>;

// Input types
type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;
type UserWhereInput = Prisma.UserWhereInput;
type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
```
