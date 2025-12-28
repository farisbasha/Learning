# Phase 083: Controllers Pattern

## Overview

Controllers are the **HTTP layer** of your application. They handle incoming requests, delegate work to services, and format responses. A well-designed controller is **thin** — it contains minimal logic and delegates business operations to services.

---

## The Problem: Fat Controllers

### Bad Example (Everything in Controller)

```typescript
// ❌ Fat controller - hard to test, hard to maintain
app.post('/users', async (req, res) => {
    // Validation
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    
    // Business logic
    const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email }
    });
    
    if (existingUser) {
        return res.status(409).json({ error: 'Email exists' });
    }
    
    // Password hashing
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Database operation
    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name
        }
    });
    
    // Email sending
    await sendEmail(user.email, 'Welcome!');
    
    // Response
    res.status(201).json({ user });
});
```

**Problems:**
- Can't test without HTTP
- Business logic mixed with HTTP
- Hard to reuse logic
- Difficult to mock dependencies

---

## Controller Responsibilities

### What Controllers SHOULD Do:
✅ Parse request data
✅ Call service methods
✅ Format HTTP responses
✅ Handle HTTP-specific errors (404, 400, etc.)
✅ Set status codes and headers

### What Controllers SHOULD NOT Do:
❌ Business logic
❌ Database queries
❌ Data validation (use middleware)
❌ Complex transformations
❌ External API calls

---

## Controller Patterns

### Pattern 1: Plain Functions

```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.findAll();
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// routes/users.ts
import { getAllUsers, getUserById } from '../controllers/userController';

router.get('/', getAllUsers);
router.get('/:id', getUserById);
```

**Pros:**
- Simple
- No `this` binding issues
- Easy to understand

**Cons:**
- Hard to inject dependencies
- Hard to test
- Global service instance

### Pattern 2: Class-Based (Recommended)

```typescript
// controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, UpdateUserDto } from '../schemas/user.schema';

export class UserController {
    constructor(private userService: UserService) {}
    
    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const users = await this.userService.findAll(
                Number(page),
                Number(limit)
            );
            
            res.json({
                success: true,
                data: users,
                meta: {
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        } catch (error) {
            next(error);
        }
    };
    
    show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    };
    
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body as CreateUserDto;
            const user = await this.userService.create(data);
            
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    };
    
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = req.body as UpdateUserDto;
            
            const user = await this.userService.update(id, data);
            
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    };
    
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.delete(req.params.id);
            
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
```

**Pros:**
- Dependency injection
- Easy to test
- Organized
- Reusable

**Cons:**
- Slightly more boilerplate
- Need to bind methods (use arrow functions)

### Using Class Controller

```typescript
// container.ts
import { UserService } from './services/UserService';
import { UserController } from './controllers/UserController';

const userService = new UserService();
export const userController = new UserController(userService);

// routes/users.ts
import { userController } from '../container';

router.get('/', userController.list);
router.get('/:id', userController.show);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
```

---

## Typed Controllers

### Typing Request and Response

```typescript
interface UserParams {
    id: string;
}

interface CreateUserBody {
    email: string;
    password: string;
    name: string;
}

interface ListUsersQuery {
    page?: string;
    limit?: string;
    search?: string;
}

export class UserController {
    show = async (
        req: Request<UserParams>,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;  // Typed!
        // ...
    };
    
    create = async (
        req: Request<{}, {}, CreateUserBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { email, password, name } = req.body;  // Typed!
        // ...
    };
    
    list = async (
        req: Request<{}, {}, {}, ListUsersQuery>,
        res: Response,
        next: NextFunction
    ) => {
        const { page, limit, search } = req.query;  // Typed!
        // ...
    };
}
```

---

## Response Formatting

### Consistent Response Structure

