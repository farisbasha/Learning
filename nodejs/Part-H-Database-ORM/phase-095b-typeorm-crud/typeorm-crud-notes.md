# Phase 095b: TypeORM CRUD Operations — Complete Guide

## Overview

TypeORM provides multiple ways to interact with your database:
1. **Repository** - Main API for entity operations (Data Mapper pattern)
2. **EntityManager** - Lower-level, entity-agnostic operations
3. **QueryBuilder** - Complex queries with SQL-like syntax
4. **Raw Queries** - Direct SQL execution

This phase covers all CRUD operations using each approach.

---

## Repository Pattern

### Getting a Repository

```typescript
import { AppDataSource } from './data-source';
import { User } from './entities/User';

// Get repository for an entity
const userRepository = AppDataSource.getRepository(User);

// In a service/controller
class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async findAll() {
        return this.userRepository.find();
    }
}
```

### Repository vs EntityManager

```typescript
// Repository - scoped to one entity
const userRepository = AppDataSource.getRepository(User);
await userRepository.find();  // Always queries User table

// EntityManager - works with any entity
const entityManager = AppDataSource.manager;
await entityManager.find(User);  // Must specify entity
await entityManager.find(Post);  // Can query any entity
```

---

## CREATE Operations

### repository.create()

Creates a new entity instance **without saving to database**:

```typescript
const userRepository = AppDataSource.getRepository(User);

// Create from object
const user = userRepository.create({
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
});
// user is a User instance, NOT saved yet!

console.log(user instanceof User);  // true
console.log(user.id);  // undefined (not saved)

// Create multiple
const users = userRepository.create([
    { email: 'user1@test.com', firstName: 'User', lastName: 'One' },
    { email: 'user2@test.com', firstName: 'User', lastName: 'Two' }
]);
```

### repository.save()

Saves entity to database (INSERT or UPDATE):

```typescript
// Create and save (two steps)
const user = userRepository.create({
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
});
const savedUser = await userRepository.save(user);
console.log(savedUser.id);  // Now has ID!

// Direct save (one step) - also works
const user2 = await userRepository.save({
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe'
});

// Save updates existing entity (if ID present)
user.firstName = 'Johnny';
await userRepository.save(user);  // UPDATE, not INSERT
```

### repository.insert()

Direct INSERT without creating entity instance:

```typescript
// Insert single
const result = await userRepository.insert({
    email: 'fast@example.com',
    firstName: 'Fast',
    lastName: 'Insert'
});

console.log(result.identifiers);  // [{ id: 1 }]
console.log(result.generatedMaps);  // Generated values

// Insert multiple
await userRepository.insert([
    { email: 'batch1@test.com', firstName: 'Batch', lastName: 'One' },
    { email: 'batch2@test.com', firstName: 'Batch', lastName: 'Two' }
]);
```

**Key Difference: save() vs insert()**

| Feature | save() | insert() |
|---------|--------|----------|
| Returns | Full entity | InsertResult |
| Triggers | Subscribers, listeners | Minimal |
| Cascade | Yes | No |
| Upsert logic | Yes (checks ID) | No |
| Performance | Slower | Faster |

### Upsert (Insert or Update)

```typescript
// PostgreSQL/MySQL syntax
await userRepository.upsert(
    {
        email: 'john@example.com',  // Conflict key
        firstName: 'John',
        lastName: 'Updated'
    },
    ['email']  // Conflict columns
);

// Upsert multiple
await userRepository.upsert(
    [
        { email: 'user1@test.com', firstName: 'Updated1' },
        { email: 'user2@test.com', firstName: 'Updated2' }
    ],
    ['email']
);
```

---

## READ Operations

### find()

Retrieve multiple entities:

```typescript
const userRepository = AppDataSource.getRepository(User);

// All records
const allUsers = await userRepository.find();

// With conditions
const activeUsers = await userRepository.find({
    where: { isActive: true }
});

// Multiple conditions (AND)
const specificUsers = await userRepository.find({
    where: {
        isActive: true,
        role: 'admin'
    }
});

// OR conditions
const users = await userRepository.find({
    where: [
        { role: 'admin' },
        { role: 'moderator' }
    ]
});
```

### findBy()

Simplified find with just conditions:

