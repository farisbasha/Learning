# Phase 076: Express Router — Cheatsheet

## Basic Router

```typescript
// routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);

export default router;

// app.ts
import userRouter from './routes/users';
app.use('/api/users', userRouter);
```

## Router Options

```typescript
// With mergeParams (for nested routers)
const router = Router({ mergeParams: true });

// Case sensitive routing
const router = Router({ caseSensitive: true });

// Strict routing (trailing slash matters)
const router = Router({ strict: true });
```

## Router-Level Middleware

```typescript
const router = Router();

// Applies to ALL routes in this router
router.use(authenticate);
router.use(logger);

// Routes
router.get('/', handler);  // Has auth + logger
```

## Nested Routers

```typescript
// Parent router
const userRouter = Router();
userRouter.use('/:userId/posts', postsRouter);

// Child router (MUST use mergeParams!)
const postsRouter = Router({ mergeParams: true });
postsRouter.get('/', (req, res) => {
    const { userId } = req.params;  // From parent!
});

// URL: /api/users/123/posts
```

## router.param()

```typescript
// Pre-load resource for any route with :id
router.param('id', async (req, res, next, id) => {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: 'Not found' });
    }
    req.user = user;  // Attach to request
    next();
});

// Now all routes with :id have req.user pre-loaded
router.get('/:id', (req, res) => {
    res.json(req.user);  // Already loaded!
});
```

## Organization Patterns

### By Resource
```
routes/
├── index.ts
├── users.ts
├── posts.ts
└── auth.ts
```

### By Version
```
routes/
├── v1/
│   └── users.ts
└── v2/
    └── users.ts
```

## Complete Example

```typescript
// routes/users.ts
import { Router } from 'express';

const router = Router();

// Middleware for all routes
router.use(authenticate);

// Routes
router.get('/', controller.list);
router.get('/:id', controller.show);
router.post('/', validate(schema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

export default router;

// app.ts
app.use('/api/users', userRouter);
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `Route::prefix('api')` | `app.use('/api', router)` |
| `Route::group()` | Router with middleware |
| `Route::middleware(['auth'])` | `router.use(auth)` |
| Route model binding | `router.param()` |
| Nested groups | Nested routers |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Including prefix in router | Use relative paths only |
| Missing mergeParams | Add `{ mergeParams: true }` |
| Forgetting to export | `export default router` |
| Wrong middleware order | App-level before router-level |

## Remember

- ✅ Use Router() for modularity
- ✅ Mount with `app.use('/prefix', router)`
- ✅ Use mergeParams for nested routers
- ✅ router.param() for pre-loading resources
- ✅ Export routers as default
- ❌ Don't include mount path in router routes
