# Phase 095a: TypeORM Entities — Complete Entity Definition Guide

## Overview

Entities are the heart of TypeORM. An **Entity** is a TypeScript class decorated with `@Entity()` that maps directly to a database table. Each instance of the entity represents a row in that table.

TypeORM uses **decorators** to define how class properties map to database columns, their types, constraints, and relationships.

---

## The @Entity() Decorator

### Basic Usage

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()  // Table name = class name lowercase: 'user'
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;
}
```

### Specifying Table Name

```typescript
@Entity('users')  // Explicit table name
export class User {
    // ...
}

@Entity({ name: 'user_accounts' })  // Object syntax
export class User {
    // ...
}
```

### Entity Options

```typescript
@Entity({
    name: 'users',                    // Table name
    schema: 'public',                 // Schema (PostgreSQL)
    database: 'customers',            // Database (MySQL)
    synchronize: false,               // Skip sync for this entity
    orderBy: { createdAt: 'DESC' },   // Default ordering
})
export class User {
    // ...
}
```

### Comparison with Sequelize

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
}, {
    tableName: 'users'  // Separate config
});
```

---

## Column Types and @Column Options

### Basic Column Types

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    // String types
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'char', length: 2 })
    countryCode!: string;

    // Numeric types
    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'bigint' })
    bigNumber!: string;  // Note: bigint returns string!

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: string;  // Decimal also returns string

    @Column({ type: 'float' })
    rating!: number;

    // Boolean
    @Column({ type: 'boolean' })
    isActive!: boolean;

    // Date/Time
    @Column({ type: 'date' })
    releaseDate!: Date;

    @Column({ type: 'timestamp' })
    publishedAt!: Date;

    @Column({ type: 'time' })
    openingTime!: string;

    // JSON (PostgreSQL, MySQL 5.7+)
    @Column({ type: 'json' })
    metadata!: object;

    @Column({ type: 'jsonb' })  // PostgreSQL only
    settings!: object;

    // Arrays (PostgreSQL only)
    @Column({ type: 'simple-array' })
    tags!: string[];

    @Column({ type: 'text', array: true })  // PostgreSQL native
    categories!: string[];

    // Enum
    @Column({ type: 'enum', enum: ['draft', 'published', 'archived'] })
    status!: string;

    // UUID
    @Column({ type: 'uuid' })
    externalId!: string;
}
```

### Database-Specific Types

```typescript
// PostgreSQL specific
@Column({ type: 'inet' })
ipAddress!: string;

@Column({ type: 'macaddr' })
macAddress!: string;

@Column({ type: 'cidr' })
network!: string;

@Column({ type: 'int4range' })
priceRange!: string;

@Column({ type: 'tsvector' })
searchVector!: string;

// MySQL specific
@Column({ type: 'tinyint' })
smallNumber!: number;

@Column({ type: 'mediumtext' })
longContent!: string;

@Column({ type: 'year' })
manufactureYear!: number;

@Column({ type: 'set', enum: ['a', 'b', 'c'] })
options!: string;
```

### Type Inference (Simple Columns)

TypeORM can infer types from TypeScript:

```typescript
@Entity()
export class User {
    @Column()  // Inferred as varchar(255)
    name!: string;

    @Column()  // Inferred as int
    age!: number;

    @Column()  // Inferred as boolean
    isActive!: boolean;

    @Column()  // Inferred as timestamp
    birthday!: Date;
}
```

**Best Practice**: Always explicitly specify types for production code to avoid surprises across databases.

---

## @PrimaryGeneratedColumn()

### Auto-Increment (Default)

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()  // Auto-increment integer
    id!: number;
}

// Specify strategy explicitly
@PrimaryGeneratedColumn('increment')
id!: number;
```

### UUID Primary Keys

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')  // UUID v4
    id!: string;
}

// Generated value example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
```

### ROWID (SQLite)

```typescript
@PrimaryGeneratedColumn('rowid')
id!: number;
```

### Identity (PostgreSQL 10+)

```typescript
@PrimaryGeneratedColumn('identity')
id!: number;
```

### Manual Primary Key

For non-generated primary keys:

```typescript
import { PrimaryColumn } from 'typeorm';

@Entity()
export class Country {
    @PrimaryColumn({ type: 'char', length: 2 })
    code!: string;  // e.g., 'US', 'GB'

