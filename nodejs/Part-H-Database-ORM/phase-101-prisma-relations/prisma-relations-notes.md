# Phase 101: Prisma Relations - Comprehensive Notes

**Phase**: 101 | **Part**: H - Database & ORM | **Language**: TypeScript
**Focus**: Deep understanding of Prisma's relation system, type-safe queries, and nested operations

---

## Table of Contents
1. [Introduction to Prisma Relations](#introduction)
2. [One-to-One Relations](#one-to-one)
3. [One-to-Many Relations](#one-to-many)
4. [Many-to-Many Relations (Implicit)](#many-to-many-implicit)
5. [Many-to-Many Relations (Explicit)](#many-to-many-explicit)
6. [Self-Relations](#self-relations)
7. [Required vs Optional Relations](#required-optional)
8. [Referential Actions](#referential-actions)
9. [Nested Reads (Include & Select)](#nested-reads)
10. [Nested Writes](#nested-writes)
11. [Connect, Disconnect, Set Operations](#connect-operations)
12. [Performance & Memory Implications](#performance)
13. [Comparison with Other ORMs](#orm-comparison)

---

## Introduction to Prisma Relations {#introduction}

### What Are Relations in Prisma?

Relations in Prisma represent connections between database tables (models). Unlike traditional SQL where you manually write JOIN queries, Prisma provides a **type-safe, declarative API** for defining and querying related data.

### Why Prisma's Approach is Different

**Traditional SQL Approach:**
```sql
-- Manual JOIN query
SELECT users.*, posts.*
FROM users
LEFT JOIN posts ON users.id = posts.user_id
WHERE users.id = 1;
```

**Prisma Approach:**
```typescript
// Type-safe, declarative
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});
```

**WHY This Matters:**

1. **Type Safety**: TypeScript knows the shape of nested data at compile time
2. **No SQL Injection**: Prisma generates parameterized queries
3. **Automatic JOIN Optimization**: Prisma Client analyzes and optimizes JOINs
4. **Developer Experience**: Less boilerplate, more readable code

### Prisma's Relation Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Relations                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Schema Definition (Declarative)                            │
│  ─────────────────────────────                              │
│  Define relations in schema.prisma                          │
│  Prisma generates TypeScript types                          │
│                                                             │
│                      ↓                                      │
│                                                             │
│  Runtime Query Builder (Type-Safe)                          │
│  ──────────────────────────────────                         │
│  Use include/select for nested queries                      │
│  Use create/connect for nested writes                       │
│                                                             │
│                      ↓                                      │
│                                                             │
│  SQL Generation (Optimized)                                 │
│  ───────────────────────────                                │
│  Prisma Engine generates efficient SQL                      │
│  Automatic JOIN optimization                                │
│  Connection pooling & batching                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How Prisma Generates SQL JOINs

When you use `include`, Prisma's query engine analyzes the request and generates optimized SQL. Let's see HOW:

**Prisma Query:**
```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: true,
        profile: true
    }
});
```

**Generated SQL (Simplified):**
```sql
-- Query 1: Fetch user
SELECT * FROM users WHERE id = 1;

-- Query 2: Fetch posts (using user.id from Query 1)
SELECT * FROM posts WHERE user_id = 1;

-- Query 3: Fetch profile
SELECT * FROM profiles WHERE user_id = 1;
```

**WHY Multiple Queries Instead of JOINs?**

Prisma uses a **query batching strategy** called "N+1 Prevention":

1. **Reduces Data Duplication**: JOINs with one-to-many can duplicate parent data
2. **Better Caching**: Individual queries can be cached more efficiently
3. **Parallel Execution**: Queries can run in parallel
4. **Consistent Response Shape**: Always returns normalized data

**Example of JOIN Duplication Problem:**

```sql
-- Traditional JOIN with one-to-many
SELECT users.*, posts.*
FROM users
LEFT JOIN posts ON users.id = posts.user_id;

-- Result (note user data duplication):
┌─────┬──────────┬─────────┬────────────┐
│ id  │ name     │ post_id │ post_title │
├─────┼──────────┼─────────┼────────────┤
│ 1   │ Alice    │ 101     │ Post A     │  ← User data duplicated
│ 1   │ Alice    │ 102     │ Post B     │  ← User data duplicated
│ 1   │ Alice    │ 103     │ Post C     │  ← User data duplicated
└─────┴──────────┴─────────┴────────────┘
```

With Prisma's approach, user data is fetched once, posts separately:

```typescript
// Prisma result (no duplication)
{
    id: 1,
    name: 'Alice',      // ← User data once
    posts: [            // ← Posts as nested array
        { id: 101, title: 'Post A' },
        { id: 102, title: 'Post B' },
        { id: 103, title: 'Post C' }
    ]
}
```

---

## One-to-One Relations {#one-to-one}

### Schema Definition

```prisma
// schema.prisma
model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    profile   Profile? // ← Optional one-to-one
}

model Profile {
    id        Int    @id @default(autoincrement())
    bio       String
    userId    Int    @unique // ← Foreign key with @unique
    user      User   @relation(fields: [userId], references: [id])
}
```

**Relation Anatomy:**

```
User (Parent)                    Profile (Child)
─────────────                    ───────────────
id (PK) ←──────────────────────┐ userId (FK + Unique)
email                           └─ user relation field
profile (virtual field)
```

### WHY This Design?

1. **@unique on Foreign Key**: Ensures one-to-one constraint at database level
2. **Virtual Field on Parent**: `User.profile` doesn't exist in database, only in Prisma schema
3. **Relation Field on Child**: `Profile.user` references parent via `fields` and `references`

### Example 1: Create User with Profile

```typescript
const user = await prisma.user.create({
    data: {
        email: 'alice@example.com',
        name: 'Alice',
        profile: {
            create: {
                bio: 'Software engineer and cat lover'
            }
        }
    },
    include: { profile: true }
});

console.log(user);
// {
//     id: 1,
//     email: 'alice@example.com',
//     name: 'Alice',
//     profile: {
//         id: 1,
//         bio: 'Software engineer and cat lover',
//         userId: 1
//     }
// }
```

**Generated SQL:**
```sql
-- Transaction begins
BEGIN;

-- Insert user
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
RETURNING *;

-- Insert profile (using user.id from above)
INSERT INTO profiles (bio, user_id)
VALUES ('Software engineer and cat lover', 1)
RETURNING *;

COMMIT;
```

### Example 2: Create Profile for Existing User

```typescript
// Option 1: Connect using nested create
const profile = await prisma.profile.create({
    data: {
        bio: 'Backend developer',
        user: {
            connect: { id: 1 } // ← Connect to existing user
        }
    }
});

// Option 2: Direct foreign key assignment
const profile = await prisma.profile.create({
    data: {
        bio: 'Backend developer',
        userId: 1 // ← Direct FK assignment
    }
});
```

### Example 3: Query with Include

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { profile: true }
});

// Or use select for specific fields
const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: {
        name: true,
        email: true,
        profile: {
            select: { bio: true }
        }
    }
});
```

### Example 4: Update Profile through User

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        profile: {
            update: {
                bio: 'Updated bio'
            }
        }
    },
    include: { profile: true }
});
```

### Optional vs Required One-to-One

```prisma
// Optional: User can exist without profile
model User {
    id      Int      @id
    profile Profile?
}

// Required: User MUST have profile
model User {
    id      Int     @id
    profile Profile // ← No ? means required
}
```

**WHY Optional by Default?**

1. **Flexibility**: Can create user first, profile later
2. **Migration Safety**: Existing users won't fail when adding profile relation
3. **Real-World Modeling**: Many one-to-one relations are truly optional (e.g., driver's license)

---

## One-to-Many Relations {#one-to-many}

### Schema Definition

```prisma
model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    posts Post[] // ← Array indicates one-to-many
}

model Post {
    id       Int    @id @default(autoincrement())
    title    String
    content  String?
    userId   Int    // ← Foreign key
    user     User   @relation(fields: [userId], references: [id])
}
```

**Relation Diagram:**

```
User (One)                       Post (Many)
──────────                       ───────────
id (PK) ←────────────────────┐   userId (FK)
email                         ├─  user
posts[] (virtual, array)      │
                              ├─  userId (FK)
                              └─  user
```

### WHY Array Syntax?

The `Post[]` syntax in Prisma schema indicates:

1. **One-to-Many Relationship**: One user has many posts
2. **Type Generation**: TypeScript type will be `Post[]`
3. **Query Capability**: Can use `include: { posts: true }` on User queries

### Example 1: Create User with Multiple Posts

```typescript
const user = await prisma.user.create({
    data: {
        email: 'bob@example.com',
        posts: {
            create: [
                {
                    title: 'First Post',
                    content: 'Hello World'
                },
                {
                    title: 'Second Post',
                    content: 'Learning Prisma'
                }
            ]
        }
    },
    include: { posts: true }
});

console.log(user.posts.length); // 2
```

**Generated SQL:**
```sql
BEGIN;

INSERT INTO users (email) VALUES ('bob@example.com') RETURNING *;

INSERT INTO posts (title, content, user_id) VALUES
    ('First Post', 'Hello World', 1),
    ('Second Post', 'Learning Prisma', 1)
RETURNING *;

COMMIT;
```

### Example 2: Add Post to Existing User

```typescript
const post = await prisma.post.create({
    data: {
        title: 'Third Post',
        content: 'Relations are cool',
        user: {
            connect: { id: 1 } // ← Connect to existing user
        }
    },
    include: { user: true }
});
```

### Example 3: Query User with Posts

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            orderBy: { id: 'desc' },
            take: 10 // Limit to 10 most recent posts
        }
    }
});
```

### Example 4: Filtered Nested Queries

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            where: {
                published: true // ← Filter nested posts
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true
            }
        }
    }
});
```

**Generated SQL:**
```sql
-- Query 1: Fetch user
SELECT * FROM users WHERE id = 1;

-- Query 2: Fetch filtered posts
SELECT id, title FROM posts
WHERE user_id = 1 AND published = true
ORDER BY created_at DESC;
```

### Example 5: Count Relations

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        _count: {
            select: { posts: true } // ← Count posts without loading them
        }
    }
});

console.log(user._count.posts); // e.g., 42
```

**WHY Use _count?**

1. **Performance**: Doesn't load all posts, just counts them
2. **Efficiency**: Single COUNT query vs loading all records
3. **Memory**: No large arrays in memory

### Example 6: Nested Updates

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        posts: {
            updateMany: {
                where: { published: false },
                data: { published: true }
            }
        }
    }
});
```

---

## Many-to-Many Relations (Implicit) {#many-to-many-implicit}

### Schema Definition

```prisma
model Post {
    id    Int    @id @default(autoincrement())
    title String
    tags  Tag[]  // ← Many-to-many
}

model Tag {
    id    Int    @id @default(autoincrement())
    name  String @unique
    posts Post[] // ← Many-to-many (other side)
}
```

**WHY "Implicit"?**

Prisma automatically creates a **join table** without you defining it in schema. The join table is managed by Prisma internally.

**Generated Join Table (automatic):**

```sql
CREATE TABLE "_PostToTag" (
    A INT NOT NULL REFERENCES posts(id),
    B INT NOT NULL REFERENCES tags(id),
    PRIMARY KEY (A, B)
);

CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"(B);
```

**Relation Diagram:**

```
Post                    _PostToTag (hidden)              Tag
────                    ───────────────────              ───
id (PK) ←──────────┐    A (FK to Post)                   id (PK)
title              └──  B (FK to Tag)  ─────────────────→ name
tags[] (virtual)                                          posts[] (virtual)
```

### WHY Use Implicit Relations?

**Advantages:**

1. **Less Boilerplate**: No need to define join table model
2. **Simpler Queries**: Direct access without intermediate model
3. **Automatic Management**: Prisma handles join table operations

**Disadvantages:**

1. **No Extra Fields**: Can't add metadata to relationship (e.g., timestamps)
2. **Limited Control**: Can't customize join table name easily
3. **Less Explicit**: Hidden table might confuse developers

### Example 1: Create Post with Tags

```typescript
const post = await prisma.post.create({
    data: {
        title: 'Introduction to TypeScript',
        tags: {
            create: [
                { name: 'TypeScript' },
                { name: 'Programming' },
                { name: 'Tutorial' }
            ]
        }
    },
    include: { tags: true }
});
```

**Generated SQL:**
```sql
BEGIN;

-- Insert post
INSERT INTO posts (title) VALUES ('Introduction to TypeScript') RETURNING *;

-- Insert tags
INSERT INTO tags (name) VALUES ('TypeScript') RETURNING *;
INSERT INTO tags (name) VALUES ('Programming') RETURNING *;
INSERT INTO tags (name) VALUES ('Tutorial') RETURNING *;

-- Create join table entries
INSERT INTO "_PostToTag" (A, B) VALUES (1, 1);
INSERT INTO "_PostToTag" (A, B) VALUES (1, 2);
INSERT INTO "_PostToTag" (A, B) VALUES (1, 3);

COMMIT;
```

### Example 2: Connect to Existing Tags

```typescript
const post = await prisma.post.create({
    data: {
        title: 'Advanced TypeScript Patterns',
        tags: {
            connect: [
                { id: 1 },      // TypeScript tag
                { name: 'Advanced' } // Can use any unique field
            ]
        }
    },
    include: { tags: true }
});
```

### Example 3: Add Tags to Existing Post

```typescript
const post = await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            connect: [{ id: 4 }, { id: 5 }]
        }
    },
    include: { tags: true }
});
```

### Example 4: Remove Tags from Post

```typescript
const post = await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            disconnect: [{ id: 2 }] // ← Remove specific tag
        }
    },
    include: { tags: true }
});
```

### Example 5: Replace All Tags

```typescript
const post = await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            set: [{ id: 1 }, { id: 3 }, { id: 5 }] // ← Replace all with these
        }
    },
    include: { tags: true }
});
```

**Generated SQL for `set`:**
```sql
BEGIN;

-- Delete all existing tag relations
DELETE FROM "_PostToTag" WHERE A = 1;

-- Insert new relations
INSERT INTO "_PostToTag" (A, B) VALUES (1, 1);
INSERT INTO "_PostToTag" (A, B) VALUES (1, 3);
INSERT INTO "_PostToTag" (A, B) VALUES (1, 5);

COMMIT;
```

### Example 6: Query Posts by Tag

```typescript
const posts = await prisma.post.findMany({
    where: {
        tags: {
            some: { // ← At least one tag matches
                name: 'TypeScript'
            }
        }
    },
    include: { tags: true }
});
```

**Generated SQL:**
```sql
SELECT posts.* FROM posts
INNER JOIN "_PostToTag" ON posts.id = "_PostToTag".A
INNER JOIN tags ON "_PostToTag".B = tags.id
WHERE tags.name = 'TypeScript';
```

### Example 7: Complex Tag Filtering

```typescript
const posts = await prisma.post.findMany({
    where: {
        tags: {
            every: { // ← All tags must match condition
                name: { in: ['TypeScript', 'JavaScript'] }
            }
        }
    }
});

const posts2 = await prisma.post.findMany({
    where: {
        tags: {
            none: { // ← No tags should match
                name: 'Deprecated'
            }
        }
    }
});
```

---

## Many-to-Many Relations (Explicit) {#many-to-many-explicit}

### Schema Definition

```prisma
model Post {
    id         Int           @id @default(autoincrement())
    title      String
    categories CategoryOnPost[]
}

model Category {
    id    Int              @id @default(autoincrement())
    name  String           @unique
    posts CategoryOnPost[]
}

// Explicit join table with extra fields
model CategoryOnPost {
    postId     Int
    categoryId Int
    assignedAt DateTime @default(now())
    assignedBy String?  // Who assigned this category

    post     Post     @relation(fields: [postId], references: [id])
    category Category @relation(fields: [categoryId], references: [id])

    @@id([postId, categoryId]) // ← Composite primary key
}
```

**WHY Use Explicit Relations?**

1. **Metadata on Relationships**: Store when/who created the relation
2. **Full Control**: Custom table name, fields, indexes
3. **Audit Trail**: Track relationship history
4. **Business Logic**: Add validation or status fields

**Relation Diagram:**

```
Post                 CategoryOnPost                Category
────                 ──────────────                ────────
id ←──────────┐      postId (FK)                   id
title         └────  categoryId (FK) ────────────→ name
categories[]         assignedAt                    posts[]
                     assignedBy
                     @@id([postId, categoryId])
```

### Example 1: Create Post with Categories

```typescript
const post = await prisma.post.create({
    data: {
        title: 'Database Design Patterns',
        categories: {
            create: [
                {
                    assignedBy: 'admin',
                    category: {
                        connect: { id: 1 } // ← Connect to existing category
                    }
                },
                {
                    assignedBy: 'admin',
                    category: {
                        create: { name: 'Design Patterns' }
                    }
                }
            ]
        }
    },
    include: {
        categories: {
            include: { category: true }
        }
    }
});

console.log(post.categories);
// [
//     {
//         postId: 1,
//         categoryId: 1,
//         assignedAt: 2024-01-15T10:30:00.000Z,
//         assignedBy: 'admin',
//         category: { id: 1, name: 'Database' }
//     },
//     ...
// ]
```

### Example 2: Query with Metadata

```typescript
const post = await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        categories: {
            where: {
                assignedAt: {
                    gte: new Date('2024-01-01')
                }
            },
            include: { category: true },
            orderBy: { assignedAt: 'desc' }
        }
    }
});
```

### Example 3: Update Relationship Metadata

```typescript
const updated = await prisma.categoryOnPost.update({
    where: {
        postId_categoryId: {
            postId: 1,
            categoryId: 1
        }
    },
    data: {
        assignedBy: 'editor'
    }
});
```

### Comparison: Implicit vs Explicit

```
┌──────────────────────────────────────────────────────────────┐
│              Implicit vs Explicit Relations                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Implicit (Auto Join Table)                                  │
│  ──────────────────────────                                  │
│  ✓ Simpler schema definition                                 │
│  ✓ Less code to write                                        │
│  ✓ Direct relation queries                                   │
│  ✗ No relationship metadata                                  │
│  ✗ Limited customization                                     │
│                                                              │
│  Best For: Simple many-to-many (tags, categories)            │
│                                                              │
│  ────────────────────────────────────────────────────────    │
│                                                              │
│  Explicit (Custom Join Table)                                │
│  ─────────────────────────────                               │
│  ✓ Full control over join table                              │
│  ✓ Add metadata (timestamps, user, status)                   │
│  ✓ Query/filter by relationship fields                       │
│  ✗ More verbose schema                                       │
│  ✗ More complex queries                                      │
│                                                              │
│  Best For: Complex relations with metadata                   │
│  (user roles, permissions, assignments)                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Self-Relations {#self-relations}

### One-to-Many Self-Relation (Tree Structure)

```prisma
model Category {
    id          Int        @id @default(autoincrement())
    name        String
    parentId    Int?       // ← Self-reference (optional)
    parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
    children    Category[] @relation("CategoryTree")
}
```

**Relation Diagram:**

```
Category
────────
id (PK)
name
parentId (FK → Category.id, nullable)

Tree Structure:
─────────────
Electronics (id: 1, parentId: null)
├── Computers (id: 2, parentId: 1)
│   ├── Laptops (id: 3, parentId: 2)
│   └── Desktops (id: 4, parentId: 2)
└── Phones (id: 5, parentId: 1)
```

**WHY Named Relation ("CategoryTree")?**

When a model has multiple relations to itself, Prisma requires **relation names** to distinguish them:

```prisma
parent   Category?  @relation("CategoryTree", ...)  // ← Up the tree
children Category[] @relation("CategoryTree")        // ← Down the tree
```

### Example 1: Create Nested Categories

```typescript
const electronics = await prisma.category.create({
    data: {
        name: 'Electronics',
        children: {
            create: [
                {
                    name: 'Computers',
                    children: {
                        create: [
                            { name: 'Laptops' },
                            { name: 'Desktops' }
                        ]
                    }
                },
                { name: 'Phones' }
            ]
        }
    },
    include: {
        children: {
            include: { children: true }
        }
    }
});
```

### Example 2: Query Category Tree

```typescript
// Get category with all ancestors
const category = await prisma.category.findUnique({
    where: { id: 3 }, // Laptops
    include: {
        parent: {
            include: {
                parent: true // Grandparent
            }
        }
    }
});

// Result: Laptops → Computers → Electronics
```

### Example 3: Recursive Tree Query (Workaround)

Prisma doesn't support recursive queries natively. Use application logic:

```typescript
async function getCategoryTree(categoryId: number): Promise<any> {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: true }
    });

    if (!category) return null;

    // Recursively fetch children
    const childrenWithDescendants = await Promise.all(
        category.children.map(child => getCategoryTree(child.id))
    );

    return {
        ...category,
        children: childrenWithDescendants
    };
}

