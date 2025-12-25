# Phase 148: NestJS Interceptors
## Agent Instructions

**Phase**: 148 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are interceptors — AOP
2. NestInterceptor interface
3. Before and after logic
4. Response transformation
5. Caching interceptor
6. Logging interceptor
7. Timeout interceptor
8. Error handling in interceptors
9. RxJS operators
10. Use cases

## Example
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => ({
                success: true,
                data,
                timestamp: new Date().toISOString()
            }))
        );
    }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        return next.handle().pipe(
            tap(() => console.log(`Request took ${Date.now() - now}ms`))
        );
    }
}
```

## Content Instructions
**Notes**: NestJS interceptors guide
**Summary**: Interceptor patterns reference
