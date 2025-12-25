# Phase 136: Integration Testing
## Agent Instructions

**Phase**: 136 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is integration testing
2. Testing with real database
3. Test database setup
4. Database seeding
5. Transaction rollback strategy
6. Testing service + repository
7. Docker for test databases
8. Prisma testing patterns
9. Clean up after tests
10. CI/CD integration testing

## Example
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('UserService Integration', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });
    
    afterAll(async () => {
        await prisma.$disconnect();
    });
    
    beforeEach(async () => {
        // Clean database
        await prisma.user.deleteMany();
    });
    
    test('should create and retrieve user', async () => {
        const userService = new UserService(prisma);
        
        const created = await userService.create({
            email: 'test@test.com',
            password: 'password'
        });
        
        const found = await userService.findById(created.id);
        
        expect(found).toBeDefined();
        expect(found.email).toBe('test@test.com');
    });
});
```

## Content Instructions
**Notes**: Integration testing guide
**Summary**: Integration test setup checklist
