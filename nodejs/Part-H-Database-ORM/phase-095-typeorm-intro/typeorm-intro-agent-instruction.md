# Phase 095: TypeORM Introduction
## Agent Instructions

**Phase**: 095 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Learn TypeORM
> TypeORM is heavily used in enterprise applications and is the default ORM for NestJS.
> It's a "middle ground" between Sequelize (legacy) and Prisma (modern).

## Topics
1. What is TypeORM — decorator-based ORM
2. Installation and setup
3. DataSource configuration
4. Entity definition with decorators
5. `@Entity`, `@Column`, `@PrimaryGeneratedColumn`
6. Supported databases
7. Active Record vs Data Mapper patterns
8. Repository pattern
9. Synchronize vs migrations
10. TypeORM vs Sequelize comparison

## Example
```typescript
import { DataSource } from 'typeorm';
import { User } from './entities/User';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    database: 'myapp',
    entities: [User],
    synchronize: false,
    logging: true
});

await AppDataSource.initialize();
```

## Content Instructions
**Notes**: TypeORM setup and core concepts
**Summary**: TypeORM quick start guide
