# Phase 150: NestJS Exception Filters
## Agent Instructions

**Phase**: 150 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. Built-in exceptions
2. HttpException hierarchy
3. Custom exceptions
4. Exception filters
5. @Catch() decorator
6. Global exception filter
7. Exception response format
8. Logging exceptions
9. Prisma exception handling
10. Laravel comparison: Exception handling

## Example
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        
        const message = exception instanceof HttpException
            ? exception.message
            : 'Internal server error';
        
        response.status(status).json({
            success: false,
            error: {
                statusCode: status,
                message,
                timestamp: new Date().toISOString(),
                path: request.url
            }
        });
    }
}

// Global registration
app.useGlobalFilters(new AllExceptionsFilter());
```

## Content Instructions
**Notes**: NestJS exception handling guide
**Summary**: Exception types reference