```typescript
// Equivalent to find({ where: ... })
const activeUsers = await userRepository.findBy({
    isActive: true
});

const admins = await userRepository.findBy({
    role: 'admin',
    isActive: true
});
```

### findOne()

Retrieve single entity with full options:

```typescript
// With options object
const user = await userRepository.findOne({
    where: { id: 1 }
});

// With relations
const userWithPosts = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts', 'profile']
});

// Returns null if not found
if (!user) {
    throw new Error('User not found');
}
```

### findOneBy()

Simplified single entity lookup:

```typescript
// Just the where clause
const user = await userRepository.findOneBy({ id: 1 });
const userByEmail = await userRepository.findOneBy({
    email: 'john@example.com'
});
```

### findOneOrFail() / findOneByOrFail()

Throws exception if not found:

```typescript
try {
    const user = await userRepository.findOneByOrFail({ id: 999 });
} catch (error) {
    // EntityNotFoundError thrown
    console.log('User not found!');
}

// With full options
const user = await userRepository.findOneOrFail({
    where: { id: 1 },
    relations: ['posts']
});
```

### Find Options

```typescript
const users = await userRepository.find({
    // WHERE clause
    where: {
        isActive: true,
        role: 'user'
    },

    // SELECT specific columns
    select: {
        id: true,
        email: true,
        firstName: true
        // Excluded: password, lastName, etc.
    },

    // Load relations
    relations: {
        posts: true,
        profile: true
    },
    // Or array syntax: relations: ['posts', 'profile']

    // ORDER BY
    order: {
        createdAt: 'DESC',
        firstName: 'ASC'
    },

    // LIMIT
    take: 10,

    // OFFSET
    skip: 0,

    // Include soft-deleted
    withDeleted: true,

    // Cache results
    cache: true,
    // Or: cache: { id: 'users_cache', milliseconds: 60000 }
});
```

### Advanced Where Conditions

```typescript
import {
    Equal,
    Not,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
    Like,
    ILike,
    Between,
    In,
    Any,
    IsNull,
    ArrayContains,
    ArrayContainedBy,
    ArrayOverlap,
    Raw
} from 'typeorm';

const users = await userRepository.find({
    where: {
        // Exact match
        email: Equal('john@example.com'),

        // Not equal
        role: Not('admin'),

        // Comparison
        age: MoreThan(18),
        age: MoreThanOrEqual(18),
        age: LessThan(65),
        age: LessThanOrEqual(65),
        age: Between(18, 65),

        // Pattern matching
        firstName: Like('%John%'),     // Case-sensitive
        firstName: ILike('%john%'),    // Case-insensitive (PostgreSQL)

        // IN clause
        status: In(['active', 'pending']),

        // NULL check
        deletedAt: IsNull(),
        middleName: Not(IsNull()),

        // Array operations (PostgreSQL)
        tags: ArrayContains(['typescript']),
        tags: ArrayContainedBy(['js', 'ts', 'node']),
        tags: ArrayOverlap(['react', 'vue']),

        // Raw SQL condition
        createdAt: Raw(alias => `${alias} > NOW() - INTERVAL '7 days'`)
    }
});
```

### Combining Operators

```typescript
// Complex conditions
const users = await userRepository.find({
    where: {
        age: Between(18, 65),
        status: Not(In(['banned', 'suspended'])),
        email: ILike('%@gmail.com'),
        createdAt: MoreThan(new Date('2024-01-01'))
    }
});
```

### count() and countBy()

```typescript
// Count all
const totalUsers = await userRepository.count();

// Count with condition
const activeCount = await userRepository.count({
    where: { isActive: true }
});

// Shorthand
const adminCount = await userRepository.countBy({ role: 'admin' });
```

### exists() and existsBy()

```typescript
// Check existence
const emailExists = await userRepository.existsBy({
    email: 'john@example.com'
});

if (emailExists) {
    throw new Error('Email already registered');
}
```

---

## UPDATE Operations

### repository.update()

Update without loading entity first:

```typescript
// Update by ID
await userRepository.update(1, { firstName: 'Johnny' });

// Update by conditions
await userRepository.update(
    { isActive: false },  // WHERE
    { role: 'inactive' }  // SET
);

// Update multiple by IDs
await userRepository.update([1, 2, 3], { isActive: true });

// Returns UpdateResult
const result = await userRepository.update(1, { firstName: 'Johnny' });
console.log(result.affected);  // Number of rows affected
```

