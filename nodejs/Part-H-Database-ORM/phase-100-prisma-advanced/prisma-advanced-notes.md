# Phase 100: Prisma Advanced Queries - Master Complex Database Operations

## Table of Contents

1. [Introduction to Advanced Querying](#introduction-to-advanced-querying)
2. [Filtering Basics](#filtering-basics)
3. [Comparison Operators](#comparison-operators)
4. [String Filtering](#string-filtering)
5. [Logical Operators](#logical-operators)
6. [Ordering Results](#ordering-results)
7. [Pagination Strategies](#pagination-strategies)
8. [Cursor-Based Pagination](#cursor-based-pagination)
9. [Aggregations](#aggregations)
10. [Group By Operations](#group-by-operations)
11. [Distinct Queries](#distinct-queries)
12. [Query Performance](#query-performance)
13. [Comparison with Other ORMs](#comparison-with-other-orms)

---

## Introduction to Advanced Querying

### Why Advanced Queries Matter

As your application scales, simple CRUD operations aren't enough. You need:

1. **Efficient Data Retrieval**: Fetch exactly what you need, nothing more
2. **Performance**: Minimize database round trips
3. **Scalability**: Handle thousands/millions of records
4. **Complex Business Logic**: Filter, sort, aggregate data

### The Query Execution Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Query Pipeline                     │
└─────────────────────────────────────────────────────────────┘

1. TypeScript Query (Your Code)
   │
   ├─> Prisma Client validates query structure
   │   (Compile-time type checking)
   │
2. Query Translation Layer
   │
   ├─> Converts to Prisma Query Engine format
   │   (Binary protocol - ultra fast)
   │
3. Query Engine (Rust)
   │
   ├─> Generates optimized SQL
   │   (Database-specific optimizations)
   │
4. Database Execution
   │
   ├─> SQL runs on PostgreSQL/MySQL/SQLite/etc.
   │
5. Result Processing
   │
   ├─> Maps DB results back to TypeScript types
   │
6. Type-Safe Response
   └─> Returns exactly what TypeScript expects
```

### How Prisma Optimizes Queries

**Under the Hood:**

```typescript
// Your code
const users = await prisma.user.findMany({
  where: { age: { gte: 18 } },
  select: { name: true, email: true }
});

// Prisma generates (PostgreSQL):
// SELECT "name", "email" FROM "User" WHERE "age" >= 18;

// NOT this inefficient query:
// SELECT * FROM "User" WHERE "age" >= 18;
```

**Why it matters:**
- Only selected fields are fetched (reduces bandwidth)
- WHERE clause runs on database (not in-memory filtering)
- Database indexes can be used effectively
- No N+1 query problems

---

## Filtering Basics

### The `where` Clause Foundation

Every query filter in Prisma uses the `where` clause. It's type-safe and mirrors SQL logic.

### Equals and Not Equals

```typescript
// Schema
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  age       Int?
  role      String  @default("USER")
  active    Boolean @default(true)
}

// Exact match (shorthand)
const user = await prisma.user.findMany({
  where: { role: 'ADMIN' }
});
// SQL: WHERE role = 'ADMIN'

// Exact match (explicit)
const user = await prisma.user.findMany({
  where: { role: { equals: 'ADMIN' } }
});

// Not equals
const nonAdmins = await prisma.user.findMany({
  where: { role: { not: 'ADMIN' } }
});
// SQL: WHERE role != 'ADMIN'

// Not equals (complex)
const users = await prisma.user.findMany({
  where: {
    NOT: { role: 'ADMIN' }
  }
});
```

### In and NotIn (Array Matching)

```typescript
// Find users with specific roles
const users = await prisma.user.findMany({
  where: {
    role: {
      in: ['ADMIN', 'MODERATOR', 'EDITOR']
    }
  }
});
// SQL: WHERE role IN ('ADMIN', 'MODERATOR', 'EDITOR')

// Exclude specific roles
const regularUsers = await prisma.user.findMany({
  where: {
    role: {
      notIn: ['ADMIN', 'MODERATOR']
    }
  }
});
// SQL: WHERE role NOT IN ('ADMIN', 'MODERATOR')

// Multiple ID lookup
const specificUsers = await prisma.user.findMany({
  where: {
    id: { in: [1, 5, 10, 23, 42] }
  }
});
// Very efficient for bulk lookups
```

### Null Filtering

```typescript
// Find users with no age set
const usersWithoutAge = await prisma.user.findMany({
  where: { age: null }
});
// SQL: WHERE age IS NULL

// Find users with age set
const usersWithAge = await prisma.user.findMany({
  where: { age: { not: null } }
});
// SQL: WHERE age IS NOT NULL

// Or use isSet (Prisma 4+)
const usersWithAge = await prisma.user.findMany({
  where: {
    age: { isSet: true }
  }
});
```

### Why These Operators Exist

**Comparison with SQL:**

```sql
-- SQL is verbose and error-prone
SELECT * FROM users
WHERE role = 'ADMIN'
   OR role = 'MODERATOR'
   OR role = 'EDITOR';

-- Prisma is clean and type-safe
where: { role: { in: ['ADMIN', 'MODERATOR', 'EDITOR'] } }
```

**Performance Implications:**
- `IN` clauses are optimized by databases (uses indexes)
- Prisma prevents SQL injection by using prepared statements
- Type safety prevents runtime errors

---

## Comparison Operators

### Numeric Comparisons

```typescript
model Product {
  id       Int     @id @default(autoincrement())
  name     String
  price    Decimal
  stock    Int
  rating   Float?
}

// Less than
const cheapProducts = await prisma.product.findMany({
  where: { price: { lt: 20 } }
});
// SQL: WHERE price < 20

// Less than or equal
const affordableProducts = await prisma.product.findMany({
  where: { price: { lte: 50 } }
});
// SQL: WHERE price <= 50

// Greater than
const expensiveProducts = await prisma.product.findMany({
  where: { price: { gt: 100 } }
});
// SQL: WHERE price > 100

// Greater than or equal
const premiumProducts = await prisma.product.findMany({
  where: { price: { gte: 100 } }
});
// SQL: WHERE price >= 100

// Range query (combine operators)
const midRangeProducts = await prisma.product.findMany({
  where: {
    price: {
      gte: 20,
      lte: 100
    }
  }
});
// SQL: WHERE price >= 20 AND price <= 100
```

### Date Comparisons

```typescript
model Post {
  id          Int      @id @default(autoincrement())
  title       String
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  publishedAt DateTime?
}

// Posts from last week
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const recentPosts = await prisma.post.findMany({
  where: {
    createdAt: { gte: lastWeek }
  }
});

// Posts published in a date range
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');

const posts2024 = await prisma.post.findMany({
  where: {
    publishedAt: {
      gte: startDate,
      lte: endDate
    }
  }
});

// Posts published today
const today = new Date();
today.setHours(0, 0, 0, 0);

const todaysPosts = await prisma.post.findMany({
  where: {
    publishedAt: { gte: today }
  }
});
```

### Why Comparison Operators Are Database-Level

```
┌─────────────────────────────────────────────────────────┐
│           WHERE Clause Execution Location                │
└─────────────────────────────────────────────────────────┘

Option 1: In-Memory Filtering (BAD)
┌──────────┐     Fetch ALL      ┌──────────────┐
│ Database │ ─────────────────> │ Application  │
│          │   1,000,000 rows   │ Filter here  │
└──────────┘                     └──────────────┘
                                  ↓
                              Return 10 rows
Problem: Transfers massive data over network!

Option 2: Database Filtering (GOOD - Prisma does this)
┌──────────┐   WHERE price > 100  ┌──────────────┐
│ Database │ ──────────────────> │ Application  │
│ Filters  │     10 rows          │              │
└──────────┘                      └──────────────┘

Benefits:
✓ Uses database indexes
✓ Minimal network transfer
✓ Database does what it's optimized for
```

---

## String Filtering

### Contains, StartsWith, EndsWith

```typescript
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String
  bio      String?
}

// Contains (case-sensitive on most DBs)
const gmailUsers = await prisma.user.findMany({
  where: {
    email: { contains: '@gmail.com' }
  }
});
// SQL (PostgreSQL): WHERE email LIKE '%@gmail.com%'
// SQL (MySQL): WHERE email LIKE '%@gmail.com%'

// Starts with
const adminUsers = await prisma.user.findMany({
  where: {
    username: { startsWith: 'admin_' }
  }
});
// SQL: WHERE username LIKE 'admin_%'

// Ends with
const devUsers = await prisma.user.findMany({
  where: {
    email: { endsWith: '@dev.company.com' }
  }
});
// SQL: WHERE email LIKE '%@dev.company.com'
```

### Case-Insensitive Filtering

```typescript
// Case-insensitive mode (PostgreSQL/MongoDB only)
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@GMAIL.COM',
      mode: 'insensitive'
    }
  }
});
// PostgreSQL: WHERE email ILIKE '%@gmail.com%'

// MySQL workaround (use raw SQL or LOWER)
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@gmail.com' // MySQL is case-insensitive by default
    }
  }
});
```

### Complex String Patterns

```typescript
// Multiple conditions
const filtered = await prisma.user.findMany({
  where: {
    AND: [
      { email: { contains: '@company.com' } },
      { email: { not: { startsWith: 'test_' } } }
    ]
  }
});

// Find users with bio containing keywords
const techUsers = await prisma.user.findMany({
  where: {
    OR: [
      { bio: { contains: 'developer' } },
      { bio: { contains: 'engineer' } },
      { bio: { contains: 'programmer' } }
    ]
  }
});
```

### Performance Considerations

```typescript
// ❌ SLOW: Contains requires full table scan
const users = await prisma.user.findMany({
  where: { email: { contains: 'john' } }
});
// No index can help with middle-of-string search

// ✅ FASTER: StartsWith can use index
const users = await prisma.user.findMany({
  where: { email: { startsWith: 'john' } }
});
// B-tree index works: WHERE email >= 'john' AND email < 'joho'

// ✅ FASTEST: Exact match uses index perfectly
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});
// Index lookup: O(log n)
```

### String Filtering: Database Differences

```typescript
/*
PostgreSQL:
- LIKE is case-sensitive
- ILIKE is case-insensitive
- Best full-text search support

MySQL:
- LIKE is case-insensitive by default
- Use BINARY for case-sensitive
- Full-text search available

SQLite:
- LIKE is case-insensitive
- Limited full-text search

MongoDB:
- Regex-based
- Case-insensitive with options
*/

// Prisma abstracts these differences!
```

---

## Logical Operators

### AND Operator

```typescript
// Implicit AND (all conditions must match)
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    active: true,
    role: 'USER'
  }
});
// SQL: WHERE age >= 18 AND active = true AND role = 'USER'

