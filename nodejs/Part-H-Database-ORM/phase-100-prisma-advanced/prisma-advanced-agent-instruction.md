# Phase 101: Prisma Advanced Queries
## Agent Instructions

**Phase**: 101 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Filtering: where clause operators
2. equals, not, in, notIn
3. lt, lte, gt, gte
4. contains, startsWith, endsWith
5. AND, OR, NOT logical operators
6. Ordering: orderBy
7. Pagination: take, skip
8. Cursor-based pagination
9. Aggregations: count, avg, sum, min, max
10. Group by
11. Distinct

## Example
```typescript
// Complex filtering
const users = await prisma.user.findMany({
    where: {
        AND: [
            { email: { contains: '@gmail.com' } },
            { OR: [
                { role: 'ADMIN' },
                { posts: { some: { published: true } } }
            ]}
        ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    skip: 0
});

// Aggregation
const stats = await prisma.post.aggregate({
    _count: { id: true },
    _avg: { views: true },
    where: { published: true }
});

// Group by
const postsByUser = await prisma.post.groupBy({
    by: ['authorId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
});
```

## Content Instructions
**Notes**: Advanced Prisma querying techniques
**Summary**: Prisma query operators reference