### repository.save() for Updates

Load, modify, and save:

```typescript
// Load entity
const user = await userRepository.findOneBy({ id: 1 });

if (user) {
    // Modify
    user.firstName = 'Johnny';
    user.lastName = 'Updated';

    // Save (UPDATE)
    await userRepository.save(user);
}
```

**Key Difference: update() vs save()**

| Feature | update() | save() |
|---------|----------|--------|
| Loads entity | No | Yes (if exists) |
| Triggers | Minimal | Subscribers, listeners |
| Cascade | No | Yes |
| Validation | No | Entity validation |
| Returns | UpdateResult | Updated entity |
| Performance | Faster | Slower |

### Increment / Decrement

```typescript
// Increment column value
await userRepository.increment(
    { id: 1 },           // WHERE
    'loginCount',        // Column
    1                    // Amount
);

// Decrement
await userRepository.decrement(
    { id: 1 },
    'credits',
    10
);
```

---

## DELETE Operations

### repository.delete()

Delete without loading entity:

```typescript
// Delete by ID
await userRepository.delete(1);

// Delete by conditions
await userRepository.delete({ isActive: false });

// Delete multiple IDs
await userRepository.delete([1, 2, 3]);

// Returns DeleteResult
const result = await userRepository.delete(1);
console.log(result.affected);  // Number of rows deleted
```

### repository.remove()

Delete loaded entity:

```typescript
// Load and remove
const user = await userRepository.findOneBy({ id: 1 });
if (user) {
    await userRepository.remove(user);
}

// Remove multiple
const inactiveUsers = await userRepository.findBy({ isActive: false });
await userRepository.remove(inactiveUsers);
```

**Key Difference: delete() vs remove()**

| Feature | delete() | remove() |
|---------|----------|----------|
| Input | ID or conditions | Entity instance |
| Loads entity | No | Already loaded |
| Triggers | Minimal | Subscribers, listeners |
| Cascade | No | Yes |
| Returns | DeleteResult | Removed entity |

### Soft Delete

```typescript
// Entity must have @DeleteDateColumn
@Entity()
export class User {
    @DeleteDateColumn()
    deletedAt?: Date;
}

// Soft delete (sets deletedAt)
await userRepository.softDelete(1);
await userRepository.softDelete({ isActive: false });

// Soft delete loaded entity
const user = await userRepository.findOneBy({ id: 1 });
await userRepository.softRemove(user);

// Find excludes soft-deleted by default
const users = await userRepository.find();  // Only non-deleted

// Include soft-deleted
const allUsers = await userRepository.find({ withDeleted: true });

// Only soft-deleted
const deleted = await userRepository.find({
    withDeleted: true,
    where: { deletedAt: Not(IsNull()) }
});

// Restore soft-deleted
await userRepository.restore(1);
await userRepository.restore({ email: 'john@example.com' });
```

---

## QueryBuilder

For complex queries that FindOptions can't handle.

### Creating QueryBuilder

```typescript
// From repository
const qb = userRepository.createQueryBuilder('user');

// From DataSource
const qb = AppDataSource
    .createQueryBuilder()
    .select('user')
    .from(User, 'user');

// From EntityManager
const qb = AppDataSource.manager
    .createQueryBuilder(User, 'user');
```

### SELECT Queries

```typescript
// Basic select
const users = await userRepository
    .createQueryBuilder('user')
    .getMany();

// With conditions
const activeUsers = await userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :isActive', { isActive: true })
    .getMany();

// Complex WHERE
const users = await userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :active', { active: true })
    .andWhere('user.age > :age', { age: 18 })
    .orWhere('user.role = :role', { role: 'admin' })
    .getMany();

// Brackets for complex logic
const users = await userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :active', { active: true })
    .andWhere(new Brackets(qb => {
        qb.where('user.role = :role1', { role1: 'admin' })
          .orWhere('user.role = :role2', { role2: 'moderator' });
    }))
    .getMany();
// WHERE isActive = true AND (role = 'admin' OR role = 'moderator')
```

### SELECT Specific Columns

```typescript
// Select specific columns
const users = await userRepository
    .createQueryBuilder('user')
    .select(['user.id', 'user.email', 'user.firstName'])
    .getMany();

// Add columns to selection
const users = await userRepository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.email')
    .addSelect('user.password')  // Include excluded columns
    .getMany();
```

