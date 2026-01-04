# Phase 113: Authorization Patterns Summary

## 1. Simple Role Middleware

```typescript
const isRole = (role: string) => (req, res, next) => {
    if (req.user?.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

// Usage
router.post('/admin/dashboard', authenticate, isRole('admin'), controller);
```

## 2. Resource-Level Check (Policy)

```typescript
// controller.ts
async function updatePost(req, res) {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    
    // Authorization logic
    const isAuthor = post.authorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'You do not own this post' });
    }
    
    // Success...
}
```

## 3. Permission-Based Table

| Role | `post:create` | `post:delete` | `user:manage` |
| :--- | :---: | :---: | :---: |
| Admin | ✅ | ✅ | ✅ |
| Editor | ✅ | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ |

## 4. Key Differences: 401 vs 403

- **401 Unauthorized**: "I don't know who you are. Please log in."
- **403 Forbidden**: "I know who you are, but you are not allowed to do this."

## 5. Security Checklist
- [ ] Never trust the frontend's role claim; check the DB/Token.
- [ ] Implement "Default Deny" policy.
- [ ] Use `ability` libraries (like CASL) for complex business logic.
- [ ] Log failed authorization attempts for security auditing.
