# Phase 113: RBAC Authorization
## Agent Instructions

**Phase**: 113 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. Authentication vs Authorization
2. Role-Based Access Control (RBAC)
3. Permission-based authorization
4. Role hierarchy
5. Authorization middleware
6. Route-level authorization
7. Resource-level authorization
8. CASL library for complex permissions
9. Database schema for roles/permissions
10. Laravel comparison: Gates and Policies

## Example
```typescript
// Simple role-based middleware
const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthenticated' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};

// Usage
router.delete('/users/:id', 
    authMiddleware, 
    authorize('admin'), 
    deleteUser
);
```

## Content Instructions
**Notes**: RBAC implementation patterns
**Summary**: Authorization middleware patterns
