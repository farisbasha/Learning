# Phase 082: Express Project Structure

## Overview

A well-organized project structure is crucial for maintainability, scalability, and team collaboration. This phase covers **production-ready** folder organization patterns for TypeScript Express applications.

---

## The Problem: Unorganized Code

### Bad Structure (Everything in One Place)

```
project/
├── app.ts                    # 2000 lines!
├── database.ts
├── helpers.ts
└── package.json
```

**Problems:**
- Hard to find code
- Difficult to test
- Merge conflicts
- Can't scale
- No separation of concerns

---

## Recommended Structure (Layer-Based)

### Complete Production Structure

```
project-root/
├── src/
│   ├── config/                    # Configuration
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   │
│   ├── controllers/               # Request handlers
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   └── PostController.ts
│   │
│   ├── services/                  # Business logic
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   └── EmailService.ts
│   │
│   ├── repositories/              # Data access
│   │   ├── UserRepository.ts
│   │   └── PostRepository.ts
│   │
│   ├── middleware/                # Custom middleware
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   │
│   ├── routes/                    # Route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── post.routes.ts
│   │
│   ├── schemas/                   # Validation schemas
│   │   ├── user.schema.ts
│   │   ├── post.schema.ts
│   │   └── auth.schema.ts
│   │
│   ├── types/                     # TypeScript types
│   │   ├── express.d.ts
│   │   ├── user.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   └── date.ts
│   │
│   ├── errors/                    # Custom errors
│   │   ├── AppError.ts
│   │   ├── NotFoundError.ts
│   │   └── ValidationError.ts
│   │
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
│
├── prisma/                        # Database
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── tests/                         # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Layer Responsibilities

### 1. Controllers Layer

**Purpose**: Handle HTTP requests and responses
**Responsibilities**:
- Receive requests
- Call services
- Format responses
- Handle HTTP-specific logic

```typescript
// controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto } from '../schemas/user.schema';

export class UserController {
    constructor(private userService: UserService) {}
    
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateUserDto;
            const user = await this.userService.createUser(data);
            
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
    
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const users = await this.userService.listUsers(
                Number(page),
                Number(limit)
            );
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }
}
```

### 2. Services Layer

**Purpose**: Business logic
**Responsibilities**:
- Implement business rules
- Orchestrate operations
- Call repositories
- Independent of HTTP

```typescript
// services/UserService.ts
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';
import { NotFoundError } from '../errors/NotFoundError';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private emailService: EmailService
    ) {}
    
    async createUser(data: CreateUserDto) {
        // Business logic
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const user = await this.userRepo.create({
            ...data,
            password: hashedPassword
        });
        
        // Send welcome email
        await this.emailService.sendWelcome(user.email);
        
        return user;
    }
    
    async getUserById(id: string) {
        const user = await this.userRepo.findById(id);
        
        if (!user) {
            throw new NotFoundError('User');
        }
        
        return user;
    }
}
```

### 3. Repositories Layer

**Purpose**: Data access
**Responsibilities**:
- Database queries
- Data mapping
- No business logic

```typescript
// repositories/UserRepository.ts
import { PrismaClient } from '@prisma/client';

export class UserRepository {
    constructor(private prisma: PrismaClient) {}
    
    async create(data: CreateUserData) {
        return this.prisma.user.create({ data });
    }
    
    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    
    async list(page: number, limit: number) {
        return this.prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit
        });
    }
}
```

---

## Configuration Files

### config/env.ts

```typescript
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.string().transform(Number),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    REDIS_URL: z.string().url().optional()
});

export const env = envSchema.parse(process.env);
```

### config/database.ts

```typescript
import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query'] : ['error']
});
```

### config/logger.ts

```typescript
import winston from 'winston';
import { env } from './env';

export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});
```

---

## App Setup

### app.ts (Application Configuration)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api', routes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

export default app;
```

### server.ts (Server Entry Point)

```typescript
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    
    server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
    });
});
```

---

## Dependency Injection Setup

### Container Pattern

```typescript
// container.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/UserRepository';
import { UserService } from './services/UserService';
import { UserController } from './controllers/UserController';
import { EmailService } from './services/EmailService';

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

### Using in Routes

```typescript
// routes/users.ts
import { Router } from 'express';
import { userController } from '../container';

const router = Router();

router.get('/', (req, res, next) => userController.list(req, res, next));
router.post('/', (req, res, next) => userController.create(req, res, next));

export default router;
```

---

## Alternative: Feature-Based Structure

### When to Use

- Large applications
- Multiple teams
- Domain-driven design

### Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.routes.ts
│   │   ├── user.schema.ts
│   │   └── user.types.ts
│   │
│   └── posts/
│       ├── post.controller.ts
│       ├── post.service.ts
│       ├── post.repository.ts
│       ├── post.routes.ts
│       └── post.schema.ts
│
├── shared/
│   ├── middleware/
│   ├── utils/
│   ├── errors/
│   └── types/
│
├── config/
├── app.ts
└── server.ts
```

---

## PHP/Laravel Comparison

### Laravel Structure

```
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/
├── Models/
├── Services/
└── Repositories/

routes/
├── web.php
└── api.php

config/
database/
tests/
```

### Express Equivalent

```
src/
├── controllers/
├── middleware/
├── schemas/          # Like Requests
├── models/           # If using TypeORM
├── services/
└── repositories/

routes/
config/
prisma/              # Like database/
tests/
```

---

## Best Practices

### 1. Separation of Concerns

```typescript
// ❌ Bad - everything in controller
class UserController {
    async create(req, res) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({ data: { ...req.body, password: hashedPassword } });
        await sendEmail(user.email, 'Welcome');
        res.json(user);
    }
}

// ✅ Good - separated layers
class UserController {
    async create(req, res) {
        const user = await this.userService.createUser(req.body);
        res.json(user);
    }
}
```

### 2. Dependency Injection

```typescript
// ❌ Bad - hard dependencies
class UserService {
    async createUser(data) {
        const repo = new UserRepository();  // Hard to test!
        return repo.create(data);
    }
}

// ✅ Good - injected dependencies
class UserService {
    constructor(private userRepo: UserRepository) {}
    
    async createUser(data) {
        return this.userRepo.create(data);
    }
}
```

### 3. Single Responsibility

Each file should have ONE clear purpose.

---

## Key Takeaways

1. **Layer-based for most projects** — Controllers → Services → Repositories
2. **Feature-based for large apps** — Group by domain/feature
3. **Separate app.ts and server.ts** — Better for testing
4. **Use dependency injection** — Easier testing and maintenance
5. **Config in separate files** — Environment-specific settings
6. **Types in dedicated folder** — Shared TypeScript definitions
7. **Follow consistent naming** — `*.controller.ts`, `*.service.ts`, etc.
