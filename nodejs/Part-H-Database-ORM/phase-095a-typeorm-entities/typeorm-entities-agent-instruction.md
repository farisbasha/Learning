# Phase 095a: TypeORM Entities
## Agent Instructions

**Phase**: 095a | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Entity definition with `@Entity()`
2. Column types: `@Column({ type: 'varchar' })`
3. Primary keys: `@PrimaryGeneratedColumn()`
4. UUID primary keys
5. Column options: nullable, default, unique
6. Embedded entities
7. Entity inheritance
8. Single table inheritance
9. Indexes: `@Index()`
10. Composite keys

## Example
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
```

## Content Instructions
**Notes**: TypeORM entity definition complete guide
**Summary**: Entity decorators reference