// Explicit AND (for complex conditions)
const users = await prisma.user.findMany({
  where: {
    AND: [
      { age: { gte: 18 } },
      { age: { lt: 65 } },
      { active: true }
    ]
  }
});
// SQL: WHERE (age >= 18) AND (age < 65) AND (active = true)

// Nested AND with relations
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      { author: { age: { gte: 18 } } },
      { views: { gt: 1000 } }
    ]
  }
});
```

### OR Operator

```typescript
// Simple OR
const users = await prisma.user.findMany({
  where: {
    OR: [
      { role: 'ADMIN' },
      { role: 'MODERATOR' }
    ]
  }
});
// SQL: WHERE role = 'ADMIN' OR role = 'MODERATOR'

// Complex OR conditions
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { featured: true },
      { views: { gt: 10000 } },
      { author: { verified: true } }
    ]
  }
});

// OR with different fields
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@gmail.com' } },
      { username: { startsWith: 'verified_' } }
    ]
  }
});
```

### NOT Operator

```typescript
// Simple NOT
const posts = await prisma.post.findMany({
  where: {
    NOT: { status: 'DRAFT' }
  }
});
// SQL: WHERE NOT (status = 'DRAFT')

// NOT with multiple conditions
const users = await prisma.user.findMany({
  where: {
    NOT: {
      OR: [
        { banned: true },
        { deleted: true }
      ]
    }
  }
});
// SQL: WHERE NOT (banned = true OR deleted = true)
// Equivalent to: WHERE banned = false AND deleted = false

