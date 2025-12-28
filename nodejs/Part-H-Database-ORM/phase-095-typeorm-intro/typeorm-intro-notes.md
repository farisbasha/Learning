# Phase 095: TypeORM Introduction — The Middle Ground ORM

## Overview

**TypeORM** is a decorator-based Object-Relational Mapper for TypeScript and JavaScript. It sits as the **"middle ground"** between Sequelize (legacy, JS-first) and Prisma (modern, schema-first). TypeORM is the **default ORM for NestJS** and heavily used in enterprise TypeScript applications.

TypeORM's key differentiator: **It uses TypeScript decorators** to define entities directly in classes, making your models look like annotated classes (similar to Java's JPA/Hibernate or C#'s Entity Framework).

---

## Why TypeORM?

### The ORM Landscape

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Node.js ORM Spectrum                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Legacy ◄─────────────────────────────────────────────────► Modern   │
│                                                                      │
│  Sequelize          TypeORM                    Prisma      Drizzle   │
│  (JS-first)     (Decorator-based)          (Schema-first)  (TS-first)│
│                    ▲                                                 │
│                    │                                                 │
│              NestJS Default                                          │
│              Enterprise Popular                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### When to Use TypeORM

| Use Case | TypeORM Fit |
|----------|-------------|
| **NestJS project** | Excellent - first-class integration |
| **Coming from Java/C#** | Excellent - familiar decorator pattern |
| **Enterprise TypeScript** | Very Good - mature, stable |
| **Need both Active Record AND Data Mapper** | Excellent - supports both |
| **Complex legacy migrations** | Good - flexible migration system |
| **Want Prisma-like DX** | Okay - use Prisma instead |
| **Need best type safety** | Okay - Prisma/Drizzle are better |

---

## Installation and Setup

### Step 1: Install Dependencies

```bash
# Core TypeORM package
npm install typeorm

# Database driver (pick one)
npm install pg                  # PostgreSQL
npm install mysql2              # MySQL
npm install better-sqlite3      # SQLite
npm install mssql               # SQL Server

# TypeScript support
npm install reflect-metadata    # Required for decorators
npm install @types/node -D
```

### Step 2: Configure TypeScript

TypeORM requires specific TypeScript settings for decorators:

```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "ES2021",
        "module": "commonjs",
        "lib": ["ES2021"],
        "strict": true,
        "esModuleInterop": true,
        "experimentalDecorators": true,    // REQUIRED
        "emitDecoratorMetadata": true,     // REQUIRED
        "strictPropertyInitialization": false  // Recommended for entities
    }
}
```

**Critical**: Without `experimentalDecorators` and `emitDecoratorMetadata`, TypeORM decorators won't work!

### Step 3: Import reflect-metadata

At the entry point of your application:

```typescript
// src/index.ts or src/main.ts
import 'reflect-metadata';  // MUST be first import!
import { AppDataSource } from './data-source';

// Rest of your application...
```

---

## DataSource Configuration

### What is DataSource?

`DataSource` is TypeORM's main entry point. It holds your database connection configuration and is used to:
- Connect to the database
- Get repositories
- Run migrations
- Create query builders

### Basic DataSource Configuration

```typescript
// src/data-source.ts
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Post } from './entities/Post';

export const AppDataSource = new DataSource({
    // Database type
    type: 'postgres',

    // Connection settings
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp',

    // Entity registration
    entities: [User, Post],
    // OR use glob pattern:
    // entities: ['src/entities/**/*.ts'],

    // Schema synchronization (DEV ONLY!)
    synchronize: true,  // Auto-create tables - NEVER in production!

    // Logging
    logging: true,  // Show SQL queries

    // Connection pool
    extra: {
        max: 20,  // Max connections in pool
    }
});
```

### Environment-Based Configuration

