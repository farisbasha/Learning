# Phase 113: RBAC Authorization (Role-Based Access Control)

## Overview

If authentication is about **who** you are, authorization is about **what** you can do. **Role-Based Access Control (RBAC)** is the most common approach to managing permissions in business applications. Instead of assigning permissions to individual users, you assign permissions to roles (e.g., Admin, Editor, Viewer), and then assign users to those roles.

This phase covers how to build a flexible authorization system in Express using middleware and modern patterns used in enterprise applications.

---

## 1. Authorization Levels

Authorization typically happens at three distinct levels:

### I. Route Level
"Only admins can access any route starting with `/admin`."
- **Implementation**: Simple middleware at the beginning of the route stack.

### II. Action Level
"Only the owner of this post OR an admin can delete it."
- **Implementation**: Logic within the controller or a specialized "Policy" check.

### III. Field Level
"Everyone can see a user's name, but only an admin can see their email."
- **Implementation**: Scrubbing data in the response phase or using a library like **CASL**.

---

## 2. Implementing RBAC Middleware

The most common way to enforce roles in Express is via a higher-order middleware function.

```typescript
import { Request, Response, NextFunction } from 'express';

// Higher-order function to allow configuration
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user; // Assumes authMiddleware has run

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: You do not have the required role. Required: [${allowedRoles.join(', ')}]` 
            });
        }

        next();
    };
};
```

### Usage in Routes
```typescript
router.delete('/posts/:id', 
    authMiddleware,             // 1. Who are you?
    authorize(['admin', 'editor']), // 2. Are you allowed?
    PostController.delete       // 3. Do it.
);
```

---

## 3. Beyond Roles: Permissions & Claims

Simple roles often fall short in complex apps.
- **Admin**: Can do everything.
- **Support**: Can see users but not delete them.
- **Editor**: Can delete posts they created, but not other people's posts.

### Permission-Based Access Control (PBAC)
Instead of checking for `role === 'admin'`, we check for `permission === 'users:delete'`.

**Database Schema**:
- **User**: belongs to a Role.
- **Role**: has many Permissions.
- **Permission**: a string like `post:create`, `post:edit`, `user:manage`.

---

## 4. Advanced: CASL (Isomorphic Permissions)

If you need very fine-grained permissions (e.g., "A user can edit a post only if they are the author AND the post is not published"), usually you'd use a library like **CASL**.

```typescript
// CASL approach
const ability = defineAbilitiesFor(user);

if (ability.can('update', post)) {
  // Logic
}
```

---

## 5. Security Principles: Least Privilege

- **Default to Deny**: If no rule explicitly allows an action, it should be forbidden.
- **Least Privilege**: Users should only have the minimum permissions necessary to do their job.
- **Don't hardcode IDs**: Never do `if (user.id === 1)`. Use roles or attribute checks.

---

## 6. PHP / Laravel Comparison

### Laravel Gates & Policies
Laravel has a very standard way of handling authorization:
- **Gates**: Simple role/closure checks (`Gate::allows('update-post', $post)`).
- **Policies**: Class-based logic for specific models (`$this->authorize('update', $post)`).

Node.js/Express doesn't provide a "standard" policy class.
- **Gates Equivalence**: Simple middleware functions (Phase 113 example).
- **Policies Equivalence**: Moving logic into a `PostPolicy.ts` file and calling it from your controller.

```typescript
// Node.js "Policy" Pattern
export class PostPolicy {
    static canUpdate(user: User, post: Post): boolean {
        return user.role === 'admin' || post.authorId === user.id;
    }
}
```

---

## Key Takeaways

1. **Authentication** confirms identity; **Authorization** confirms permissions.
2. **RBAC** (Role-Based) is easier to manage; **PBAC** (Permission-Based) is more flexible.
3. Use **Middleware** for route-level protection.
4. Always send **403 Forbidden** for auth failures to distinguish from **401 Unauthorized**.
5. Log authorization failures as they might indicate an active attack or a misconfigured frontend.
