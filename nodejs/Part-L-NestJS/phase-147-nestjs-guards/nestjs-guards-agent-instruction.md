# Phase 147: NestJS Guards
## Agent Instructions

**Phase**: 147 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are guards — authorization
2. `@Injectable()` guard class
3. CanActivate interface
4. ExecutionContext
5. @UseGuards() decorator
6. Global guards
7. Role-based guards
8. JWT guard with Passport
9. Combining guards
10. Custom decorators for metadata

## Example
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return !!request.user;
    }
}

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true;
        
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.includes(user.role);
    }
}

// Usage
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
getAdminData() {}
```

## Content Instructions
**Notes**: NestJS guards for authorization
**Summary**: Guard patterns reference
