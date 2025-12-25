# Phase 135: Mocking
## Agent Instructions

**Phase**: 135 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is mocking and why
2. jest.fn() — mock functions
3. jest.mock() — module mocking
4. jest.spyOn() — spy on methods
5. Mocking return values
6. Mocking implementations
7. Mocking Prisma
8. Mocking external services
9. Clearing mocks between tests
10. Partial mocking

## Example
```typescript
// Mocking a module
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        }
    }))
}));

// Using mock functions
const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn()
};

describe('UserService', () => {
    const userService = new UserService(mockUserRepository);
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('should find user by id', async () => {
        const mockUser = { id: '1', email: 'test@test.com' };
        mockUserRepository.findById.mockResolvedValue(mockUser);
        
        const user = await userService.findById('1');
        
        expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
        expect(user).toEqual(mockUser);
    });
});
```

## Content Instructions
**Notes**: Mocking strategies with Jest
**Summary**: Mock patterns cheatsheet
