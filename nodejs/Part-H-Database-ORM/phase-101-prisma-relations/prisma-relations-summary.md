# Phase 101: Prisma Relations - Quick Reference

## One-to-One Relations

### Schema
```prisma
model User {
    id        Int      @id @default(autoincrement())
    profile   Profile?
}

model Profile {
    id        Int    @id @default(autoincrement())
    bio       String
    userId    Int    @unique  // Foreign key with @unique
    user      User   @relation(fields: [userId], references: [id])
}
```

### Operations
```typescript
// Create with relation
await prisma.user.create({
    data: {
        email: 'user@example.com',
        profile: { create: { bio: 'Bio text' } }
    }
});

// Connect existing
await prisma.profile.create({
    data: {
        bio: 'Bio',
        user: { connect: { id: 1 } }
    }
});

// Query with include
await prisma.user.findUnique({
    where: { id: 1 },
    include: { profile: true }
});
```

## One-to-Many Relations

### Schema
```prisma
model User {
    id    Int    @id @default(autoincrement())
    posts Post[]  // Array indicates one-to-many
}

model Post {
    id       Int    @id @default(autoincrement())
    title    String
    userId   Int    // Foreign key
    user     User   @relation(fields: [userId], references: [id])
}
```

### Operations
```typescript
// Create user with posts
await prisma.user.create({
    data: {
        email: 'user@example.com',
        posts: {
            create: [
                { title: 'Post 1', content: 'Content 1' },
                { title: 'Post 2', content: 'Content 2' }
            ]
        }
    }
});

// Add post to existing user
await prisma.post.create({
    data: {
        title: 'New Post',
        user: { connect: { id: 1 } }
    }
});

// Query with filtering
await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        }
    }
});

// Count relations without loading
await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        _count: { select: { posts: true } }
    }
});
```

## Many-to-Many Relations (Implicit)

### Schema
```prisma
model Post {
    id    Int    @id @default(autoincrement())
    title String
    tags  Tag[]
}

model Tag {
    id    Int    @id @default(autoincrement())
    name  String @unique
    posts Post[]
}
// Prisma auto-creates join table: _PostToTag
```

### Operations
```typescript
// Create with new tags
await prisma.post.create({
    data: {
        title: 'My Post',
        tags: {
            create: [
                { name: 'TypeScript' },
                { name: 'Tutorial' }
            ]
        }
    }
});

// Connect to existing tags
await prisma.post.create({
    data: {
        title: 'Another Post',
        tags: {
            connect: [
                { id: 1 },
                { name: 'TypeScript' }  // Can use any unique field
            ]
        }
    }
});

// Add tags to existing post
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { connect: [{ id: 3 }, { id: 4 }] }
    }
});

// Remove specific tags
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { disconnect: [{ id: 2 }] }
    }
});

// Replace all tags
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { set: [{ id: 1 }, { id: 3 }] }
    }
});

// Query by tag
await prisma.post.findMany({
    where: {
        tags: {
            some: { name: 'TypeScript' }  // At least one tag matches
        }
    }
});
```

### Filter Options
- `some`: At least one related record matches
- `every`: All related records match
- `none`: No related records match

## Many-to-Many Relations (Explicit)

### Schema
```prisma
model Post {
    id         Int              @id @default(autoincrement())
    categories CategoryOnPost[]
}

model Category {
    id    Int              @id @default(autoincrement())
    name  String           @unique
    posts CategoryOnPost[]
}

model CategoryOnPost {
    postId     Int
    categoryId Int
    assignedAt DateTime @default(now())
    assignedBy String?

    post     Post     @relation(fields: [postId], references: [id])
    category Category @relation(fields: [categoryId], references: [id])

    @@id([postId, categoryId])
}
```

