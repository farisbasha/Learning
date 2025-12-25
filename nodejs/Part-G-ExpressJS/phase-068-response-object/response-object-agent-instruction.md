# Phase 068: Response Object Deep Dive
## Agent Instructions

**Phase**: 068 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Complete `Response` interface overview
2. `res.json<T>()` — send JSON with types
3. `res.send()` — send various types
4. `res.status()` — set HTTP status code
5. `res.sendStatus()` — send status with message
6. `res.redirect()` — redirects
7. `res.sendFile()` — send files
8. `res.download()` — trigger file download
9. `res.set()` / `res.header()` — set headers
10. `res.cookie()` — set cookies
11. Response chaining pattern
12. Laravel comparison: `response()->json()`

## Example
```typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

app.get('/users', (req, res: Response<ApiResponse<User[]>>) => {
    res.status(200).json({
        success: true,
        data: users
    });
});
```

## Content Instructions
**Notes**: Complete Response object with typed patterns
**Summary**: Response API quick reference