```typescript
// src/data-source.ts
import { DataSource } from 'typeorm';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
    type: 'postgres',

    // Use connection URL or individual settings
    url: process.env.DATABASE_URL,
    // OR
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp',

    // SSL for production
    ssl: isProduction ? { rejectUnauthorized: false } : false,

    // Entities
    entities: isProduction
        ? ['dist/entities/**/*.js']   // Compiled JS in production
        : ['src/entities/**/*.ts'],   // TS source in development

    // Migrations
    migrations: isProduction
        ? ['dist/migrations/**/*.js']
        : ['src/migrations/**/*.ts'],

    // NEVER synchronize in production!
    synchronize: !isProduction,

    logging: !isProduction,
});
```

### Initializing the DataSource

```typescript
// src/index.ts
import 'reflect-metadata';
import { AppDataSource } from './data-source';

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        // Your app code here...

    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

bootstrap();
```

---

## Entity Definition Basics

### What is an Entity?

An **Entity** is a TypeScript class that maps to a database table. TypeORM uses **decorators** to define the mapping:

```typescript
// src/entities/User.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('users')  // Maps to 'users' table
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name?: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
```

### Decorator Breakdown

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@Entity()` | Marks class as database entity | `@Entity('users')` |
| `@PrimaryGeneratedColumn()` | Auto-incrementing primary key | `@PrimaryGeneratedColumn()` |
| `@Column()` | Regular column | `@Column({ type: 'varchar' })` |
| `@CreateDateColumn()` | Auto-set on insert | `@CreateDateColumn()` |
| `@UpdateDateColumn()` | Auto-update on save | `@UpdateDateColumn()` |

### Comparison with Sequelize

```typescript
// TypeORM (decorator-based)
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    email!: string;
}

// Sequelize (method-based)
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255)
    }
}, { tableName: 'users' });
```

---

## Active Record vs Data Mapper Patterns

TypeORM is unique in supporting **both** patterns. Understanding them is crucial for architectural decisions.

### Active Record Pattern

In Active Record, the **entity itself** has methods to save, remove, and find records. The entity knows how to persist itself.

```typescript
// Entity with Active Record
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {  // Extends BaseEntity!
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    name!: string;
}

// Usage - methods are on the entity/class
async function activeRecordExample() {
    // Create and save
    const user = new User();
    user.email = 'john@example.com';
    user.name = 'John';
    await user.save();  // Instance method

    // Find
    const users = await User.find();  // Static method on class
    const john = await User.findOneBy({ email: 'john@example.com' });

    // Update
    john.name = 'John Doe';
    await john.save();

    // Delete
    await john.remove();
}
```

**Pros of Active Record:**
- Simple, intuitive API
- Less boilerplate
- Familiar to Rails/Laravel developers
- Good for simple CRUD apps

**Cons of Active Record:**
- Entity coupled to database logic
- Harder to unit test (entities need mocking)
- Violates Single Responsibility Principle
- Less flexible for complex queries

### Data Mapper Pattern

In Data Mapper, entities are "dumb" data structures. A separate **Repository** handles all database operations. The entity doesn't know about persistence.

```typescript
// Entity - just data, no methods
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    name!: string;
}

// Usage - Repository handles all operations
async function dataMapperExample() {
    const userRepository = AppDataSource.getRepository(User);

    // Create and save
    const user = userRepository.create({
        email: 'john@example.com',
        name: 'John'
    });
    await userRepository.save(user);

    // Find
    const users = await userRepository.find();
    const john = await userRepository.findOneBy({ email: 'john@example.com' });

    // Update
    john.name = 'John Doe';
    await userRepository.save(john);

    // Delete
    await userRepository.remove(john);
}
```

**Pros of Data Mapper:**
- Entities are simple data containers
- Better separation of concerns
- Easy to unit test (mock repository)
- More flexible for complex architectures
- Better for large applications

**Cons of Data Mapper:**
- More boilerplate
- Requires injecting repositories
- Slightly more complex setup

### When to Use Which?

| Scenario | Recommended Pattern |
|----------|-------------------|
| Small/simple app | Active Record |
| Rapid prototyping | Active Record |
| Large enterprise app | Data Mapper |
| NestJS application | Data Mapper |
| Need dependency injection | Data Mapper |
| Coming from Rails/Laravel | Active Record (initially) |

### Side-by-Side Comparison

```typescript
// ========== ACTIVE RECORD ==========
// Entity extends BaseEntity
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
}

