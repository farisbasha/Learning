# Phase 095c: TypeORM Relations — Complete Relationships Guide

## Overview

TypeORM supports all standard database relationship types through decorators:
- **One-to-One**: User has one Profile
- **One-to-Many / Many-to-One**: User has many Posts, Post belongs to one User
- **Many-to-Many**: Post has many Tags, Tag has many Posts

Understanding relations is critical for modeling real-world data and efficiently querying related entities.

---

## One-to-One Relations

### Basic One-to-One

A one-to-one relationship means each record in Table A relates to exactly one record in Table B.

```typescript
// User has ONE Profile
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @OneToOne(() => Profile)
    @JoinColumn()  // Creates foreign key column
    profile!: Profile;
}

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    bio!: string;

    @Column()
    avatar!: string;
}

// Database result:
// users table: id, email, profileId (FK)
// profiles table: id, bio, avatar
```

### @JoinColumn Options

```typescript
@Entity()
export class User {
    @OneToOne(() => Profile)
    @JoinColumn({
        name: 'profile_id',              // Custom FK column name
        referencedColumnName: 'id',      // Column in Profile to reference
        foreignKeyConstraintName: 'fk_user_profile'  // Custom FK name
    })
    profile!: Profile;
}
```

### Bi-directional One-to-One

Both entities know about each other:

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @OneToOne(() => Profile, profile => profile.user)  // Inverse side
    @JoinColumn()
    profile!: Profile;
}

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    bio!: string;

    @OneToOne(() => User, user => user.profile)  // Inverse side
    user!: User;  // No @JoinColumn - inverse side
}
```

### Creating and Loading One-to-One

```typescript
const userRepository = AppDataSource.getRepository(User);
const profileRepository = AppDataSource.getRepository(Profile);

// Create with relation
const profile = profileRepository.create({
    bio: 'Software developer',
    avatar: 'avatar.jpg'
});
await profileRepository.save(profile);

const user = userRepository.create({
    email: 'john@example.com',
    profile: profile  // Assign relation
});
await userRepository.save(user);

// Load with relation
const userWithProfile = await userRepository.findOne({
    where: { id: 1 },
    relations: ['profile']
});

console.log(userWithProfile.profile.bio);  // 'Software developer'
```

---

## One-to-Many / Many-to-One Relations

### Basic Setup

One-to-Many is always the inverse of Many-to-One. You need both decorators.

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';

// ONE User has MANY Posts
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @OneToMany(() => Post, post => post.author)
    posts!: Post[];  // Array of posts
}

// MANY Posts belong to ONE User
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })  // FK column
    author!: User;
}

// Database result:
// users table: id, email
// posts table: id, title, content, author_id (FK)
```

### Understanding the Decorators

| Decorator | Side | Has FK Column | Array |
|-----------|------|---------------|-------|
| `@OneToMany` | "One" side | No | Yes |
| `@ManyToOne` | "Many" side | Yes (@JoinColumn) | No |

```typescript
// The FK is always on the "Many" side
@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })  // This side has the FK
    author!: User;
}
```

### Creating with Relations

```typescript
const userRepository = AppDataSource.getRepository(User);
const postRepository = AppDataSource.getRepository(Post);

// Create user first
const user = userRepository.create({ email: 'john@example.com' });
await userRepository.save(user);

// Create posts with author
const post1 = postRepository.create({
    title: 'First Post',
    content: 'Content here',
    author: user  // Assign relation
});
await postRepository.save(post1);

// Or set by ID directly
const post2 = postRepository.create({
    title: 'Second Post',
    content: 'More content'
});
post2.author = { id: user.id } as User;  // Just ID
await postRepository.save(post2);
```

### Loading Relations

```typescript
// Load user with posts
const userWithPosts = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});
console.log(userWithPosts.posts);  // [Post, Post, ...]

// Load post with author
const postWithAuthor = await postRepository.findOne({
    where: { id: 1 },
    relations: ['author']
});
console.log(postWithAuthor.author.email);

// Nested relations
const userWithPostsAndComments = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts', 'posts.comments']
});
```

---

## Many-to-Many Relations

