# Phase 093: Sequelize Relations (LEGACY)

> **LEGACY NOTICE**: Sequelize associations use decorators in sequelize-typescript to define relationships. This approach is more verbose than Prisma's schema-based relations but offers more runtime flexibility. Understanding these patterns is essential for legacy codebase maintenance.

## Table of Contents
1. [Relations Overview](#relations-overview)
2. [One-to-One Relations](#one-to-one-relations)
3. [One-to-Many Relations](#one-to-many-relations)
4. [Many-to-Many Relations](#many-to-many-relations)
5. [Foreign Key Configuration](#foreign-key-configuration)
6. [Eager Loading](#eager-loading)
7. [Lazy Loading](#lazy-loading)
8. [Association Aliases](#association-aliases)
9. [Through Tables (Junction/Pivot)](#through-tables)
10. [Cascade Operations](#cascade-operations)
11. [Laravel/Eloquent Comparison](#laravel-comparison)

---

## Relations Overview

### Relationship Types in Databases

```
One-to-One (1:1):
  User ──────── Profile
  Each user has exactly one profile
  Each profile belongs to exactly one user

One-to-Many (1:M):
  User ──────<< Posts
  Each user can have many posts
  Each post belongs to one user

Many-to-Many (M:N):
  Post >>────<< Tags
  Each post can have many tags
  Each tag can belong to many posts
  (Requires junction/pivot table)
```

### Sequelize Association Methods

| Relationship | Parent Side | Child Side |
|--------------|-------------|------------|
| One-to-One | @HasOne | @BelongsTo |
| One-to-Many | @HasMany | @BelongsTo |
| Many-to-Many | @BelongsToMany | @BelongsToMany |

> **Theory Note**: The "parent" side owns the relationship conceptually, while the "child" side holds the foreign key. In One-to-One, the FK can be on either side, but conventionally goes on the dependent entity.

---

## One-to-One Relations

### Basic One-to-One: User has one Profile

```typescript
// src/models/User.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasOne,
} from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  // User HAS ONE Profile
  @HasOne(() => Profile)
  profile?: Profile;
}
```

```typescript
// src/models/Profile.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'profiles' })
export class Profile extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Foreign key column
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @Column(DataType.STRING)
  bio?: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  // Profile BELONGS TO User
  @BelongsTo(() => User)
  user?: User;
}
```

### Usage Examples

```typescript
// Create user with profile
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
});

const profile = await Profile.create({
  userId: user.id,
  bio: 'Software Developer',
});

// Or create together
const user = await User.create(
  {
    name: 'John',
    email: 'john@example.com',
    profile: {
      bio: 'Software Developer',
    },
  },
  {
    include: [Profile],
  }
);

// Query user with profile
const userWithProfile = await User.findByPk(1, {
  include: [Profile],
});
console.log(userWithProfile?.profile?.bio);

// Query profile with user
const profile = await Profile.findOne({
  where: { userId: 1 },
  include: [User],
});
console.log(profile?.user?.name);
```

---

## One-to-Many Relations

### Basic One-to-Many: User has many Posts

```typescript
// src/models/User.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Post } from './Post';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  // User HAS MANY Posts
  @HasMany(() => Post)
  posts?: Post[];
}
```

```typescript
// src/models/Post.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'posts' })
export class Post extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  content?: string;

  // Foreign key to User
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  // Post BELONGS TO User (author)
  @BelongsTo(() => User)
  user?: User;
}
```

### Usage Examples

```typescript
// Create post for user
const post = await Post.create({
  title: 'My First Post',
  content: 'Hello World!',
  userId: 1,
});

// Get user with all posts
const user = await User.findByPk(1, {
  include: [Post],
});

console.log(user?.posts?.length); // Number of posts
user?.posts?.forEach(post => {
  console.log(post.title);
});

// Get posts for user (alternative)
const posts = await Post.findAll({
  where: { userId: 1 },
});

// Get post with author
const post = await Post.findByPk(1, {
  include: [User],
});
console.log(post?.user?.name); // Author name
```

### Self-Referencing One-to-Many (Categories/Tree)

```typescript
// src/models/Category.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

@Table({ tableName: 'categories' })
export class Category extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  // Self-referencing foreign key
  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  parentId?: number;

  // Parent category
  @BelongsTo(() => Category, 'parentId')
  parent?: Category;

  // Child categories
  @HasMany(() => Category, 'parentId')
  children?: Category[];
}

// Usage
const electronics = await Category.create({ name: 'Electronics' });
const phones = await Category.create({
  name: 'Phones',
  parentId: electronics.id,
});
const laptops = await Category.create({
  name: 'Laptops',
  parentId: electronics.id,
});

// Get category with children
const parent = await Category.findByPk(electronics.id, {
  include: [{ model: Category, as: 'children' }],
});
```

---

## Many-to-Many Relations

### Basic Many-to-Many: Posts and Tags

```typescript
// src/models/Post.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Tag } from './Tag';
import { PostTag } from './PostTag';

@Table({ tableName: 'posts' })
export class Post extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  // Many-to-Many: Post has many Tags through PostTag
  @BelongsToMany(() => Tag, () => PostTag)
  tags?: Tag[];
}
```

```typescript
// src/models/Tag.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Post } from './Post';
import { PostTag } from './PostTag';

@Table({ tableName: 'tags' })
export class Tag extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING, unique: true })
  name!: string;

  // Many-to-Many: Tag belongs to many Posts through PostTag
  @BelongsToMany(() => Post, () => PostTag)
  posts?: Post[];
}
```

```typescript
// src/models/PostTag.ts (Junction/Pivot Table)
import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Post } from './Post';
import { Tag } from './Tag';

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

### Usage Examples

```typescript
// Create post with tags
const post = await Post.create({ title: 'TypeScript Guide' });
const tag1 = await Tag.findOrCreate({ where: { name: 'typescript' } });
const tag2 = await Tag.findOrCreate({ where: { name: 'programming' } });

// Associate tags with post
await post.$set('tags', [tag1[0], tag2[0]]);
// or
await post.$add('tags', tag1[0]);
await post.$add('tags', tag2[0]);

// Get post with tags
const postWithTags = await Post.findByPk(1, {
  include: [Tag],
});
postWithTags?.tags?.forEach(tag => console.log(tag.name));

// Get all posts for a tag
const tag = await Tag.findOne({
  where: { name: 'typescript' },
  include: [Post],
});
tag?.posts?.forEach(post => console.log(post.title));

// Add tags by ID
await post.$add('tags', [1, 2, 3]);

// Remove a tag
await post.$remove('tags', tag1[0]);

// Replace all tags
await post.$set('tags', [newTag1, newTag2]);

// Check if has tag
const hasTag = await post.$has('tags', tag1[0]);

// Count tags
const tagCount = await post.$count('tags');
```

### Junction Table with Extra Columns

```typescript
// src/models/UserRole.ts (Pivot with extra data)
import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './User';
import { Role } from './Role';

@Table({ tableName: 'user_roles' })
export class UserRole extends Model {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number;

  // Extra column: who assigned this role
  @Column(DataType.INTEGER)
  assignedBy?: number;

  // Extra column: when assigned
  @CreatedAt
  assignedAt!: Date;

  // Extra column: is it active
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;
}

// User model
@Table({ tableName: 'users' })
export class User extends Model {
  @BelongsToMany(() => Role, () => UserRole)
  roles?: (Role & { UserRole: UserRole })[];
}

// Accessing pivot data
const user = await User.findByPk(1, {
  include: [Role],
});

user?.roles?.forEach(role => {
  console.log(role.name);
  console.log(role.UserRole.assignedAt); // Pivot data
  console.log(role.UserRole.isActive);
});

// Adding with pivot data
await user.$add('roles', role, {
  through: {
    assignedBy: adminId,
    isActive: true,
  },
});
```

---

## Foreign Key Configuration

### Explicit Foreign Key Options

```typescript
// src/models/Comment.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Post } from './Post';
import { User } from './User';

@Table({ tableName: 'comments' })
export class Comment extends Model {
  @Column(DataType.TEXT)
  content!: string;

  // Foreign key with custom column name
  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    field: 'post_id', // Database column name
    allowNull: false,
  })
  postId!: number;

  @BelongsTo(() => Post, {
    foreignKey: 'postId',
    targetKey: 'id', // Primary key on Post
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  post?: Post;

  // Nullable foreign key (optional relation)
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Can be NULL
  })
  authorId?: number;

  @BelongsTo(() => User, {
    foreignKey: 'authorId',
    onDelete: 'SET NULL', // Set to NULL when user deleted
  })
  author?: User;
}
```

### HasMany with Foreign Key Options

```typescript
// src/models/Post.ts
@Table({ tableName: 'posts' })
export class Post extends Model {
  @HasMany(() => Comment, {
    foreignKey: 'postId',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    hooks: true, // Run hooks on cascade
  })
  comments?: Comment[];
}
```

---

## Eager Loading

### Basic Eager Loading with include

```typescript
// Include single association
const user = await User.findByPk(1, {
  include: [Post],
});

// Include multiple associations
const user = await User.findByPk(1, {
  include: [Post, Profile],
});

// Include with options
const user = await User.findByPk(1, {
  include: [
    {
      model: Post,
      where: { isPublished: true }, // Filter included posts
      required: false, // LEFT JOIN (include user even without posts)
    },
  ],
});

// Include with specific attributes
const user = await User.findByPk(1, {
  include: [
    {
      model: Post,
      attributes: ['id', 'title'], // Only include these fields
    },
  ],
});
```

### Nested Includes (Deep Loading)

```typescript
// User -> Posts -> Comments -> Author
const user = await User.findByPk(1, {
  include: [
    {
      model: Post,
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    },
  ],
});

// Access nested data
user?.posts?.forEach(post => {
  console.log(post.title);
  post.comments?.forEach(comment => {
    console.log(`  ${comment.author?.name}: ${comment.content}`);
  });
});
```

### Include All Associations

```typescript
// Include everything (use with caution - performance!)
const user = await User.findByPk(1, {
  include: { all: true },
});

// Include all, nested one level
const user = await User.findByPk(1, {
  include: { all: true, nested: true },
});
```

### Required vs Optional Includes

```typescript
// INNER JOIN - only users with posts
const usersWithPosts = await User.findAll({
  include: [
    {
      model: Post,
      required: true, // INNER JOIN
    },
  ],
});

// LEFT JOIN - all users, with posts if they have any
const allUsers = await User.findAll({
  include: [
    {
      model: Post,
      required: false, // LEFT JOIN (default)
    },
  ],
});

// Filter parent by child condition (RIGHT-side condition)
const usersWithRecentPosts = await User.findAll({
  include: [
    {
      model: Post,
      where: {
        createdAt: { [Op.gt]: lastWeek },
      },
      required: true, // Only users with posts matching condition
    },
  ],
});
```

---

## Lazy Loading

### Manual Lazy Loading

```typescript
// Fetch user without posts
const user = await User.findByPk(1);

// Later, fetch posts separately
const posts = await Post.findAll({
  where: { userId: user.id },
});

// Or use association getter method
const posts = await user.$get('posts');
const profile = await user.$get('profile');
```

### Association Methods (Magic Methods)

Sequelize creates "magic" methods on instances for each association:

```typescript
// For HasMany/HasOne/BelongsToMany
user.$get('posts');      // Get associated records
user.$set('posts', [...]);   // Replace all associated
user.$add('posts', post);    // Add to association
user.$remove('posts', post); // Remove from association
user.$has('posts', post);    // Check if associated
user.$count('posts');        // Count associated

// With options
const publishedPosts = await user.$get('posts', {
  where: { isPublished: true },
  order: [['createdAt', 'DESC']],
  limit: 10,
});
```

### Lazy Loading with Mixins

```typescript
// User model generates these methods for posts:
interface User {
  getPosts(): Promise<Post[]>;
  setPosts(posts: Post[]): Promise<void>;
  addPost(post: Post): Promise<void>;
  addPosts(posts: Post[]): Promise<void>;
  removePost(post: Post): Promise<void>;
  removePosts(posts: Post[]): Promise<void>;
  hasPost(post: Post): Promise<boolean>;
  hasPosts(posts: Post[]): Promise<boolean>;
  countPosts(): Promise<number>;
  createPost(values: object): Promise<Post>;
}

// Usage
const user = await User.findByPk(1);
const posts = await user.getPosts();
const newPost = await user.createPost({ title: 'New Post' });
const count = await user.countPosts();
```

---

## Association Aliases

### Why Use Aliases?

Aliases are necessary when:
1. A model has multiple associations to the same model
2. You want semantic naming for relationships

```typescript
// Post has author (User) AND editor (User)
@Table({ tableName: 'posts' })
export class Post extends Model {
  @Column(DataType.STRING)
  title!: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  authorId!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  editorId?: number;

  // Alias: 'author'
  @BelongsTo(() => User, {
    foreignKey: 'authorId',
    as: 'author',
  })
  author?: User;

  // Alias: 'editor'
  @BelongsTo(() => User, {
    foreignKey: 'editorId',
    as: 'editor',
  })
  editor?: User;
}

// User side
@Table({ tableName: 'users' })
export class User extends Model {
  // Posts where user is author
  @HasMany(() => Post, {
    foreignKey: 'authorId',
    as: 'authoredPosts',
  })
  authoredPosts?: Post[];

  // Posts where user is editor
  @HasMany(() => Post, {
    foreignKey: 'editorId',
    as: 'editedPosts',
  })
  editedPosts?: Post[];
}
```

### Querying with Aliases

```typescript
// Must use alias in include
const post = await Post.findByPk(1, {
  include: [
    { model: User, as: 'author' },
    { model: User, as: 'editor' },
  ],
});

console.log(post?.author?.name);
console.log(post?.editor?.name);

// Must use alias in getter
const author = await post.$get('author');
const editor = await post.$get('editor');

// Get user with both types of posts
const user = await User.findByPk(1, {
  include: [
    { model: Post, as: 'authoredPosts' },
    { model: Post, as: 'editedPosts' },
  ],
});
```

---

## Through Tables

### Accessing Through Table Data

```typescript
// Define Through model with extra columns
@Table({ tableName: 'enrollments' })
export class Enrollment extends Model {
  @ForeignKey(() => Student)
  @Column(DataType.INTEGER)
  studentId!: number;

  @ForeignKey(() => Course)
  @Column(DataType.INTEGER)
  courseId!: number;

  @Column(DataType.DATE)
  enrolledAt!: Date;

  @Column(DataType.STRING)
  grade?: string;

  @Column(DataType.BOOLEAN)
  completed!: boolean;
}

// Student model
@Table({ tableName: 'students' })
export class Student extends Model {
  @Column(DataType.STRING)
  name!: string;

  @BelongsToMany(() => Course, () => Enrollment)
  courses?: (Course & { Enrollment: Enrollment })[];
}

// Course model
@Table({ tableName: 'courses' })
export class Course extends Model {
  @Column(DataType.STRING)
  title!: string;

  @BelongsToMany(() => Student, () => Enrollment)
  students?: (Student & { Enrollment: Enrollment })[];
}
```

### Querying Through Table

```typescript
// Get student with courses and enrollment data
const student = await Student.findByPk(1, {
  include: [
    {
      model: Course,
      through: {
        attributes: ['enrolledAt', 'grade', 'completed'],
      },
    },
  ],
});

student?.courses?.forEach(course => {
  console.log(course.title);
  console.log(`Enrolled: ${course.Enrollment.enrolledAt}`);
  console.log(`Grade: ${course.Enrollment.grade}`);
});

// Filter by through table
const completedCourses = await Student.findByPk(1, {
  include: [
    {
      model: Course,
      through: {
        where: { completed: true },
      },
    },
  ],
});

// Update through table
await student.$add('courses', course, {
  through: {
    enrolledAt: new Date(),
    grade: 'A',
    completed: false,
  },
});

// Query through table directly
const enrollments = await Enrollment.findAll({
  where: { studentId: 1 },
  include: [Course],
});
```

---

## Cascade Operations

### onDelete and onUpdate Options

```typescript
@Table({ tableName: 'comments' })
export class Comment extends Model {
  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId!: number;

  @BelongsTo(() => Post, {
    foreignKey: 'postId',
    onDelete: 'CASCADE',   // Delete comments when post deleted
    onUpdate: 'CASCADE',   // Update FK when post ID changes
  })
  post?: Post;
}

// Options:
// 'CASCADE' - Delete/update children with parent
// 'SET NULL' - Set FK to NULL when parent deleted
// 'SET DEFAULT' - Set FK to default value
// 'RESTRICT' - Prevent deletion if children exist
// 'NO ACTION' - Same as RESTRICT in most databases
```

### Manual Cascade with Hooks

```typescript
@Table({ tableName: 'users' })
export class User extends Model {
  @HasMany(() => Post, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    hooks: true, // Enable hooks on cascade
  })
  posts?: Post[];
}

// In Post model
@BeforeDestroy
static async deleteComments(instance: Post) {
  await Comment.destroy({
    where: { postId: instance.id },
  });
}

// Now when user is deleted:
// 1. User's posts are deleted (onDelete: CASCADE)
// 2. Each post's BeforeDestroy hook runs
// 3. Comments for each post are deleted
```

### Soft Delete Cascade

```typescript
// Custom soft delete cascade
@BeforeDestroy
static async softDeleteChildren(instance: User) {
  // Soft delete all user's posts
  await Post.destroy({
    where: { userId: instance.id },
    // This triggers soft delete if Post has paranoid: true
  });
}

// Restore with children
async restoreWithPosts() {
  await this.restore();
  await Post.restore({
    where: { userId: this.id },
  });
}
```

---

## Laravel/Eloquent Comparison

### Relationship Definition

```php
// Laravel: app/Models/User.php
class User extends Model
{
    // One-to-One
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    // One-to-Many
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Many-to-Many
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)
            ->withPivot('assigned_at', 'assigned_by')
            ->withTimestamps();
    }
}

// Laravel: app/Models/Post.php
class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

```typescript
// Sequelize: src/models/User.ts
@Table({ tableName: 'users' })
export class User extends Model {
  // One-to-One
  @HasOne(() => Profile)
  profile?: Profile;

  // One-to-Many
  @HasMany(() => Post)
  posts?: Post[];

  // Many-to-Many
  @BelongsToMany(() => Role, () => UserRole)
  roles?: Role[];
}

// Sequelize: src/models/Post.ts
@Table({ tableName: 'posts' })
export class Post extends Model {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User)
  user?: User;
}
```

### Eager Loading

```php
// Laravel
$user = User::with('posts')->find(1);
$user = User::with(['posts', 'profile'])->find(1);
$user = User::with('posts.comments.author')->find(1);

// Constrained eager loading
$user = User::with(['posts' => function ($query) {
    $query->where('is_published', true);
}])->find(1);
```

```typescript
// Sequelize
const user = await User.findByPk(1, { include: [Post] });
const user = await User.findByPk(1, { include: [Post, Profile] });
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    include: [{ model: Comment, include: [{ model: User, as: 'author' }] }]
  }]
});

// Constrained eager loading
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    where: { isPublished: true },
  }]
});
```

### Lazy Loading

```php
// Laravel - Automatic lazy loading
$user = User::find(1);
$posts = $user->posts; // Lazy loaded

// Explicit lazy load
$user->load('posts');
```

```typescript
// Sequelize - Must be explicit
const user = await User.findByPk(1);
const posts = await user.$get('posts'); // Explicit call

// Or query separately
const posts = await Post.findAll({ where: { userId: user.id } });
```

### Many-to-Many Operations

```php
// Laravel
$user->roles()->attach($roleId);
$user->roles()->detach($roleId);
$user->roles()->sync([$roleId1, $roleId2]);
$user->roles()->toggle($roleId);

// With pivot data
$user->roles()->attach($roleId, ['assigned_by' => $adminId]);
```

```typescript
// Sequelize
await user.$add('roles', roleId);
await user.$remove('roles', roleId);
await user.$set('roles', [roleId1, roleId2]);
// No toggle equivalent

// With pivot data
await user.$add('roles', role, {
  through: { assignedBy: adminId }
});
```

### Cascade Configuration

```php
// Laravel: Migration
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')
        ->constrained()
        ->onDelete('cascade');
});

// Laravel: Model events
protected static function booted()
{
    static::deleting(function ($user) {
        $user->posts()->delete();
    });
}
```

```typescript
// Sequelize: Model decorator
@BelongsTo(() => User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
})
user?: User;

// Or with hooks
@BeforeDestroy
static async deletePosts(instance: User) {
  await Post.destroy({ where: { userId: instance.id } });
}
```

---

## Key Takeaways

1. **@HasOne/@HasMany go on parent** - The model that "owns" the relationship uses these.

2. **@BelongsTo goes on child** - The model with the foreign key uses BelongsTo.

3. **@ForeignKey is explicit** - Unlike Prisma/Eloquent, you must declare the FK column.

4. **Aliases are required for multiple relations** - When pointing to the same model twice.

5. **Eager loading uses include** - Similar to Eloquent's `with()`.

6. **$get(), $set(), $add()** - Magic methods for lazy loading and manipulation.

7. **Through tables can have data** - Access via `association.ThroughModel`.

8. **Cascade is per-association** - Set onDelete/onUpdate on each relationship.

---

## What's Next?

In the next phase, we'll explore **Sequelize Migrations**:
- Creating and running migrations
- Schema versioning
- Seeders for test data
- Why migrations beat sync()
