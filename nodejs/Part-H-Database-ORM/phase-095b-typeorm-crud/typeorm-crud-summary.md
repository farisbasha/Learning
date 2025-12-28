# Phase 095b: TypeORM CRUD — Repository API Reference

## Getting Repository

```typescript
const userRepository = AppDataSource.getRepository(User);
```

## CREATE

```typescript
// Create entity (doesn't save)
const user = userRepository.create({ email: 'test@test.com' });

// Save to database
const saved = await userRepository.save(user);

// One step
const user = await userRepository.save({ email: 'test@test.com' });

// Fast insert (no entity return)
await userRepository.insert({ email: 'test@test.com' });

// Upsert
await userRepository.upsert({ email: 'x@y.com', name: 'X' }, ['email']);
```

## READ

### Find Methods

```typescript
// All records
await userRepository.find();

// With conditions
await userRepository.find({ where: { isActive: true } });

// Shorthand
await userRepository.findBy({ isActive: true });

// Single record
await userRepository.findOne({ where: { id: 1 } });
await userRepository.findOneBy({ id: 1 });

// Throw if not found
await userRepository.findOneByOrFail({ id: 1 });

// Count
await userRepository.count();
await userRepository.countBy({ isActive: true });

// Exists
await userRepository.existsBy({ email: 'x@y.com' });
```

### Find Options

```typescript
await userRepository.find({
    where: { isActive: true },
    select: { id: true, email: true },
    relations: ['posts', 'profile'],
    order: { createdAt: 'DESC' },
    take: 10,      // LIMIT
    skip: 0,       // OFFSET
    withDeleted: true
});
```

### Where Operators

```typescript
import { Equal, Not, MoreThan, LessThan, Like, ILike, Between, In, IsNull, Raw } from 'typeorm';

await userRepository.find({
    where: {
        email: Equal('test@test.com'),
        role: Not('admin'),
        age: MoreThan(18),
        age: LessThan(65),
        age: Between(18, 65),
        name: Like('%John%'),
        name: ILike('%john%'),  // Case-insensitive
        status: In(['active', 'pending']),
        deletedAt: IsNull(),
        createdAt: Raw(a => `${a} > NOW() - INTERVAL '7 days'`)
    }
});

// OR conditions
await userRepository.find({
    where: [
        { role: 'admin' },
        { role: 'moderator' }
    ]
});
```

## UPDATE

```typescript
// Direct update (no entity load)
await userRepository.update(1, { name: 'New Name' });
await userRepository.update({ isActive: false }, { role: 'inactive' });

// Load and update
const user = await userRepository.findOneBy({ id: 1 });
user.name = 'New Name';
await userRepository.save(user);

// Increment/Decrement
await userRepository.increment({ id: 1 }, 'loginCount', 1);
await userRepository.decrement({ id: 1 }, 'credits', 10);
```

## DELETE

```typescript
// Direct delete
await userRepository.delete(1);
await userRepository.delete({ isActive: false });

// Load and remove
const user = await userRepository.findOneBy({ id: 1 });
await userRepository.remove(user);

// Soft delete (needs @DeleteDateColumn)
await userRepository.softDelete(1);
await userRepository.restore(1);

// Find with/without deleted
await userRepository.find();                        // Excludes deleted
await userRepository.find({ withDeleted: true });   // Includes deleted
```

## QueryBuilder

```typescript
// SELECT
const users = await userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :active', { active: true })
    .andWhere('user.age > :age', { age: 18 })
    .orderBy('user.createdAt', 'DESC')
    .take(10)
    .skip(0)
    .getMany();

// With joins
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .where('post.isPublished = :pub', { pub: true })
    .getMany();

// Aggregates
const stats = await userRepository
    .createQueryBuilder('user')
    .select('user.role', 'role')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.role')
    .getRawMany();

// UPDATE
await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ isActive: false })
    .where('lastLogin < :date', { date: oldDate })
    .execute();

// DELETE
await userRepository
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('isActive = :active', { active: false })
    .execute();
```

## Raw Queries

```typescript
const result = await AppDataSource.query(
    'SELECT * FROM users WHERE email = $1',
    ['test@test.com']
);
```

## Transactions

```typescript
// Simple
await AppDataSource.transaction(async (em) => {
    await em.save(user);
    await em.save(profile);
});

// With QueryRunner (manual control)
const qr = AppDataSource.createQueryRunner();
await qr.connect();
await qr.startTransaction();
try {
    await qr.manager.save(user);
    await qr.commitTransaction();
} catch (e) {
    await qr.rollbackTransaction();
} finally {
    await qr.release();
}
```

## Quick Comparison

| Operation | Method | Returns |
|-----------|--------|---------|
| Create + Save | `save()` | Entity |
| Fast Insert | `insert()` | InsertResult |
| Find All | `find()` | Entity[] |
| Find One | `findOneBy()` | Entity \| null |
| Find or Fail | `findOneByOrFail()` | Entity (throws) |
| Update | `update()` | UpdateResult |
| Delete | `delete()` | DeleteResult |
| Soft Delete | `softDelete()` | UpdateResult |
| Restore | `restore()` | UpdateResult |

## save() vs insert()/update()/delete()

| Feature | save() | insert/update/delete |
|---------|--------|----------------------|
| Returns | Entity | Result object |
| Triggers listeners | Yes | Minimal |
| Cascade | Yes | No |
| Performance | Slower | Faster |

## Pagination Pattern

```typescript
const [items, total] = await userRepository.findAndCount({
    take: limit,
    skip: (page - 1) * limit,
    order: { createdAt: 'DESC' }
});

return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
};
```
