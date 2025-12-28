# Phase 084 & 085: Services + DI — Cheatsheet

## Services Pattern

### Service Responsibilities
✅ Business logic, orchestration, call repositories
❌ HTTP handling, direct DB queries, response formatting

### Basic Service

```typescript
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
    
    async getUserById(id: string) {
        const user = await this.userRepo.findById(id);
        if (!user) throw new NotFoundError('User');
        return user;
    }
}
```

## Dependency Injection

### Manual DI (Simple)

```typescript
// container.ts
const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const emailService = new EmailService();
const userService = new UserService(userRepo, emailService);
export const userController = new UserController(userService);
```

### tsyringe DI (Recommended)

```bash
npm install tsyringe reflect-metadata
```

```typescript
// tsconfig.json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}

// app.ts
import 'reflect-metadata';

// Service
@injectable()
export class UserService {
    constructor(
        @inject('UserRepository') private userRepo: UserRepository
    ) {}
}

// Controller
@injectable()
export class UserController {
    constructor(private userService: UserService) {}
}

// Container
container.register('UserRepository', { useClass: UserRepository });

// Usage
const controller = container.resolve(UserController);
```

## Architecture Layers

```
Controller → Service → Repository → Database
   (HTTP)   (Business)   (Data)
```

## Testing with DI

```typescript
describe('UserService', () => {
    let service: UserService;
    let mockRepo: jest.Mocked<UserRepository>;
    
    beforeEach(() => {
        mockRepo = { findById: jest.fn() } as any;
        service = new UserService(mockRepo);  // Inject mock!
    });
    
    it('should find user', async () => {
        mockRepo.findById.mockResolvedValue({ id: '1', name: 'John' });
        const user = await service.getUserById('1');
        expect(user.name).toBe('John');
    });
});
```

## Complete Example

```typescript
// Repository
export class UserRepository {
    constructor(private prisma: PrismaClient) {}
    async findById(id: string) { return this.prisma.user.findUnique({ where: { id } }); }
}

// Service
@injectable()
export class UserService {
    constructor(@inject('UserRepository') private repo: UserRepository) {}
    async getUser(id: string) { return this.repo.findById(id); }
}

// Controller
@injectable()
export class UserController {
    constructor(private service: UserService) {}
    show = async (req, res) => {
        const user = await this.service.getUser(req.params.id);
        res.json({ data: user });
    };
}
```

## Remember

- ✅ Services contain business logic
- ✅ Inject dependencies via constructor
- ✅ Use tsyringe for large apps
- ✅ Manual DI for small apps
- ✅ Services are testable
- ❌ No HTTP in services
- ❌ No DB queries in services (use repos)
