# Phase 126: API Documentation with Swagger
## Agent Instructions

**Phase**: 126 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. OpenAPI/Swagger specification
2. `swagger-jsdoc` for Express
3. `swagger-ui-express` for serving docs
4. JSDoc annotations for routes
5. Request/response schema definition
6. Authentication in Swagger
7. Grouping endpoints with tags
8. Generating client SDKs
9. Postman collection export
10. Keeping docs in sync

## Example
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'My API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000' }]
    },
    apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getUsers);
```

## Content Instructions
**Notes**: Swagger/OpenAPI integration guide
**Summary**: Swagger setup checklist
