# Phase 100: Prisma CRUD Operations
## Agent Instructions

**Phase**: 100 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. PrismaClient instantiation
2. Create: `create()`, `createMany()`
3. Read: `findUnique()`, `findFirst()`, `findMany()`
4. Update: `update()`, `updateMany()`
5. Delete: `delete()`, `deleteMany()`
6. Upsert: `upsert()`
7. Type-safe queries (auto-completion)
8. Return types
9. Select specific fields
10. Include relations

## Example
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
    data: {
        email: 'test@test.com',
        name: 'Test User',
        posts: {
            create: { title: 'First Post' }
        }
    }
});

// Read
const user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
    include: { posts: true }
});

// Update
await prisma.user.update({
    where: { id: user.id },
    data: { name: 'New Name' }
});

// Delete
await prisma.user.delete({ where: { id: user.id } });
```

## Content Instructions
**Notes**: Prisma CRUD with full type safety (detailed)
**Summary**: Prisma Client API cheatsheet
