# Phase 084: Services Pattern
## Agent Instructions

**Phase**: 084 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. What are services — business logic layer
2. Why separate services from controllers
3. Service class structure
4. Typed service methods
5. Service dependencies (database, external APIs)
6. Service composition
7. Error throwing in services
8. Testing services (unit tests)
9. Repository pattern introduction
10. Laravel comparison: Service classes

## Example
```typescript
interface IUserService {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    create(data: CreateUserDto): Promise<User>;
}

class UserService implements IUserService {
    constructor(private db: PrismaClient) {}

    async findAll(): Promise<User[]> {
        return this.db.user.findMany();
    }

    async findById(id: string): Promise<User | null> {
        return this.db.user.findUnique({ where: { id } });
    }

    async create(data: CreateUserDto): Promise<User> {
        const hashedPassword = await hash(data.password, 10);
        return this.db.user.create({
            data: { ...data, password: hashedPassword }
        });
    }
}
```

## Content Instructions
**Notes**: Service layer design patterns
**Summary**: Service class template