const fullTree = await getCategoryTree(1);
```

### Many-to-Many Self-Relation (Following System)

```prisma
model User {
    id         Int     @id @default(autoincrement())
    name       String
    following  User[]  @relation("UserFollows")
    followers  User[]  @relation("UserFollows")
}
```

**Generated Join Table:**
```sql
CREATE TABLE "_UserFollows" (
    A INT NOT NULL REFERENCES users(id), -- follower
    B INT NOT NULL REFERENCES users(id), -- following
    PRIMARY KEY (A, B)
);
```

**Relation Flow:**

```
User A follows User B
──────────────────────
_UserFollows: (A=1, B=2)

User 1 (Alice)                  User 2 (Bob)
──────────────                  ────────────
following: [Bob]                followers: [Alice]
```

### Example 4: Follow/Unfollow Users

```typescript
// Alice follows Bob and Charlie
const alice = await prisma.user.update({
    where: { id: 1 },
    data: {
        following: {
            connect: [{ id: 2 }, { id: 3 }]
        }
    },
    include: {
        following: true,
        followers: true
    }
});

// Unfollow
await prisma.user.update({
    where: { id: 1 },
    data: {
        following: {
            disconnect: [{ id: 3 }]
        }
    }
});
```

### Example 5: Query Followers/Following

```typescript
// Get Alice's followers
const alice = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        followers: {
            select: { id: true, name: true }
        }
    }
});

