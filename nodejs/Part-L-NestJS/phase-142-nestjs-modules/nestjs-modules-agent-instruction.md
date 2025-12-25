# Phase 142: NestJS Modules
## Agent Instructions

**Phase**: 142 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are modules — organizing code
2. `@Module()` decorator
3. Module metadata: imports, controllers, providers, exports
4. Feature modules
5. Core module
6. Shared modules
7. Global modules
8. Dynamic modules
9. Module structure best practices
10. Laravel comparison: Service Providers

## Example
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService] // Make available to other modules
})
export class UsersModule {}

// App module
@Module({
    imports: [UsersModule, PostsModule, AuthModule]
})
export class AppModule {}
```

## Content Instructions
**Notes**: NestJS module system guide
**Summary**: Module decorator options
