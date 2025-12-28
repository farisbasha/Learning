# Phase 083: Controllers Pattern — Cheatsheet

## Controller Responsibilities

✅ **DO**: Parse requests, call services, format responses
❌ **DON'T**: Business logic, DB queries, validation

## Class-Based Controller (Recommended)

```typescript
export class UserController {
    constructor(private userService: UserService) {}
    
    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.findAll();
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    };
    
    show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    };
}
```

## Usage

```typescript
// container.ts
const userService = new UserService();
export const userController = new UserController(userService);

// routes/users.ts
import { userController } from '../container';
router.get('/', userController.list);
router.get('/:id', userController.show);
```

## Typed Controllers

```typescript
interface UserParams { id: string; }
interface CreateUserBody { email: string; password: string; }
interface ListQuery { page?: string; limit?: string; }

class UserController {
    show = async (req: Request<UserParams>, res: Response) => {
        const { id } = req.params;  // Typed!
    };
    
    create = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
        const { email, password } = req.body;  // Typed!
    };
}
```

## Response Helpers

```typescript
class BaseController {
    protected success<T>(res: Response, data: T, status = 200) {
        res.status(status).json({ success: true, data });
    }
    
    protected error(res: Response, message: string, status = 400) {
        res.status(status).json({ success: false, error: message });
    }
    
    protected notFound(res: Response, resource = 'Resource') {
        res.status(404).json({ error: `${resource} not found` });
    }
}

class UserController extends BaseController {
    show = async (req, res, next) => {
        const user = await this.userService.findById(req.params.id);
        if (!user) return this.notFound(res, 'User');
        this.success(res, user);
    };
}
```

## Error Handling

```typescript
// Option 1: Try-catch
show = async (req, res, next) => {
    try {
        const user = await this.userService.findById(req.params.id);
        res.json({ data: user });
    } catch (error) {
        next(error);
    }
};

// Option 2: express-async-errors
import 'express-async-errors';
show = async (req, res) => {
    const user = await this.userService.findById(req.params.id);
    res.json({ data: user });  // Errors auto-caught
};
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `public function index()` | `list = async (req, res) => {}` |
| `public function show($id)` | `show = async (req, res) => {}` |
| `public function store(Request $request)` | `create = async (req, res) => {}` |
| `return response()->json()` | `res.json()` |
| Constructor injection | Constructor injection |

## Remember

- ✅ Use class-based controllers
- ✅ Arrow functions for methods
- ✅ Inject services via constructor
- ✅ Keep controllers thin
- ✅ Delegate to services
- ❌ No business logic in controllers
- ❌ No direct DB access
