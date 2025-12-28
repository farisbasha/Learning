# Phase 100: Prisma Advanced Queries - Quick Reference

## Filtering Operators

### Equality & Membership

```typescript
// Equals (shorthand)
where: { role: 'ADMIN' }

// Equals (explicit)
where: { role: { equals: 'ADMIN' } }

// Not equals
where: { role: { not: 'ADMIN' } }

// In array
where: { role: { in: ['ADMIN', 'MODERATOR'] } }

// Not in array
where: { role: { notIn: ['BANNED', 'SUSPENDED'] } }

// Null check
where: { age: null }
where: { age: { not: null } }
```

## Comparison Operators

```typescript
// Numeric comparisons
where: { price: { lt: 20 } }        // Less than
where: { price: { lte: 50 } }       // Less than or equal
where: { price: { gt: 100 } }       // Greater than
where: { price: { gte: 100 } }      // Greater than or equal

// Range
where: {
  price: { gte: 20, lte: 100 }     // Between 20 and 100
}

// Date comparisons
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

where: { createdAt: { gte: lastWeek } }
```

## String Filtering

```typescript
// Contains
where: { email: { contains: '@gmail.com' } }

// Starts with
where: { username: { startsWith: 'admin_' } }

// Ends with
where: { email: { endsWith: '@company.com' } }

// Case insensitive (PostgreSQL/MongoDB)
where: {
  email: {
    contains: '@GMAIL.COM',
    mode: 'insensitive'
  }
}
```

## Logical Operators

### AND

```typescript
// Implicit AND
where: {
  age: { gte: 18 },
  active: true,
  role: 'USER'
}

// Explicit AND
where: {
  AND: [
    { age: { gte: 18 } },
    { age: { lt: 65 } },
    { verified: true }
  ]
}
```

### OR

```typescript
where: {
  OR: [
    { role: 'ADMIN' },
    { role: 'MODERATOR' },
    { verified: true }
  ]
}
```

### NOT

```typescript
where: {
  NOT: { status: 'DELETED' }
}

// Complex NOT
where: {
  NOT: {
    OR: [
      { banned: true },
      { suspended: true }
    ]
  }
}
```

### Combined Example

```typescript
// (age >= 18 AND active) AND (role = 'ADMIN' OR verified) AND NOT banned
where: {
  AND: [
    { age: { gte: 18 } },
    { active: true },
    {
      OR: [
        { role: 'ADMIN' },
        { verified: true }
      ]
    },
    { NOT: { banned: true } }
  ]
}
```

## Ordering

```typescript
// Single field
orderBy: { createdAt: 'desc' }

// Multiple fields
orderBy: [
  { score: 'desc' },
  { level: 'desc' },
  { username: 'asc' }
]

// Order by relation
orderBy: {
  author: { name: 'asc' }
}

// Order by relation count
orderBy: {
  posts: { _count: 'desc' }
}

// Null handling (Prisma 4+)
orderBy: {
  lastLoginAt: { sort: 'asc', nulls: 'first' }
}
```

## Pagination

### Offset-Based (take/skip)

```typescript
// Page 1
findMany({
  take: 10,
  skip: 0
})

// Page N
const pageSize = 10;
const page = 5;

findMany({
  take: pageSize,
  skip: (page - 1) * pageSize
})

// With total count
const [data, total] = await Promise.all([
  prisma.user.findMany({ take: 10, skip: 0 }),
  prisma.user.count()
]);
```

### Cursor-Based

```typescript
// First page
const page1 = await prisma.post.findMany({
  take: 10,
  orderBy: { id: 'asc' }
});

// Next page
const lastId = page1[page1.length - 1].id;

const page2 = await prisma.post.findMany({
  take: 10,
  skip: 1,              // Skip the cursor
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
});

// Reusable helper
async function getCursorPage(cursor?: number, pageSize = 10) {
  const posts = await prisma.post.findMany({
    take: pageSize + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { id: 'asc' }
  });

  const hasMore = posts.length > pageSize;
  const data = hasMore ? posts.slice(0, pageSize) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor, hasMore };
}
```

## Aggregations

### Count

```typescript
// Count all
const total = await prisma.user.count();

// Count with filter
const activeUsers = await prisma.user.count({
  where: { active: true }
});
```

