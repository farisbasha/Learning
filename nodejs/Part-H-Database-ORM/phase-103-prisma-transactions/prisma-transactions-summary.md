# Phase 103: Prisma Transactions - Quick Reference

## Transaction Types

### Sequential Transactions

**Array of operations** - all succeed or all fail

```typescript
const [user, profile, posts] = await prisma.$transaction([
    prisma.user.create({ data: { email: 'user@example.com' } }),
    prisma.profile.create({ data: { bio: 'Bio', userId: 1 } }),
    prisma.post.createMany({ data: [{ title: 'Post 1' }, { title: 'Post 2' }] })
]);
```

**Use when:**
- Simple, independent operations
- No conditional logic needed
- Can't reference previous results

### Interactive Transactions

**Callback with logic** - full control

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: 1 } });

    if (user.balance < amount) {
        throw new Error('Insufficient balance');
    }

    await tx.user.update({
        where: { id: 1 },
        data: { balance: { decrement: amount } }
    });

    await tx.transaction.create({
        data: { userId: 1, amount }
    });
});
```

**Use when:**
- Need conditional logic (if/else)
- Reference previous query results
- Complex workflows with loops
- Business validation

## Transaction Options

```typescript
await prisma.$transaction(
    async (tx) => {
        // Transaction logic
    },
    {
        maxWait: 5000,              // Max wait for transaction slot (ms)
        timeout: 10000,             // Max transaction duration (ms)
        isolationLevel: 'Serializable'  // Isolation level
    }
);
```

## Isolation Levels

| Level | Dirty Reads | Non-Repeatable Reads | Phantom Reads | Performance |
|-------|-------------|---------------------|---------------|-------------|
| **Read Committed** (default) | ❌ No | ✅ Possible | ✅ Possible | Fast |
| **Repeatable Read** | ❌ No | ❌ No | ✅ Possible | Medium |
| **Serializable** | ❌ No | ❌ No | ❌ No | Slow |

### Read Committed (Default)

```typescript
await prisma.$transaction(async (tx) => {
    const user1 = await tx.user.findUnique({ where: { id: 1 } });
    // Another transaction commits changes here
    const user2 = await tx.user.findUnique({ where: { id: 1 } });
    // user1 !== user2 (non-repeatable read)
});
```

**Use for:** Most queries, performance-critical operations

### Repeatable Read

```typescript
await prisma.$transaction(
    async (tx) => {
        const user1 = await tx.user.findUnique({ where: { id: 1 } });
        // Another transaction commits changes here
        const user2 = await tx.user.findUnique({ where: { id: 1 } });
        // user1 === user2 (snapshot isolation)
    },
    { isolationLevel: 'RepeatableRead' }
);
```

**Use for:** Analytics, reports, consistent snapshots

### Serializable

```typescript
await prisma.$transaction(
    async (tx) => {
        // Highest isolation - prevents all anomalies
        // Transactions appear to run serially
    },
    { isolationLevel: 'Serializable' }
);
```

**Use for:** Financial transactions, critical data integrity

## Common Patterns

### Money Transfer

```typescript
async function transferMoney(fromId: number, toId: number, amount: number) {
    return await prisma.$transaction(async (tx) => {
        // Check balance
        const sender = await tx.user.findUnique({ where: { id: fromId } });

        if (!sender || sender.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Debit sender
        await tx.user.update({
            where: { id: fromId },
            data: { balance: { decrement: amount } }
        });

        // Credit receiver
        await tx.user.update({
            where: { id: toId },
            data: { balance: { increment: amount } }
        });

        // Log transaction
        return await tx.transfer.create({
            data: { fromId, toId, amount }
        });
    });
}
```

### Inventory Management

```typescript
await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
        where: { id: productId }
    });

    if (product.stock < quantity) {
        throw new Error('Insufficient stock');
    }

    await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
    });

    await tx.order.create({
        data: {
            productId,
            quantity,
            status: 'CONFIRMED'
        }
    });
});
```

### Batch Processing

```typescript
await prisma.$transaction(async (tx) => {
    const pendingOrders = await tx.order.findMany({
        where: { status: 'PENDING' }
    });

    for (const order of pendingOrders) {
        const product = await tx.product.findUnique({
            where: { id: order.productId }
        });

        if (product.stock >= order.quantity) {
            await tx.product.update({
                where: { id: order.productId },
                data: { stock: { decrement: order.quantity } }
            });

            await tx.order.update({
                where: { id: order.id },
                data: { status: 'FULFILLED' }
            });
        }
    }
});
```

## Rollback

### Automatic Rollback

```typescript
try {
    await prisma.$transaction(async (tx) => {
        await tx.user.create({ data: { email: 'test@example.com' } });

        // Throw to rollback
        if (validationFails) {
            throw new Error('Validation failed');
        }

        await tx.post.create({ data: { title: 'Post' } });
    });
} catch (error) {
    console.log('Transaction rolled back');
    // No user or post created
}
```

### Manual Rollback Pattern

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });

    const apiResult = await callExternalAPI(user.id);

    if (!apiResult.success) {
        throw new Error('API failed'); // Triggers rollback
    }

    await tx.user.update({
        where: { id: user.id },
        data: { verified: true }
    });
});
```