// Get Bob's following
const bob = await prisma.user.findUnique({
    where: { id: 2 },
    include: {
        following: true
    }
});
```

---

## Required vs Optional Relations {#required-optional}

### Schema Syntax

```prisma
model User {
    id              Int      @id
    email           String

    // Optional relations (nullable)
    profileId       Int?     // ← Nullable FK
    profile         Profile? @relation(fields: [profileId], references: [id])

    // Required relation
    companyId       Int      // ← Non-nullable FK
    company         Company  @relation(fields: [companyId], references: [id])
}

model Profile {
    id    Int    @id
    bio   String
    users User[] // ← Reverse relation (always array, so no ?)
}

model Company {
    id      Int    @id
    name    String
    users   User[]
}
```

**WHY Required vs Optional Matters:**

1. **Database Constraints**: Required = NOT NULL foreign key
2. **Type Safety**: TypeScript enforces null checks
3. **Business Logic**: Models real-world requirements

### Example 1: Required Relations Enforce Constraints

```typescript
// ❌ This will fail - company is required
const user = await prisma.user.create({
    data: {
        email: 'test@example.com'
        // Missing companyId or company connection!
    }
});
// Error: Missing required relation 'company'

// ✅ Must provide company
const user = await prisma.user.create({
    data: {
        email: 'test@example.com',
        company: {
            connect: { id: 1 }
        }
    }
});
```

### Example 2: Optional Relations Allow Flexibility

```typescript
// ✅ This works - profile is optional
const user = await prisma.user.create({
    data: {
        email: 'test@example.com',
        company: { connect: { id: 1 } }
        // No profile needed
    }
});