### Basic Many-to-Many

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable
} from 'typeorm';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @ManyToMany(() => Tag, tag => tag.posts)
    @JoinTable()  // Creates junction table
    tags!: Tag[];
}

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToMany(() => Post, post => post.tags)
    posts!: Post[];  // No @JoinTable - inverse side
}

// Database result:
// posts table: id, title
// tags table: id, name
// post_tags_tag table: postId, tagId (junction table)
```

### @JoinTable Options

```typescript
@ManyToMany(() => Tag, tag => tag.posts)
@JoinTable({
    name: 'post_tags',  // Junction table name
    joinColumn: {
        name: 'post_id',
        referencedColumnName: 'id'
    },
    inverseJoinColumn: {
        name: 'tag_id',
        referencedColumnName: 'id'
    }
})
tags!: Tag[];
```

### Managing Many-to-Many Relations

```typescript
const postRepository = AppDataSource.getRepository(Post);
const tagRepository = AppDataSource.getRepository(Tag);

// Create tags
const tag1 = await tagRepository.save({ name: 'TypeScript' });
const tag2 = await tagRepository.save({ name: 'TypeORM' });

// Create post with tags
const post = postRepository.create({
    title: 'TypeORM Guide',
    tags: [tag1, tag2]  // Assign tags
});
await postRepository.save(post);

// Add tag to existing post
const existingPost = await postRepository.findOne({
    where: { id: 1 },
    relations: ['tags']
});
const newTag = await tagRepository.save({ name: 'Database' });
existingPost.tags.push(newTag);
await postRepository.save(existingPost);

// Remove tag from post
existingPost.tags = existingPost.tags.filter(t => t.id !== tag2.id);
await postRepository.save(existingPost);
```

### Many-to-Many with Extra Columns

When your junction table needs additional columns (e.g., timestamps, metadata):

```typescript
// Instead of @ManyToMany, use explicit junction entity

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles!: UserRole[];
}

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles!: UserRole[];
}

// Explicit junction entity with extra columns
@Entity()
export class UserRole {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.userRoles)
    user!: User;

    @ManyToOne(() => Role, role => role.userRoles)
    role!: Role;

    @Column()
    assignedAt!: Date;

    @Column()
    assignedBy!: string;

    @Column({ default: true })
    isActive!: boolean;
}
```

---

## Relation Options

### Common Options

```typescript
@OneToMany(() => Post, post => post.author, {
    cascade: true,          // Cascade operations
    eager: true,            // Always load relation
    nullable: true,         // FK can be null
    onDelete: 'CASCADE',    // On delete behavior
    onUpdate: 'CASCADE',    // On update behavior
    orphanedRowAction: 'delete'  // Delete orphaned children
})
posts!: Post[];
```

### cascade Option

Controls automatic cascading of operations:

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, post => post.author, {
        cascade: true  // All operations cascade
    })
    posts!: Post[];

    // Or specific operations
    @OneToMany(() => Comment, comment => comment.user, {
        cascade: ['insert', 'update']  // Only insert/update
    })
    comments!: Comment[];
}

// With cascade: true
const user = userRepository.create({
    email: 'john@example.com',
    posts: [
        { title: 'Post 1', content: '...' },
        { title: 'Post 2', content: '...' }
    ]
});
await userRepository.save(user);  // Saves user AND posts!
```

Cascade options:
- `insert` - Cascade inserts
- `update` - Cascade updates
- `remove` - Cascade deletes
- `soft-remove` - Cascade soft deletes
- `recover` - Cascade recovers
- `true` - All operations

### eager Option

Automatically load relation without specifying in `relations`:

```typescript
@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts, {
        eager: true  // Always load author
    })
    author!: User;
}

// No need to specify relations
const posts = await postRepository.find();
console.log(posts[0].author);  // Loaded automatically!
```

**Warning**: Eager loading can cause performance issues. Use sparingly.

### onDelete and onUpdate Options

```typescript
@ManyToOne(() => User, user => user.posts, {
    onDelete: 'CASCADE',     // Delete posts when user deleted
    onUpdate: 'CASCADE'      // Update FK when user ID changes
})
author!: User;

// Options: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'DEFAULT' | 'NO ACTION'
```

