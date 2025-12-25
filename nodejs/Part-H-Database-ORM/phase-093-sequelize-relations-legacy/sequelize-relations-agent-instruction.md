# Phase 093: Sequelize Relations (Legacy)
## Agent Instructions

**Phase**: 093 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. One-to-One: `@HasOne`, `@BelongsTo`
2. One-to-Many: `@HasMany`, `@BelongsTo`
3. Many-to-Many: `@BelongsToMany`
4. Foreign key configuration
5. Eager loading: `include` option
6. Nested includes
7. Lazy loading
8. Association aliases
9. Through tables for M:N
10. Cascade delete
11. Laravel comparison: Eloquent relationships

## Example
```typescript
@Table
class User extends Model {
    @HasMany(() => Post)
    posts!: Post[];
}

@Table
class Post extends Model {
    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    author!: User;
}

// Eager loading
const users = await User.findAll({
    include: [{ model: Post, as: 'posts' }]
});
```

## Content Instructions
**Notes**: Sequelize relationships with TypeScript
**Summary**: Sequelize relations reference
