# Phase 138: E2E Testing
## Agent Instructions

**Phase**: 138 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is E2E testing
2. E2E vs integration testing
3. Full system testing
4. Test environment setup
5. Seeding test data
6. Testing user flows
7. Playwright for browser E2E
8. API E2E testing
9. CI/CD E2E pipeline
10. Performance considerations

## Example
```typescript
describe('User Registration Flow (E2E)', () => {
    beforeAll(async () => {
        // Start app, seed database
        await setupTestEnvironment();
    });
    
    afterAll(async () => {
        await teardownTestEnvironment();
    });
    
    test('complete registration and login flow', async () => {
        // 1. Register
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'newuser@test.com',
                password: 'password123',
                name: 'New User'
            })
            .expect(201);
        
        const { accessToken } = registerRes.body.data;
        
        // 2. Access protected resource
        const profileRes = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        
        expect(profileRes.body.data.email).toBe('newuser@test.com');
        
        // 3. Logout (if applicable)
        await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });
});
```

## Content Instructions
**Notes**: E2E testing strategies
**Summary**: E2E test organization
