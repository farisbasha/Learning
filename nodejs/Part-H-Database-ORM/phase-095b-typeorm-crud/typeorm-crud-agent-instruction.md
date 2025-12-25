# Phase 095b: TypeORM CRUD
## Agent Instructions

**Phase**: 095b | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Repository pattern: `getRepository()`
2. EntityManager
3. Create: `repository.create()`, `repository.save()`
4. Read: `find()`, `findOne()`, `findBy()`, `findOneBy()`
5. Update: `update()`, `save()` on existing entity
6. Delete: `delete()`, `remove()`, `softDelete()`
7. Query options: where, order, take, skip
8. QueryBuilder for complex queries
9. Raw queries
10. Transactions

## Example
```typescript
const userRepository = AppDataSource.getRepository(User);

// Create
const user = userRepository.create({ email: 'test@test.com' });
await userRepository.save(user);

// Read
const users = await userRepository.find({
    where: { isActive: true },
    order: { createdAt: 'DESC' },
    take: 10
});

// QueryBuilder
const result = await userRepository
    .createQueryBuilder('user')
    .where('user.email LIKE :email', { email: '%@gmail.com' })
    .getMany();
```

## Content Instructions
**Notes**: TypeORM CRUD and QueryBuilder
**Summary**: TypeORM repository API reference