## Prisma Middleware

### Basic Middleware

```typescript
prisma.$use(async (params, next) => {
    // params: { model, action, args }
    // next: function to execute query

    console.log('Before query:', params.action);

    const result = await next(params);

    console.log('After query');

    return result;
});
```

### Query Logging

```typescript
prisma.$use(async (params, next) => {
    const start = Date.now();

    const result = await next(params);

    const duration = Date.now() - start;

    console.log(`${params.model}.${params.action} took ${duration}ms`);

    return result;
});
```

### Auto-Timestamp

```typescript
prisma.$use(async (params, next) => {
    if (params.action === 'update' || params.action === 'updateMany') {
        if (params.args.data) {
            params.args.data.updatedAt = new Date();
        }
    }

    return next(params);
});
```

### Access Control

```typescript
prisma.$use(async (params, next) => {
    if (params.model === 'Post' && params.action === 'update') {
        const post = await prisma.post.findUnique({
            where: params.args.where
        });

        if (post?.userId !== currentUserId) {
            throw new Error('Access denied');
        }
    }

    return next(params);
});
```

### Slow Query Detection

```typescript
const SLOW_THRESHOLD = 1000; // 1 second

prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > SLOW_THRESHOLD) {
        console.warn(`Slow query: ${params.model}.${params.action} (${duration}ms)`);
    }

    return result;
});
```

## Soft Deletes

### Schema

```prisma
model User {
    id        Int       @id @default(autoincrement())
    email     String    @unique
    deletedAt DateTime?  // null = active
}
```

### Soft Delete Middleware

```typescript
prisma.$use(async (params, next) => {
    if (params.model === 'User') {
        // Convert delete to update
        if (params.action === 'delete') {
            params.action = 'update';
            params.args['data'] = { deletedAt: new Date() };
        }

        if (params.action === 'deleteMany') {
            params.action = 'updateMany';
            params.args['data'] = { deletedAt: new Date() };
        }

        // Filter soft-deleted from queries
        if (params.action === 'findMany') {
            if (params.args.where) {
                params.args.where['deletedAt'] = null;
            } else {
                params.args['where'] = { deletedAt: null };
            }
        }

        if (params.action === 'findUnique' || params.action === 'findFirst') {
            params.action = 'findFirst';
            params.args.where['deletedAt'] = null;
        }
    }

    return next(params);
});
```

**Now:**
```typescript
// Soft delete
await prisma.user.delete({ where: { id: 1 } });
// SQL: UPDATE users SET deleted_at = NOW() WHERE id = 1

// Queries exclude soft-deleted
await prisma.user.findMany();
// SQL: SELECT * FROM users WHERE deleted_at IS NULL
```

