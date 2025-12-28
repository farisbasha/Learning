# Phase 103: Prisma Transactions - Comprehensive Notes

**Phase**: 103 | **Part**: H - Database & ORM | **Language**: TypeScript
**Focus**: Deep understanding of Prisma transactions, isolation levels, middleware, and advanced patterns

---

## Table of Contents
1. [Introduction to Transactions](#introduction)
2. [Sequential Transactions](#sequential-transactions)
3. [Interactive Transactions](#interactive-transactions)
4. [Transaction Isolation Levels](#isolation-levels)
5. [Rollback Strategies](#rollback-strategies)
6. [Prisma Middleware](#middleware)
7. [Soft Deletes with Middleware](#soft-deletes)
8. [Query Logging](#query-logging)
9. [Raw Queries](#raw-queries)
10. [Connection Management](#connection-management)
11. [Testing with Prisma](#testing)
12. [Advanced Patterns](#advanced-patterns)
13. [Best Practices](#best-practices)

---

## Introduction to Transactions {#introduction}

### What Are Database Transactions?

A **transaction** is a sequence of database operations that are executed as a **single unit of work**. Transactions follow the **ACID** properties:

**ACID Principles:**

```
┌─────────────────────────────────────────────────────────┐
│                    ACID Properties                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  A - Atomicity                                          │
│  ──────────────                                         │
│  All operations succeed or all fail                     │
│  No partial execution                                   │
│                                                         │
│  Example: Transfer $100 from Alice to Bob               │
│  Either both debit Alice AND credit Bob succeed,        │
│  or neither happens (if any fails)                      │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  C - Consistency                                        │
│  ────────────────                                       │
│  Database remains in valid state                        │
│  All constraints maintained                             │
│                                                         │
│  Example: Total money in system stays same              │
│  Alice ($100) + Bob ($50) = $150 before                 │
│  Alice ($0) + Bob ($150) = $150 after                   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  I - Isolation                                          │
│  ──────────────                                         │
│  Concurrent transactions don't interfere                │
│  Each transaction sees consistent snapshot              │
│                                                         │
│  Example: Two transfers happening simultaneously        │
│  Each sees database in consistent state                 │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  D - Durability                                         │
│  ─────────────                                          │
│  Committed changes persist                              │
│  Survive power failures, crashes                        │
│                                                         │
│  Example: After commit, data saved to disk              │
│  Recovery from backup includes transaction              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### WHY Use Transactions?

**Without Transactions:**
```typescript
// ❌ Dangerous: Not atomic
const user = await prisma.user.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } }
});

// What if this fails? User lost money!
await prisma.transaction.create({
    data: { userId: 1, amount: -100 }
});
```

**With Transactions:**
```typescript
// ✅ Safe: All or nothing
await prisma.$transaction(async (tx) => {
    await tx.user.update({
        where: { id: 1 },
        data: { balance: { decrement: 100 } }
    });

    await tx.transaction.create({
        data: { userId: 1, amount: -100 }
    });
});
// If anything fails, entire transaction rolls back
```

### Prisma Transaction Types

Prisma provides **two ways** to execute transactions:

1. **Sequential Transactions**: Array of operations
2. **Interactive Transactions**: Callback with logic

---

## Sequential Transactions {#sequential-transactions}

### Basic Syntax

```typescript
const result = await prisma.$transaction([
    prisma.user.create({ data: { email: 'alice@example.com' } }),
    prisma.post.create({ data: { title: 'First Post', userId: 1 } }),
    prisma.comment.create({ data: { text: 'Great!', postId: 1 } })
]);

// result is an array: [user, post, comment]
```

### How Sequential Transactions Work

**Execution Flow:**

```
┌─────────────────────────────────────────────────────────┐
│           Sequential Transaction Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. BEGIN TRANSACTION                                   │
│                                                         │
│  2. Execute operations in order:                        │
│     a. Create user                                      │
│     b. Create post                                      │
│     c. Create comment                                   │
│                                                         │
│  3. If ALL succeed → COMMIT                             │
│     If ANY fails → ROLLBACK                             │
│                                                         │
│  4. Return array of results                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Example 1: Creating Related Records

```typescript
const [user, profile, posts] = await prisma.$transaction([
    prisma.user.create({
        data: {
            email: 'bob@example.com',
            name: 'Bob'
        }
    }),
    prisma.profile.create({
        data: {
            bio: 'Software engineer',
            userId: 1  // Assumes user.id will be 1
        }
    }),
    prisma.post.createMany({
        data: [
            { title: 'Post 1', userId: 1 },
            { title: 'Post 2', userId: 1 }
        ]
    })
]);

console.log(user);    // User object
console.log(profile); // Profile object
console.log(posts);   // { count: 2 }
```

**Generated SQL:**
```sql
BEGIN;

INSERT INTO "User" (email, name) VALUES ('bob@example.com', 'Bob') RETURNING *;

INSERT INTO "Profile" (bio, user_id) VALUES ('Software engineer', 1) RETURNING *;

INSERT INTO "Post" (title, user_id) VALUES
    ('Post 1', 1),
    ('Post 2', 1);

COMMIT;
```

### Example 2: Update Multiple Records

```typescript
await prisma.$transaction([
    prisma.user.update({
        where: { id: 1 },
        data: { balance: { decrement: 100 } }
    }),
    prisma.user.update({
        where: { id: 2 },
        data: { balance: { increment: 100 } }
    }),
    prisma.transfer.create({
        data: {
            fromUserId: 1,
            toUserId: 2,
            amount: 100
        }
    })
]);
```

### Example 3: Handling Errors

```typescript
try {
    const result = await prisma.$transaction([
        prisma.user.create({ data: { email: 'test@example.com' } }),
        prisma.user.create({ data: { email: 'test@example.com' } }) // Duplicate!
    ]);
} catch (error) {
    console.error('Transaction failed:', error);
    // First user creation was rolled back automatically
}
```

### Limitations of Sequential Transactions

**Cannot do:**

1. **Conditional Logic**: No if/else between operations
2. **Reference Previous Results**: Can't use result of operation 1 in operation 2
3. **Complex Workflows**: No loops or dynamic queries

```typescript
// ❌ This won't work - can't reference user.id
await prisma.$transaction([
    prisma.user.create({ data: { email: 'test@example.com' } }),
    prisma.post.create({
        data: {
            title: 'Post',
            userId: user.id  // ❌ user not available yet!
        }
    })
]);
```

For these cases, use **Interactive Transactions**.

---

## Interactive Transactions {#interactive-transactions}

### Basic Syntax

```typescript
await prisma.$transaction(async (tx) => {
    // tx is a Prisma Client instance
    // All queries inside use the same transaction

    const user = await tx.user.create({
        data: { email: 'alice@example.com' }
    });

    const post = await tx.post.create({
        data: {
            title: 'My Post',
            userId: user.id  // ✅ Can reference user.id
        }
    });

    return { user, post };
});
```

### How Interactive Transactions Work

**Execution Flow:**

```
┌─────────────────────────────────────────────────────────┐
│          Interactive Transaction Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. BEGIN TRANSACTION                                   │
│                                                         │
│  2. Execute callback function:                          │
│     - Run queries using tx client                       │
│     - Can use if/else, loops, etc.                      │
│     - Can reference previous query results              │
│                                                         │
│  3. If callback completes → COMMIT                      │
│     If error thrown → ROLLBACK                          │
│                                                         │
│  4. Return callback result                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Example 1: Transfer Money (Classic Use Case)

```typescript
async function transferMoney(
    fromUserId: number,
    toUserId: number,
    amount: number
) {
    return await prisma.$transaction(async (tx) => {
        // 1. Check sender balance
        const sender = await tx.user.findUnique({
            where: { id: fromUserId }
        });

        if (!sender) {
            throw new Error('Sender not found');
        }

        if (sender.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // 2. Debit sender
        await tx.user.update({
            where: { id: fromUserId },
            data: { balance: { decrement: amount } }
        });

        // 3. Credit receiver
        await tx.user.update({
            where: { id: toUserId },
            data: { balance: { increment: amount } }
        });

        // 4. Record transfer
        const transfer = await tx.transfer.create({
            data: {
                fromUserId,
                toUserId,
                amount,
                timestamp: new Date()
            }
        });

        return transfer;
    });
}

// Usage
try {
    const transfer = await transferMoney(1, 2, 100);
    console.log('Transfer successful:', transfer);
} catch (error) {
    console.error('Transfer failed:', error.message);
    // All operations rolled back
}
```

### Example 2: Conditional Logic

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
        where: { id: 1 },
        include: { subscription: true }
    });

    if (user.subscription?.plan === 'PREMIUM') {
        // Premium users get bonus points
        await tx.user.update({
            where: { id: 1 },
            data: { points: { increment: 100 } }
        });
    } else {
        // Regular users get normal points
        await tx.user.update({
            where: { id: 1 },
            data: { points: { increment: 10 } }
        });
    }

    // Create activity log
    await tx.activityLog.create({
        data: {
            userId: 1,
            action: 'POINTS_AWARDED',
            timestamp: new Date()
        }
    });
});
```

### Example 3: Batch Processing with Loop

```typescript
await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
        where: { status: 'PENDING' }
    });

    for (const order of orders) {
        // Check inventory
        const product = await tx.product.findUnique({
            where: { id: order.productId }
        });

        if (product.stock >= order.quantity) {
            // Reduce stock
            await tx.product.update({
                where: { id: order.productId },
                data: { stock: { decrement: order.quantity } }
            });

            // Mark order as fulfilled
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'FULFILLED' }
            });
        } else {
            // Cancel order
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' }
            });
        }
    }
});
```

### Example 4: Early Rollback

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: { email: 'test@example.com' }
    });

    const validationResult = await validateEmail(user.email);

    if (!validationResult.valid) {
        // Explicitly throw to rollback
        throw new Error('Email validation failed');
    }

    await tx.emailVerification.create({
        data: {
            userId: user.id,
            token: validationResult.token
        }
    });
});
```

### Transaction Options

```typescript
await prisma.$transaction(
    async (tx) => {
        // Transaction logic
    },
    {
        maxWait: 5000,     // Max time to wait for transaction start (ms)
        timeout: 10000,    // Max time transaction can run (ms)
        isolationLevel: 'Serializable'  // Isolation level
    }
);
```

**Options Explained:**

- **maxWait**: How long to wait for a transaction slot (default: 2000ms)
- **timeout**: Max transaction duration before automatic rollback (default: 5000ms)
- **isolationLevel**: Transaction isolation level (see next section)

---

## Transaction Isolation Levels {#isolation-levels}

### What Are Isolation Levels?

Isolation levels control **how transactions interact with each other** when running concurrently.

### Available Levels (Lowest to Highest Isolation)

```
┌─────────────────────────────────────────────────────────────┐
│              Transaction Isolation Levels                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Read Uncommitted (PostgreSQL doesn't support)              │
│  ──────────────────                                         │
│  Dirty reads possible                                       │
│  See uncommitted changes from other transactions            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Read Committed (PostgreSQL default)                        │
│  ─────────────                                              │
│  ✓ No dirty reads                                           │
│  ✗ Non-repeatable reads possible                            │
│  ✗ Phantom reads possible                                   │
│                                                             │
│  Each query sees committed data at query time               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Repeatable Read                                            │
│  ────────────────                                           │
│  ✓ No dirty reads                                           │
│  ✓ No non-repeatable reads                                  │
│  ✗ Phantom reads possible                                   │
│                                                             │
│  Sees snapshot at transaction start                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Serializable (Highest isolation)                           │
│  ────────────                                               │
│  ✓ No dirty reads                                           │
│  ✓ No non-repeatable reads                                  │
│  ✓ No phantom reads                                         │
│                                                             │
│  Transactions appear to run one at a time                   │
│  Slowest, most restrictive                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Read Phenomena Explained

**Dirty Read:**
Transaction A reads data written by transaction B that hasn't committed yet.

**Non-Repeatable Read:**
Transaction A reads same row twice and gets different values (B modified it between reads).

**Phantom Read:**
Transaction A runs same query twice and gets different number of rows (B inserted/deleted rows).

### Isolation Level Examples

#### Read Committed (Default)

```typescript
// Transaction A
await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: 1 } });
    console.log(user.balance); // 100

    // While this is running, Transaction B commits:
    // UPDATE users SET balance = 200 WHERE id = 1

    const userAgain = await tx.user.findUnique({ where: { id: 1 } });
    console.log(userAgain.balance); // 200 (changed!)
});
```

#### Repeatable Read

```typescript
// Transaction A
await prisma.$transaction(
    async (tx) => {
        const user = await tx.user.findUnique({ where: { id: 1 } });
        console.log(user.balance); // 100

        // Transaction B commits:
        // UPDATE users SET balance = 200 WHERE id = 1

        const userAgain = await tx.user.findUnique({ where: { id: 1 } });
        console.log(userAgain.balance); // 100 (same! snapshot isolation)
    },
    { isolationLevel: 'RepeatableRead' }
);
```

#### Serializable

```typescript
// Highest isolation - transactions run as if serial
await prisma.$transaction(
    async (tx) => {
        const count = await tx.user.count();
        console.log(count); // 10

        // Transaction B tries to insert a user
        // It will wait or fail due to serialization

        const countAgain = await tx.user.count();
        console.log(countAgain); // 10 (no phantoms)
    },
    { isolationLevel: 'Serializable' }
);
```

### Choosing Isolation Level

**Use Read Committed (default) when:**
- Performance is critical
- Eventual consistency is acceptable
- Simple read operations

**Use Repeatable Read when:**
- Need consistent snapshot within transaction
- Analytical queries
- Report generation

**Use Serializable when:**
- Financial transactions
- Critical data integrity
- Preventing race conditions

**Trade-off:**
```
Lower Isolation ←──────────────────────→ Higher Isolation
(Faster)                                  (Slower)
(Less consistent)                         (More consistent)
```

---

## Rollback Strategies {#rollback-strategies}

### Automatic Rollback

**Throwing an error automatically rolls back:**

```typescript
try {
    await prisma.$transaction(async (tx) => {
        await tx.user.create({ data: { email: 'test@example.com' } });

        // Validation fails
        if (someCondition) {
            throw new Error('Validation failed');
        }

        await tx.post.create({ data: { title: 'Post' } });
    });
} catch (error) {
    console.log('Transaction rolled back:', error.message);
    // User was NOT created (rollback happened)
}
```

### Manual Rollback Pattern

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: { email: 'test@example.com' }
    });

    // External API call
    const apiResult = await callExternalAPI(user.id);

    if (!apiResult.success) {
        // Rollback by throwing
        throw new Error('External API failed');
    }

    await tx.user.update({
        where: { id: user.id },
        data: { verified: true }
    });
});
```

### Partial Rollback (Not Supported)

Prisma **does NOT support savepoints** (partial rollback within transaction).

```typescript
// ❌ This is NOT possible in Prisma
await prisma.$transaction(async (tx) => {
    await tx.user.create({ data: { email: 'user1@example.com' } });

    // SAVEPOINT checkpoint1; (not available)

    try {
        await tx.user.create({ data: { email: 'invalid' } });
    } catch (error) {
        // ROLLBACK TO checkpoint1; (not available)
        // Can't rollback just this part
    }

    // Either all succeeds or all fails
});
```

### Compensating Transactions

**Pattern:** If transaction fails, create another transaction to undo changes.

```typescript
async function processOrderWithCompensation(orderId: number) {
    let inventoryReserved = false;

    try {
        // Transaction 1: Reserve inventory
        await prisma.$transaction(async (tx) => {
            await tx.inventory.update({
                where: { id: 1 },
                data: { reserved: { increment: 10 } }
            });
            inventoryReserved = true;
        });

        // External payment API (outside transaction)
        const paymentResult = await processPayment(orderId);

        if (!paymentResult.success) {
            throw new Error('Payment failed');
        }

        // Transaction 2: Fulfill order
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'FULFILLED' }
            });
        });
    } catch (error) {
        // Compensating transaction: Release inventory
        if (inventoryReserved) {
            await prisma.$transaction(async (tx) => {
                await tx.inventory.update({
                    where: { id: 1 },
                    data: { reserved: { decrement: 10 } }
                });
            });
        }
        throw error;
    }
}
```

---

## Prisma Middleware {#middleware}

### What is Middleware?

Middleware allows you to **intercept and modify** Prisma queries before/after execution.

**Use Cases:**

1. Logging queries
2. Implementing soft deletes
3. Adding timestamps automatically
4. Data transformation
5. Access control
6. Caching

### Middleware Anatomy

```typescript
prisma.$use(async (params, next) => {
    // params: Query information (model, action, args)
    // next: Function to execute query

    // Before query
    console.log('Before:', params.action, params.model);

    // Execute query
    const result = await next(params);

    // After query
    console.log('After:', result);

    return result;
});
```

### Example 1: Query Logging

```typescript
prisma.$use(async (params, next) => {
    const start = Date.now();

    const result = await next(params);

    const duration = Date.now() - start;

    console.log(`Query ${params.model}.${params.action} took ${duration}ms`);

    return result;
});