// Create
const user = new User();
user.email = 'test@test.com';
await user.save();

// Find
const users = await User.find();
const one = await User.findOneBy({ id: 1 });

// Delete
await user.remove();


// ========== DATA MAPPER ==========
// Entity is standalone
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
}

// Get repository first
const repo = AppDataSource.getRepository(User);

// Create
const user = repo.create({ email: 'test@test.com' });
await repo.save(user);

// Find
const users = await repo.find();
const one = await repo.findOneBy({ id: 1 });

// Delete
await repo.remove(user);
```

---

## Repository Pattern

The Repository pattern is central to Data Mapper and provides a clean API for database operations.

### Getting a Repository

```typescript
import { AppDataSource } from './data-source';
import { User } from './entities/User';

// Get the repository
const userRepository = AppDataSource.getRepository(User);
```

### Repository API Overview

```typescript
const userRepository = AppDataSource.getRepository(User);

// Create (does NOT save to DB)
const user = userRepository.create({ email: 'test@test.com' });

// Save (INSERT or UPDATE)
await userRepository.save(user);

// Find methods
await userRepository.find();                           // All records
await userRepository.findBy({ isActive: true });       // With conditions
await userRepository.findOne({ where: { id: 1 } });   // One record
await userRepository.findOneBy({ email: 'x@y.com' }); // Shorthand

// Update
await userRepository.update({ id: 1 }, { name: 'New Name' });

// Delete
await userRepository.delete({ id: 1 });
await userRepository.remove(user);  // Remove entity instance

// Count
await userRepository.count();
await userRepository.countBy({ isActive: true });

// Check existence
await userRepository.existsBy({ email: 'test@test.com' });
```

### Custom Repositories

For complex queries, create custom repositories:

```typescript
// src/repositories/UserRepository.ts
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export const UserRepository = AppDataSource.getRepository(User).extend({
    findByEmail(email: string) {
        return this.findOneBy({ email });
    },

    findActiveUsers() {
        return this.findBy({ isActive: true });
    },

    async findWithPosts(userId: number) {
        return this.findOne({
            where: { id: userId },
            relations: ['posts']
        });
    },

    async searchByName(name: string) {
        return this.createQueryBuilder('user')
            .where('user.name ILIKE :name', { name: `%${name}%` })
            .getMany();
    }
});

// Usage
const user = await UserRepository.findByEmail('john@example.com');
const activeUsers = await UserRepository.findActiveUsers();
```

---

## Synchronize vs Migrations

### The Synchronize Option

```typescript
export const AppDataSource = new DataSource({
    // ...
    synchronize: true,  // Dangerous in production!
});
```

**What `synchronize: true` does:**
- On every application start, TypeORM compares entities to database schema
- Automatically creates/modifies tables to match entities
- Adds new columns, indexes, etc.
- **MAY DROP COLUMNS/DATA if entity changes!**

### When to Use Synchronize

| Environment | Synchronize | Reason |
|-------------|-------------|--------|
| Development | Maybe | Quick iteration, but can lose data |
| Testing | Yes | Fresh schema each test run |
| Staging | NO | Should mirror production |
| Production | **NEVER** | Data loss risk! |

### Migrations: The Safe Way

Migrations are versioned SQL files that modify the schema in a controlled way:

```typescript
// migrations/1703548800000-CreateUsers.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1703548800000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
                { name: 'email', type: 'varchar', isUnique: true },
                { name: 'name', type: 'varchar', isNullable: true },
            ]
        }));
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
```

### Synchronize vs Migrations Comparison

| Aspect | Synchronize | Migrations |
|--------|-------------|------------|
| Speed | Fast iteration | Slower, but controlled |
| Safety | Risky | Safe |
| Version control | No history | Full history |
| Rollback | Not possible | Easy with `down()` |
| Production | NEVER | Always |
| Team collaboration | Conflicts | Mergeable |

---

## TypeORM vs Sequelize Comparison

### Feature Comparison

| Feature | TypeORM | Sequelize |
|---------|---------|-----------|
| Language | TypeScript-first | JavaScript-first |
| Model definition | Decorators | Object/class methods |
| Type safety | Good | Requires @types |
| Patterns | Active Record + Data Mapper | Active Record |
| Query builder | Yes (powerful) | Yes (basic) |
| Migrations | Built-in CLI | Separate CLI |
| NestJS integration | First-class | Third-party |
| Learning curve | Moderate | Lower |
| Maturity | Stable | Very mature |

### Code Comparison

```typescript
// ========== MODEL DEFINITION ==========