### Multiple Aggregations

```typescript
const stats = await prisma.order.aggregate({
  _count: { id: true },      // Total count
  _sum: { total: true },     // Sum of total
  _avg: { total: true },     // Average total
  _min: { total: true },     // Minimum total
  _max: { total: true }      // Maximum total
});

// With filter
const stats = await prisma.order.aggregate({
  _sum: { total: true },
  where: {
    status: 'COMPLETED',
    createdAt: { gte: new Date('2024-01-01') }
  }
});
```

## Group By

### Basic Group By

```typescript
// Count by status
const grouped = await prisma.post.groupBy({
  by: ['status'],
  _count: { id: true }
});
// [
//   { status: 'DRAFT', _count: { id: 15 } },
//   { status: 'PUBLISHED', _count: { id: 120 } }
// ]
```

### Multiple Fields

```typescript
const grouped = await prisma.post.groupBy({
  by: ['authorId', 'status'],
  _count: { id: true },
  _sum: { views: true }
});
```

### With HAVING Clause

```typescript
// Authors with 10k+ total views
const popular = await prisma.post.groupBy({
  by: ['authorId'],
  _sum: { views: true },
  having: {
    views: { _sum: { gt: 10000 } }
  },
  orderBy: {
    _sum: { views: 'desc' }
  }
});
```

### WHERE + GROUP BY + HAVING

```typescript
const stats = await prisma.post.groupBy({
  by: ['authorId'],
  where: {
    status: 'PUBLISHED',          // Filter BEFORE grouping
    createdAt: { gte: new Date('2024-01-01') }
  },
  _count: { id: true },
  having: {
    id: { _count: { gte: 5 } }    // Filter AFTER grouping
  }
});
```

## Distinct

```typescript
// Unique roles
const roles = await prisma.user.findMany({
  distinct: ['role'],
  select: { role: true }
});

// Multiple fields (unique combinations)
const combos = await prisma.post.findMany({
  distinct: ['authorId', 'status'],
  select: { authorId: true, status: true }
});

// With filter
const cities = await prisma.user.findMany({
  distinct: ['city'],
  select: { city: true },
  where: { city: { not: null } }
});
```

## Performance Tips

### 1. Use Indexes

```prisma
model User {
  id        Int      @id
  email     String   @unique
  createdAt DateTime @default(now())
  age       Int?
  city      String?

  @@index([createdAt])      // For ORDER BY
  @@index([age])            // For WHERE filters
  @@index([city, age])      // For combined queries
}
```

### 2. Select Only Needed Fields

```typescript
// Bad
const users = await prisma.user.findMany();

// Good
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true }
});
```

### 3. Avoid N+1 Queries

```typescript
// Bad (N+1)
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId }
  });
}

// Good (single query)
const posts = await prisma.post.findMany({
  include: { author: true }
});
```

### 4. Use Cursor Pagination for Large Datasets

```typescript
// Bad for large datasets
const posts = await prisma.post.findMany({
  take: 10,
  skip: 100000  // Very slow!
});

// Good
const posts = await prisma.post.findMany({
  take: 10,
  cursor: { id: lastId },
  skip: 1
});
```

### 5. Batch Operations

```typescript
// Bad
for (const user of users) {
  await prisma.user.create({ data: user });
}

// Good
await prisma.user.createMany({ data: users });
```

## Query Performance Comparison

```
Offset vs Cursor Pagination (1M rows):

Offset-Based:
Page 1:      OFFSET 0       → 1ms
Page 100:    OFFSET 1000    → 5ms
Page 10000:  OFFSET 100000  → 200ms  (SLOW!)

Cursor-Based:
Page 1:      cursor=null    → 1ms
Page 100:    cursor=1000    → 1ms
Page 10000:  cursor=100000  → 1ms    (FAST!)
```

## Real-World Examples

### E-commerce Product Search