// Now all queries are logged
await prisma.user.findMany(); // Query User.findMany took 15ms
```

### Example 2: Auto-Timestamp Updates

```typescript
prisma.$use(async (params, next) => {
    if (params.action === 'update' || params.action === 'updateMany') {
        // Add updatedAt to all updates
        if (params.args.data) {
            params.args.data.updatedAt = new Date();
        }
    }

    return next(params);
});

// Now all updates automatically set updatedAt
await prisma.user.update({
    where: { id: 1 },
    data: { name: 'Alice' }
    // updatedAt added automatically
});
```

### Example 3: Data Transformation

```typescript
prisma.$use(async (params, next) => {
    const result = await next(params);

    // Transform email to lowercase on read
    if (params.model === 'User' && result) {
        if (Array.isArray(result)) {
            return result.map(user => ({
                ...user,
                email: user.email?.toLowerCase()
            }));
        } else if (result.email) {
            return {
                ...result,
                email: result.email.toLowerCase()
            };
        }
    }

    return result;
});
```

### Example 4: Access Control

```typescript
function createAccessControlMiddleware(userId: number) {
    return async (params, next) => {
        if (params.model === 'Post') {
            // Only allow users to modify their own posts
            if (params.action === 'update' || params.action === 'delete') {
                const post = await prisma.post.findUnique({
                    where: params.args.where
                });

                if (post?.userId !== userId) {
                    throw new Error('Access denied');
                }
            }
        }

        return next(params);
    };
}