| Option | Behavior on Delete |
|--------|-------------------|
| `RESTRICT` | Prevent delete if children exist |
| `CASCADE` | Delete children too |
| `SET NULL` | Set FK to NULL (requires nullable) |
| `NO ACTION` | Like RESTRICT (deferred check) |

### nullable Option

```typescript
@ManyToOne(() => User, user => user.posts, {
    nullable: true  // Post can exist without author
})
author?: User;  // Note the optional marker
```

---

## Loading Relations

### Using `relations` Option

```typescript
// Load single relation
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});

// Load multiple relations
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts', 'profile', 'comments']
});

// Load nested relations
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts', 'posts.tags', 'posts.comments', 'posts.comments.author']
});

// Object syntax (TypeORM 0.3+)
const user = await userRepository.findOne({
    where: { id: 1 },
    relations: {
        posts: {
            tags: true,
            comments: {
                author: true
            }
        },
        profile: true
    }
});
```

### QueryBuilder Joins

```typescript
// Left join (include even if no relation)
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .getMany();

// Inner join (only if relation exists)
const usersWithPosts = await userRepository
    .createQueryBuilder('user')
    .innerJoinAndSelect('user.posts', 'post')
    .getMany();

// Join with condition
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post', 'post.isPublished = :pub', { pub: true })
    .getMany();

// Multiple joins
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .leftJoinAndSelect('post.tags', 'tag')
    .leftJoinAndSelect('user.profile', 'profile')
    .where('user.id = :id', { id: 1 })
    .getOne();
```

### Join Without Loading (for filtering)

```typescript
// Join but don't select (for WHERE clause)
const users = await userRepository
    .createQueryBuilder('user')
    .leftJoin('user.posts', 'post')  // No AndSelect
    .where('post.title LIKE :title', { title: '%TypeORM%' })
    .getMany();
// Users returned WITHOUT posts property loaded
```

---

## Lazy Relations

Load relations on demand using Promises.

### Defining Lazy Relations

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany(() => Post, post => post.author)
    posts!: Promise<Post[]>;  // Promise type = lazy
}

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.posts)
    author!: Promise<User>;  // Promise type = lazy
}
```

### Using Lazy Relations

```typescript
// Load user (posts NOT loaded)
const user = await userRepository.findOneBy({ id: 1 });

// Access lazy relation (triggers query)
const posts = await user.posts;  // Query executed here
console.log(posts);

// Setting lazy relation
const post = postRepository.create({ title: 'New Post' });
post.author = Promise.resolve(user);
await postRepository.save(post);
```

**Caveat**: Lazy relations can cause N+1 query problems. Use eager loading or explicit joins for better performance.

---

## Bi-directional vs Uni-directional

### Uni-directional (One-way)

Only one side knows about the relation:

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
    // No reference to posts
}

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)  // No inverse callback
    @JoinColumn()
    author!: User;
}

// Can only navigate: post.author
// Cannot navigate: user.posts
```

### Bi-directional (Two-way)

Both sides know about each other:

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany(() => Post, post => post.author)  // Inverse side
    posts!: Post[];
}

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.posts)  // Owning side
    @JoinColumn()
    author!: User;
}

// Can navigate both directions:
// post.author
// user.posts
```

**Rule of thumb**: Use bi-directional when you need to query from both sides.

---

## Self-Referencing Relations

Entities that relate to themselves.

### Tree Structure (Parent-Child)

```typescript
@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToOne(() => Category, category => category.children, {
        nullable: true
    })
    @JoinColumn({ name: 'parent_id' })
    parent?: Category;

    @OneToMany(() => Category, category => category.parent)
    children!: Category[];
}
```

### Using Self-Reference

```typescript
const categoryRepository = AppDataSource.getRepository(Category);

// Create parent
const electronics = categoryRepository.create({ name: 'Electronics' });
await categoryRepository.save(electronics);

// Create children
const phones = categoryRepository.create({
    name: 'Phones',
    parent: electronics
});
const laptops = categoryRepository.create({
    name: 'Laptops',
    parent: electronics
});
await categoryRepository.save([phones, laptops]);

// Load with relations
const category = await categoryRepository.findOne({
    where: { id: electronics.id },
    relations: ['children', 'children.children']
});

