# Phase 132: Jest Introduction
## Agent Instructions

**Phase**: 132 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is Jest — all-in-one testing framework
2. Installation and setup
3. Jest vs Mocha comparison
4. Test file naming: `.test.ts`, `.spec.ts`
5. Running tests: `jest`, `npm test`
6. Watch mode
7. describe, test/it, expect
8. Jest matchers
9. Configuration: `jest.config.js`
10. Snapshot testing

## Example
```typescript
describe('UserService', () => {
    test('should create a user', async () => {
        const user = await userService.create({
            email: 'test@test.com',
            password: 'password123'
        });
        
        expect(user).toBeDefined();
        expect(user.email).toBe('test@test.com');
        expect(user.id).toBeDefined();
    });
});
```

## Content Instructions
**Notes**: Jest fundamentals guide
**Summary**: Jest matchers reference
