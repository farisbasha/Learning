# Phase 095c: TypeORM Relations — Decorators Reference

## Relation Types

| Relation | Decorator | FK Location |
|----------|-----------|-------------|
| One-to-One | `@OneToOne` + `@JoinColumn` | Either side |
| One-to-Many | `@OneToMany` | None (inverse) |
| Many-to-One | `@ManyToOne` + `@JoinColumn` | "Many" side |
| Many-to-Many | `@ManyToMany` + `@JoinTable` | Junction table |

## One-to-One

```typescript
// User has ONE Profile
@Entity()
export class User {
    @OneToOne(() => Profile, profile => profile.user)
    @JoinColumn()  // FK here
    profile!: Profile;
}

@Entity()
export class Profile {
    @OneToOne(() => User, user => user.profile)
    user!: User;  // No @JoinColumn
}
```

## One-to-Many / Many-to-One

```typescript
// User has MANY Posts
@Entity()
export class User {
    @OneToMany(() => Post, post => post.author)
    posts!: Post[];  // Array, no FK
}

// Post belongs to ONE User
@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })  // FK here
    author!: User;
}
```

## Many-to-Many

```typescript
// Post has MANY Tags, Tag has MANY Posts
@Entity()
export class Post {
    @ManyToMany(() => Tag, tag => tag.posts)
    @JoinTable()  // Creates junction table
    tags!: Tag[];
}

@Entity()
export class Tag {
    @ManyToMany(() => Post, post => post.tags)
    posts!: Post[];  // No @JoinTable
}
```

### Custom Junction Table

```typescript
@ManyToMany(() => Tag)
@JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id' },
    inverseJoinColumn: { name: 'tag_id' }
})
tags!: Tag[];
```

## Loading Relations

### With find()

```typescript
// Single relation
await userRepo.findOne({
    where: { id: 1 },
    relations: ['posts']
});

// Multiple relations
await userRepo.findOne({
    where: { id: 1 },
    relations: ['posts', 'profile']
});

// Nested relations
await userRepo.findOne({
    where: { id: 1 },
    relations: ['posts', 'posts.tags', 'posts.comments']
});

// Object syntax
await userRepo.findOne({
    where: { id: 1 },
    relations: {
        posts: { tags: true },
        profile: true
    }
});
```

### With QueryBuilder

```typescript
// Left join (include all)
await userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .getMany();

// Inner join (only with relation)
await userRepo
    .createQueryBuilder('user')
    .innerJoinAndSelect('user.posts', 'post')
    .getMany();

// Join with condition
await userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post', 'post.isPublished = :pub', { pub: true })
    .getMany();
```

## Relation Options

```typescript
@OneToMany(() => Post, post => post.author, {
    cascade: true,           // Auto-save children
    eager: true,             // Always load
    nullable: true,          // FK can be null
    onDelete: 'CASCADE',     // Delete children on parent delete
    onUpdate: 'CASCADE'
})
posts!: Post[];
```

### cascade Values

| Value | Effect |
|-------|--------|
| `true` | All operations |
| `['insert']` | Only inserts |
| `['update']` | Only updates |
| `['remove']` | Only deletes |
| `['insert', 'update']` | Multiple |

### onDelete Values

| Value | Effect |
|-------|--------|
| `CASCADE` | Delete children |
| `SET NULL` | Set FK to null |
| `RESTRICT` | Prevent delete |
| `NO ACTION` | Default |

## Creating with Relations

```typescript
// Cascade insert
const user = userRepo.create({
    email: 'john@test.com',
    posts: [{ title: 'Post 1' }]  // Saved automatically
});
await userRepo.save(user);

// Manual relation
const user = await userRepo.findOneBy({ id: 1 });
const post = postRepo.create({
    title: 'New Post',
    author: user
});
await postRepo.save(post);

// By ID only
const post = postRepo.create({
    title: 'New Post'
});
post.author = { id: 1 } as User;
await postRepo.save(post);
```

## Lazy Relations

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, post => post.author)
    posts!: Promise<Post[]>;  // Promise = lazy
}

// Usage
const user = await userRepo.findOneBy({ id: 1 });
const posts = await user.posts;  // Query here
```

## Self-Referencing

### Tree Structure

```typescript
@Entity()
export class Category {
    @ManyToOne(() => Category, cat => cat.children, { nullable: true })
    parent?: Category;

    @OneToMany(() => Category, cat => cat.parent)
    children!: Category[];
}
```

### User Followers

```typescript
@Entity()
export class User {
    @ManyToMany(() => User, user => user.following)
    @JoinTable({
        name: 'followers',
        joinColumn: { name: 'follower_id' },
        inverseJoinColumn: { name: 'following_id' }
    })
    followers!: User[];

    @ManyToMany(() => User, user => user.followers)
    following!: User[];
}
```

## Many-to-Many with Extra Columns

```typescript
// Use explicit junction entity
@Entity()
export class UserRole {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Role)
    role!: Role;

    @Column()
    assignedAt!: Date;  // Extra column
}

@Entity()
export class User {
    @OneToMany(() => UserRole, ur => ur.user)
    userRoles!: UserRole[];
}
```

## Quick Reference

| Task | Code |
|------|------|
| Load relation | `relations: ['posts']` |
| Nested relation | `relations: ['posts.tags']` |
| Cascade save | `cascade: true` |
| Always load | `eager: true` |
| Delete children | `onDelete: 'CASCADE'` |
| Lazy load | `Promise<Entity[]>` |
| FK column name | `@JoinColumn({ name: 'x' })` |
| Junction table | `@JoinTable({ name: 'x' })` |

## Uni vs Bi-directional

```typescript
// Uni-directional (one-way)
@ManyToOne(() => User)  // No callback
author!: User;

// Bi-directional (two-way)
@ManyToOne(() => User, user => user.posts)  // With callback
author!: User;
```

## Remember

- `@JoinColumn` goes on FK side (Many-to-One, One-to-One owner)
- `@JoinTable` goes on one side of Many-to-Many
- Bi-directional needs inverse callback on both sides
- `cascade: true` can be dangerous with deletes
- `eager: true` can hurt performance
- Lazy relations use Promises
- Load relations explicitly or use eager/lazy