    @Column()
    name!: string;
}
```

---

## Column Options Deep Dive

### All Column Options

```typescript
@Column({
    // Type settings
    type: 'varchar',
    length: 255,
    precision: 10,        // For decimal
    scale: 2,             // For decimal

    // Constraints
    nullable: false,      // NOT NULL (default: false)
    unique: true,         // UNIQUE constraint
    default: 'pending',   // DEFAULT value

    // Naming
    name: 'user_email',   // Column name in DB (default: property name)

    // Behavior
    primary: false,       // Is primary key
    select: true,         // Include in SELECT by default
    insert: true,         // Include in INSERT
    update: true,         // Include in UPDATE

    // Advanced
    comment: 'User email address',  // Column comment
    collation: 'utf8_general_ci',   // Collation
    charset: 'utf8mb4',             // Character set
    zerofill: true,                 // MySQL zerofill
    unsigned: true,                 // MySQL unsigned

    // Transformers
    transformer: {
        to: (value) => value,       // Before save
        from: (value) => value      // After load
    },

    // Enum specific
    enum: ['active', 'inactive'],
    enumName: 'user_status_enum',   // PostgreSQL enum name

    // Array specific (PostgreSQL)
    array: true,
})
email!: string;
```

### nullable Option

```typescript
@Entity()
export class User {
    @Column({ nullable: false })  // Required (default)
    email!: string;

    @Column({ nullable: true })   // Optional
    middleName?: string;          // Use ? in TypeScript too

    @Column({ type: 'varchar', nullable: true })
    bio?: string;
}
```

### default Option

```typescript
@Entity()
export class Post {
    @Column({ default: 'draft' })
    status!: string;

    @Column({ type: 'boolean', default: true })
    isPublic!: boolean;

    @Column({ type: 'int', default: 0 })
    viewCount!: number;

    // Database functions as default
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    // UUID default
    @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
    publicId!: string;
}
```

### unique Option

```typescript
@Entity()
export class User {
    @Column({ unique: true })
    email!: string;

    @Column({ unique: true })
    username!: string;
}
```

### length Option

```typescript
@Entity()
export class User {
    @Column({ type: 'varchar', length: 100 })
    firstName!: string;

    @Column({ type: 'varchar', length: 100 })
    lastName!: string;

    @Column({ type: 'char', length: 2 })
    countryCode!: string;
}
```

### select Option

Control whether a column is included in SELECT by default:

```typescript
@Entity()
export class User {
    @Column()
    email!: string;

    @Column({ select: false })  // Excluded from SELECT
    password!: string;

    @Column({ select: false })
    secretToken!: string;
}

// Usage
const user = await userRepository.findOneBy({ id: 1 });
// user.password is undefined!

// To include password explicitly:
const userWithPassword = await userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.id = :id', { id: 1 })
    .getOne();
```

---

## Special Column Decorators

### @CreateDateColumn

Automatically set when entity is first saved:

```typescript
import { CreateDateColumn } from 'typeorm';

@Entity()
export class User {
    @CreateDateColumn()
    createdAt!: Date;

    // With options
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;
}
```

### @UpdateDateColumn

Automatically updated on every save:

```typescript
import { UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
    @UpdateDateColumn()
    updatedAt!: Date;
}
```

### @DeleteDateColumn (Soft Delete)

For soft delete functionality:

```typescript
import { DeleteDateColumn } from 'typeorm';

@Entity()
export class User {
    @DeleteDateColumn()
    deletedAt?: Date;  // null = not deleted
}

// Usage
const userRepository = AppDataSource.getRepository(User);

// Soft delete - sets deletedAt
await userRepository.softDelete({ id: 1 });

// Find excludes soft-deleted by default
const users = await userRepository.find();  // Excludes deleted

// Include soft-deleted
const allUsers = await userRepository.find({ withDeleted: true });

// Restore soft-deleted
await userRepository.restore({ id: 1 });
```

### @VersionColumn

For optimistic locking:

```typescript
import { VersionColumn } from 'typeorm';

@Entity()
export class User {
    @VersionColumn()
    version!: number;
}

// Version increments automatically on each save
// Concurrent updates to same version throw error
```

### @Generated

For database-generated values:

```typescript
import { Generated } from 'typeorm';

@Entity()
export class User {
    @Column()
    @Generated('uuid')
    uuid!: string;

    @Column()
    @Generated('increment')
    sequenceNumber!: number;
}
```

---

## Embedded Entities

Embedded entities allow you to reuse column definitions across multiple entities.

### Defining an Embedded

```typescript
// Embedded class (no @Entity!)
export class Name {
    @Column()
    first!: string;

    @Column()
    last!: string;
}

export class Address {
    @Column()
    street!: string;

    @Column()
    city!: string;

    @Column()
    postalCode!: string;

    @Column()
    country!: string;
}
```

### Using Embedded Entities

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => Name)  // Embed Name
    name!: Name;

    @Column(() => Address)  // Embed Address
    address!: Address;
}

// Database table columns:
// id, nameFirst, nameLast, addressStreet, addressCity, addressPostalCode, addressCountry
```

### Customizing Embedded Column Prefix