### Hard Delete (Force)

```typescript
// Bypass middleware with raw query
await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${userId}`;
```

## Raw Queries

### $queryRaw (SELECT)

```typescript
import { Prisma } from '@prisma/client';

// Type-safe raw query
const users = await prisma.$queryRaw<User[]>`
    SELECT * FROM "User"
    WHERE email LIKE ${`%@example.com`}
`;
```

### $executeRaw (INSERT/UPDATE/DELETE)

```typescript
// Returns affected row count
const count = await prisma.$executeRaw`
    UPDATE "User"
    SET role = 'ADMIN'
    WHERE email LIKE ${`%@admin.com`}
`;

console.log(`Updated ${count} users`);
```

### Complex Joins

```typescript
interface PostWithStats {
    id: number;
    title: string;
    authorName: string;
    commentCount: number;
}

const posts = await prisma.$queryRaw<PostWithStats[]>`
    SELECT
        p.id,
        p.title,
        u.name AS "authorName",
        COUNT(c.id) AS "commentCount"
    FROM "Post" p
    JOIN "User" u ON p.user_id = u.id
    LEFT JOIN "Comment" c ON c.post_id = p.id
    GROUP BY p.id, p.title, u.name
    HAVING COUNT(c.id) > 5
    ORDER BY "commentCount" DESC
`;
```

### Bulk Operations

```typescript
const users = [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
];

await prisma.$executeRaw`
    INSERT INTO "User" (email, name)
    VALUES
        ${Prisma.join(users.map(u => Prisma.sql`(${u.email}, ${u.name})`))}
`;
```

### SQL Injection Prevention

```typescript
// ✅ Safe: Template literal with parameters
const email = userInput;
await prisma.$queryRaw`
    SELECT * FROM "User" WHERE email = ${email}
`;
// Parameters are escaped automatically

// ❌ DANGEROUS: String concatenation
await prisma.$queryRawUnsafe(
    `SELECT * FROM "User" WHERE email = '${userInput}'`
);
// SQL injection risk!
```

## Connection Management

### Singleton Pattern

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
```

### Manual Connection Control

```typescript
// Connect
await prisma.$connect();

// Disconnect
await prisma.$disconnect();

// Auto-disconnect on exit
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
```

### Connection Pool Configuration

```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?connection_limit=20&pool_timeout=20"
```

## Testing

### Test Setup

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
    }
});

beforeEach(async () => {
    // Reset before each test
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Post" CASCADE`;
});

afterAll(async () => {
    await prisma.$disconnect();
});

export { prisma };
```

### Integration Tests

```typescript
describe('User Service', () => {
    it('should create user', async () => {
        const user = await prisma.user.create({
            data: { email: 'test@example.com' }
        });

        expect(user.email).toBe('test@example.com');
    });

    it('should enforce unique email', async () => {
        await prisma.user.create({
            data: { email: 'test@example.com' }
        });

        await expect(
            prisma.user.create({
                data: { email: 'test@example.com' }
            })
        ).rejects.toThrow();
    });
});
```

### Mocking Prisma

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

const mockPrisma = mockDeep<PrismaClient>();

mockPrisma.user.findUnique.mockResolvedValue({
    id: 1,
    email: 'test@example.com'
});

const user = await mockPrisma.user.findUnique({ where: { id: 1 } });
```

## Advanced Patterns

### Optimistic Locking

```prisma
model Post {
    id      Int @id
    title   String
    version Int @default(0)
}
```

```typescript
await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { id: postId } });

    const updated = await tx.post.updateMany({
        where: {
            id: postId,
            version: post.version  // Must match current version
        },
        data: {
            title: newTitle,
            version: { increment: 1 }
        }
    });

    if (updated.count === 0) {
        throw new Error('Concurrent modification detected');
    }
});
```

### Retry on Deadlock

```typescript
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (error.code === 'P2034' && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, attempt * 100));
                continue;
            }
            throw error;
        }
    }
}

await withRetry(() => prisma.$transaction(async (tx) => {
    // Transaction logic
}));
```