```typescript
async function searchProducts(params: {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
}) {
  return await prisma.product.findMany({
    where: {
      AND: [
        params.query ? {
          OR: [
            { name: { contains: params.query, mode: 'insensitive' } },
            { description: { contains: params.query, mode: 'insensitive' } }
          ]
        } : {},
        params.minPrice ? { price: { gte: params.minPrice } } : {},
        params.maxPrice ? { price: { lte: params.maxPrice } } : {},
        params.category ? { category: { name: params.category } } : {},
        params.inStock ? { stock: { gt: 0 } } : {},
        { deleted: false }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}
```

### Sales Report

```typescript
async function getSalesReport(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await prisma.sale.groupBy({
    by: ['salesRep', 'region'],
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    _sum: { revenue: true, quantity: true },
    _count: { id: true },
    _avg: { revenue: true },
    orderBy: { _sum: { revenue: 'desc' } }
  });
}
```

### User Analytics Dashboard

```typescript
async function getUserStats(userId: number) {
  const [totalPosts, publishedPosts, stats] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.post.count({ where: { authorId: userId, published: true } }),
    prisma.post.aggregate({
      _sum: { views: true },
      _avg: { views: true },
      _max: { views: true },
      where: { authorId: userId, published: true }
    })
  ]);

  return {
    posts: { total: totalPosts, published: publishedPosts },
    views: {
      total: stats._sum.views || 0,
      average: stats._avg.views || 0,
      peak: stats._max.views || 0
    }
  };
}
```

## ORM Comparison: Same Query

```typescript
// TASK: Find active users aged 18-65 who are admins or verified,
//       order by creation date, paginate

// PRISMA
const users = await prisma.user.findMany({
  where: {
    AND: [
      { age: { gte: 18, lte: 65 } },
      { active: true },
      { OR: [{ role: 'ADMIN' }, { verified: true }] }
    ]
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// SEQUELIZE
const users = await User.findAll({
  where: {
    age: { [Op.between]: [18, 65] },
    active: true,
    [Op.or]: [
      { role: 'ADMIN' },
      { verified: true }
    ]
  },
  order: [['createdAt', 'DESC']],
  limit: 10,
  offset: 0
});

// TYPEORM
const users = await getRepository(User).find({
  where: {
    age: Between(18, 65),
    active: true,
    // Complex OR requires QueryBuilder
  },
  order: { createdAt: 'DESC' },
  take: 10,
  skip: 0
});

// MONGOOSE
const users = await User.find({
  age: { $gte: 18, $lte: 65 },
  active: true,
  $or: [
    { role: 'ADMIN' },
    { verified: true }
  ]
})
.sort({ createdAt: -1 })
.limit(10)
.skip(0);
```

## Common Patterns

### Reusable Pagination

```typescript
interface PaginatedResult<T> {
  data: T[];
  cursor: number | null;
  hasMore: boolean;
}

async function paginate<T>(
  model: any,
  params: {
    cursor?: number;
    pageSize?: number;
    where?: any;
    orderBy?: any;
  }
): Promise<PaginatedResult<T>> {
  const { cursor, pageSize = 10, where, orderBy } = params;

  const items = await model.findMany({
    take: pageSize + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where,
    orderBy: orderBy || { id: 'asc' }
  });

  const hasMore = items.length > pageSize;
  const data = hasMore ? items.slice(0, pageSize) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, cursor: nextCursor, hasMore };
}
```

### Dynamic Filters

```typescript
function buildWhereClause(filters: {
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const conditions = [];

  if (filters.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    });
  }

  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (filters.minPrice) {
    conditions.push({ price: { gte: filters.minPrice } });
  }

  if (filters.maxPrice) {
    conditions.push({ price: { lte: filters.maxPrice } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

// Usage
const where = buildWhereClause({
  search: 'laptop',
  minPrice: 500,
  maxPrice: 2000
});

const products = await prisma.product.findMany({ where });
```

## Key Takeaways

1. **Type Safety**: All queries are validated at compile time
2. **Performance**: Queries run at database level with index optimization
3. **Consistency**: Same API across PostgreSQL, MySQL, SQLite, MongoDB
4. **Developer Experience**: Autocomplete, error checking, clean syntax
5. **Pagination**: Use cursor-based for large datasets
6. **Indexes**: Critical for filter and sort performance
7. **Aggregations**: Powerful groupBy with HAVING support
8. **Comparison**: Prisma = Modern, type-safe Eloquent for Node.js