```typescript
@Entity()
export class User {
    @Column(() => Name, { prefix: 'user_' })
    name!: Name;
    // Columns: user_first, user_last

    @Column(() => Address, { prefix: false })
    address!: Address;
    // Columns: street, city, postalCode, country (no prefix)
}
```

### Nested Embeds

```typescript
export class ContactInfo {
    @Column()
    email!: string;

    @Column()
    phone!: string;
}

export class PersonalInfo {
    @Column(() => Name)
    name!: Name;

    @Column(() => ContactInfo)
    contact!: ContactInfo;
}

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => PersonalInfo)
    personal!: PersonalInfo;
}
// Columns: id, personalNameFirst, personalNameLast, personalContactEmail, personalContactPhone
```

---

## Entity Inheritance

TypeORM supports multiple inheritance strategies for creating entity hierarchies.

### Concrete Table Inheritance

Each entity has its own table with all columns:

```typescript
// Base class (not an entity itself)
export abstract class Content {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @CreateDateColumn()
    createdAt!: Date;
}

@Entity()
export class Article extends Content {
    @Column()
    body!: string;
}

@Entity()
export class Video extends Content {
    @Column()
    videoUrl!: string;

    @Column()
    duration!: number;
}

// Creates two tables:
// articles: id, title, createdAt, body
// videos: id, title, createdAt, videoUrl, duration
```

### Single Table Inheritance

All entities in one table with discriminator column:

```typescript
import { TableInheritance, ChildEntity } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Content {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
}

@ChildEntity('article')  // Discriminator value
export class Article extends Content {
    @Column({ nullable: true })
    body?: string;
}

@ChildEntity('video')  // Discriminator value
export class Video extends Content {
    @Column({ nullable: true })
    videoUrl?: string;

    @Column({ nullable: true })
    duration?: number;
}

// Creates ONE table:
// content: id, title, type, body, videoUrl, duration
// 'type' column has 'article' or 'video'
```

### Using Single Table Inheritance

```typescript
const contentRepository = AppDataSource.getRepository(Content);
const articleRepository = AppDataSource.getRepository(Article);
const videoRepository = AppDataSource.getRepository(Video);

// Get all content
const allContent = await contentRepository.find();

// Get only articles
const articles = await articleRepository.find();

// Create article
const article = articleRepository.create({
    title: 'TypeORM Guide',
    body: 'Content here...'
});
await articleRepository.save(article);
```

---

## Indexes

### @Index() Decorator

```typescript
import { Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()  // Single column index
    @Column()
    email!: string;

    @Index('idx_user_username')  // Named index
    @Column()
    username!: string;

    @Index({ unique: true })  // Unique index
    @Column()
    slug!: string;
}
```

### Composite Indexes

```typescript
@Entity()
@Index(['firstName', 'lastName'])  // Composite index on class
@Index('idx_email_username', ['email', 'username'])  // Named composite
@Index('idx_active_created', ['isActive', 'createdAt'])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    email!: string;

    @Column()
    username!: string;

    @Column()
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
```

### Index Options

```typescript
@Entity()
@Index('idx_unique_email', ['email'], { unique: true })
@Index('idx_active_partial', ['isActive'], {
    where: '"isActive" = true'  // Partial index (PostgreSQL)
})
@Index('idx_name_fulltext', ['firstName', 'lastName'], {
    fulltext: true  // Full-text index (MySQL)
})
export class User {
    // ...
}
```

### Spatial Indexes (PostgreSQL PostGIS)

```typescript
@Index({ spatial: true })
@Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
})
location!: string;
```

---

## Composite Primary Keys

For tables with multiple-column primary keys:

```typescript
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class UserRole {
    @PrimaryColumn()
    userId!: number;

    @PrimaryColumn()
    roleId!: number;

    @Column()
    assignedAt!: Date;

    @Column()
    assignedBy!: string;
}

// Primary key is (userId, roleId)
```

### With Relations

```typescript
@Entity()
export class Subscription {
    @PrimaryColumn()
    userId!: number;

    @PrimaryColumn()
    planId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: 'planId' })
    plan!: Plan;

    @Column()
    startDate!: Date;

    @Column({ nullable: true })
    endDate?: Date;
}
```

---

## Enum Columns

### String Enum

```typescript
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator'
}

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

@Entity()
export class User {
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;
}

@Entity()
export class Post {
    @Column({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.DRAFT
    })
    status!: PostStatus;
}
```

### Simple String Array Enum

```typescript
@Entity()
export class User {
    @Column({
        type: 'enum',
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    })
    status!: string;
}
```

### PostgreSQL Named Enum

```typescript
@Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum'  // Creates reusable enum type
})
role!: UserRole;
```

---

## Column Transformers

Transform data when reading from or writing to the database:

### Basic Transformer

```typescript
@Entity()
export class User {
    @Column({
        type: 'simple-json',
        transformer: {
            to: (value: string[]) => JSON.stringify(value),
            from: (value: string) => JSON.parse(value)
        }
    })
    tags!: string[];
}
```

### Encryption Transformer

```typescript
import * as crypto from 'crypto';

const encryptionTransformer = {
    to: (value: string): string => {
        if (!value) return value;
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
    },
    from: (value: string): string => {
        if (!value) return value;
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
    }
};

@Entity()
export class User {
    @Column({ transformer: encryptionTransformer })
    ssn!: string;
}
```

### Lowercase Transformer

```typescript
const lowercaseTransformer = {
    to: (value: string) => value?.toLowerCase(),
    from: (value: string) => value
};

@Entity()
export class User {
    @Column({ transformer: lowercaseTransformer })
    email!: string;  // Always stored lowercase
}
```

### BigInt Transformer

```typescript
const bigIntTransformer = {
    to: (value: bigint) => value?.toString(),
    from: (value: string) => value ? BigInt(value) : null
};

@Entity()
export class Transaction {
    @Column({ type: 'bigint', transformer: bigIntTransformer })
    amount!: bigint;
}
```

---

## Complete Entity Example

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    VersionColumn,
    Index,
    Generated
} from 'typeorm';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending'
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator'
}

// Embedded entity
export class Address {
    @Column({ type: 'varchar', length: 255 })
    street!: string;

    @Column({ type: 'varchar', length: 100 })
    city!: string;

    @Column({ type: 'varchar', length: 20 })
    postalCode!: string;

    @Column({ type: 'char', length: 2 })
    country!: string;
}

@Entity('users')
@Index(['email'])
@Index(['firstName', 'lastName'])
@Index('idx_status_active', ['status'], { where: '"status" = \'active\'' })
export class User {
    // Primary key
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Generated UUID (separate from PK)
    @Column({ type: 'uuid' })
    @Generated('uuid')
    publicId!: string;

    // Basic columns
    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 100 })
    firstName!: string;

    @Column({ type: 'varchar', length: 100 })
    lastName!: string;

    // Excluded from SELECT by default
    @Column({ type: 'varchar', select: false })
    password!: string;

    // Nullable column
    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    // Enum column
    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING
    })
    status!: UserStatus;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    // Boolean with default
    @Column({ type: 'boolean', default: false })
    emailVerified!: boolean;

    // JSON column
    @Column({ type: 'jsonb', nullable: true })
    preferences?: {
        theme: 'light' | 'dark';
        notifications: boolean;
        language: string;
    };

    // Array column (PostgreSQL)
    @Column({ type: 'simple-array', nullable: true })
    tags?: string[];

    // Embedded entity
    @Column(() => Address, { prefix: 'address_' })
    address!: Address;

    // Automatic timestamps
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt!: Date;

    // Soft delete
    @DeleteDateColumn({ type: 'timestamp with time zone' })
    deletedAt?: Date;

    // Optimistic locking
    @VersionColumn()
    version!: number;

    // Virtual getter (not stored in DB)
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
```

---

## TypeORM vs Sequelize Entity Comparison

| Feature | TypeORM | Sequelize |
|---------|---------|-----------|
| Definition | Decorators on class | Object passed to `define()` |
| Types | Decorator options | DataTypes constants |
| Embedded | `@Column(() => Embed)` | Not supported natively |
| Inheritance | Single/Concrete table | Manual implementation |
| Indexes | `@Index()` decorator | `indexes` in options |
| Soft delete | `@DeleteDateColumn()` | `paranoid: true` |
| Timestamps | Separate decorators | `timestamps: true` |

```typescript
// TypeORM
@Entity()
@Index(['firstName', 'lastName'])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}

// Sequelize
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    paranoid: true,
    deletedAt: 'deletedAt',
    indexes: [
        { fields: ['firstName', 'lastName'] }
    ]
});
```

---

## Key Takeaways

1. **@Entity() marks a table** - Class becomes database table
2. **@Column() defines columns** - With type, constraints, and options
3. **@PrimaryGeneratedColumn()** - Auto-increment or UUID
4. **Nullable requires `?`** - Use `nullable: true` AND optional property
5. **Special date decorators** - `@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn`
6. **Embedded entities** - Reuse column groups across entities
7. **Inheritance strategies** - Concrete table or single table
8. **Indexes** - `@Index()` on properties or class
9. **Transformers** - Transform data to/from database
10. **select: false** - Exclude sensitive fields by default

---

## Next Steps

- **Phase 095b**: CRUD operations and QueryBuilder
- **Phase 095c**: Relationships between entities
- **Phase 095d**: Migrations for production