// Query children
const children = await categoryRepository.find({
    where: { parent: { id: electronics.id } }
});
```

### User Followers (Many-to-Many Self-Reference)

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @ManyToMany(() => User, user => user.following)
    @JoinTable({
        name: 'user_followers',
        joinColumn: { name: 'follower_id' },
        inverseJoinColumn: { name: 'following_id' }
    })
    followers!: User[];

    @ManyToMany(() => User, user => user.followers)
    following!: User[];
}

// Usage
const userRepository = AppDataSource.getRepository(User);

// Follow a user
const user1 = await userRepository.findOne({
    where: { id: 1 },
    relations: ['following']
});
const user2 = await userRepository.findOneBy({ id: 2 });

user1.following.push(user2);
await userRepository.save(user1);

// Get followers
const userWithFollowers = await userRepository.findOne({
    where: { id: 2 },
    relations: ['followers']
});
```

---

## Comparison with Sequelize

### One-to-Many

```typescript
// TypeORM
@Entity()
export class User {
    @OneToMany(() => Post, post => post.author)
    posts!: Post[];
}

@Entity()
export class Post {
    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })
    author!: User;
}

// Load
await userRepository.findOne({
    where: { id: 1 },
    relations: ['posts']
});

// Sequelize
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId' });

// Load
await User.findByPk(1, { include: [Post] });
```

### Many-to-Many

```typescript
// TypeORM
@Entity()
export class Post {
    @ManyToMany(() => Tag, tag => tag.posts)
    @JoinTable()
    tags!: Tag[];
}

// Sequelize
Post.belongsToMany(Tag, { through: 'post_tags' });
Tag.belongsToMany(Post, { through: 'post_tags' });
```

---

## Complete Example

```typescript
// User Entity
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @OneToOne(() => Profile, profile => profile.user, { cascade: true })
    @JoinColumn()
    profile!: Profile;

    @OneToMany(() => Post, post => post.author, { cascade: ['insert'] })
    posts!: Post[];

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({ name: 'user_roles' })
    roles!: Role[];
}

// Profile Entity
@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    bio!: string;

    @OneToOne(() => User, user => user.profile)
    user!: User;
}

// Post Entity
@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @ManyToMany(() => Tag, tag => tag.posts)
    @JoinTable({ name: 'post_tags' })
    tags!: Tag[];
}

// Tag Entity
@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @ManyToMany(() => Post, post => post.tags)
    posts!: Post[];
}

// Role Entity
@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @ManyToMany(() => User, user => user.roles)
    users!: User[];
}
```

### Usage Example

```typescript
async function example() {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);
    const tagRepo = AppDataSource.getRepository(Tag);

    // Create user with profile (cascade)
    const user = userRepo.create({
        email: 'john@example.com',
        profile: {
            bio: 'Software developer'
        },
        posts: [
            { title: 'My First Post' }
        ]
    });
    await userRepo.save(user);

    // Add roles
    const adminRole = await roleRepo.save({ name: 'admin' });
    user.roles = [adminRole];
    await userRepo.save(user);

    // Add tags to post
    const tag = await tagRepo.save({ name: 'TypeORM' });
    const post = user.posts[0];
    post.tags = [tag];
    await AppDataSource.getRepository(Post).save(post);

    // Load complete user
    const fullUser = await userRepo.findOne({
        where: { id: user.id },
        relations: ['profile', 'posts', 'posts.tags', 'roles']
    });

    console.log(fullUser);
}
```

---

## Key Takeaways

1. **@JoinColumn on owning side** - The side with the FK column
2. **@JoinTable for Many-to-Many** - Creates junction table
3. **Bi-directional needs callbacks** - `() => Entity, entity => entity.relation`
4. **cascade for automatic saves** - Be careful with delete cascade
5. **eager loads automatically** - Can hurt performance
6. **Lazy uses Promises** - Watch for N+1 problems
7. **relations option to load** - Or QueryBuilder joins
8. **Self-reference works** - For trees, followers, etc.
9. **onDelete controls FK behavior** - CASCADE, SET NULL, etc.

---

## Next Steps

- **Phase 095d**: Migrations for production