### ORDER, LIMIT, OFFSET

```typescript
const users = await userRepository
    .createQueryBuilder('user')
    .orderBy('user.createdAt', 'DESC')
    .addOrderBy('user.firstName', 'ASC')
    .take(10)   // LIMIT
    .skip(20)   // OFFSET
    .getMany();
```

### Joins

```typescript
// Left join and load relation
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .leftJoinAndSelect('user.profile', 'profile')
    .getMany();

// Inner join
const usersWithPosts = await userRepository
    .createQueryBuilder('user')
    .innerJoinAndSelect('user.posts', 'post')
    .getMany();

// Join with condition
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post', 'post.isPublished = :published', { published: true })
    .getMany();
```

### Aggregations

```typescript
// Count
const count = await userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :active', { active: true })
    .getCount();

// Group by with aggregates
const stats = await userRepository
    .createQueryBuilder('user')
    .select('user.role', 'role')
    .addSelect('COUNT(*)', 'count')
    .addSelect('AVG(user.age)', 'avgAge')
    .groupBy('user.role')
    .getRawMany();
// Returns: [{ role: 'admin', count: '5', avgAge: '35.5' }, ...]
```

### Subqueries

```typescript
// Subquery in WHERE
const users = await userRepository
    .createQueryBuilder('user')
    .where(qb => {
        const subQuery = qb
            .subQuery()
            .select('post.authorId')
            .from(Post, 'post')
            .where('post.isPublished = :published', { published: true })
            .getQuery();
        return 'user.id IN ' + subQuery;
    })
    .getMany();

// Subquery in FROM
const avgAges = await AppDataSource
    .createQueryBuilder()
    .select('subQuery.role', 'role')
    .addSelect('AVG(subQuery.age)', 'avgAge')
    .from(subQuery => {
        return subQuery
            .select('user.role', 'role')
            .addSelect('user.age', 'age')
            .from(User, 'user')
            .where('user.isActive = :active', { active: true });
    }, 'subQuery')
    .groupBy('subQuery.role')
    .getRawMany();
```

### INSERT with QueryBuilder

```typescript
await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
        { email: 'user1@test.com', firstName: 'User', lastName: 'One' },
        { email: 'user2@test.com', firstName: 'User', lastName: 'Two' }
    ])
    .execute();

// Insert from select
await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(UserArchive)
    .values(
        AppDataSource
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.deletedAt IS NOT NULL')
    )
    .execute();
```

### UPDATE with QueryBuilder

```typescript
await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ isActive: false })
    .where('lastLoginAt < :date', { date: new Date('2024-01-01') })
    .execute();

// Update with computed values
await userRepository
    .createQueryBuilder()
    .update(User)
    .set({
        loginCount: () => 'loginCount + 1',
        lastLoginAt: new Date()
    })
    .where('id = :id', { id: 1 })
    .execute();
```

### DELETE with QueryBuilder

```typescript
await userRepository
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('isActive = :active', { active: false })
    .andWhere('createdAt < :date', { date: new Date('2023-01-01') })
    .execute();

// Soft delete
await userRepository
    .createQueryBuilder()
    .softDelete()
    .where('lastLoginAt < :date', { date: oneYearAgo })
    .execute();
```

---

## Raw Queries

For complex SQL that QueryBuilder can't express.

### query() Method

```typescript
// Raw SELECT
const users = await AppDataSource.query(
    'SELECT * FROM users WHERE email = $1',
    ['john@example.com']
);

// Raw INSERT
await AppDataSource.query(
    'INSERT INTO users (email, firstName) VALUES ($1, $2)',
    ['new@test.com', 'New']
);

// Database-specific features
const result = await AppDataSource.query(`
    SELECT
        role,
        COUNT(*) as count,
        array_agg(email) as emails
    FROM users
    WHERE is_active = true
    GROUP BY role
`);
```

### EntityManager.query()

```typescript
const result = await AppDataSource.manager.query(
    'SELECT * FROM users WHERE id = $1',
    [1]
);
```

---

## Transactions

### Simple Transaction