// Can add profile later
await prisma.user.update({
    where: { id: user.id },
    data: {
        profile: {
            create: { bio: 'Added later' }
        }
    }
});
```

### Type Safety in Action

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { profile: true, company: true }
});

// TypeScript knows profile might be null
if (user.profile) {
    console.log(user.profile.bio); // ✅ Safe access
}

// Company is always present (required)
console.log(user.company.name); // ✅ No null check needed
```

---

## Referential Actions {#referential-actions}

### What Are Referential Actions?

Referential actions define what happens to **child records** when **parent records** are updated or deleted.

### Available Actions

```prisma
model Post {
    id       Int    @id
    title    String
    userId   Int
    user     User   @relation(fields: [userId], references: [id],
                              onDelete: Cascade,    // ← Delete action
                              onUpdate: Cascade)    // ← Update action
}
```

**Available Actions:**

1. **Cascade**: Propagate change to children
2. **Restrict**: Prevent change if children exist
3. **NoAction**: Do nothing (may cause constraint violations)
4. **SetNull**: Set child FK to null (requires optional relation)
5. **SetDefault**: Set child FK to default value

### Action Comparison Table

```
┌─────────────────────────────────────────────────────────────────┐
│               Referential Actions Summary                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cascade                                                        │
│  ────────                                                       │
│  Parent deleted → Children deleted                              │
│  Parent updated → Children's FK updated                         │
│  Use: Dependent data (posts when user deleted)                  │
│                                                                 │
│  Restrict                                                       │
│  ────────                                                       │
│  Parent deleted → Error if children exist                       │
│  Parent updated → Error if children exist                       │
│  Use: Protect important data (prevent deleting user with posts) │
│                                                                 │
│  SetNull                                                        │
│  ───────                                                        │
│  Parent deleted → Children's FK set to NULL                     │
│  Parent updated → Children's FK set to NULL                     │
│  Use: Optional relations (soft-delete pattern)                  │
│                                                                 │
│  SetDefault                                                     │
│  ──────────                                                     │
│  Parent deleted → Children's FK set to default value            │
│  Use: Fallback to "unknown" or "deleted" user                   │
│                                                                 │
│  NoAction                                                       │
│  ────────                                                       │
│  Do nothing (may violate constraints)                           │
│  Use: Custom application-level handling                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Example 1: Cascade Delete

```prisma
model User {
    id    Int    @id
    posts Post[]
}

