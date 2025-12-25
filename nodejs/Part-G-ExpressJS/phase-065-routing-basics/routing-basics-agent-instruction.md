# Phase 065: Express Routing Basics
## Agent Instructions

**Phase**: 065 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Route methods: GET, POST, PUT, PATCH, DELETE
2. Route paths: strings vs patterns
3. Route handler signature: `(req, res, next)`
4. `RequestHandler` type
5. Multiple handlers per route
6. `app.all()` for all methods
7. `app.route()` for chaining
8. Response methods: `res.send()`, `res.json()`, `res.status()`
9. Laravel comparison: Route::get(), Route::post()

## Example
```typescript
app.route('/users')
    .get((req, res) => res.json({ users: [] }))
    .post((req, res) => res.status(201).json({ created: true }));
```

## Content Instructions
**Notes**: Complete routing patterns with examples
**Summary**: Express routing cheatsheet