### Event Sourcing

```typescript
await prisma.$transaction(async (tx) => {
    // Update aggregate
    const account = await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
    });

    // Store event
    await tx.accountEvent.create({
        data: {
            accountId,
            type: 'DEBIT',
            amount,
            balanceAfter: account.balance,
            timestamp: new Date()
        }
    });
});
```

## Best Practices

### 1. Keep Transactions Short

```typescript
// ❌ Bad: Long transaction with external call
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    await sendEmail(user.email);  // External call!
    await tx.log.create({ data: { userId: user.id } });
});

// ✅ Good: External call after transaction
const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    await tx.log.create({ data: { userId: user.id } });
    return user;
});
await sendEmail(user.email);
```

### 2. Choose Appropriate Isolation

```typescript
// Financial: Use Serializable
await prisma.$transaction(
    async (tx) => { /* money transfer */ },
    { isolationLevel: 'Serializable' }
);

// Analytics: Use Repeatable Read
await prisma.$transaction(
    async (tx) => { /* report generation */ },
    { isolationLevel: 'RepeatableRead' }
);

// Simple queries: Use default
await prisma.user.findMany();
```

### 3. Handle Timeouts

```typescript
await prisma.$transaction(
    async (tx) => {
        // Long operation
    },
    {
        maxWait: 10000,   // Wait up to 10s for slot
        timeout: 30000    // Transaction can run 30s
    }
);
```

### 4. Don't Nest Transactions

```typescript
// ❌ Bad: Nested not supported
await prisma.$transaction(async (tx) => {
    await tx.$transaction(async (innerTx) => {
        // Won't work!
    });
});

// ✅ Good: Flatten logic
await prisma.$transaction(async (tx) => {
    // All operations here
});
```

### 5. Use Sequential for Simple Cases

```typescript
// Simple: Use sequential
await prisma.$transaction([
    prisma.user.create({ data: user1 }),
    prisma.user.create({ data: user2 })
]);

// Complex: Use interactive
await prisma.$transaction(async (tx) => {
    if (condition) {
        // conditional logic
    }
});
```

### 6. Monitor Transaction Performance

```typescript
prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > 1000) {
        console.warn(`Slow transaction: ${params.model}.${params.action}`);
    }

    return result;
});
```

## Quick Decision Guide

### Sequential vs Interactive?

| Criteria | Use Sequential | Use Interactive |
|----------|---------------|-----------------|
| Conditional logic | ❌ No | ✅ Yes |
| Reference previous results | ❌ No | ✅ Yes |
| Loops | ❌ No | ✅ Yes |
| Simple operations | ✅ Yes | Use either |
| Independent operations | ✅ Yes | Use either |

### Which Isolation Level?

| Use Case | Level |
|----------|-------|
| Money transfers | Serializable |
| Inventory updates | Serializable |
| User registration | Read Committed |
| Blog posts | Read Committed |
| Analytics reports | Repeatable Read |
| Batch jobs | Repeatable Read |

### Raw Query vs Prisma Client?

| Use | Prisma Client | Raw Query |
|-----|--------------|-----------|
| Simple CRUD | ✅ Preferred | ❌ No |
| Complex joins | ❌ Limited | ✅ Use raw |
| Aggregations | ❌ Limited | ✅ Use raw |
| Bulk operations | ❌ Slow | ✅ Use raw |
| Type safety | ✅ Full | ⚠️ Partial |
| Database-specific features | ❌ No | ✅ Available |

## Common Errors

**P2034: Transaction failed due to write conflict or deadlock**
- Cause: Concurrent transactions accessing same data
- Solution: Use retry pattern, higher isolation level

**P2028: Transaction API error**
- Cause: Timeout, connection issues
- Solution: Increase timeout, check connection pool

**P2024: Timed out fetching a new connection from pool**
- Cause: All connections busy
- Solution: Increase connection_limit, optimize queries