```typescript
// types/response.types.ts
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

// controllers/UserController.ts
export class UserController {
    list = async (req: Request, res: Response<ApiResponse<User[]>>) => {
        const users = await this.userService.findAll();
        
        res.json({
            success: true,
            data: users,
            meta: {
                total: users.length
            }
        });
    };
}
```

### Response Helper Methods

```typescript
export class BaseController {
    protected success<T>(res: Response, data: T, status = 200) {
        res.status(status).json({
            success: true,
            data
        });
    }
    
    protected error(res: Response, message: string, status = 400) {
        res.status(status).json({
            success: false,
            error: message
        });
    }
    
    protected notFound(res: Response, resource = 'Resource') {
        res.status(404).json({
            success: false,
            error: `${resource} not found`
        });
    }
}

export class UserController extends BaseController {
    show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.findById(req.params.id);
            
            if (!user) {
                return this.notFound(res, 'User');
            }
            
            this.success(res, user);
        } catch (error) {
            next(error);
        }
    };
}
```

---

## Error Handling in Controllers

### Option 1: Try-Catch (Explicit)

```typescript
show = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await this.userService.findById(req.params.id);
        res.json({ data: user });
    } catch (error) {
        next(error);  // Forward to error handler
    }
};
```

### Option 2: express-async-errors (Automatic)

```typescript
import 'express-async-errors';  // At app entry

// No try-catch needed!
show = async (req: Request, res: Response) => {
    const user = await this.userService.findById(req.params.id);
    res.json({ data: user });  // Errors auto-forwarded
};
```

---

## PHP/Laravel Comparison

### Laravel Controller

```php
class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}
    
    public function index(Request $request)
    {
        $users = $this->userService->findAll();
        return response()->json(['users' => $users]);
    }
    
    public function show(string $id)
    {
        $user = $this->userService->findById($id);
        
        if (!$user) {
            return response()->json(['error' => 'Not found'], 404);
        }
        
        return response()->json(['user' => $user]);
    }
    
    public function store(CreateUserRequest $request)
    {
        $user = $this->userService->create($request->validated());
        return response()->json(['user' => $user], 201);
    }
}
```

### Express Equivalent

```typescript
export class UserController {
    constructor(private userService: UserService) {}
    
    list = async (req: Request, res: Response) => {
        const users = await this.userService.findAll();
        res.json({ users });
    };
    
    show = async (req: Request, res: Response) => {
        const user = await this.userService.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        res.json({ user });
    };
    
    create = async (req: Request, res: Response) => {
        const user = await this.userService.create(req.body);
        res.status(201).json({ user });
    };
}
```

---

## Testing Controllers

### Unit Test Example

```typescript
import { UserController } from './UserController';
import { UserService } from '../services/UserService';

describe('UserController', () => {
    let controller: UserController;
    let mockService: jest.Mocked<UserService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;
    
    beforeEach(() => {
        mockService = {
            findById: jest.fn()
        } as any;
        
        controller = new UserController(mockService);
        
        mockReq = { params: { id: '123' } };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });
    
    it('should return user when found', async () => {
        const mockUser = { id: '123', name: 'John' };
        mockService.findById.mockResolvedValue(mockUser);
        
        await controller.show(
            mockReq as Request,
            mockRes as Response,
            mockNext
        );
        
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            data: mockUser
        });
    });
    
    it('should return 404 when user not found', async () => {
        mockService.findById.mockResolvedValue(null);
        
        await controller.show(
            mockReq as Request,
            mockRes as Response,
            mockNext
        );
        
        expect(mockRes.status).toHaveBeenCalledWith(404);
    });
});
```

---

## Key Takeaways

1. **Keep controllers thin** — Delegate to services
2. **Use class-based controllers** — Better DI and testing
3. **Arrow functions for methods** — Avoid `this` binding issues
4. **Type your requests** — `Request<Params, ResBody, ReqBody, Query>`
5. **Consistent response format** — Use helper methods
6. **Handle errors properly** — Try-catch or express-async-errors
7. **Controllers are HTTP layer only** — No business logic
