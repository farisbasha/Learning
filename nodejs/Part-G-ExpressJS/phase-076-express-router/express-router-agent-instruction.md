# Phase 076: Express Router
## Agent Instructions

**Phase**: 076 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. `express.Router()` — modular routing
2. Typed router creation
3. Router-level middleware
4. Mounting routers with prefixes
5. Nested routers
6. Route organization by feature/resource
7. Router parameters: `router.param()`
8. Router mergeParams option
9. Splitting routes into files
10. Laravel comparison: Route groups, `Route::prefix()`

## Example
```typescript
// routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;

// app.ts
import userRouter from './routes/users';
app.use('/api/users', userRouter);
```

## Content Instructions
**Notes**: Modular routing for large applications
**Summary**: Router patterns reference
