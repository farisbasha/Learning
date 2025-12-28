# Phase 095a: TypeORM Entities — Decorators Reference

## Entity Definition

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('table_name')  // Optional: specify table name
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    email!: string;
}
```

## Primary Key Options

```typescript
// Auto-increment integer
@PrimaryGeneratedColumn()
id!: number;

// UUID
@PrimaryGeneratedColumn('uuid')
id!: string;

// Manual (non-generated)
@PrimaryColumn()
code!: string;

// Composite
@PrimaryColumn()
userId!: number;
@PrimaryColumn()
roleId!: number;
```

## Column Types

| TypeScript | PostgreSQL | MySQL |
|------------|------------|-------|
| `string` | `varchar` | `varchar` |
| `string` | `text` | `text` |
| `number` | `int` | `int` |
| `number` | `float` | `float` |
| `string` | `decimal` | `decimal` |
| `boolean` | `boolean` | `tinyint` |
| `Date` | `timestamp` | `datetime` |
| `object` | `jsonb` | `json` |
| `string[]` | `text[]` | `simple-array` |

```typescript
@Column({ type: 'varchar', length: 255 })
name!: string;

@Column({ type: 'decimal', precision: 10, scale: 2 })
price!: string;  // Decimal returns string!

@Column({ type: 'jsonb' })
metadata!: object;
```

## Column Options

```typescript
@Column({
    type: 'varchar',
    length: 255,
    nullable: false,      // NOT NULL
    unique: true,         // UNIQUE constraint
    default: 'pending',   // DEFAULT value
    name: 'user_email',   // DB column name
    select: false,        // Exclude from SELECT
    comment: 'Description'
})
email!: string;
```

### Quick Options Reference

| Option | Purpose | Example |
|--------|---------|---------|
| `nullable` | Allow NULL | `nullable: true` |
| `unique` | UNIQUE constraint | `unique: true` |
| `default` | DEFAULT value | `default: 'active'` |
| `length` | String length | `length: 100` |
| `name` | Column name in DB | `name: 'user_email'` |
| `select` | Include in SELECT | `select: false` |
| `precision` | Decimal precision | `precision: 10` |
| `scale` | Decimal scale | `scale: 2` |

## Special Column Decorators

```typescript
// Auto-set on insert
@CreateDateColumn()
createdAt!: Date;

// Auto-update on save
@UpdateDateColumn()
updatedAt!: Date;

// Soft delete (null = not deleted)
@DeleteDateColumn()
deletedAt?: Date;

// Optimistic locking
@VersionColumn()
version!: number;

// Generated value
@Column()
@Generated('uuid')
publicId!: string;
```

## Enum Columns

```typescript
enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

@Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
})
role!: UserRole;

// Or simple array
@Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active'
})
status!: string;
```

## Embedded Entities

```typescript
// Embedded (no @Entity)
export class Address {
    @Column()
    street!: string;

    @Column()
    city!: string;
}

@Entity()
export class User {
    @Column(() => Address)
    address!: Address;
    // Columns: addressStreet, addressCity

    @Column(() => Address, { prefix: false })
    shipping!: Address;
    // Columns: street, city
}
```

## Indexes

```typescript
@Entity()
@Index(['firstName', 'lastName'])  // Composite
@Index('idx_email', ['email'], { unique: true })
export class User {
    @Index()  // Single column
    @Column()
    email!: string;

    @Index('idx_username')  // Named
    @Column()
    username!: string;
}
```

## Entity Inheritance

### Concrete Table (Separate Tables)

```typescript
abstract class Content {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
}

@Entity()
export class Article extends Content {
    @Column()
    body!: string;
}
```

### Single Table (One Table)

```typescript
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Content {
    @PrimaryGeneratedColumn()
    id!: number;
}

@ChildEntity('article')
export class Article extends Content {
    @Column({ nullable: true })
    body?: string;
}
```

## Column Transformers

```typescript
const lowercase = {
    to: (value: string) => value?.toLowerCase(),
    from: (value: string) => value
};

@Column({ transformer: lowercase })
email!: string;
```

## Soft Delete Usage

```typescript
@Entity()
export class User {
    @DeleteDateColumn()
    deletedAt?: Date;
}

// Soft delete
await repo.softDelete({ id: 1 });

// Find (excludes deleted)
await repo.find();

// Find with deleted
await repo.find({ withDeleted: true });

// Restore
await repo.restore({ id: 1 });
```

## Complete Example

```typescript
@Entity('users')
@Index(['firstName', 'lastName'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', select: false })
    password!: string;

    @Column({ type: 'varchar', nullable: true })
    name?: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
    role!: string;

    @Column({ type: 'jsonb', nullable: true })
    settings?: object;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
```

## Common Patterns

### Password Field (Excluded from SELECT)

```typescript
@Column({ select: false })
password!: string;

// Query with password
repo.createQueryBuilder('user')
    .addSelect('user.password')
    .getOne();
```

### UUID Public ID + Auto-increment Internal ID

```typescript
@PrimaryGeneratedColumn()
id!: number;  // Internal

@Column()
@Generated('uuid')
publicId!: string;  // External/API
```

### JSON Settings

```typescript
@Column({ type: 'jsonb', default: {} })
settings!: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
};
```

## Remember

- Use `!` for required properties (non-null assertion)
- Use `?` for nullable properties
- `bigint` and `decimal` return strings!
- Always specify `type` for production
- Use `select: false` for sensitive data
- `@DeleteDateColumn` enables soft delete
- Import `reflect-metadata` first