// Complex NOT
const posts = await prisma.post.findMany({
  where: {
    NOT: {
      AND: [
        { published: false },
        { featured: false }
      ]
    }
  }
});
```

### Combining Logical Operators

```typescript
// Complex business logic
const eligibleUsers = await prisma.user.findMany({
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
      {
        NOT: {
          OR: [
            { banned: true },
            { suspended: true }
          ]
        }
      }
    ]
  }
});

// Translation:
// Find users who are:
// - 18 or older
// - Active
// - Either admin OR verified
// - NOT banned or suspended
```

### Real-World Example: E-commerce Product Search

```typescript
interface ProductSearchParams {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
}

async function searchProducts(params: ProductSearchParams) {
  const {
    query,
    minPrice,
    maxPrice,
    category,
    inStock
  } = params;

  return await prisma.product.findMany({
    where: {
      AND: [
        // Search query (name or description)
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        } : {},

        // Price range
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},

        // Category filter
        category ? { category: { name: category } } : {},

        // Stock filter
        inStock ? { stock: { gt: 0 } } : {},

        // Always exclude deleted products
        { deleted: false }
      ]
    },
    include: {
      category: true,
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

// Usage
const results = await searchProducts({
  query: 'laptop',
  minPrice: 500,
  maxPrice: 2000,
  category: 'Electronics',
  inStock: true
});
```

### Logical Operators: Why They're Database-Level

```
Boolean Logic Evaluation:

┌─────────────────────────────────────────────────────────┐
│               Database Query Planner                     │
└─────────────────────────────────────────────────────────┘

Query: WHERE (age >= 18 AND active = true) OR role = 'ADMIN'

1. Database builds execution plan:
   ├─> Check if index on 'role' exists → Use for OR branch
   ├─> Check if index on 'age' exists → Use for AND branch
   └─> Determine optimal order

2. Short-circuit evaluation:
   ├─> OR: If first condition true, skip second
   └─> AND: If first condition false, skip second

3. Index usage:
   ├─> Can use multiple indexes
   └─> Bitmap index scans for complex OR

This is MUCH faster than fetching all data and filtering in-memory!
```

---

## Ordering Results

### Basic Ordering

```typescript
// Ascending order (oldest first)
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'asc' }
});
// SQL: ORDER BY createdAt ASC

// Descending order (newest first)
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' }
});
// SQL: ORDER BY createdAt DESC

// Order by text field
const users = await prisma.user.findMany({
  orderBy: { username: 'asc' }
});
// SQL: ORDER BY username ASC (alphabetical)
```

### Multi-Column Ordering

```typescript
// Order by multiple fields
const users = await prisma.user.findMany({
  orderBy: [
    { role: 'asc' },      // First by role
    { createdAt: 'desc' } // Then by creation date
  ]
});
// SQL: ORDER BY role ASC, createdAt DESC

// Use case: Leaderboard
const leaderboard = await prisma.player.findMany({
  orderBy: [
    { score: 'desc' },     // Highest score first
    { level: 'desc' },     // If tied, highest level
    { username: 'asc' }    // If still tied, alphabetical
  ]
});
```

### Ordering by Relations

```typescript
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

// Order posts by author name
const posts = await prisma.post.findMany({
  orderBy: {
    author: { name: 'asc' }
  },
  include: { author: true }
});
// SQL: ORDER BY users.name ASC (with JOIN)

// Order users by post count
const users = await prisma.user.findMany({
  orderBy: {
    posts: { _count: 'desc' }
  }
});
// Users with most posts first
```

### Ordering with Aggregations

```typescript
// Order by count of relations
const users = await prisma.user.findMany({
  orderBy: {
    posts: { _count: 'desc' }
  }
});

// Order by sum (requires aggregation)
const authors = await prisma.user.findMany({
  orderBy: {
    posts: {
      _count: 'desc'
    }
  },
  include: {
    _count: {
      select: { posts: true }
    }
  }
});
```

### Null Handling in Ordering

```typescript
// How NULL values are ordered varies by database:

// PostgreSQL: NULLS LAST by default for ASC
const users = await prisma.user.findMany({
  orderBy: { lastLoginAt: 'asc' }
});
// NULL values appear last

// To change null position (Prisma 4+):
const users = await prisma.user.findMany({
  orderBy: {
    lastLoginAt: { sort: 'asc', nulls: 'first' }
  }
});
```

### Performance: Ordering and Indexes

```typescript
/*
How Ordering Uses Indexes:

┌─────────────────────────────────────────────────┐
│         Without Index on 'createdAt'             │
└─────────────────────────────────────────────────┘
1. Fetch ALL rows
2. Sort in memory (SLOW for large datasets)
3. Return sorted results

┌─────────────────────────────────────────────────┐
│          With Index on 'createdAt'               │
└─────────────────────────────────────────────────┘
1. Traverse index (already sorted!)
2. Fetch rows in order
3. Return results (FAST!)

Create index in schema.prisma:
*/

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())

  @@index([createdAt]) // Speeds up ORDER BY createdAt
}

