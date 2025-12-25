# Phase 143: NestJS Controllers
## Agent Instructions

**Phase**: 143 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. `@Controller()` decorator
2. Route decorators: `@Get()`, `@Post()`, `@Put()`, `@Delete()`
3. Route parameters: `@Param()`
4. Query parameters: `@Query()`
5. Request body: `@Body()`
6. Response: `@Res()` (avoid when possible)
7. HTTP codes: `@HttpCode()`
8. Headers: `@Headers()`
9. Redirect: `@Redirect()`
10. Route prefixes

## Example
```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    
    @Get()
    findAll(@Query('page') page: number = 1) {
        return this.usersService.findAll(page);
    }
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
    
    @Post()
    @HttpCode(201)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}
```

## Content Instructions
**Notes**: NestJS controllers complete guide
**Summary**: Controller decorators reference
