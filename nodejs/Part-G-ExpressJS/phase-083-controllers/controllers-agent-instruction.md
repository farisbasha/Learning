# Phase 083: Controllers Pattern
## Agent Instructions

**Phase**: 083 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. What are controllers — handling HTTP logic
2. Controller as plain functions
3. Controller as classes
4. Typed controller methods
5. Keeping controllers "thin"
6. Extracting business logic to services
7. Dependency injection in controllers (manual)
8. Async controllers
9. Response typing in controllers
10. Laravel comparison: Controller classes

## Example
```typescript
// Class-based controller
class UserController {
    constructor(private userService: UserService) {}

    getAll = async (req: Request, res: Response) => {
        const users = await this.userService.findAll();
        res.json({ users });
    };

    getById = async (req: Request<{ id: string }>, res: Response) => {
        const user = await this.userService.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ user });
    };
}

// Usage
const userService = new UserService();
const userController = new UserController(userService);
router.get('/', userController.getAll);
```

## Content Instructions
**Notes**: Controller patterns for scalable APIs
**Summary**: Controller organization patterns