// Composite index for multi-column sort
model User {
  id        Int      @id @default(autoincrement())
  role      String
  createdAt DateTime @default(now())

  @@index([role, createdAt]) // Speeds up ORDER BY role, createdAt
}
```

---

## Pagination Strategies

### Offset-Based Pagination (take/skip)

```typescript
// Page 1 (first 10 records)
const page1 = await prisma.user.findMany({
  take: 10,
  skip: 0
});
// SQL: LIMIT 10 OFFSET 0

// Page 2 (next 10 records)
const page2 = await prisma.user.findMany({
  take: 10,
  skip: 10
});
// SQL: LIMIT 10 OFFSET 10

// Page N
const pageSize = 10;
const pageNumber = 5;

const pageN = await prisma.user.findMany({
  take: pageSize,
  skip: (pageNumber - 1) * pageSize
});
// SQL: LIMIT 10 OFFSET 40
```

### Complete Pagination Helper

```typescript
interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

async function paginateUsers(
  params: PaginationParams = {}
): Promise<PaginatedResult<User>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  // Get total count
  const totalCount = await prisma.user.count();

  // Get page data
  const data = await prisma.user.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { createdAt: 'desc' }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalCount,
      hasMore: page < totalPages
    }
  };
}

// Usage
const result = await paginateUsers({ page: 2, pageSize: 20 });
console.log(result.pagination);
// { page: 2, pageSize: 20, totalPages: 50, totalCount: 1000, hasMore: true }
```

### Why Offset Pagination Has Problems

```
Problem: Performance Degrades with Large Offsets

┌──────────────────────────────────────────────────────┐
│              Offset Pagination Issue                  │
└──────────────────────────────────────────────────────┘

Query: LIMIT 10 OFFSET 100000

What the database does:
1. Scans first 100,000 rows
2. Skips them all
3. Returns the next 10

Time complexity: O(n) where n = offset + limit

Page 1:     OFFSET 0      →  0.1ms
Page 10:    OFFSET 90     →  0.5ms
Page 100:   OFFSET 990    →  2ms
Page 1000:  OFFSET 9990   →  15ms
Page 10000: OFFSET 99990  →  150ms  (SLOW!)

Solution: Use cursor-based pagination
```

### Offset Pagination: When to Use

```typescript
// ✅ GOOD: Small datasets
const users = await prisma.user.findMany({
  take: 10,
  skip: 20
});
// Total users: ~1000 → No problem

// ✅ GOOD: User explicitly selects page number
// (Like page numbers at bottom of Google search)

// ❌ BAD: Infinite scroll with large datasets
// ❌ BAD: APIs with deep pagination
// ❌ BAD: Real-time feeds (data changes between requests)
```

---

## Cursor-Based Pagination

### How Cursor Pagination Works

```
Cursor-Based Pagination Concept:

Instead of: "Skip 100 rows, give me 10"
Use:        "Start after ID 100, give me 10"

┌────────────────────────────────────────────────────┐
│                Cursor Approach                      │
└────────────────────────────────────────────────────┘

Request 1: cursor=null
Response:  [id:1, id:2, ..., id:10], nextCursor=10

Request 2: cursor=10
Response:  [id:11, id:12, ..., id:20], nextCursor=20

Request 3: cursor=20
Response:  [id:21, id:22, ..., id:30], nextCursor=30

Database always uses index (O(log n))
Performance is CONSTANT regardless of depth!
```

### Basic Cursor Pagination

```typescript
// First page (no cursor)
const firstPage = await prisma.post.findMany({
  take: 10,
  orderBy: { id: 'asc' }
});

// Get last item's ID as cursor
const lastPost = firstPage[firstPage.length - 1];
const cursor = lastPost.id;

// Next page (using cursor)
const nextPage = await prisma.post.findMany({
  take: 10,
  skip: 1, // Skip the cursor itself
  cursor: { id: cursor },
  orderBy: { id: 'asc' }
});
```

### Advanced Cursor Pagination

```typescript
interface CursorPaginationParams {
  cursor?: number;
  pageSize?: number;
}

interface CursorResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

async function getCursorPaginatedPosts(
  params: CursorPaginationParams = {}
): Promise<CursorResult<Post>> {
  const pageSize = params.pageSize || 10;

  const posts = await prisma.post.findMany({
    take: pageSize + 1, // Fetch one extra to check if more exist
    ...(params.cursor ? {
      skip: 1,
      cursor: { id: params.cursor }
    } : {}),
    orderBy: { id: 'asc' }
  });

  const hasMore = posts.length > pageSize;
  const data = hasMore ? posts.slice(0, pageSize) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return {
    data,
    nextCursor,
    hasMore
  };
}

// Usage
const page1 = await getCursorPaginatedPosts({ pageSize: 20 });
// { data: [...20 posts], nextCursor: 20, hasMore: true }

const page2 = await getCursorPaginatedPosts({
  cursor: page1.nextCursor!,
  pageSize: 20
});
// { data: [...20 posts], nextCursor: 40, hasMore: true }
```

### Cursor with Complex Ordering

```typescript
// When ordering by non-unique field (e.g., createdAt)
// Use compound cursor

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())

  @@index([createdAt, id]) // Composite index for cursor
}

// Cursor pagination with createdAt
const posts = await prisma.post.findMany({
  take: 10,
  ...(cursorCreatedAt && cursorId ? {
    skip: 1,
    cursor: {
      createdAt_id: {
        createdAt: cursorCreatedAt,
        id: cursorId
      }
    }
  } : {}),
  orderBy: [
    { createdAt: 'desc' },
    { id: 'desc' }
  ]
});