### Operations
```typescript
// Create with metadata
await prisma.post.create({
    data: {
        title: 'My Post',
        categories: {
            create: [
                {
                    assignedBy: 'admin',
                    category: { connect: { id: 1 } }
                }
            ]
        }
    },
    include: {
        categories: { include: { category: true } }
    }
});

// Query with metadata filtering
await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        categories: {
            where: {
                assignedAt: { gte: new Date('2024-01-01') }
            },
            include: { category: true }
        }
    }
});

// Update relationship metadata
await prisma.categoryOnPost.update({
    where: {
        postId_categoryId: { postId: 1, categoryId: 1 }
    },
    data: { assignedBy: 'editor' }
});
```

## Self-Relations

### One-to-Many (Tree Structure)
```prisma
model Category {
    id       Int        @id @default(autoincrement())
    name     String
    parentId Int?
    parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
    children Category[] @relation("CategoryTree")
}
```

```typescript
// Create nested structure
await prisma.category.create({
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
                }
            ]
        }
    }
});

// Query with ancestors
await prisma.category.findUnique({
    where: { id: 3 },
    include: {
        parent: {
            include: { parent: true }  // Grandparent
        }
    }
});
```

### Many-to-Many (Following System)
```prisma
model User {
    id        Int    @id @default(autoincrement())
    following User[] @relation("UserFollows")
    followers User[] @relation("UserFollows")
}
```

```typescript
// Follow users
await prisma.user.update({
    where: { id: 1 },
    data: {
        following: { connect: [{ id: 2 }, { id: 3 }] }
    }
});

// Unfollow
await prisma.user.update({
    where: { id: 1 },
    data: {
        following: { disconnect: [{ id: 3 }] }
    }
});

// Query followers
await prisma.user.findUnique({
    where: { id: 1 },
    include: { followers: true, following: true }
});
```

## Referential Actions

```prisma
model Post {
    id     Int  @id
    userId Int
    user   User @relation(
        fields: [userId],
        references: [id],
        onDelete: Cascade,   // What happens when parent is deleted
        onUpdate: Cascade    // What happens when parent key is updated
    )
}
```

### Action Types

| Action | Delete Behavior | Update Behavior | Use Case |
|--------|----------------|-----------------|----------|
| **Cascade** | Delete children | Update children FK | Dependent data (order items) |
| **Restrict** | Error if children exist | Error if children exist | Prevent accidental deletion |
| **SetNull** | Set children FK to null | Set children FK to null | Optional relations |
| **SetDefault** | Set to default value | Set to default value | Fallback to "unknown" user |
| **NoAction** | Do nothing | Do nothing | Custom app-level handling |

### Examples
```typescript
// Cascade: Delete user deletes all posts
onDelete: Cascade

// Restrict: Can't delete user with posts
onDelete: Restrict

// SetNull: Posts remain but userId becomes null (requires optional FK)
onDelete: SetNull
```

## Include vs Select

### Include
```typescript
// Load all fields + specified relations
await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: true,
        profile: true
    }
});
```

### Select
```typescript
// Choose specific fields only
await prisma.user.findUnique({
    where: { id: 1 },
    select: {
        id: true,
        email: true,
        posts: {
            select: { title: true }
        }
    }
});
```

**Cannot mix include and select at same level!**

### When to Use What
- **Include**: Quick queries, need all fields
- **Select**: Performance-critical, large payloads, security (exclude sensitive fields)

## Nested Writes

### Create Operations
```typescript
// Create with nested relations
await prisma.user.create({
    data: {
        email: 'user@example.com',
        posts: {
            create: [{ title: 'Post 1' }]
        },
        profile: {
            create: { bio: 'Bio' }
        }
    }
});

// Create with connect
await prisma.post.create({
    data: {
        title: 'Post',
        user: { connect: { id: 1 } },
        tags: {
            create: [{ name: 'New Tag' }],
            connect: [{ id: 2 }]
        }
    }
});
```

### Update Operations
```typescript
// Update nested relations
await prisma.user.update({
    where: { id: 1 },
    data: {
        profile: {
            update: { bio: 'New bio' }
        },
        posts: {
            updateMany: {
                where: { published: false },
                data: { published: true }
            }
        }
    }
});

// Upsert nested relation
await prisma.user.update({
    where: { id: 1 },
    data: {
        profile: {
            upsert: {
                create: { bio: 'New' },
                update: { bio: 'Updated' }
            }
        }
    }
});
```

