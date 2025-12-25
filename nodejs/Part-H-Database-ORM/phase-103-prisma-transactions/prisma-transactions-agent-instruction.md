# Phase 104: Prisma Transactions & Advanced
## Agent Instructions

**Phase**: 104 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Sequential operations: `prisma.$transaction([])`
2. Interactive transactions
3. Transaction isolation levels
4. Prisma middleware
5. Soft deletes with middleware
6. Query logging
7. Raw queries: `$queryRaw`, `$executeRaw`
8. Connection management
9. Testing with Prisma
10. Best practices

## Example
```typescript
// Sequential transaction
const [user, posts] = await prisma.$transaction([
    prisma.user.create({ data: { email: 'test@test.com' } }),
    prisma.post.createMany({ data: [...] })
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (user.balance < amount) {
        throw new Error('Insufficient balance');
    }
    await tx.user.update({
        where: { id },
        data: { balance: { decrement: amount } }
    });
    await tx.transaction.create({ data: { userId: id, amount } });
});

// Middleware for soft delete
prisma.$use(async (params, next) => {
    if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
    }
    return next(params);
});
```

## Content Instructions
**Notes**: Prisma transactions and advanced patterns
**Summary**: Transaction patterns reference