// Note: Requires compound unique constraint
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())

  @@unique([createdAt, id])
}
```

### Bidirectional Cursor Pagination

```typescript
// Support both next and previous
async function getBidirectionalPosts(params: {
  cursor?: number;
  direction?: 'next' | 'prev';
  pageSize?: number;
}) {
  const { cursor, direction = 'next', pageSize = 10 } = params;

  const posts = await prisma.post.findMany({
    take: direction === 'next' ? pageSize + 1 : -(pageSize + 1),
    ...(cursor ? {
      skip: 1,
      cursor: { id: cursor }
    } : {}),
    orderBy: { id: 'asc' }
  });

  if (direction === 'prev') {
    posts.reverse();
  }

  const hasMore = posts.length > pageSize;
  const data = hasMore ? posts.slice(0, pageSize) : posts;

  return {
    data,
    nextCursor: hasMore && direction === 'next'
      ? data[data.length - 1].id
      : null,
    prevCursor: hasMore && direction === 'prev'
      ? data[0].id
      : null
  };
}
```

### Cursor vs Offset: Performance Comparison

```typescript
/*
Benchmark: 1,000,000 rows

Offset Pagination:
Page 1:     OFFSET 0       →    1ms
Page 100:   OFFSET 1000    →    5ms
Page 1000:  OFFSET 10000   →   20ms
Page 10000: OFFSET 100000  →  200ms  (SLOW!)

Cursor Pagination:
Page 1:     cursor=null    →    1ms
Page 100:   cursor=1000    →    1ms
Page 1000:  cursor=10000   →    1ms
Page 10000: cursor=100000  →    1ms  (FAST!)

Why? Cursor uses index seek, offset uses index scan
*/
```

---

## Aggregations

### Count

```typescript
// Count all users
const userCount = await prisma.user.count();
// Returns: 1500

// Count with filter
const activeUsers = await prisma.user.count({
  where: { active: true }
});

// Count with multiple conditions
const eligibleUsers = await prisma.user.count({
  where: {
    AND: [
      { age: { gte: 18 } },
      { verified: true },
      { banned: false }
    ]
  }
});
```

### Aggregate Multiple Fields

```typescript
model Order {
  id       Int     @id @default(autoincrement())
  total    Decimal
  quantity Int
  userId   Int
}

// Get statistics
const stats = await prisma.order.aggregate({
  _count: { id: true },        // Total orders
  _sum: { total: true },       // Total revenue
  _avg: { total: true },       // Average order value
  _min: { total: true },       // Smallest order
  _max: { total: true }        // Largest order
});

console.log(stats);
/*
{
  _count: { id: 1000 },
  _sum: { total: 50000 },
  _avg: { total: 50 },
  _min: { total: 5 },
  _max: { total: 500 }
}
*/
```

### Aggregate with Filtering

```typescript
// Revenue from completed orders only
const revenue = await prisma.order.aggregate({
  _sum: { total: true },
  _count: { id: true },
  where: {
    status: 'COMPLETED',
    createdAt: {
      gte: new Date('2024-01-01')
    }
  }
});

// Average rating for published posts
const avgRating = await prisma.post.aggregate({
  _avg: { rating: true },
  where: { published: true }
});
```

### Multiple Aggregations Example

```typescript
// E-commerce dashboard statistics
async function getDashboardStats(userId: number) {
  const [
    totalOrders,
    completedOrders,
    revenue,
    productStats
  ] = await Promise.all([
    // Total orders
    prisma.order.count({
      where: { userId }
    }),

    // Completed orders
    prisma.order.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    }),

    // Revenue statistics
    prisma.order.aggregate({
      _sum: { total: true },
      _avg: { total: true },
      where: {
        userId,
        status: 'COMPLETED'
      }
    }),

    // Product quantities
    prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: { userId }
      }
    })
  ]);

  return {
    orders: {
      total: totalOrders,
      completed: completedOrders,
      pending: totalOrders - completedOrders
    },
    revenue: {
      total: revenue._sum.total || 0,
      average: revenue._avg.total || 0
    },
    items: {
      total: productStats._sum.quantity || 0
    }
  };
}
```

### Why Aggregations Are Database-Level

```
Aggregation Performance:

┌────────────────────────────────────────────────────┐
│         In-Memory Aggregation (BAD)                 │
└────────────────────────────────────────────────────┘

1. Fetch ALL 1,000,000 rows from database
2. Transfer over network (SLOW!)
3. Loop through in JavaScript
4. Calculate sum/avg/count
5. Return result

Time: ~5000ms, Memory: ~500MB

┌────────────────────────────────────────────────────┐
│        Database Aggregation (GOOD - Prisma)         │
└────────────────────────────────────────────────────┘

1. Database calculates internally
2. Uses indexes where possible
3. Returns single result row
4. Minimal network transfer

Time: ~50ms, Memory: ~1KB

Prisma always uses database aggregation!
```

---

## Group By Operations

### Basic Group By

```typescript
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  status   String
  authorId Int
  views    Int
}

// Count posts by status
const postsByStatus = await prisma.post.groupBy({
  by: ['status'],
  _count: { id: true }
});

console.log(postsByStatus);
/*
[
  { status: 'DRAFT', _count: { id: 15 } },
  { status: 'PUBLISHED', _count: { id: 120 } },
  { status: 'ARCHIVED', _count: { id: 30 } }
]
*/
```

### Group By Multiple Fields

```typescript
// Posts by author and status
const grouped = await prisma.post.groupBy({
  by: ['authorId', 'status'],
  _count: { id: true },
  _sum: { views: true }
});