// Use it
prisma.$use(createAccessControlMiddleware(currentUserId));
```

### Middleware Execution Order

**Multiple middleware run in order:**

```typescript
// First middleware
prisma.$use(async (params, next) => {
    console.log('Middleware 1: Before');
    const result = await next(params);
    console.log('Middleware 1: After');
    return result;
});

// Second middleware
prisma.$use(async (params, next) => {
    console.log('Middleware 2: Before');
    const result = await next(params);
    console.log('Middleware 2: After');
    return result;
});

await prisma.user.findMany();

// Output:
// Middleware 1: Before
// Middleware 2: Before
// (Query executes)
// Middleware 2: After
// Middleware 1: After
```

---

## Soft Deletes with Middleware {#soft-deletes}

### What is Soft Delete?

**Soft Delete** = Mark records as deleted without removing them from database.

**Use Cases:**
- Audit trail
- Data recovery
- Regulatory compliance
- Undo functionality

### Schema Setup

```prisma
model User {
    id        Int       @id @default(autoincrement())
    email     String    @unique
    name      String?
    deletedAt DateTime? // Null = not deleted
}
```

### Soft Delete Middleware

```typescript
// Intercept delete operations
prisma.$use(async (params, next) => {
    if (params.model === 'User') {
        if (params.action === 'delete') {
            // Change delete to update
            params.action = 'update';
            params.args['data'] = { deletedAt: new Date() };
        }

        if (params.action === 'deleteMany') {
            // Change deleteMany to updateMany
            params.action = 'updateMany';
            if (params.args.data !== undefined) {
                params.args.data['deletedAt'] = new Date();
            } else {
                params.args['data'] = { deletedAt: new Date() };
            }
        }
    }

    return next(params);
});