model Post {
    id     Int  @id
    userId Int
    user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```typescript
// Delete user
await prisma.user.delete({
    where: { id: 1 }
});

// All posts by this user are automatically deleted
```

**Generated SQL:**
```sql
-- Database-level cascade
ALTER TABLE posts
ADD CONSTRAINT posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- When deleting user
DELETE FROM users WHERE id = 1;
-- Database automatically deletes related posts
```

### Example 2: Restrict Delete

```prisma
model User {
    id    Int    @id
    posts Post[]
}

model Post {
    id     Int  @id
    userId Int
    user   User @relation(fields: [userId], references: [id], onDelete: Restrict)
}
```

```typescript
// Try to delete user with posts
await prisma.user.delete({
    where: { id: 1 }
});
// ❌ Error: Foreign key constraint failed

// Must delete posts first
await prisma.post.deleteMany({
    where: { userId: 1 }
});
await prisma.user.delete({
    where: { id: 1 }
}); // ✅ Now succeeds
```

### Example 3: SetNull

```prisma
model Post {
    id      Int   @id
    userId  Int?  // ← Must be optional
    user    User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

```typescript
// Delete user
await prisma.user.delete({
    where: { id: 1 }
});

// Posts remain, but userId set to null
const orphanedPosts = await prisma.post.findMany({
    where: { userId: null }
});
```

### Example 4: SetDefault

```prisma
model Post {
    id     Int  @id
    userId Int  @default(999) // ← Default "deleted user"
    user   User @relation(fields: [userId], references: [id], onDelete: SetDefault)
}
```

```typescript
// Create "deleted user" placeholder
await prisma.user.create({
    data: { id: 999, email: 'deleted@example.com' }
});

// Delete actual user
await prisma.user.delete({
    where: { id: 1 }
});

// Posts now belong to userId: 999
```

### WHY Choose Different Actions?

**Use Cascade When:**
- Child data is meaningless without parent (order items without order)
- Cleaning up is desired (user deletion removes all posts)

**Use Restrict When:**
- Preventing accidental data loss (don't delete category with products)
- Business rules require manual cleanup

**Use SetNull When:**
- Child data should survive parent deletion (posts survive user deletion)
- Implementing soft-delete patterns

---

## Nested Reads (Include & Select) {#nested-reads}

### Include vs Select

```typescript
// Include: Load all fields + relations
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: true,
        profile: true
    }
});

