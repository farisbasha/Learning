# Phase 078: Services Pattern
## Agent Instructions

**Phase**: 078 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Service layer purpose
2. Business logic isolation
3. Typed service classes
4. Service dependencies
5. Repository integration

## Example
```typescript
class UserService {
    constructor(private prisma: PrismaClient) {}
    
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }
    
    async create(data: CreateUserDTO): Promise<User> {
        return this.prisma.user.create({ data });
    }
}
```

## Content Instructions
**Notes**: Service layer implementation
**Summary**: Service patterns reference