// Now delete sets deletedAt instead of removing
await prisma.user.delete({ where: { id: 1 } });
// SQL: UPDATE users SET deleted_at = NOW() WHERE id = 1
```

### Filter Soft-Deleted Records

```typescript
// Exclude soft-deleted from queries
prisma.$use(async (params, next) => {
    if (params.model === 'User') {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
            params.action = 'findFirst';
            params.args.where['deletedAt'] = null;
        }

        if (params.action === 'findMany') {
            if (params.args.where) {
                if (params.args.where.deletedAt === undefined) {
                    params.args.where['deletedAt'] = null;
                }
            } else {
                params.args['where'] = { deletedAt: null };
            }
        }
    }

    return next(params);
});

// Now queries automatically exclude soft-deleted
await prisma.user.findMany();
// SQL: SELECT * FROM users WHERE deleted_at IS NULL
```

### Complete Soft Delete Implementation

```typescript
// prisma/middleware/softDelete.ts

export function createSoftDeleteMiddleware(models: string[]) {
    return async (params, next) => {
        if (models.includes(params.model)) {
            // Convert delete to soft delete
            if (params.action === 'delete') {
                params.action = 'update';
                params.args['data'] = { deletedAt: new Date() };
            }

            if (params.action === 'deleteMany') {
                params.action = 'updateMany';
                if (params.args.data !== undefined) {
                    params.args.data['deletedAt'] = new Date();
                } else {
                    params.args['data'] = { deletedAt: new Date() };
                }
            }

            // Filter out soft-deleted records
            if (params.action === 'findUnique' || params.action === 'findFirst') {
                params.action = 'findFirst';
                params.args.where['deletedAt'] = null;
            }

            if (params.action === 'findMany') {
                if (params.args.where) {
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where['deletedAt'] = null;
                    }
                } else {
                    params.args['where'] = { deletedAt: null };
                }
            }

            if (params.action === 'update') {
                params.action = 'updateMany';
                params.args.where['deletedAt'] = null;
            }

            if (params.action === 'updateMany') {
                if (params.args.where !== undefined) {
                    params.args.where['deletedAt'] = null;
                } else {
                    params.args['where'] = { deletedAt: null };
                }
            }
        }

        return next(params);
    };
}