/*
[
  { authorId: 1, status: 'PUBLISHED', _count: { id: 5 }, _sum: { views: 1000 } },
  { authorId: 1, status: 'DRAFT', _count: { id: 2 }, _sum: { views: 0 } },
  { authorId: 2, status: 'PUBLISHED', _count: { id: 10 }, _sum: { views: 5000 } }
]
*/
```

### Group By with Filtering

```typescript
// HAVING clause equivalent
const popularAuthors = await prisma.post.groupBy({
  by: ['authorId'],
  _count: { id: true },
  _sum: { views: true },
  having: {
    views: {
      _sum: { gt: 10000 } // Only authors with 10k+ total views
    }
  },
  orderBy: {
    _sum: { views: 'desc' }
  }
});

// WHERE + GROUP BY + HAVING
const stats = await prisma.post.groupBy({
  by: ['authorId'],
  where: {
    status: 'PUBLISHED', // WHERE clause (filter before grouping)
    createdAt: {
      gte: new Date('2024-01-01')
    }
  },
  _count: { id: true },
  _avg: { views: true },
  having: {
    id: {
      _count: { gte: 5 } // HAVING clause (filter after grouping)
    }
  }
});
// Authors with at least 5 published posts in 2024
```

### Real-World Example: Sales Report

```typescript
model Sale {
  id          Int      @id @default(autoincrement())
  productId   Int
  quantity    Int
  revenue     Decimal
  salesRep    String
  region      String
  createdAt   DateTime @default(now())
}

async function getSalesReport(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Group by sales rep and region
  const salesByRep = await prisma.sale.groupBy({
    by: ['salesRep', 'region'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      revenue: true,
      quantity: true
    },
    _count: {
      id: true
    },
    _avg: {
      revenue: true
    },
    orderBy: {
      _sum: {
        revenue: 'desc'
      }
    }
  });

  // Top performing regions
  const regionPerformance = await prisma.sale.groupBy({
    by: ['region'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: { revenue: true },
    _count: { id: true },
    having: {
      revenue: {
        _sum: { gte: 100000 } // Regions with 100k+ revenue
      }
    },
    orderBy: {
      _sum: { revenue: 'desc' }
    }
  });

  return {
    salesByRep,
    regionPerformance
  };
}
```

### Group By: SQL Translation

```typescript
// Prisma query
const result = await prisma.post.groupBy({
  by: ['authorId', 'status'],
  _count: { id: true },
  _sum: { views: true },
  where: { published: true },
  having: {
    views: { _sum: { gt: 1000 } }
  },
  orderBy: {
    _sum: { views: 'desc' }
  }
});

// Translates to SQL:
/*
SELECT
  "authorId",
  "status",
  COUNT("id") as "_count_id",
  SUM("views") as "_sum_views"
FROM "Post"
WHERE "published" = true
GROUP BY "authorId", "status"
HAVING SUM("views") > 1000
ORDER BY SUM("views") DESC
*/
```

---

## Distinct Queries

### Basic Distinct

```typescript
// Get unique values from a field
const uniqueRoles = await prisma.user.findMany({
  distinct: ['role'],
  select: { role: true }
});

console.log(uniqueRoles);
/*
[
  { role: 'USER' },
  { role: 'ADMIN' },
  { role: 'MODERATOR' }
]
*/
```

### Distinct on Multiple Fields

```typescript
// Unique combinations
const uniqueCombos = await prisma.post.findMany({
  distinct: ['authorId', 'status'],
  select: {
    authorId: true,
    status: true
  }
});

/*
[
  { authorId: 1, status: 'PUBLISHED' },
  { authorId: 1, status: 'DRAFT' },
  { authorId: 2, status: 'PUBLISHED' },
  { authorId: 3, status: 'DRAFT' }
]
*/
```

### Distinct with Filtering and Ordering

```typescript
// Unique authors who published posts
const publishedAuthors = await prisma.post.findMany({
  where: { published: true },
  distinct: ['authorId'],
  select: {
    authorId: true,
    author: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  },
  orderBy: { authorId: 'asc' }
});
```

### Distinct Use Cases

```typescript
// 1. Get all cities where users are located
const cities = await prisma.user.findMany({
  distinct: ['city'],
  select: { city: true },
  where: { city: { not: null } }
});

// 2. Get all tags used in posts
const tags = await prisma.post.findMany({
  distinct: ['tag'],
  select: { tag: true }
});

// 3. Get unique product categories
const categories = await prisma.product.findMany({
  distinct: ['categoryId'],
  select: {
    categoryId: true,
    category: {
      select: { id: true, name: true }
    }
  }
});
```

### Distinct vs Group By

```typescript
// DISTINCT: Get unique values
const distinct = await prisma.user.findMany({
  distinct: ['role'],
  select: { role: true }
});
// Returns: [{ role: 'USER' }, { role: 'ADMIN' }]

// GROUP BY: Get unique values + aggregations
const grouped = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true }
});
// Returns: [
//   { role: 'USER', _count: { id: 150 } },
//   { role: 'ADMIN', _count: { id: 5 } }
// ]

// Use DISTINCT when you only need unique values
// Use GROUP BY when you need counts/sums/averages
```

---

## Query Performance

### Query Optimization Principles

```typescript
/*
Prisma Query Performance Hierarchy:

1. Index Usage (MOST IMPORTANT)
   - Unique indexes: O(1) lookup
   - B-tree indexes: O(log n) lookup
   - Full table scan: O(n) - AVOID!

2. Select Only What You Need
   - Don't fetch unnecessary fields
   - Don't fetch unnecessary relations

3. Pagination
   - Use cursor-based for large datasets
   - Limit result sets with take

4. Batch Operations
   - Use createMany, updateMany
   - Reduce round trips

5. Connection Pooling
   - Reuse database connections
   - Prevent connection exhaustion
*/
```

### Selecting Fields Efficiently

```typescript
// ❌ BAD: Fetches all fields (including large text columns)
const users = await prisma.user.findMany();

