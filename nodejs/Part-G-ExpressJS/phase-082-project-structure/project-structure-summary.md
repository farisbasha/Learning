# Phase 082: Project Structure — Cheatsheet

## Production Structure

```
src/
├── config/           # Configuration
├── controllers/      # Request handlers
├── services/         # Business logic
├── repositories/     # Data access
├── middleware/       # Custom middleware
├── routes/           # Route definitions
├── schemas/          # Validation (Zod)
├── types/            # TypeScript types
├── utils/            # Helpers
├── errors/           # Custom errors
├── app.ts            # App setup
└── server.ts         # Entry point
```

## Layer Responsibilities

| Layer | Purpose | Example |
|-------|---------|---------|
| **Controllers** | HTTP handling | Parse request, call service, format response |
| **Services** | Business logic | Validate rules, orchestrate operations |
| **Repositories** | Data access | Database queries only |
| **Middleware** | Request processing | Auth, validation, logging |
| **Routes** | URL mapping | Define endpoints |

## Controller Pattern

```typescript
// controllers/UserController.ts
export class UserController {
    constructor(private userService: UserService) {}
    
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
}
```

## Service Pattern

```typescript
// services/UserService.ts
export class UserService {
    constructor(
        private userRepo: UserRepository,
        private emailService: EmailService
    ) {}
    
    async createUser(data: CreateUserDto) {
        // Business logic
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepo.create({ ...data, password: hashedPassword });
        await this.emailService.sendWelcome(user.email);
        return user;
    }
}
```

## Repository Pattern

```typescript
// repositories/UserRepository.ts
export class UserRepository {
    constructor(private prisma: PrismaClient) {}
    
    async create(data: CreateUserData) {
        return this.prisma.user.create({ data });
    }
    
    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }
}
```

## Dependency Injection

```typescript
// container.ts
const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const emailService = new EmailService();
const userService = new UserService(userRepo, emailService);
export const userController = new UserController(userService);

// routes/users.ts
import { userController } from '../container';
router.post('/', (req, res, next) => userController.create(req, res, next));
```

## App vs Server

```typescript
// app.ts - Express configuration
const app = express();
app.use(express.json());
app.use('/api', routes);
export default app;

// server.ts - Server startup
import app from './app';
app.listen(PORT, () => console.log('Running'));
```

## Feature-Based (Alternative)

```
src/features/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.routes.ts
│   └── auth.schema.ts
└── users/
    ├── user.controller.ts
    ├── user.service.ts
    ├── user.repository.ts
    └── user.routes.ts
```

## PHP → Express

| Laravel | Express |
|---------|---------|
| `app/Http/Controllers/` | `src/controllers/` |
| `app/Services/` | `src/services/` |
| `app/Models/` | `src/repositories/` |
| `routes/api.php` | `src/routes/` |
| `app/Http/Requests/` | `src/schemas/` |
| `config/` | `src/config/` |

## Best Practices

- ✅ Separate app.ts and server.ts
- ✅ Use dependency injection
- ✅ One responsibility per file
- ✅ Controllers only handle HTTP
- ✅ Business logic in services
- ✅ Data access in repositories
- ❌ Don't put logic in controllers
- ❌ Don't access DB from controllers

## Remember

**Controller** → **Service** → **Repository** → **Database**

Each layer has ONE job!