// Select: Choose specific fields
const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: {
        id: true,
        email: true,
        posts: {
            select: {
                title: true
            }
        }
    }
});
```

**WHY Use Select?**

1. **Performance**: Load only needed fields
2. **Network**: Reduce payload size
3. **Security**: Exclude sensitive fields (password hash)

### Performance Comparison

```
┌──────────────────────────────────────────────────────┐
│         Include vs Select Performance                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Include { posts: true }                             │
│  ────────────────────────                            │
│  SELECT * FROM users WHERE id = 1;                   │
│  SELECT * FROM posts WHERE user_id = 1;              │
│                                                      │
│  Data: All columns from both tables                  │
│  Size: ~2KB (example)                                │
│                                                      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Select { id, email, posts: { select: { title } } }  │
│  ───────────────────────────────────────────────────  │
│  SELECT id, email FROM users WHERE id = 1;           │
│  SELECT title FROM posts WHERE user_id = 1;          │
│                                                      │
│  Data: Only specified columns                        │
│  Size: ~0.5KB (example)                              │
│                                                      │
│  Savings: 75% reduction in data transfer             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Example 1: Deep Nested Include

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            include: {
                comments: {
                    include: {
                        author: true
                    }
                },
                tags: true
            }
        },
        profile: true
    }
});

// Result structure:
// {
//     id: 1,
//     email: '...',
//     posts: [
//         {
//             id: 1,
//             title: '...',
//             comments: [
//                 {
//                     id: 1,
//                     text: '...',
//                     author: { id: 2, name: '...' }
//                 }
//             ],
//             tags: [...]
//         }
//     ],
//     profile: { ... }
// }
```

### Example 2: Filtered Nested Queries

```typescript
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            where: {
                published: true,
                createdAt: {
                    gte: new Date('2024-01-01')
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        }
    }
});
```

### Example 3: Combining Include and Select

```typescript
// ❌ Can't mix include and select at same level
const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: { email: true },
    include: { posts: true } // ❌ Error!
});

// ✅ Use select for everything
const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: {
        email: true,
        posts: { // ← Nested select instead of include
            select: { title: true }
        }
    }
});
```

---

## Nested Writes {#nested-writes}

### Create Operations

```typescript
// Create parent with children
const user = await prisma.user.create({
    data: {
        email: 'alice@example.com',
        posts: {
            create: [
                { title: 'Post 1', content: '...' },
                { title: 'Post 2', content: '...' }
            ]
        },
        profile: {
            create: { bio: 'Software engineer' }
        }
    }
});
```

**Generated SQL:**
```sql
BEGIN;

INSERT INTO users (email) VALUES ('alice@example.com') RETURNING *;

INSERT INTO posts (title, content, user_id) VALUES
    ('Post 1', '...', 1),
    ('Post 2', '...', 1)
RETURNING *;

INSERT INTO profiles (bio, user_id) VALUES ('Software engineer', 1) RETURNING *;

COMMIT;
```

### Example 1: Nested Create with Many-to-Many

```typescript
const post = await prisma.post.create({
    data: {
        title: 'Introduction to Prisma',
        content: '...',
        user: {
            connect: { id: 1 }
        },
        tags: {
            create: [
                { name: 'Prisma' },
                { name: 'Database' }
            ],
            connect: [
                { id: 3 } // Connect to existing "TypeScript" tag
            ]
        }
    },
    include: { tags: true }
});
```

### Example 2: CreateMany (Nested)

```typescript
const user = await prisma.user.create({
    data: {
        email: 'bob@example.com',
        posts: {
            createMany: {
                data: [
                    { title: 'Post 1', content: 'Content 1' },
                    { title: 'Post 2', content: 'Content 2' },
                    { title: 'Post 3', content: 'Content 3' }
                ]
            }
        }
    }
});

// Note: createMany doesn't support nested relations
```

### Update Operations

### Example 3: Nested Update

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        email: 'newemail@example.com',
        profile: {
            update: {
                bio: 'Updated bio'
            }
        },
        posts: {
            updateMany: {
                where: { published: false },
                data: { published: true }
            }
        }
    }
});
```

### Example 4: Upsert Nested Relations

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        profile: {
            upsert: {
                create: { bio: 'New profile' },
                update: { bio: 'Updated profile' }
            }
        }
    }
});
```

### Delete Operations

### Example 5: Nested Delete

```typescript
const user = await prisma.user.update({
    where: { id: 1 },
    data: {
        posts: {
            delete: [
                { id: 1 },
                { id: 2 }
            ]
        }
    }
});

// Or delete by condition
await prisma.user.update({
    where: { id: 1 },
    data: {
        posts: {
            deleteMany: {
                where: {
                    published: false
                }
            }
        }
    }
});
```

---

## Connect, Disconnect, Set Operations {#connect-operations}

### Connect

**Purpose**: Link existing records together

```typescript
// Connect post to existing user
await prisma.post.update({
    where: { id: 1 },
    data: {
        user: {
            connect: { id: 5 }
        }
    }
});

// Connect multiple tags (many-to-many)
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            connect: [
                { id: 1 },
                { id: 2 },
                { name: 'TypeScript' } // Can use any unique field
            ]
        }
    }
});
```

**Generated SQL:**
```sql
-- One-to-many connect
UPDATE posts SET user_id = 5 WHERE id = 1;

