# Phase 093: Sequelize Relations - Reference

> **LEGACY**: Quick reference for sequelize-typescript associations.

## Relationship Decorators

| Relationship | Parent Decorator | Child Decorator |
|--------------|------------------|-----------------|
| One-to-One | `@HasOne` | `@BelongsTo` + `@ForeignKey` |
| One-to-Many | `@HasMany` | `@BelongsTo` + `@ForeignKey` |
| Many-to-Many | `@BelongsToMany` | `@BelongsToMany` + Junction Model |

## One-to-One

```typescript
// User.ts (parent)
@HasOne(() => Profile)
profile?: Profile;

// Profile.ts (child)
@ForeignKey(() => User)
@Column(DataType.INTEGER)
userId!: number;

@BelongsTo(() => User)
user?: User;
```

## One-to-Many

```typescript
// User.ts (parent)
@HasMany(() => Post)
posts?: Post[];

// Post.ts (child)
@ForeignKey(() => User)
@Column(DataType.INTEGER)
userId!: number;

@BelongsTo(() => User)
user?: User;
```

## Many-to-Many

```typescript
// Post.ts
@BelongsToMany(() => Tag, () => PostTag)
tags?: Tag[];

// Tag.ts
@BelongsToMany(() => Post, () => PostTag)
posts?: Post[];

// PostTag.ts (junction table)
@Table({ tableName: 'post_tags', timestamps: false })
export class PostTag extends Model {
  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId!: number;

  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  tagId!: number;
}
```

## Eager Loading

```typescript
// Single include
const user = await User.findByPk(1, { include: [Post] });

// Multiple includes
const user = await User.findByPk(1, { include: [Post, Profile] });

// With options
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    where: { isPublished: true },
    required: false,           // LEFT JOIN (default)
    attributes: ['id', 'title'],
  }]
});

// Nested includes
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    include: [{ model: Comment, include: [User] }]
  }]
});

// With alias
const post = await Post.findByPk(1, {
  include: [
    { model: User, as: 'author' },
    { model: User, as: 'editor' },
  ]
});
```

## Lazy Loading (Magic Methods)

```typescript
// Get associated records
const posts = await user.$get('posts');
const posts = await user.$get('posts', { where: { isPublished: true } });

// Set (replace all)
await user.$set('posts', [post1, post2]);

// Add to association
await user.$add('posts', post);
await user.$add('posts', [post1, post2]);

// Remove from association
await user.$remove('posts', post);

// Check if associated
const hasPost = await user.$has('posts', post);

// Count associated
const count = await user.$count('posts');

// Create associated
const newPost = await user.$create('posts', { title: 'New Post' });
```

## Many-to-Many with Pivot Data

```typescript
// Junction with extra columns
@Table({ tableName: 'user_roles' })
export class UserRole extends Model {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number;

  @Column(DataType.DATE)
  assignedAt!: Date;
}

// Query with pivot data
const user = await User.findByPk(1, {
  include: [{
    model: Role,
    through: { attributes: ['assignedAt'] }
  }]
});

// Access pivot data
user.roles.forEach(role => {
  console.log(role.UserRole.assignedAt);
});

// Add with pivot data
await user.$add('roles', role, {
  through: { assignedAt: new Date() }
});
```

## Aliases (Multiple Relations to Same Model)

```typescript
// Post.ts
@ForeignKey(() => User)
@Column(DataType.INTEGER)
authorId!: number;

@ForeignKey(() => User)
@Column(DataType.INTEGER)
editorId?: number;

@BelongsTo(() => User, { foreignKey: 'authorId', as: 'author' })
author?: User;

@BelongsTo(() => User, { foreignKey: 'editorId', as: 'editor' })
editor?: User;

// Querying - must use alias
const post = await Post.findByPk(1, {
  include: [
    { model: User, as: 'author' },
    { model: User, as: 'editor' }
  ]
});
```

## Cascade Options

```typescript
@BelongsTo(() => User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',    // DELETE children when parent deleted
  onUpdate: 'CASCADE',    // UPDATE FK when parent PK changes
})

// Options: CASCADE, SET NULL, SET DEFAULT, RESTRICT, NO ACTION
```

## Laravel Eloquent Mapping

| Eloquent | Sequelize |
|----------|-----------|
| `hasOne()` | `@HasOne(() => Model)` |
| `hasMany()` | `@HasMany(() => Model)` |
| `belongsTo()` | `@BelongsTo(() => Model)` |
| `belongsToMany()` | `@BelongsToMany(() => M, () => Junction)` |
| `with('posts')` | `include: [Post]` |
| `$user->posts` | `user.$get('posts')` |
| `attach($id)` | `$add('assoc', item)` |
| `detach($id)` | `$remove('assoc', item)` |
| `sync([...])` | `$set('assoc', [...])` |
| `withPivot()` | `through: { attributes: [...] }` |
| `->onDelete('cascade')` | `onDelete: 'CASCADE'` |

## Remember

1. **@ForeignKey is required** - Always declare the FK column explicitly
2. **Use aliases for multiple relations** - When pointing to same model
3. **include = eager loading** - Fetches in same query
4. **$get() = lazy loading** - Separate query when needed
5. **through for pivot data** - Access junction table columns
6. **required: true = INNER JOIN** - Only records with match
