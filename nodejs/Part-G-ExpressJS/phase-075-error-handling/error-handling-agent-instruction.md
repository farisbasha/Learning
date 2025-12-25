# Phase 075: Error Handling
## Agent Instructions

**Phase**: 075 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Error handling in Express — the 4-parameter signature
2. `ErrorRequestHandler` type
3. Creating custom error classes
4. Centralized error handler
5. Async error wrapper (catching promise rejections)
6. `express-async-errors` package
7. Typed error responses
8. HTTP status codes for errors
9. Development vs production error responses
10. Logging errors
11. Laravel comparison: Exception handling

## Example
```typescript
import { ErrorRequestHandler } from 'express';

class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message
    });
};

app.use(errorHandler);
```

## Content Instructions
**Notes**: Production-ready error handling patterns
**Summary**: Error handling checklist