```typescript
await AppDataSource.transaction(async (transactionalManager) => {
    // All operations use the same transaction
    const user = transactionalManager.create(User, {
        email: 'john@example.com',
        firstName: 'John'
    });
    await transactionalManager.save(user);

    const profile = transactionalManager.create(Profile, {
        userId: user.id,
        bio: 'Hello!'
    });
    await transactionalManager.save(profile);

    // If any operation fails, all are rolled back
});
```

### Transaction with Isolation Level

```typescript
await AppDataSource.transaction(
    'SERIALIZABLE',  // Isolation level
    async (transactionalManager) => {
        // Operations here
    }
);

// Isolation levels: 'READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'
```

### QueryRunner for Manual Control

```typescript
const queryRunner = AppDataSource.createQueryRunner();

// Establish connection
await queryRunner.connect();

// Start transaction
await queryRunner.startTransaction();

try {
    // Execute operations
    await queryRunner.manager.save(user);
    await queryRunner.manager.save(profile);

    // Commit
    await queryRunner.commitTransaction();
} catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction();
    throw error;
} finally {
    // Release connection
    await queryRunner.release();
}
```

### Nested Transactions (Savepoints)

```typescript
await AppDataSource.transaction(async (em) => {
    await em.save(user);

    try {
        // Nested transaction (savepoint)
        await em.transaction(async (nestedEm) => {
            await nestedEm.save(riskyOperation);
            // If this fails, only nested transaction rolls back
        });
    } catch (e) {
        // Handle nested failure, outer transaction continues
        console.log('Nested failed, but continuing');
    }

    await em.save(anotherUser);  // Still executes
});
```

---

## Comparison with Sequelize

### CREATE

```typescript
// TypeORM
const user = userRepository.create({ email: 'test@test.com' });
await userRepository.save(user);
// Or: await userRepository.insert({ email: 'test@test.com' });

// Sequelize
const user = await User.create({ email: 'test@test.com' });
```

### READ

```typescript
// TypeORM
const users = await userRepository.find({
    where: { isActive: true },
    order: { createdAt: 'DESC' },
    take: 10
});

// Sequelize
const users = await User.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
    limit: 10
});
```

### UPDATE

```typescript
// TypeORM
await userRepository.update({ id: 1 }, { name: 'New Name' });

// Sequelize
await User.update({ name: 'New Name' }, { where: { id: 1 } });
```

### DELETE

```typescript
// TypeORM
await userRepository.delete({ id: 1 });

// Sequelize
await User.destroy({ where: { id: 1 } });
```

---

## Best Practices

### 1. Use findOneByOrFail for Required Records

```typescript
// Instead of
const user = await userRepository.findOneBy({ id });
if (!user) throw new Error('Not found');

// Use
const user = await userRepository.findOneByOrFail({ id });
```

### 2. Select Only Needed Columns

```typescript
// For list views
const users = await userRepository.find({
    select: { id: true, email: true, firstName: true }
});
```

### 3. Paginate Results

```typescript
async function paginate<T>(
    repository: Repository<T>,
    page: number,
    limit: number
) {
    const [items, total] = await repository.findAndCount({
        take: limit,
        skip: (page - 1) * limit
    });

    return {
        items,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
}
```

### 4. Use Transactions for Related Operations

```typescript
// Always wrap related operations
await AppDataSource.transaction(async (em) => {
    await em.save(user);
    await em.save(profile);
    await em.save(settings);
});
```

### 5. Prefer QueryBuilder for Complex Queries

```typescript
// When FindOptions get complex, use QueryBuilder
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .where('user.isActive = :active', { active: true })
    .andWhere('post.publishedAt IS NOT NULL')
    .orderBy('post.publishedAt', 'DESC')
    .getMany();
```

---

## Key Takeaways

1. **Repository is the main API** - `getRepository(Entity)` for CRUD
2. **create() doesn't save** - Use `save()` after `create()`
3. **save() handles insert/update** - Checks for ID presence
4. **insert()/update()/delete() are faster** - Skip entity loading
5. **FindOptions for simple queries** - `where`, `order`, `take`, `skip`
6. **QueryBuilder for complex queries** - Joins, subqueries, aggregations
7. **Soft delete needs @DeleteDateColumn** - And `softDelete()`/`restore()`
8. **Transactions wrap related operations** - Rollback on any failure
9. **findOneByOrFail() throws if not found** - Cleaner than null check

---

## Next Steps

- **Phase 095c**: Relations between entities
- **Phase 095d**: Migrations for production
