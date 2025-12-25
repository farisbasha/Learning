# Phase 137: API Testing with Supertest
## Agent Instructions

**Phase**: 137 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is Supertest
2. Testing Express routes
3. HTTP assertions
4. Testing with authentication
5. Testing request body
6. Testing response format
7. Testing error responses
8. Testing file uploads
9. Organizing API tests
10. Laravel comparison: Feature tests

## Example
```typescript
import request from 'supertest';
import app from '../src/app';

describe('Users API', () => {
    describe('POST /api/users', () => {
        test('should create user with valid data', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    email: 'test@test.com',
                    password: 'password123'
                })
                .expect('Content-Type', /json/)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('test@test.com');
        });
        
        test('should return 400 for invalid email', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ email: 'invalid', password: 'pass' })
                .expect(400);
            
            expect(response.body.error).toBeDefined();
        });
    });
    
    describe('GET /api/users (authenticated)', () => {
        test('should return users for authenticated user', async () => {
            const token = await getAuthToken();
            
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
```

## Content Instructions
**Notes**: API testing with Supertest
**Summary**: Supertest patterns reference