### Delete Operations
```typescript
// Delete specific nested records
await prisma.user.update({
    where: { id: 1 },
    data: {
        posts: {
            delete: [{ id: 1 }, { id: 2 }]
        }
    }
});

// Delete by condition
await prisma.user.update({
    where: { id: 1 },
    data: {
        posts: {
            deleteMany: {
                where: { published: false }
            }
        }
    }
});
```

## Connect / Disconnect / Set

### Connect
```typescript
// Add relationships (preserves existing)
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { connect: [{ id: 1 }, { id: 2 }] }
    }
});
```

### Disconnect
```typescript
// Remove relationships (preserves others)
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { disconnect: [{ id: 2 }] }
    }
});

// For one-to-one/many-to-one
await prisma.post.update({
    where: { id: 1 },
    data: {
        user: { disconnect: true }
    }
});
```

### Set
```typescript
// Replace ALL relationships
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { set: [{ id: 1 }, { id: 3 }] }
    }
});

// Empty set removes all
await prisma.post.update({
    where: { id: 1 },
    data: {
        tags: { set: [] }
    }
});
```

## Performance Optimization

### Avoid N+1 Queries
```typescript
// Bad: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
    const posts = await prisma.post.findMany({
        where: { userId: user.id }
    });
}

// Good: 2 queries total
const users = await prisma.user.findMany({
    include: { posts: true }
});
```

### Pagination for Large Relations
```typescript
// Bad: Loads all posts
await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});

// Good: Paginate
await prisma.user.findUnique({
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

### Use Counts Instead of Loading
```typescript
// Bad: Load all posts just to count
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true }
});
const count = user.posts.length;

// Good: Count without loading
const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        _count: { select: { posts: true } }
    }
});
const count = user._count.posts;
```

### Optimized Query Example
```typescript
// Fully optimized query
await prisma.post.findMany({
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
    take: 20,
    where: { published: true }
});
```

## Best Practices

1. **Use select for performance** - Load only needed fields
2. **Implement pagination** - Use take/skip for large datasets
3. **Use _count for counting** - Don't load relations just to count
4. **Choose appropriate referential actions** - Protect data integrity
5. **Avoid deep nesting** - Keep to 2-3 levels max
6. **Use explicit M2M when needed** - Add metadata to relationships
7. **Prevent N+1 queries** - Use include for related data
8. **Index foreign keys** - Add database indexes for performance

## Common Patterns

### Conditional Relations
```typescript
const includeRelations = isAdmin ? {
    include: { posts: true, adminLogs: true }
} : {
    include: { posts: { where: { published: true } } }
};

await prisma.user.findUnique({
    where: { id: 1 },
    ...includeRelations
});
```

### Relation Aggregations
```typescript
await prisma.user.findMany({
    include: {
        _count: {
            select: {
                posts: true,
                comments: true
            }
        }
    }
});
```

### Avoid Circular Relations
```typescript
// Bad: Potential infinite loop
await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        user: {
            include: {
                posts: {
                    include: { user: true }  // Circular!
                }
            }
        }
    }
});

// Good: Limit depth
await prisma.post.findUnique({
    where: { id: 1 },
    include: {
        user: {
            select: { id: true, name: true }
        }
    }
});
```

## Quick Decision Guide

### Implicit vs Explicit Many-to-Many?
- **Implicit**: Simple relationships (tags, categories)
- **Explicit**: Need metadata (timestamps, who assigned, status)

### Required vs Optional Relation?
- **Required**: Business rule enforces (user must have company)
- **Optional**: Can exist independently (user may have profile)

### Include vs Select?
- **Include**: Development, quick queries, all fields needed
- **Select**: Production, performance-critical, large payloads

### Referential Action?
- **Cascade**: Dependent data that should be deleted together
- **Restrict**: Important data that needs manual review
- **SetNull**: Data should survive parent deletion
