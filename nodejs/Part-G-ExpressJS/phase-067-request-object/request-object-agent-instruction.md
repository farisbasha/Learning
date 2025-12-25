# Phase 067: Request Object Deep Dive
## Agent Instructions

**Phase**: 067 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Complete `Request` interface overview
2. `req.body` — request payload
3. `req.params` — URL parameters
4. `req.query` — query strings
5. `req.headers` — HTTP headers
6. `req.cookies` — cookie data (with cookie-parser)
7. `req.method`, `req.url`, `req.path`
8. `req.ip`, `req.hostname`
9. Extending Request interface for custom properties
10. Adding `req.user` for authentication
11. Laravel comparison: `$request->input()`, `$request->all()`

## Example
```typescript
// Extending Request for auth
declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string };
        }
    }
}
```

## Content Instructions
**Notes**: Complete Request object guide with custom extensions
**Summary**: Request object API reference
