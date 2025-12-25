# Phase 073: Error Handling
## Agent Instructions

**Phase**: 073 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. `ErrorRequestHandler` type
2. Error-handling middleware: `(err, req, res, next)`
3. Custom error classes
4. Centralized error handler
5. Typed error responses
6. Async error wrapper

## Example
```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message,
        code: err.code
    });
};
```

## Content Instructions
**Notes**: Error handling patterns
**Summary**: Error handling reference
