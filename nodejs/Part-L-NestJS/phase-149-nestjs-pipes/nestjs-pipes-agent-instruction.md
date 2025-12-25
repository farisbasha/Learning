# Phase 149: NestJS Pipes
## Agent Instructions

**Phase**: 149 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. What are pipes — transformation & validation
2. Built-in pipes: ValidationPipe, ParseIntPipe, etc.
3. Custom pipes
4. Pipe scope: parameter, method, controller, global
5. Validation pipe configuration
6. Transform pipes
7. Binding pipes
8. Default values
9. ParseUUIDPipe, ParseBoolPipe
10. Use cases

## Example
```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
    transform(value: string, metadata: ArgumentMetadata): number {
        const val = parseInt(value, 10);
        if (isNaN(val)) {
            throw new BadRequestException('Validation failed');
        }
        return val;
    }
}

// Usage
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
}

@Get(':uuid')
findByUuid(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.findByUuid(uuid);
}
```

## Content Instructions
**Notes**: NestJS pipes for transformation/validation
**Summary**: Built-in pipes reference
