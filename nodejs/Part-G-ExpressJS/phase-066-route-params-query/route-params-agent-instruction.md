# Phase 066: Route Parameters & Query Strings
## Agent Instructions

**Phase**: 066 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Route parameters: `/users/:id`
2. Typing `req.params` with generics
3. Multiple parameters: `/users/:userId/posts/:postId`
4. Query strings: `?page=1&limit=10`
5. Typing `req.query`
6. Optional parameters
7. Parameter validation basics
8. `Request<Params, ResBody, ReqBody, Query>` generic
9. Laravel comparison: Route model binding

## Example
```typescript
interface UserParams {
    id: string;
}

interface PaginationQuery {
    page?: string;
    limit?: string;
}

app.get('/users/:id', (req: Request<UserParams, {}, {}, PaginationQuery>, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page || '1');
    res.json({ userId, page });
});
```

## Content Instructions
**Notes**: Type-safe route params and query handling
**Summary**: Params & query patterns reference
