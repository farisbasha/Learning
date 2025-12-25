# Phase 085: Dependency Injection
## Agent Instructions

**Phase**: 085 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. What is Dependency Injection (DI)
2. Why DI matters for testing and flexibility
3. Manual DI in Express (factory pattern)
4. DI containers: `tsyringe`, `inversify`
5. Using `tsyringe` with Express
6. Decorators for DI: `@injectable()`, `@inject()`
7. Registering dependencies
8. Scoped vs singleton dependencies
9. Testing with mocked dependencies
10. Laravel comparison: Service container

## Example
```typescript
import { container, injectable, inject } from 'tsyringe';

@injectable()
class UserService {
    constructor(@inject('Database') private db: Database) {}
}

@injectable()
class UserController {
    constructor(private userService: UserService) {}
}

// Registration
container.register('Database', { useClass: PostgresDatabase });

// Resolution
const controller = container.resolve(UserController);
```

## Content Instructions
**Notes**: DI patterns for Express applications
**Summary**: DI setup guide
