# Phase 146: NestJS Middleware
## Agent Instructions

**Phase**: 146 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What is middleware in NestJS
2. `@Injectable()` middleware class
3. NestMiddleware interface
4. Function middleware
5. Applying middleware
6. Middleware for specific routes
7. Global middleware
8. Multiple middleware
9. Express middleware compatibility
10. Middleware vs Guard vs Interceptor

## Example
```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(`${req.method} ${req.url}`);
        next();
    }
}

// app.module.ts
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*');
        
        consumer
            .apply(AuthMiddleware)
            .exclude({ path: 'auth/login', method: RequestMethod.POST })
            .forRoutes('*');
    }
}
```

## Content Instructions
**Notes**: NestJS middleware patterns
**Summary**: Middleware configuration reference