// ✅ GOOD: Fetch only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
});

// ❌ BAD: Fetches all relation data
const posts = await prisma.post.findMany({
  include: { author: true, comments: true, tags: true }
});

// ✅ GOOD: Select specific relation fields
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    author: {
      select: { id: true, name: true }
    },
    _count: {
      select: { comments: true }
    }
  }
});
```

### Avoiding N+1 Queries

```typescript
// ❌ BAD: N+1 query problem
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId }
  });
  // This runs 1 query + N queries (one per post)
}

// ✅ GOOD: Single query with include
const posts = await prisma.post.findMany({
  include: { author: true }
});
// This runs 1 query with a JOIN

// ✅ ALSO GOOD: Manual batching
const posts = await prisma.post.findMany();
const authorIds = [...new Set(posts.map(p => p.authorId))];
const authors = await prisma.user.findMany({
  where: { id: { in: authorIds } }
});
const authorMap = new Map(authors.map(a => [a.id, a]));
posts.forEach(p => p.author = authorMap.get(p.authorId));
```

### Index Strategy

```prisma
// schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique  // Automatic unique index
  username  String   @unique
  createdAt DateTime @default(now())
  age       Int?
  city      String?

  // Single-column indexes
  @@index([createdAt])  // For: ORDER BY createdAt
  @@index([age])        // For: WHERE age > 18

  // Composite indexes
  @@index([city, age])  // For: WHERE city = 'NYC' AND age > 18

  // Partial indexes (PostgreSQL only)
  @@index([email], where: email != null)
}

model Post {
  id        Int      @id @default(autoincrement())
  authorId  Int
  status    String
  createdAt DateTime @default(now())

  // Covering index (includes all queried fields)
  @@index([status, createdAt])  // For: WHERE status = 'PUBLISHED' ORDER BY createdAt
  @@index([authorId, status])   // For: WHERE authorId = 1 AND status = 'PUBLISHED'
}
```

### Query Execution Plan (Using Raw SQL)

```typescript
// Analyze query performance
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM "User"
  WHERE age > 18
  ORDER BY createdAt DESC
  LIMIT 10
`;

console.log(result);
/*
Without index on age:
Seq Scan on User  (cost=0.00..1234.00 rows=5000 width=100)
  Filter: (age > 18)
Planning time: 0.1ms
Execution time: 45.2ms  ← SLOW

With index on age:
Index Scan using User_age_idx on User  (cost=0.29..123.40 rows=5000 width=100)
  Index Cond: (age > 18)
Planning time: 0.1ms
Execution time: 2.3ms  ← FAST!
*/
```

### Batch Operations

```typescript
// ❌ BAD: Individual inserts (N queries)
for (const user of users) {
  await prisma.user.create({ data: user });
}
// 1000 users = 1000 queries

// ✅ GOOD: Batch insert (1 query)
await prisma.user.createMany({
  data: users
});
// 1000 users = 1 query

// Batch update
await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { verified: true }
});

// Batch delete
await prisma.user.deleteMany({
  where: {
    createdAt: {
      lt: new Date('2020-01-01')
    }
  }
});
```

---

## Comparison with Other ORMs

### Prisma vs Sequelize

```typescript
// SEQUELIZE (Traditional ORM)
// ===============================

// Filtering
const users = await User.findAll({
  where: {
    age: { [Op.gte]: 18 },
    email: { [Op.like]: '%@gmail.com' }
  }
});
// Issues:
// - Op.gte is runtime, not type-safe
// - No autocomplete
// - Errors found at runtime

// Ordering
const users = await User.findAll({
  order: [['createdAt', 'DESC']]
});
// String-based, error-prone

// Pagination
const users = await User.findAll({
  limit: 10,
  offset: 20
});

// Aggregation
const result = await User.findAll({
  attributes: [
    'role',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['role']
});
// Verbose, uses raw SQL functions

// PRISMA (Modern ORM)
// ===============================

// Filtering
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    email: { contains: '@gmail.com' }
  }
});
// Benefits:
// - 100% type-safe
// - Full autocomplete
// - Errors at compile time

// Ordering
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' }
});
// Type-safe, autocompleted

// Pagination
const users = await prisma.user.findMany({
  take: 10,
  skip: 20
});

// Aggregation
const result = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true }
});
// Clean, declarative, type-safe
```

### Prisma vs TypeORM

```typescript
// TYPEORM (Active Record Pattern)
// ===============================

// Entity definition required
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  age: number;
}

// Complex filtering
const users = await getRepository(User).find({
  where: {
    age: MoreThan(18),
    email: Like('%@gmail.com')
  }
});

// Group by (uses Query Builder)
const result = await getRepository(User)
  .createQueryBuilder('user')
  .select('user.role')
  .addSelect('COUNT(user.id)', 'count')
  .groupBy('user.role')
  .getRawMany();
// Verbose, string-based

// PRISMA
// ===============================

// No entity classes needed
// Everything in schema.prisma

// Same filtering
const users = await prisma.user.findMany({
  where: {
    age: { gt: 18 },
    email: { contains: '@gmail.com' }
  }
});

// Same group by
const result = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true }
});
// Clean, type-safe
```

### Prisma vs Mongoose (MongoDB)

```typescript
// MONGOOSE
// ===============================

const userSchema = new Schema({
  email: String,
  age: Number,
  role: String
});
const User = model('User', userSchema);

// Complex query
const users = await User.find({
  age: { $gte: 18 },
  $or: [
    { role: 'ADMIN' },
    { verified: true }
  ]
}).sort({ createdAt: -1 });

// Aggregation
const result = await User.aggregate([
  { $match: { status: 'active' } },
  { $group: {
    _id: '$role',
    count: { $sum: 1 }
  }}
]);
// MongoDB aggregation pipeline
// Powerful but complex

// PRISMA (with MongoDB)
// ===============================

// In schema.prisma:
// datasource db {
//   provider = "mongodb"
//   url      = env("DATABASE_URL")
// }

// Same query
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    OR: [
      { role: 'ADMIN' },
      { verified: true }
    ]
  },
  orderBy: { createdAt: 'desc' }
});

// Same aggregation
const result = await prisma.user.groupBy({
  by: ['role'],
  where: { status: 'active' },
  _count: { id: true }
});
// Prisma abstracts MongoDB syntax
// Same API across all databases!
```

