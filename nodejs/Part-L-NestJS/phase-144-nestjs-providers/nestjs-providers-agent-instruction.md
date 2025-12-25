# Phase 144: NestJS Providers & DI
## Agent Instructions

**Phase**: 144 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are providers
2. `@Injectable()` decorator
3. Dependency injection in NestJS
4. Service classes
5. Constructor injection
6. Provider registration
7. Custom providers: useClass, useValue, useFactory
8. Provider scope: DEFAULT, REQUEST, TRANSIENT
9. Async providers
10. Laravel comparison: Service container

## Example
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService
    ) {}
    
    async create(data: CreateUserDto) {
        const user = await this.prisma.user.create({ data });
        await this.emailService.sendWelcome(user.email);
        return user;
    }
}

// Custom provider
@Module({
    providers: [
        UsersService,
        {
            provide: 'CONFIG',
            useValue: { apiKey: 'xxx' }
        }
    ]
})
```

## Content Instructions
**Notes**: NestJS dependency injection guide
**Summary**: Provider patterns reference
