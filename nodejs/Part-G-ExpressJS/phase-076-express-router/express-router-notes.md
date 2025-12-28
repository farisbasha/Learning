# Phase 076: Express Router

## Overview

As your Express application grows, putting all routes in one file becomes unmaintainable. `express.Router()` allows you to create **modular, mountable route handlers**. Think of routers as mini-applications that can be combined to build larger applications.

---

## The Problem: Monolithic Routing

### Without Router (Messy)

```typescript
// app.ts - everything in one file!
app.get('/api/users', getAllUsers);
app.get('/api/users/:id', getUser);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

app.get('/api/posts', getAllPosts);
app.get('/api/posts/:id', getPost);
app.post('/api/posts', createPost);
// ... 100 more routes

// Becomes unmanageable!
```

---

## Creating Routers

### Basic Router

```typescript
// routes/users.ts
import { Router } from 'express';

const router = Router();

// Define routes on router (not app)
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
```

### Mounting Router

```typescript
// app.ts
import express from 'express';
import userRouter from './routes/users';

const app = express();

// Mount router with prefix
app.use('/api/users', userRouter);

// Now routes are:
// GET    /api/users      → getAllUsers
// GET    /api/users/:id  → getUser
// POST   /api/users      → createUser
// PUT    /api/users/:id  → updateUser
// DELETE /api/users/:id  → deleteUser
```

---

## Router-Level Middleware

### Applying Middleware to Router

```typescript
// routes/users.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Middleware for ALL routes in this router
router.use(authenticate);

// Public routes
router.get('/', getAllUsers);
router.get('/:id', getUser);

// Protected routes with additional middleware
router.post('/', authorize('admin'), createUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
```

### Middleware Execution Order

```
Request: POST /api/users

1. app.use(express.json())        ← App-level
2. app.use(logger)                ← App-level
3. app.use('/api/users', router)  ← Router mount
4. router.use(authenticate)       ← Router-level
5. router.post('/', authorize)    ← Route-level
6. router.post('/', createUser)   ← Handler
```

---

## Nested Routers

### Parent-Child Relationship

```typescript
// routes/users.ts
import { Router } from 'express';
import postsRouter from './posts';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);

// Nest posts router under users
router.use('/:userId/posts', postsRouter);

export default router;

// routes/posts.ts
const postsRouter = Router({ mergeParams: true });

postsRouter.get('/', getUserPosts);  // Access req.params.userId
postsRouter.post('/', createUserPost);

export default postsRouter;
```

### Accessing Parent Params

```typescript
// Without mergeParams
const router = Router();
router.get('/', (req, res) => {
    req.params.userId;  // undefined!
});

// With mergeParams
const router = Router({ mergeParams: true });
router.get('/', (req, res) => {
    req.params.userId;  // '123' ✓
});
```

### Complete Nested Example

```typescript
// app.ts
app.use('/api/users', userRouter);

// routes/users.ts
router.use('/:userId/posts', postsRouter);

// routes/posts.ts (with mergeParams)
postsRouter.get('/', (req, res) => {
    const { userId } = req.params;  // From parent!
    // Fetch posts for this user
});

// Final URL: GET /api/users/123/posts
// req.params = { userId: '123' }
```

---

## Router Parameters

### `router.param()` Middleware

Runs before any route that has this parameter:

```typescript
// routes/users.ts
const router = Router();

// Runs for ANY route with :id parameter
router.param('id', async (req, res, next, id) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Attach to request
        (req as any).user = user;
        next();
    } catch (err) {
        next(err);
    }
});

// Now all these routes have req.user pre-loaded!
router.get('/:id', (req, res) => {
    res.json((req as any).user);  // Already loaded!
});

router.put('/:id', (req, res) => {
    const user = (req as any).user;  // Already loaded!
    // Update user...
});

router.delete('/:id', (req, res) => {
    const user = (req as any).user;  // Already loaded!
    // Delete user...
});
```

### Multiple Parameters

```typescript
router.param('userId', loadUser);
router.param('postId', loadPost);

router.get('/:userId/posts/:postId', (req, res) => {
    // Both user and post are pre-loaded!
    const user = (req as any).user;
    const post = (req as any).post;
});
```

---

## Route Organization Patterns

### Pattern 1: By Resource (Recommended)

```
src/routes/
├── index.ts          # Main router
├── users.ts          # User routes
├── posts.ts          # Post routes
├── comments.ts       # Comment routes
└── auth.ts           # Auth routes
```

