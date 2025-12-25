# Phase 066: Route Parameters & Queries
## Agent Instructions

**Phase**: 066 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Route parameters: `/users/:id`
2. Typing `req.params`
3. Query strings: `?key=value`
4. Typing `req.query`
5. Generic Request type
6. Zod validation for params

## Example
```typescript
interface Params { id: string }
interface Query { page?: string }

app.get<Params, any, any, Query>('/users/:id', (req, res) => {
    const userId = req.params.id;
    const page = req.query.page;
});
```

## Content Instructions
**Notes**: Typed params and queries
**Summary**: Request typing patterns
