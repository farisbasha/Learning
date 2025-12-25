# Phase 125: API Versioning
## Agent Instructions

**Phase**: 125 | **Part**: J - API Development | **Language**: TypeScript

## Topics
1. Why version APIs
2. URI versioning: /v1/, /v2/
3. Header versioning: Accept-Version
4. Query parameter versioning
5. Pros and cons of each
6. Maintaining multiple versions
7. Deprecation strategy
8. Version routing in Express
9. Breaking vs non-breaking changes
10. Semantic versioning for APIs

## Example
```typescript
// URI versioning (recommended)
import v1Router from './routes/v1';
import v2Router from './routes/v2';

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Header versioning middleware
const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const version = req.headers['api-version'] || '1';
    req.apiVersion = parseInt(version as string);
    next();
};
```

## Content Instructions
**Notes**: API versioning strategies
**Summary**: Versioning comparison table