```typescript
// routes/index.ts
import { Router } from 'express';
import userRouter from './users';
import postRouter from './posts';
import authRouter from './auth';

const router = Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/auth', authRouter);

export default router;

// app.ts
import routes from './routes';
app.use('/api', routes);
```

### Pattern 2: By Version

```
src/routes/
├── v1/
│   ├── index.ts
│   ├── users.ts
│   └── posts.ts
└── v2/
    ├── index.ts
    └── users.ts
```

```typescript
// app.ts
import v1Routes from './routes/v1';
import v2Routes from './routes/v2';

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

### Pattern 3: Feature-Based

```
src/features/
├── users/
│   ├── user.routes.ts
│   ├── user.controller.ts
│   └── user.service.ts
└── posts/
    ├── post.routes.ts
    ├── post.controller.ts
    └── post.service.ts
```

---

## Complete Router Example

```typescript
// routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas/user';

const router = Router();
const controller = new UserController();

// Public routes
router.get('/', controller.list);
router.get('/:id', controller.show);

// Protected routes
router.use(authenticate);  // All routes below need auth

router.post(
    '/',
    authorize('admin'),
    validate(createUserSchema),
    controller.create
);

router.put(
    '/:id',
    validate(updateUserSchema),
    controller.update
);

router.delete(
    '/:id',
    authorize('admin'),
    controller.delete
);

// Nested routes
import postsRouter from './posts';
router.use('/:userId/posts', postsRouter);

export default router;
```

---

## PHP/Laravel Comparison

### Route Groups

```php
// Laravel
Route::prefix('api')->group(function () {
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
    });
});

// With middleware
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

```typescript
// Express
const apiRouter = Router();

const userRouter = Router();
userRouter.get('/', controller.index);
userRouter.get('/:id', controller.show);

apiRouter.use('/users', userRouter);
app.use('/api', apiRouter);

// With middleware
const protectedRouter = Router();
protectedRouter.use(authenticate);
protectedRouter.get('/dashboard', controller.index);
```

### Route Model Binding

```php
// Laravel - automatic!
Route::get('/users/{user}', function (User $user) {
    return $user;  // Laravel loads it automatically
});
```

```typescript
// Express - manual with router.param()
router.param('id', async (req, res, next, id) => {
    req.user = await User.findById(id);
    next();
});

router.get('/:id', (req, res) => {
    res.json(req.user);  // Pre-loaded
});
```

---

## Advanced Patterns

### Router Factory

```typescript
// utils/createResourceRouter.ts
export function createResourceRouter<T>(controller: ResourceController<T>) {
    const router = Router();
    
    router.get('/', controller.list);
    router.get('/:id', controller.show);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);
    
    return router;
}

// Usage
const userRouter = createResourceRouter(userController);
const postRouter = createResourceRouter(postController);
```

### Conditional Routes

```typescript
const router = Router();

// Always available
router.get('/', controller.list);

// Only in development
if (process.env.NODE_ENV === 'development') {
    router.get('/debug', controller.debug);
}

// Feature flag
if (config.features.betaEndpoints) {
    router.get('/beta', controller.beta);
}
```

---

## Common Mistakes

### 1. Forgetting to Export Router

```typescript
// ❌ Wrong
const router = Router();
router.get('/', handler);
// Forgot to export!

// ✅ Correct
export default router;
```

### 2. Wrong Mount Path

```typescript
// routes/users.ts
router.get('/users', handler);  // ❌ Don't include prefix in router!

// app.ts
app.use('/api/users', userRouter);
// Results in: /api/users/users

// ✅ Correct
// routes/users.ts
router.get('/', handler);  // Just the path relative to mount

// app.ts
app.use('/api/users', userRouter);
// Results in: /api/users ✓
```

### 3. Missing mergeParams

```typescript
// ❌ Wrong
app.use('/users/:userId/posts', postsRouter);

const postsRouter = Router();  // No mergeParams!
postsRouter.get('/', (req, res) => {
    req.params.userId;  // undefined!
});

// ✅ Correct
const postsRouter = Router({ mergeParams: true });
postsRouter.get('/', (req, res) => {
    req.params.userId;  // '123' ✓
});
```

---

## Key Takeaways

1. **Use Router for modularity** — Split routes into logical files
2. **Mount with prefixes** — `app.use('/api/users', userRouter)`
3. **Router-level middleware** — `router.use(authenticate)`
4. **Nested routers need mergeParams** — Access parent params
5. **router.param() for pre-loading** — Like Laravel's route model binding
6. **Organize by resource or feature** — Keep related routes together
7. **Export routers as default** — Clean imports
