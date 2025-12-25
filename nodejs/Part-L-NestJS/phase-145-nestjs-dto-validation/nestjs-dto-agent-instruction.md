# Phase 145: NestJS DTOs & Validation
## Agent Instructions

**Phase**: 145 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are DTOs — Data Transfer Objects
2. class-validator decorators
3. class-transformer
4. ValidationPipe
5. Global validation
6. Custom validators
7. Whitelist option (strip unknown)
8. Transform option
9. Partial DTOs
10. Laravel comparison: Form Requests

## Example
```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(8)
    password: string;
    
    @IsString()
    @IsOptional()
    name?: string;
}

// main.ts — global validation
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
}));

// Controller
@Post()
create(@Body() dto: CreateUserDto) {
    // dto is validated and transformed
    return this.usersService.create(dto);
}
```

## Content Instructions
**Notes**: NestJS validation with DTOs
**Summary**: class-validator decorators reference