### Prisma vs Laravel Eloquent (PHP)

```php
// LARAVEL ELOQUENT (PHP)
// ===============================

// Complex query
$users = User::where('age', '>=', 18)
    ->where(function ($query) {
        $query->where('role', 'ADMIN')
              ->orWhere('verified', true);
    })
    ->orderBy('created_at', 'desc')
    ->paginate(10);

// Group by
$stats = User::select('role', DB::raw('count(*) as count'))
    ->groupBy('role')
    ->having('count', '>', 5)
    ->get();

// Cursor pagination
$users = User::orderBy('id')
    ->cursorPaginate(10);
```

```typescript
// PRISMA (TypeScript)
// ===============================

// Same complex query
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    OR: [
      { role: 'ADMIN' },
      { verified: true }
    ]
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// Same group by
const stats = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true },
  having: {
    id: { _count: { gt: 5 } }
  }
});

// Same cursor pagination
const users = await prisma.user.findMany({
  take: 10,
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
});

// Very similar API!
// Prisma = Laravel Eloquent for Node.js
```

### Feature Comparison Table

```
┌────────────────────┬──────────┬───────────┬─────────┬──────────┬─────────┐
│ Feature            │ Prisma   │ Sequelize │ TypeORM │ Mongoose │ Laravel │
├────────────────────┼──────────┼───────────┼─────────┼──────────┼─────────┤
│ Type Safety        │    ★★★★★ │    ★★☆☆☆  │  ★★★☆☆  │  ★☆☆☆☆   │  N/A    │
│ Query Performance  │    ★★★★★ │    ★★★☆☆  │  ★★★★☆  │  ★★★★☆   │  ★★★★☆  │
│ Developer UX       │    ★★★★★ │    ★★☆☆☆  │  ★★★☆☆  │  ★★★☆☆   │  ★★★★★  │
│ Migrations         │    ★★★★★ │    ★★★★☆  │  ★★★☆☆  │  ★☆☆☆☆   │  ★★★★★  │
│ Schema-First       │    ★★★★★ │    ★☆☆☆☆  │  ★★☆☆☆  │  ★☆☆☆☆   │  ★★★★☆  │
│ Auto-completion    │    ★★★★★ │    ★☆☆☆☆  │  ★★★☆☆  │  ★★☆☆☆   │  ★★★★☆  │
│ Multi-DB Support   │    ★★★★★ │    ★★★★★  │  ★★★★★  │  ★☆☆☆☆   │  ★★★★★  │
│ Learning Curve     │    ★★★★☆ │    ★★☆☆☆  │  ★★☆☆☆  │  ★★★☆☆   │  ★★★★☆  │
└────────────────────┴──────────┴───────────┴─────────┴──────────┴─────────┘

Winner: Prisma (for TypeScript projects)
Runner-up: Laravel Eloquent (for PHP projects)
```

---

## Best Practices

### 1. Always Use Indexes for Filtered/Sorted Fields

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  createdAt DateTime @default(now())
  age       Int?
  city      String?

  @@index([createdAt])      // For ORDER BY queries
  @@index([age])            // For WHERE age queries
  @@index([city, age])      // For combined filters
}
```

### 2. Use Cursor Pagination for Large Datasets

```typescript
// ❌ Don't use offset for infinite scroll
const posts = await prisma.post.findMany({
  take: 10,
  skip: 10000  // SLOW!
});

// ✅ Use cursor-based pagination
const posts = await prisma.post.findMany({
  take: 10,
  cursor: { id: lastId },
  skip: 1
});
```

### 3. Select Only Required Fields

```typescript
// ❌ Don't fetch everything
const users = await prisma.user.findMany();

// ✅ Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
});
```

### 4. Use Batch Operations

```typescript
// ❌ Don't loop individual operations
for (const user of users) {
  await prisma.user.create({ data: user });
}

// ✅ Use batch operations
await prisma.user.createMany({ data: users });
```

### 5. Leverage Type Safety

```typescript
// ✅ Let TypeScript guide you
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true
  }
});

// TypeScript knows: user is { id: number; email: string } | null
if (user) {
  console.log(user.email); // ✅ Safe
  console.log(user.name);  // ❌ TypeScript error!
}
```

### 6. Use Transactions for Related Operations

```typescript
// Ensure data consistency
await prisma.$transaction([
  prisma.order.create({
    data: { userId: 1, total: 100 }
  }),
  prisma.user.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } }
  })
]);
```

### 7. Monitor Query Performance

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
  ]
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');

  if (e.duration > 100) {
    console.warn('SLOW QUERY DETECTED!');
  }
});
```

---

## Summary

Prisma's advanced querying capabilities provide:

1. **Type-Safe Filtering**: All operators are checked at compile time
2. **Efficient Ordering**: Database-level sorting with index support
3. **Flexible Pagination**: Both offset and cursor-based strategies
4. **Powerful Aggregations**: Sum, count, average without raw SQL
5. **Group By**: Complex grouping with HAVING clauses
6. **Distinct Queries**: Unique value extraction
7. **Performance**: Query optimization at the database level

**Key Takeaway**: Prisma translates intuitive TypeScript syntax into optimized SQL, giving you the best of both worlds—developer experience and runtime performance.