// Usage
prisma.$use(createSoftDeleteMiddleware(['User', 'Post', 'Comment']));
```

### Hard Delete (Force Delete)

```typescript
// Bypass middleware for actual deletion
await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${userId}`;
```

---

## Query Logging {#query-logging}

### Enable Prisma Query Logs

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export default prisma;
```

**Log Levels:**
- `query`: All SQL queries
- `info`: Informational messages
- `warn`: Warnings
- `error`: Errors

### Custom Query Logging with Middleware

```typescript
prisma.$use(async (params, next) => {
    const start = Date.now();

    const result = await next(params);

    const duration = Date.now() - start;

    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        model: params.model,
        action: params.action,
        duration: `${duration}ms`,
        args: JSON.stringify(params.args)
    }, null, 2));

    return result;
});
```

### Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
    transports: [new winston.transports.Console()]
});

prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    logger.info('Prisma Query', {
        model: params.model,
        action: params.action,
        duration,
        timestamp: new Date()
    });

    return result;
});
```

### Slow Query Detection

```typescript
const SLOW_QUERY_THRESHOLD = 1000; // 1 second

prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > SLOW_QUERY_THRESHOLD) {
        console.warn(`🐌 Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
        console.warn('Args:', JSON.stringify(params.args, null, 2));
    }

    return result;
});
```

---

## Raw Queries {#raw-queries}

### When to Use Raw Queries

**Use raw SQL when:**
1. Complex queries Prisma doesn't support
2. Performance-critical operations
3. Database-specific features
4. Bulk operations
5. Analytical queries

### $queryRaw (SELECT queries)

```typescript
import { Prisma } from '@prisma/client';