-- Many-to-many connect
INSERT INTO "_PostToTag" (A, B) VALUES (1, 1), (1, 2), (1, 3);
```

### Disconnect

**Purpose**: Remove relationship (set FK to null or remove join table entry)

```typescript
// Disconnect optional relation
await prisma.post.update({
    where: { id: 1 },
    data: {
        user: {
            disconnect: true // ← For one-to-one/many-to-one
        }
    }
});

// Disconnect specific tags
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            disconnect: [{ id: 2 }] // ← For many-to-many
        }
    }
});
```

**Generated SQL:**
```sql
-- One-to-many disconnect (requires optional relation)
UPDATE posts SET user_id = NULL WHERE id = 1;

-- Many-to-many disconnect
DELETE FROM "_PostToTag" WHERE A = 1 AND B = 2;
```

### Set

**Purpose**: Replace all relations with new set

```typescript
// Replace all tags
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            set: [{ id: 1 }, { id: 3 }, { id: 5 }]
        }
    }
});

// Empty set = disconnect all
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: {
            set: [] // ← Remove all tags
        }
    }
});
```

**Generated SQL:**
```sql
-- Delete all existing
DELETE FROM "_PostToTag" WHERE A = 1;

-- Insert new set
INSERT INTO "_PostToTag" (A, B) VALUES (1, 1), (1, 3), (1, 5);
```

### Operation Comparison

```
┌────────────────────────────────────────────────────────┐
│          Connect / Disconnect / Set                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  connect                                               │
│  ───────                                               │
│  • Add relationship(s)                                 │
│  • Preserves existing relations                        │
│  • Use for: Adding tags, assigning user                │
│                                                        │
│  disconnect                                            │
│  ──────────                                            │
│  • Remove relationship(s)                              │
│  • Preserves other relations                           │
│  • Use for: Removing specific tags                     │
│                                                        │
│  set                                                   │
│  ───                                                   │
│  • Replace ALL relationships                           │
│  • Removes unlisted relations                          │
│  • Use for: Complete replacement of tags               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Example: Tag Management Workflow

```typescript
// Step 1: Create post with initial tags
const post = await prisma.post.create({
    data: {
        title: 'My Post',
        tags: {
            connect: [{ id: 1 }, { id: 2 }]
        }
    }
});
// Tags: [1, 2]

// Step 2: Add more tags
await prisma.post.update({
    where: { id: post.id },
    data: {
        tags: {
            connect: [{ id: 3 }, { id: 4 }]
        }
    }
});
// Tags: [1, 2, 3, 4]

// Step 3: Remove one tag
await prisma.post.update({
    where: { id: post.id },
    data: {
        tags: {
            disconnect: [{ id: 2 }]
        }
    }
});
// Tags: [1, 3, 4]

// Step 4: Replace all tags
await prisma.post.update({
    where: { id: post.id },
    data: {
        tags: {
            set: [{ id: 5 }, { id: 6 }]
        }
    }
});
// Tags: [5, 6] (1, 3, 4 removed)
```

---

## Performance & Memory Implications {#performance}

### N+1 Query Problem

**The Problem:**

```typescript
// ❌ N+1 queries anti-pattern
const users = await prisma.user.findMany();

for (const user of users) {
    const posts = await prisma.post.findMany({
        where: { userId: user.id }
    });
    console.log(user.email, posts.length);
}

// Queries executed:
// 1 query for users
// N queries for posts (one per user)
// Total: 1 + N queries
```

**The Solution:**

```typescript
// ✅ Use include (single batch)
const users = await prisma.user.findMany({
    include: { posts: true }
});

for (const user of users) {
    console.log(user.email, user.posts.length);
}

// Queries executed:
// 1 query for users
// 1 query for posts (batched)
// Total: 2 queries
```

### Memory Considerations

```typescript
// ⚠️ High memory usage - loads all posts into memory
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: true // ← If user has 10,000 posts, all loaded
    }
});

// ✅ Better: Paginate or filter
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            take: 20,
            skip: 0,
            orderBy: { createdAt: 'desc' }
        }
    }
});
```

### Query Optimization Strategies

```
┌──────────────────────────────────────────────────────┐
│         Prisma Relation Query Optimization           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. Use select for specific fields                   │
│     Reduces data transfer and memory                 │
│                                                      │
│  2. Implement pagination (take/skip)                 │
│     Prevents loading huge relation sets              │
│                                                      │
│  3. Use _count instead of loading relations          │
│     When you only need counts                        │
│                                                      │
│  4. Filter nested queries                            │
│     Load only relevant related records               │
│                                                      │
│  5. Avoid deep nesting (3+ levels)                   │
│     Complex queries are slow and memory-heavy        │
│                                                      │
│  6. Use indexes on foreign keys                      │
│     Database-level performance boost                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Performance Example

```typescript
// ❌ Loads everything (slow, high memory)
const posts = await prisma.post.findMany({
    include: {
        user: true,
        comments: {
            include: {
                author: true
            }
        },
        tags: true
    }
});

// ✅ Optimized version
const posts = await prisma.post.findMany({
    select: {
        id: true,
        title: true,
        user: {
            select: { id: true, name: true }
        },
        _count: {
            select: { comments: true }
        },
        tags: {
            take: 5,
            select: { name: true }
        }
    },
    take: 20
});
```

---

## Comparison with Other ORMs {#orm-comparison}

### Prisma vs Sequelize

**One-to-Many Relation:**

```javascript
// Sequelize (JavaScript)
const User = sequelize.define('User', { email: STRING });
const Post = sequelize.define('Post', { title: STRING });

