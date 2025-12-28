# Phase 084 & 085: Services Pattern + Dependency Injection

## Part 1: Services Pattern (Phase 084)

### What are Services?

Services contain **business logic** — the core rules and operations of your application. They sit between controllers (HTTP layer) and repositories (data layer).

### Service Responsibilities

✅ **DO**:
- Business logic and rules
- Orchestrate operations
- Call repositories
- Transform data
- Throw domain errors

❌ **DON'T**:
- HTTP handling (that's controllers)
- Direct database queries (use repositories)
- Response formatting

### Basic Service Pattern

```typescript
// services/UserService.ts
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';
import { NotFoundError } from '../errors';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private emailService: EmailService
    ) {}
    
    async createUser(data: CreateUserDto) {
        // Business rule: Check if email exists
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new ConflictError('Email already registered');
        }
        
        // Business logic: Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        // Create user
        const user = await this.userRepo.create({
            ...data,
            password: hashedPassword
        });
        
        // Business operation: Send welcome email
        await this.emailService.sendWelcome(user.email, user.name);
        
        return user;
    }
    
    async getUserById(id: string) {
        const user = await this.userRepo.findById(id);
        
        if (!user) {
            throw new NotFoundError('User');
        }
        
        return user;
    }
    
    async updateUser(id: string, data: UpdateUserDto) {
        // Business rule: Verify user exists
        await this.getUserById(id);
        
        // Business rule: If changing email, check uniqueness
        if (data.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new ConflictError('Email already in use');
            }
        }
        
        return this.userRepo.update(id, data);
    }
}
```

### Service with Multiple Dependencies

```typescript
export class OrderService {
    constructor(
        private orderRepo: OrderRepository,
        private productRepo: ProductRepository,
        private paymentService: PaymentService,
        private emailService: EmailService,
        private inventoryService: InventoryService
    ) {}
    
    async createOrder(userId: string, items: OrderItem[]) {
        // Validate products exist and are in stock
        for (const item of items) {
            const product = await this.productRepo.findById(item.productId);
            if (!product) {
                throw new NotFoundError(`Product ${item.productId}`);
            }
            
            const available = await this.inventoryService.checkStock(
                item.productId,
                item.quantity
            );
            
            if (!available) {
                throw new ValidationError(`Insufficient stock for ${product.name}`);
            }
        }
        
        // Calculate total
        const total = await this.calculateTotal(items);
        
        // Process payment
        const payment = await this.paymentService.charge(userId, total);
        
        // Create order
        const order = await this.orderRepo.create({
            userId,
            items,
            total,
            paymentId: payment.id
        });
        
        // Update inventory
        await this.inventoryService.decreaseStock(items);
        
        // Send confirmation
        await this.emailService.sendOrderConfirmation(userId, order);
        
        return order;
    }
    
    private async calculateTotal(items: OrderItem[]): Promise<number> {
        let total = 0;
        for (const item of items) {
            const product = await this.productRepo.findById(item.productId);
            total += product.price * item.quantity;
        }
        return total;
    }
}
```

---

## Part 2: Dependency Injection (Phase 085)

### What is Dependency Injection?

**DI** is a pattern where dependencies are **provided** to a class rather than created inside it.

```typescript
// ❌ Without DI - hard to test
class UserService {
    private userRepo = new UserRepository();  // Hard-coded!
    
    async getUser(id: string) {
        return this.userRepo.findById(id);
    }
}

// ✅ With DI - easy to test
class UserService {
    constructor(private userRepo: UserRepository) {}  // Injected!
    
    async getUser(id: string) {
        return this.userRepo.findById(id);
    }
}
```

### Manual DI (Simple Projects)

```typescript
// container.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/UserRepository';
import { EmailService } from './services/EmailService';
import { UserService } from './services/UserService';
import { UserController } from './controllers/UserController';

// Database
const prisma = new PrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);

// Services
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);

// Controllers
export const userController = new UserController(userService);
```

### DI with tsyringe (Recommended)

```bash
npm install tsyringe reflect-metadata
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```typescript
// app.ts
import 'reflect-metadata';
import { container } from 'tsyringe';

// services/UserService.ts
import { injectable, inject } from 'tsyringe';

@injectable()
export class UserService {
    constructor(
        @inject('UserRepository') private userRepo: UserRepository,
        @inject('EmailService') private emailService: EmailService
    ) {}
}

// controllers/UserController.ts
@injectable()
export class UserController {
    constructor(private userService: UserService) {}
    
    list = async (req: Request, res: Response) => {
        const users = await this.userService.findAll();
        res.json({ data: users });
    };
}

// container.ts
import { container } from 'tsyringe';

container.register('UserRepository', { useClass: UserRepository });
container.register('EmailService', { useClass: EmailService });

// routes/users.ts
const controller = container.resolve(UserController);
router.get('/', controller.list);
```

### Testing with DI

```typescript
// UserService.test.ts
describe('UserService', () => {
    let service: UserService;
    let mockRepo: jest.Mocked<UserRepository>;
    let mockEmail: jest.Mocked<EmailService>;
    
    beforeEach(() => {
        // Create mocks
        mockRepo = {
            findById: jest.fn(),
            create: jest.fn()
        } as any;
        
        mockEmail = {
            sendWelcome: jest.fn()
        } as any;
        
        // Inject mocks
        service = new UserService(mockRepo, mockEmail);
    });
    
    it('should create user and send email', async () => {
        const userData = { email: 'test@test.com', password: 'pass123' };
        const createdUser = { id: '1', ...userData };
        
        mockRepo.create.mockResolvedValue(createdUser);
        
        const result = await service.createUser(userData);
        
        expect(mockRepo.create).toHaveBeenCalled();
        expect(mockEmail.sendWelcome).toHaveBeenCalledWith(
            createdUser.email,
            createdUser.name
        );
        expect(result).toEqual(createdUser);
    });
});
```

---

## Complete Architecture Example

```typescript
// repositories/UserRepository.ts
export class UserRepository {
    constructor(private prisma: PrismaClient) {}
    
    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    
    async create(data: CreateUserData) {
        return this.prisma.user.create({ data });
    }
}

// services/UserService.ts
@injectable()
export class UserService {
    constructor(
        @inject('UserRepository') private userRepo: UserRepository,
        @inject('EmailService') private emailService: EmailService
    ) {}
    
    async createUser(data: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepo.create({ ...data, password: hashedPassword });
        await this.emailService.sendWelcome(user.email);
        return user;
    }
}

// controllers/UserController.ts
@injectable()
export class UserController {
    constructor(private userService: UserService) {}
    
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    };
}

// container.ts
container.register('PrismaClient', { useValue: new PrismaClient() });
container.register('UserRepository', { useClass: UserRepository });
container.register('EmailService', { useClass: EmailService });

// routes/users.ts
const controller = container.resolve(UserController);
router.post('/', validate(CreateUserSchema), controller.create);
```

---

## Key Takeaways

### Services:
1. **Contain business logic** — Rules, validations, orchestration
2. **Independent of HTTP** — Can be used anywhere
3. **Call repositories** — Don't query DB directly
4. **Throw domain errors** — NotFoundError, ValidationError, etc.
5. **Testable** — Pure business logic

### Dependency Injection:
1. **Inject dependencies** — Don't create them
2. **Use tsyringe for large apps** — Automatic resolution
3. **Manual DI for small apps** — Simple container file
4. **Makes testing easy** — Mock dependencies
5. **Prepares for NestJS** — Similar DI pattern