// Type-safe raw query
const users = await prisma.$queryRaw<User[]>`
    SELECT * FROM "User"
    WHERE email LIKE ${`%@example.com`}
`;

console.log(users); // Array of User objects
```

**WHY Type-Safe?**

TypeScript knows the return type, but **query is not validated** at compile time.

### $queryRawUnsafe (Dynamic SQL)

```typescript
// ⚠️ SQL injection risk!
const email = userInput;
const users = await prisma.$queryRawUnsafe(
    `SELECT * FROM "User" WHERE email = '${email}'`
);
```

**Never use with user input!** Use `$queryRaw` with template literals instead.

### $executeRaw (INSERT/UPDATE/DELETE)

```typescript
// Returns number of affected rows
const count = await prisma.$executeRaw`
    UPDATE "User"
    SET role = 'ADMIN'
    WHERE email LIKE ${`%@admin.com`}
`;

console.log(`Updated ${count} users`);
```

### Example: Complex Join Query

```typescript
interface PostWithAuthor {
    id: number;
    title: string;
    authorName: string;
    commentCount: number;
}

const posts = await prisma.$queryRaw<PostWithAuthor[]>`
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

### Example: Bulk Insert

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
// ✅ Safe: Parameterized query
const email = userInput;
await prisma.$queryRaw`
    SELECT * FROM "User" WHERE email = ${email}
