# Phase 095: TypeORM Introduction — Quick Start Guide

## What is TypeORM?

A decorator-based ORM for TypeScript. NestJS default. Middle ground between Sequelize and Prisma.

## Installation

```bash
npm install typeorm reflect-metadata pg  # PostgreSQL
npm install typeorm reflect-metadata mysql2  # MySQL
```

## tsconfig.json (Required!)

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "strictPropertyInitialization": false
    }
}
```

## DataSource Setup

```typescript
// src/data-source.ts
import { DataSource } from 'typeorm';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp',
    entities: [User],
    synchronize: true,  // DEV ONLY! Never in production
    logging: true
});
```

## Basic Entity

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ type: 'varchar', nullable: true })
    name?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
```

## Initialize and Use

```typescript
// src/index.ts
import 'reflect-metadata';  // FIRST IMPORT!
import { AppDataSource } from './data-source';
import { User } from './entities/User';

async function main() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);

    // Create
    const user = userRepo.create({ email: 'test@test.com' });
    await userRepo.save(user);

    // Read
    const users = await userRepo.find();
    const one = await userRepo.findOneBy({ id: 1 });

    // Update
    await userRepo.update({ id: 1 }, { name: 'New Name' });

    // Delete
    await userRepo.delete({ id: 1 });
}

main();
```

## Active Record vs Data Mapper

| Active Record | Data Mapper |
|---------------|-------------|
| `extends BaseEntity` | Plain entity class |
| `await user.save()` | `await repo.save(user)` |
| `await User.find()` | `await repo.find()` |
| Simpler, coupled | Complex, decoupled |
| Good for small apps | Good for large apps |

### Active Record Example

```typescript
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
}

// Usage
await User.find();
await user.save();
```

### Data Mapper Example

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
}

// Usage
const repo = AppDataSource.getRepository(User);
await repo.find();
await repo.save(user);
```

## TypeORM vs Sequelize

| TypeORM | Sequelize |
|---------|-----------|
| Decorators | Object definition |
| TypeScript-first | JavaScript-first |
| Active Record + Data Mapper | Active Record only |
| NestJS default | Third-party |

```typescript
// TypeORM
@Entity('users')
export class User {
    @Column()
    email!: string;
}

// Sequelize
const User = sequelize.define('User', {
    email: DataTypes.STRING
});
```

## Synchronize vs Migrations

| Synchronize | Migrations |
|-------------|------------|
| Auto-create tables | Manual SQL files |
| Dev only | Production safe |
| May lose data | Version controlled |
| Quick iteration | Safe deployments |

```typescript
// Development
synchronize: true

// Production
synchronize: false  // Use migrations!
```

## Quick Reference

| Task | Code |
|------|------|
| Initialize | `await AppDataSource.initialize()` |
| Get repo | `AppDataSource.getRepository(Entity)` |
| Create | `repo.create({ ... })` |
| Save | `await repo.save(entity)` |
| Find all | `await repo.find()` |
| Find one | `await repo.findOneBy({ id })` |
| Update | `await repo.update({ id }, { ... })` |
| Delete | `await repo.delete({ id })` |

## Common Decorators

| Decorator | Purpose |
|-----------|---------|
| `@Entity()` | Mark class as table |
| `@Column()` | Regular column |
| `@PrimaryGeneratedColumn()` | Auto-increment PK |
| `@CreateDateColumn()` | Auto-set created time |
| `@UpdateDateColumn()` | Auto-update on save |

## Remember

- Import `reflect-metadata` FIRST
- Enable decorator options in tsconfig
- NEVER use `synchronize: true` in production
- Use Data Mapper for NestJS/large apps
- Use migrations for production deployments