User.hasMany(Post);
Post.belongsTo(User);

// Query with include
const user = await User.findByPk(1, {
    include: [{ model: Post }]
});
```

```typescript
// Prisma (TypeScript)
// Schema defined in schema.prisma
model User {
    posts Post[]
}
model Post {
    user User @relation(...)
}

// Query with include
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});
```

**Key Differences:**

1. **Type Safety**: Prisma generates types, Sequelize doesn't
2. **Schema Location**: Prisma uses schema.prisma, Sequelize defines in code
3. **Migrations**: Prisma auto-generates, Sequelize requires manual writing

### Prisma vs TypeORM

**Entity Definition:**

```typescript
// TypeORM
@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];
}

@Entity()
class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.posts)
    user: User;
}

// Query with relations
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});
```

```typescript
// Prisma
// Defined in schema.prisma, types auto-generated

const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});
```

**Key Differences:**

1. **Decorator Heavy**: TypeORM uses decorators, Prisma uses schema
2. **Repository Pattern**: TypeORM uses repositories, Prisma uses client
3. **Active Record**: TypeORM supports, Prisma doesn't

### Prisma vs Mongoose (MongoDB)

**Schema & Query:**

```javascript
// Mongoose
const userSchema = new Schema({
    email: String,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

const User = model('User', userSchema);

// Query with populate
const user = await User.findById(id).populate('posts');
```

```typescript
// Prisma with MongoDB
// schema.prisma
model User {
    id    String @id @default(auto()) @map("_id") @db.ObjectId
    email String
    posts Post[]
}

const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true }
});
```

**Key Differences:**

1. **populate vs include**: Similar concept, different syntax
2. **Type Safety**: Prisma generates types, Mongoose doesn't natively
3. **Schema Validation**: Mongoose has built-in validation, Prisma relies on database

### Comparison Table

```
┌────────────────────────────────────────────────────────────────┐
│              ORM Relation Comparison                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Feature          │ Prisma │ Sequelize │ TypeORM │ Mongoose    │
│  ────────────────┼────────┼───────────┼─────────┼─────────    │
│  Type Safety     │   ✓✓   │     ✗     │    ✓    │     ✗       │
│  Schema-First    │   ✓    │     ✗     │    ✗    │     ✗       │
│  Auto-Migrate    │   ✓    │     ✗     │    ✓    │    N/A      │
│  Nested Writes   │   ✓✓   │     ✓     │    ✓    │     ✓       │
│  Type Generation │   ✓    │     ✗     │    ✗    │     ✗       │
│  Learning Curve  │  Low   │   Medium  │  High   │   Low       │
│  Performance     │  High  │   Medium  │  Medium │   High      │
│  SQL Transparency│  High  │   Medium  │   Low   │    N/A      │
│                                                                │
│  Legend: ✓✓ = Excellent, ✓ = Good, ✗ = No/Poor                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Laravel Eloquent Comparison

**Eloquent (PHP):**

```php
// Define relation in model
class User extends Model {
    public function posts() {
        return $this->hasMany(Post::class);
    }
}

// Query with eager loading
$user = User::with('posts')->find(1);
```

**Prisma:**

```typescript
// Define in schema.prisma
model User {
    posts Post[]
}

// Query with include
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});
```

**Similarities:**

1. Both use declarative relation definitions
2. Both support eager loading (with vs include)
3. Both abstract SQL complexity

**Differences:**

1. **Language**: PHP vs TypeScript
2. **Active Record**: Eloquent uses, Prisma doesn't
3. **Type System**: Prisma has compile-time types, Eloquent is runtime

---

## Advanced Patterns

### Conditional Relations

```typescript
// Load relations based on condition
const includeRelations = user.isAdmin ? {
    include: {
        posts: true,
        adminLogs: true
    }
} : {
    include: {
        posts: {
            where: { published: true }
        }
    }
};

const user = await prisma.user.findUnique({
    where: { id: 1 },
    ...includeRelations
});
```

### Relation Aggregations

```typescript
const users = await prisma.user.findMany({
    include: {
        _count: {
            select: {
                posts: true,
                comments: true
            }
        }
    }
});

// Result includes counts
users.forEach(user => {
    console.log(`${user.email}: ${user._count.posts} posts, ${user._count.comments} comments`);
});
```

### Circular Relations Prevention

```typescript
// ⚠️ Avoid infinite loops
const post = await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        user: {
            include: {
                posts: { // ← Circular! post → user → posts
                    include: {
                        user: true // ← Infinite loop territory
                    }
                }
            }
        }
    }
});

// ✅ Limit depth
const post = await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        user: {
            select: {
                id: true,
                name: true
                // Stop here, don't load user's posts
            }
        }
    }
});
```

---

## Summary

Prisma's relation system provides:

1. **Type-Safe Relations**: Compile-time checks prevent runtime errors
2. **Declarative Schema**: Define relations in schema.prisma
3. **Optimized Queries**: Automatic JOIN generation and batching
4. **Nested Operations**: Create/update/delete related records in one call
5. **Flexible Querying**: Include, select, filter, paginate nested data
6. **Referential Integrity**: onDelete/onUpdate actions protect data consistency

**Best Practices:**

- Use `select` to reduce data transfer
- Implement pagination for large relation sets
- Leverage `_count` for counting without loading
- Choose appropriate referential actions
- Avoid deep nesting (3+ levels)
- Use explicit many-to-many when metadata is needed

**Performance Tips:**

- Batch queries with `include` to prevent N+1
- Index foreign keys for faster JOINs
- Filter nested queries to reduce data volume
- Monitor query performance with Prisma logging

Prisma's relation system strikes a balance between developer experience and performance, making complex relational queries accessible while maintaining type safety and query optimization.