`;

// ❌ Dangerous: String concatenation
await prisma.$queryRawUnsafe(
    `SELECT * FROM "User" WHERE email = '${userInput}'`
);
```

---

## Connection Management {#connection-management}

### Prisma Connection Pool

Prisma uses a **connection pool** to manage database connections efficiently.

**Default Pool Size:**
```
pool_size = (num_physical_cpus * 2) + 1
```

### Configure Connection Pool

```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?connection_limit=20&pool_timeout=20"
```

**Parameters:**
- `connection_limit`: Max connections (default: varies by DB)
- `pool_timeout`: Wait time for connection (seconds)

### Manual Connection Management

```typescript
// Connect manually
await prisma.$connect();

// Disconnect manually
await prisma.$disconnect();

// Auto-disconnect on process exit
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
```

### Singleton Pattern (Recommended)

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

**WHY?** Prevents creating multiple Prisma Client instances in development (hot reload).

---

## Testing with Prisma {#testing}

### Test Database Setup

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL
        }
    }
});

beforeEach(async () => {
    // Reset database before each test
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Post" CASCADE`;
});

afterAll(async () => {
    await prisma.$disconnect();
});

export { prisma };
```

### Integration Tests

```typescript
// tests/user.test.ts
import { prisma } from './setup';

describe('User', () => {
    it('should create user', async () => {
        const user = await prisma.user.create({
            data: { email: 'test@example.com', name: 'Test' }
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

### Mocking Prisma Client

```typescript
// tests/mocks/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrisma = (): MockPrismaClient => {
    return mockDeep<PrismaClient>();
};
```

```typescript
// tests/service.test.ts
import { createMockPrisma } from './mocks/prisma';

describe('UserService', () => {
    it('should get user by id', async () => {
        const mockPrisma = createMockPrisma();

        mockPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            name: 'Test'
        });

        const service = new UserService(mockPrisma);
        const user = await service.getUserById(1);

        expect(user).toBeDefined();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });
});
```

---

## Advanced Patterns {#advanced-patterns}

### Optimistic Concurrency Control

```prisma
model Post {
    id      Int @id
    title   String
    version Int @default(0)  // Version field
}
```

```typescript
async function updatePostWithOptimisticLock(
    postId: number,
    newTitle: string
) {
    return await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            throw new Error('Post not found');
        }

        // Try to update with version check
        const updated = await tx.post.updateMany({
            where: {
                id: postId,
                version: post.version  // Version must match
            },
            data: {
                title: newTitle,
                version: { increment: 1 }
            }
        });

        if (updated.count === 0) {
            throw new Error('Update conflict - post was modified');
        }

        return await tx.post.findUnique({ where: { id: postId } });
    });
}
```

### Retry Pattern for Deadlocks

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
                // Deadlock detected, retry
                await new Promise(resolve =>
                    setTimeout(resolve, attempt * 100)
                );
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

// Usage
await withRetry(async () => {
    return await prisma.$transaction(async (tx) => {
        // Transaction operations
    });
});
```

### Event Sourcing Pattern

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

---

## Best Practices {#best-practices}

### 1. Keep Transactions Short

```typescript
// ❌ Bad: Long transaction
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });

    // External API call inside transaction!
    await sendWelcomeEmail(user.email);  // Slow!

    await tx.log.create({ data: { userId: user.id } });
});

// ✅ Good: Short transaction
const user = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    await tx.log.create({ data: { userId: user.id } });
    return user;
});

