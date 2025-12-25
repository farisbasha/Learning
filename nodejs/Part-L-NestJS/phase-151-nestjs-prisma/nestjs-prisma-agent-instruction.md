# Phase 151: NestJS with Prisma
## Agent Instructions

**Phase**: 151 | **Part**: L - NestJS | **Language**: TypeScript

## Topics
1. Prisma integration in NestJS
2. PrismaService as provider
3. OnModuleInit for connection
4. OnModuleDestroy for cleanup
5. Repository pattern with Prisma
6. Transactions in NestJS
7. Error handling
8. Testing with Prisma
9. Prisma middleware in NestJS
10. Best practices

## Example
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }
    
    async onModuleDestroy() {
        await this.$disconnect();
    }
}

// users.service.ts
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    
    async findAll() {
        return this.prisma.user.findMany();
    }
    
    async create(data: CreateUserDto) {
        return this.prisma.user.create({ data });
    }
}
```

## Content Instructions
**Notes**: NestJS + Prisma integration guide
**Summary**: Prisma service setup
