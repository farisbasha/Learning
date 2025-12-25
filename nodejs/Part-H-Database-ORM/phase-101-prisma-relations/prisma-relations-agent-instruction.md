# Phase 102: Prisma Relations
## Agent Instructions

**Phase**: 102 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. One-to-one relations
2. One-to-many relations
3. Many-to-many (implicit)
4. Many-to-many (explicit)
5. Self-relations
6. Required vs optional relations
7. Referential actions: onDelete, onUpdate
8. Nested reads with include
9. Nested writes (create related records)
10. Connect, disconnect, set operations
11. Nested updates

## Example
```typescript
// Create with nested relation
const user = await prisma.user.create({
    data: {
        email: 'test@test.com',
        posts: {
            create: [
                { title: 'Post 1' },
                { title: 'Post 2' }
            ]
        },
        profile: {
            create: { bio: 'Hello!' }
        }
    },
    include: { posts: true, profile: true }
});

// Connect existing
await prisma.post.update({
    where: { id: postId },
    data: {
        tags: {
            connect: [{ id: 1 }, { id: 2 }]
        }
    }
});

// Disconnect
await prisma.post.update({
    where: { id: postId },
    data: { tags: { disconnect: [{ id: 1 }] } }
});
```

## Content Instructions
**Notes**: Prisma relations and nested operations
**Summary**: Relation operations reference