// External call after transaction
await sendWelcomeEmail(user.email);
```

### 2. Use Appropriate Isolation Level

```typescript
// Financial transaction: Use Serializable
await prisma.$transaction(
    async (tx) => {
        // Critical money transfer logic
    },
    { isolationLevel: 'Serializable' }
);

// Read-heavy query: Use default Read Committed
await prisma.post.findMany();
```

### 3. Handle Transaction Timeouts

```typescript
await prisma.$transaction(
    async (tx) => {
        // Long-running operation
    },
    {
        maxWait: 10000,  // Wait up to 10s for transaction slot
        timeout: 30000   // Transaction can run for 30s
    }
);
```

### 4. Don't Nest Transactions

```typescript
// ❌ Bad: Nested transactions not supported
await prisma.$transaction(async (tx) => {
    await tx.$transaction(async (innerTx) => {
        // This won't work!
    });
});

// ✅ Good: Flatten logic
await prisma.$transaction(async (tx) => {
    // All operations at same level
});
```

### 5. Use Sequential for Simple Cases

```typescript
// Simple case: Use sequential
await prisma.$transaction([
    prisma.user.create({ data: user1 }),
    prisma.user.create({ data: user2 })
]);

// Complex logic: Use interactive
await prisma.$transaction(async (tx) => {
    // if/else, loops, etc.
});
```

---

## Summary

Prisma provides powerful transaction capabilities:

**Transaction Types:**
1. **Sequential**: Array of operations, all-or-nothing
2. **Interactive**: Callback with logic, conditional operations

**Isolation Levels:**
- Read Committed (default, fast)
- Repeatable Read (consistent snapshot)
- Serializable (highest isolation, slowest)

**Middleware:**
- Intercept queries before/after execution
- Implement soft deletes, logging, access control
- Transform data automatically

**Raw Queries:**
- `$queryRaw`: SELECT with type safety
- `$executeRaw`: INSERT/UPDATE/DELETE
- SQL injection protection with template literals

**Best Practices:**
- Keep transactions short
- Use appropriate isolation levels
- Handle timeouts and errors
- Test with dedicated test database
- Monitor slow queries with middleware