// TypeORM
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', nullable: true })
    name?: string;

    @CreateDateColumn()
    createdAt!: Date;
}

// Sequelize
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt'
});
```

```typescript
// ========== QUERIES ==========

// TypeORM
const users = await userRepository.find({
    where: { isActive: true },
    order: { createdAt: 'DESC' },
    take: 10,
    skip: 0
});

// Sequelize
const users = await User.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
    limit: 10,
    offset: 0
});
```

```typescript
// ========== RELATIONS ==========

// TypeORM
@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts)
    author!: User;
}

// Load with relations
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});

// Sequelize
Post.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });

const user = await User.findByPk(1, {
    include: [Post]
});
```

### When to Choose TypeORM Over Sequelize

1. **Building a NestJS application** - TypeORM has first-class support
2. **Want decorator-based models** - Cleaner syntax for TypeScript
3. **Need Data Mapper pattern** - Sequelize only supports Active Record
4. **Coming from Java/C# background** - Familiar annotation style
5. **Want powerful QueryBuilder** - TypeORM's is more flexible

### When to Choose Sequelize Over TypeORM

1. **Existing JavaScript codebase** - Better JS support
2. **Team knows Sequelize** - Stick with what works
3. **Need specific database features** - Sequelize has more mature edge cases
4. **Want simpler learning curve** - Less concepts to learn

---

## Complete Working Example

```typescript
// ========== src/data-source.ts ==========
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'typeorm_demo',
    entities: [User],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
});


// ========== src/entities/User.ts ==========
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name?: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}


// ========== src/index.ts ==========
import 'reflect-metadata';  // MUST be first!
import { AppDataSource } from './data-source';
import { User } from './entities/User';

async function main() {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected!');

    // Get repository (Data Mapper pattern)
    const userRepository = AppDataSource.getRepository(User);

    // Create a user
    const user = userRepository.create({
        email: 'john@example.com',
        password: 'hashedPassword123',
        name: 'John Doe'
    });
    await userRepository.save(user);
    console.log('User created:', user);

    // Find users
    const users = await userRepository.find();
    console.log('All users:', users);

    // Find one by email
    const john = await userRepository.findOneBy({
        email: 'john@example.com'
    });
    console.log('Found John:', john);

    // Update
    if (john) {
        john.name = 'John Smith';
        await userRepository.save(john);
        console.log('Updated John:', john);
    }

    // Query with options
    const activeUsers = await userRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
        take: 10
    });
    console.log('Active users:', activeUsers);

    // Cleanup
    await AppDataSource.destroy();
}

main().catch(console.error);
```

---

## Key Takeaways

1. **TypeORM is the "middle ground"** - More TypeScript-native than Sequelize, more mature than Prisma
2. **Decorator-based entities** - Clean, readable model definitions
3. **Both patterns supported** - Active Record for simplicity, Data Mapper for scalability
4. **NestJS default** - First-class integration and support
5. **NEVER use synchronize in production** - Use migrations instead
6. **Repository pattern** - Central API for Data Mapper operations
7. **reflect-metadata is required** - Must be first import
8. **Configure TypeScript properly** - `experimentalDecorators` and `emitDecoratorMetadata`

---

## Next Steps

- **Phase 095a**: Deep dive into Entity definitions and decorators
- **Phase 095b**: CRUD operations and QueryBuilder
- **Phase 095c**: Relationships and joins
- **Phase 095d**: Migrations workflow
