# Phase 092: Sequelize CRUD Operations (LEGACY)

> **LEGACY NOTICE**: Sequelize CRUD methods follow the Active Record pattern. While the syntax differs from modern ORMs like Prisma, the concepts are universal. This knowledge transfers directly when migrating legacy codebases.

## Table of Contents
1. [Create Operations](#create-operations)
2. [Read Operations](#read-operations)
3. [Update Operations](#update-operations)
4. [Delete Operations](#delete-operations)
5. [Bulk Operations](#bulk-operations)
6. [Query Options](#query-options)
7. [Operators Reference](#operators-reference)
8. [Raw Queries](#raw-queries)
9. [Aggregations](#aggregations)
10. [Laravel/Eloquent Comparison](#laravel-comparison)

---

## Create Operations

### Model.create()

The most common way to insert a record:

```typescript
import { User } from './models/User';

// Basic create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password',
});

console.log(user.id);        // Auto-generated ID
console.log(user.createdAt); // Auto-generated timestamp

// Create with specific fields only (whitelist)
const user = await User.create(
  {
    name: 'John',
    email: 'john@example.com',
    isAdmin: true, // This will be ignored!
  },
  {
    fields: ['name', 'email'], // Only these fields allowed
  }
);

// Create and return specific attributes
const user = await User.create(
  { name: 'John', email: 'john@example.com' },
  {
    returning: true, // PostgreSQL: return all fields
    // or
    returning: ['id', 'name'], // Return specific fields
  }
);
```

### Model.build() + save()

Separates object creation from database insertion:

```typescript
// Build creates an instance without saving
const user = User.build({
  name: 'Jane Doe',
  email: 'jane@example.com',
});

// Instance is NOT yet in database
console.log(user.isNewRecord); // true
console.log(user.id);          // undefined

// Modify before saving
user.name = 'Jane Smith';

// Now persist to database
await user.save();

console.log(user.isNewRecord); // false
console.log(user.id);          // Now has ID
```

> **Theory Note**: `build() + save()` is useful when you need to manipulate the instance before persisting, or when creation depends on conditional logic. `create()` is syntactic sugar for `build() + save()`.

### findOrCreate()

Creates only if not found:

```typescript
// Find by email, create if doesn't exist
const [user, created] = await User.findOrCreate({
  where: { email: 'john@example.com' },
  defaults: {
    name: 'John Doe',
    password: 'hashed_password',
  },
});

if (created) {
  console.log('New user created');
} else {
  console.log('Existing user found');
}

// With transaction for race condition safety
import { Transaction } from 'sequelize';

const [user, created] = await User.findOrCreate({
  where: { email: 'john@example.com' },
  defaults: { name: 'John Doe' },
  transaction: t,
  lock: Transaction.LOCK.UPDATE, // PostgreSQL row lock
});
```

---

## Read Operations

### findAll()

Retrieve multiple records:

```typescript
// Get all users
const users = await User.findAll();

// With conditions
const activeUsers = await User.findAll({
  where: {
    isActive: true,
  },
});

// With multiple conditions
const users = await User.findAll({
  where: {
    isActive: true,
    role: 'admin',
  },
});

// Select specific attributes
const users = await User.findAll({
  attributes: ['id', 'name', 'email'],
});

// Exclude attributes
const users = await User.findAll({
  attributes: { exclude: ['password', 'secretToken'] },
});

// Rename attributes
const users = await User.findAll({
  attributes: [
    'id',
    ['first_name', 'firstName'], // Alias: first_name AS firstName
    'email',
  ],
});

// With ordering
const users = await User.findAll({
  order: [
    ['createdAt', 'DESC'],
    ['name', 'ASC'],
  ],
});

// With pagination
const users = await User.findAll({
  limit: 10,
  offset: 20, // Skip first 20, get next 10
});

// Raw objects (no model instances)
const users = await User.findAll({
  raw: true, // Returns plain objects, not Model instances
});
```

### findOne()

Retrieve a single record:

```typescript
// Find first matching record
const user = await User.findOne({
  where: { email: 'john@example.com' },
});

if (user) {
  console.log(user.name);
} else {
  console.log('User not found');
}

// Find with ordering (get most recent)
const latestUser = await User.findOne({
  where: { isActive: true },
  order: [['createdAt', 'DESC']],
});
```

### findByPk()

Find by primary key (most efficient for ID lookups):

```typescript
// Find by primary key
const user = await User.findByPk(1);

// With options
const user = await User.findByPk(1, {
  attributes: ['id', 'name', 'email'],
  include: ['posts'], // Eager load relations
});

// Returns null if not found
const user = await User.findByPk(999);
console.log(user); // null
```

### findAndCountAll()

For pagination - get results AND total count:

```typescript
const { count, rows } = await User.findAndCountAll({
  where: { isActive: true },
  limit: 10,
  offset: 0,
});

console.log(`Showing ${rows.length} of ${count} total users`);

// Calculate pagination metadata
const page = 1;
const pageSize = 10;
const { count, rows } = await User.findAndCountAll({
  where: { isActive: true },
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

const pagination = {
  total: count,
  page,
  pageSize,
  totalPages: Math.ceil(count / pageSize),
  hasNext: page * pageSize < count,
  hasPrev: page > 1,
};
```

### count()

Just get the count:

```typescript
const totalUsers = await User.count();

const activeUsers = await User.count({
  where: { isActive: true },
});

// Count distinct
const uniqueCountries = await User.count({
  distinct: true,
  col: 'country',
});
```

---

## Update Operations

### Instance save()

Update a fetched instance:

```typescript
// Fetch, modify, save
const user = await User.findByPk(1);

if (user) {
  user.name = 'Updated Name';
  user.email = 'updated@example.com';
  await user.save();
}

// Save specific fields only
user.name = 'New Name';
user.email = 'new@example.com';
await user.save({ fields: ['name'] }); // Only saves name

// Check if changed before saving
user.name = 'New Name';
console.log(user.changed()); // ['name']
console.log(user.changed('name')); // true
console.log(user.changed('email')); // false

if (user.changed()) {
  await user.save();
}

// Get previous value
const previousName = user.previous('name');
```

### Instance update()

Update specific fields on an instance:

```typescript
const user = await User.findByPk(1);

// Update instance with object
await user.update({
  name: 'New Name',
  email: 'new@example.com',
});

// Same as:
user.set({
  name: 'New Name',
  email: 'new@example.com',
});
await user.save();
```

### Model.update() (Static)

Update multiple records without fetching:

```typescript
// Update all matching records
const [affectedCount] = await User.update(
  { isActive: false },
  { where: { lastLoginAt: { [Op.lt]: thirtyDaysAgo } } }
);

console.log(`Deactivated ${affectedCount} users`);

// PostgreSQL: Get updated rows
const [affectedCount, updatedRows] = await User.update(
  { isActive: false },
  {
    where: { status: 'pending' },
    returning: true, // PostgreSQL only
  }
);

// Update with validation
await User.update(
  { email: 'invalid' },
  {
    where: { id: 1 },
    validate: true, // Run model validations (default: true)
  }
);
```

> **LEGACY GOTCHA**: `Model.update()` does NOT run hooks by default. Use `{ individualHooks: true }` if you need hooks:

```typescript
await User.update(
  { status: 'inactive' },
  {
    where: { lastLoginAt: { [Op.lt]: thirtyDaysAgo } },
    individualHooks: true, // Runs beforeUpdate/afterUpdate for each
  }
);
```

### upsert()

Insert or update based on primary/unique key:

```typescript
// Creates if not exists, updates if exists
const [user, created] = await User.upsert({
  email: 'john@example.com', // Unique key
  name: 'John Updated',
  lastLoginAt: new Date(),
});

// created = true if inserted, false if updated (PostgreSQL only)
// For MySQL, created is always null
```

---

## Delete Operations

### Instance destroy()

Delete a fetched instance:

```typescript
const user = await User.findByPk(1);

if (user) {
  await user.destroy();
  console.log('User deleted');
}

// With soft delete (paranoid: true)
// Doesn't actually delete, sets deletedAt
await user.destroy();

// Force delete even with paranoid
await user.destroy({ force: true });
```

### Model.destroy() (Static)

Delete multiple records without fetching:

```typescript
// Delete all matching
const deletedCount = await User.destroy({
  where: { isActive: false },
});

console.log(`Deleted ${deletedCount} inactive users`);

// Delete all (dangerous!)
await User.destroy({
  where: {}, // Empty where = all records
  truncate: true, // TRUNCATE instead of DELETE
});

// With soft delete model
await User.destroy({
  where: { status: 'banned' },
  force: true, // Actually delete, not soft delete
});
```

### Restore (Soft Delete)

For models with `paranoid: true`:

```typescript
@Table({ tableName: 'users', paranoid: true })
export class User extends Model {
  @DeletedAt
  deletedAt?: Date;
}

// Soft delete
await user.destroy();
console.log(user.deletedAt); // Now has timestamp

// Restore
await user.restore();
console.log(user.deletedAt); // null

// Find includes soft-deleted by default: NO
const users = await User.findAll(); // Excludes deleted

// Include soft-deleted
const allUsers = await User.findAll({ paranoid: false });

// Only soft-deleted
const deletedUsers = await User.findAll({
  where: { deletedAt: { [Op.not]: null } },
  paranoid: false,
});
```

---

## Bulk Operations

### bulkCreate()

Insert multiple records efficiently:

```typescript
const users = await User.bulkCreate([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]);

// Returns array of created instances
console.log(users[0].id);

// With validation (off by default for performance)
await User.bulkCreate(users, {
  validate: true, // Run validations
});

// Ignore duplicates (MySQL/PostgreSQL)
await User.bulkCreate(users, {
  ignoreDuplicates: true,
});

// Update on conflict (upsert)
await User.bulkCreate(
  [
    { email: 'john@example.com', name: 'John Updated' },
  ],
  {
    updateOnDuplicate: ['name'], // Update these columns if exists
  }
);

// With individual hooks (slower)
await User.bulkCreate(users, {
  individualHooks: true,
});

// Specify fields to insert
await User.bulkCreate(users, {
  fields: ['name', 'email'], // Only insert these fields
});
```

### Bulk update and delete

```typescript
// Bulk update
await User.update(
  { isActive: false },
  {
    where: {
      lastLoginAt: { [Op.lt]: new Date('2023-01-01') },
    },
  }
);

// Bulk delete
await User.destroy({
  where: {
    createdAt: { [Op.lt]: new Date('2020-01-01') },
  },
});
```

---

## Query Options

### Complete Options Reference

```typescript
const users = await User.findAll({
  // Filtering
  where: {
    isActive: true,
    role: { [Op.in]: ['admin', 'moderator'] },
  },

  // Column selection
  attributes: ['id', 'name', 'email'],
  // or
  attributes: { exclude: ['password'] },
  // or with aliases
  attributes: [
    'id',
    [Sequelize.fn('UPPER', Sequelize.col('name')), 'upperName'],
  ],

  // Ordering
  order: [
    ['createdAt', 'DESC'],
    ['name', 'ASC'],
    [Sequelize.fn('LOWER', Sequelize.col('email')), 'ASC'],
  ],

  // Pagination
  limit: 10,
  offset: 0,

  // Grouping
  group: ['status'],

  // Associations (eager loading)
  include: [
    { model: Post, as: 'posts' },
    { model: Profile, as: 'profile' },
  ],

  // Return plain objects
  raw: true,

  // Subquery for limit/offset with includes
  subQuery: false,

  // Locking (transactions)
  lock: Transaction.LOCK.UPDATE,

  // Paranoid (soft delete)
  paranoid: false, // Include soft-deleted

  // Logging
  logging: console.log, // Log this query
  benchmark: true, // Log execution time

  // Hooks
  hooks: true, // Run hooks (default: true)
});
```

---

## Operators Reference

Import operators for complex conditions:

```typescript
import { Op } from 'sequelize';
```

### Comparison Operators

```typescript
// Equals
where: { status: 'active' }
where: { status: { [Op.eq]: 'active' } }

// Not equals
where: { status: { [Op.ne]: 'banned' } }

// Greater/Less than
where: { age: { [Op.gt]: 18 } }      // >
where: { age: { [Op.gte]: 18 } }     // >=
where: { age: { [Op.lt]: 65 } }      // <
where: { age: { [Op.lte]: 65 } }     // <=

// Between
where: { age: { [Op.between]: [18, 65] } }
where: { age: { [Op.notBetween]: [18, 65] } }
```

### String Operators

```typescript
// LIKE
where: { name: { [Op.like]: '%John%' } }
where: { name: { [Op.notLike]: '%test%' } }

// Case-insensitive LIKE (PostgreSQL)
where: { name: { [Op.iLike]: '%john%' } }

// Starts with / Ends with
where: { email: { [Op.startsWith]: 'admin' } }
where: { email: { [Op.endsWith]: '@gmail.com' } }

// Contains substring
where: { bio: { [Op.substring]: 'developer' } }

// Regex (PostgreSQL/MySQL)
where: { email: { [Op.regexp]: '^[a-z]+@' } }
where: { email: { [Op.notRegexp]: '^test' } }
```

### Array Operators

```typescript
// IN
where: { status: { [Op.in]: ['active', 'pending'] } }
where: { status: { [Op.notIn]: ['banned', 'deleted'] } }

// PostgreSQL array operators
where: { tags: { [Op.contains]: ['javascript'] } }
where: { tags: { [Op.contained]: ['js', 'ts', 'node'] } }
where: { tags: { [Op.overlap]: ['frontend', 'backend'] } }
```

### Null Operators

```typescript
// IS NULL
where: { deletedAt: { [Op.is]: null } }

// IS NOT NULL
where: { deletedAt: { [Op.not]: null } }
// or
where: { deletedAt: { [Op.ne]: null } }
```

### Logical Operators

```typescript
// AND (implicit)
where: {
  isActive: true,
  role: 'admin',
}

// AND (explicit)
where: {
  [Op.and]: [
    { isActive: true },
    { role: 'admin' },
  ],
}

// OR
where: {
  [Op.or]: [
    { role: 'admin' },
    { role: 'moderator' },
  ],
}

// NOT
where: {
  [Op.not]: {
    status: 'banned',
  },
}

// Complex nested conditions
where: {
  [Op.and]: [
    { isActive: true },
    {
      [Op.or]: [
        { role: 'admin' },
        { permissions: { [Op.contains]: ['manage_users'] } },
      ],
    },
  ],
}
```

### JSON Operators (PostgreSQL/MySQL 5.7+)

```typescript
// JSON key access
where: {
  'settings.theme': 'dark',
}

// PostgreSQL JSONB operators
where: {
  settings: {
    [Op.contains]: { theme: 'dark' },
  },
}

where: Sequelize.where(
  Sequelize.fn('jsonb_extract_path_text', Sequelize.col('settings'), 'theme'),
  'dark'
)
```

---

## Raw Queries

When Sequelize's query builder isn't enough:

```typescript
import { QueryTypes } from 'sequelize';
import sequelize from './config/database';

// SELECT with model binding
const users = await sequelize.query(
  'SELECT * FROM users WHERE is_active = :active',
  {
    replacements: { active: true },
    type: QueryTypes.SELECT,
    model: User,
    mapToModel: true, // Map results to model instances
  }
);

// SELECT returning plain objects
const results = await sequelize.query(
  'SELECT id, name, email FROM users WHERE role = ?',
  {
    replacements: ['admin'],
    type: QueryTypes.SELECT,
  }
);

// INSERT
await sequelize.query(
  'INSERT INTO logs (message, level) VALUES (:message, :level)',
  {
    replacements: { message: 'User logged in', level: 'info' },
    type: QueryTypes.INSERT,
  }
);

// UPDATE
const [affectedRows] = await sequelize.query(
  'UPDATE users SET last_login = NOW() WHERE id = :id',
  {
    replacements: { id: 1 },
    type: QueryTypes.UPDATE,
  }
);

// DELETE
await sequelize.query(
  'DELETE FROM sessions WHERE expires_at < NOW()',
  { type: QueryTypes.DELETE }
);

// Complex query with JOIN
const results = await sequelize.query(`
  SELECT
    u.id,
    u.name,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as last_post
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.is_active = true
  GROUP BY u.id
  HAVING COUNT(p.id) > 5
  ORDER BY post_count DESC
  LIMIT 10
`, {
  type: QueryTypes.SELECT,
});
```

> **When to use raw queries**:
> - Complex joins not easily expressible with include
> - Database-specific features (PostgreSQL CTEs, window functions)
> - Performance-critical queries needing exact SQL
> - Migrating existing SQL queries

---

## Aggregations

### Built-in Aggregation Methods

```typescript
// Count
const total = await User.count();
const activeCount = await User.count({ where: { isActive: true } });

// Sum
const totalRevenue = await Order.sum('amount');
const userRevenue = await Order.sum('amount', {
  where: { userId: 1 },
});

// Average
const avgPrice = await Product.sum('price') / await Product.count();
// Or use raw query for AVG

// Max/Min
const highestPrice = await Product.max('price');
const lowestPrice = await Product.min('price');
const newest = await User.max('createdAt');
```

### Using Sequelize.fn() for Aggregations

```typescript
import { Sequelize } from 'sequelize';

// COUNT with grouping
const statusCounts = await User.findAll({
  attributes: [
    'status',
    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
  ],
  group: ['status'],
  raw: true,
});
// [{ status: 'active', count: 150 }, { status: 'inactive', count: 25 }]

// SUM with grouping
const salesByCategory = await Order.findAll({
  attributes: [
    'category',
    [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalSales'],
  ],
  group: ['category'],
  order: [[Sequelize.literal('totalSales'), 'DESC']],
  raw: true,
});

// AVG
const avgRating = await Review.findAll({
  attributes: [
    [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
  ],
  where: { productId: 1 },
  raw: true,
});

// DATE functions
const postsByMonth = await Post.findAll({
  attributes: [
    [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'month'],
    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
  ],
  group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at'))],
  order: [[Sequelize.literal('month'), 'ASC']],
  raw: true,
});
```

### HAVING Clause

```typescript
// Find users with more than 10 posts
const prolificAuthors = await User.findAll({
  attributes: [
    'id',
    'name',
    [Sequelize.fn('COUNT', Sequelize.col('posts.id')), 'postCount'],
  ],
  include: [{
    model: Post,
    as: 'posts',
    attributes: [],
  }],
  group: ['User.id'],
  having: Sequelize.where(
    Sequelize.fn('COUNT', Sequelize.col('posts.id')),
    { [Op.gt]: 10 }
  ),
});
```

---

## Laravel/Eloquent Comparison

### Create Operations

```php
// Laravel
$user = User::create([
    'name' => 'John',
    'email' => 'john@example.com',
]);

// Or
$user = new User();
$user->name = 'John';
$user->save();

// firstOrCreate
$user = User::firstOrCreate(
    ['email' => 'john@example.com'],
    ['name' => 'John Doe']
);
```

```typescript
// Sequelize
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
});

// Or
const user = User.build({ name: 'John' });
await user.save();

// findOrCreate
const [user, created] = await User.findOrCreate({
  where: { email: 'john@example.com' },
  defaults: { name: 'John Doe' },
});
```

### Read Operations

```php
// Laravel
$users = User::all();
$user = User::find(1);
$user = User::where('email', 'john@example.com')->first();
$users = User::where('is_active', true)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
$count = User::where('status', 'active')->count();
```

```typescript
// Sequelize
const users = await User.findAll();
const user = await User.findByPk(1);
const user = await User.findOne({ where: { email: 'john@example.com' } });
const users = await User.findAll({
  where: { isActive: true },
  order: [['createdAt', 'DESC']],
  limit: 10,
});
const count = await User.count({ where: { status: 'active' } });
```

### Update Operations

```php
// Laravel
$user = User::find(1);
$user->name = 'Updated';
$user->save();

// Mass update
User::where('status', 'pending')
    ->update(['status' => 'approved']);
```

```typescript
// Sequelize
const user = await User.findByPk(1);
user.name = 'Updated';
await user.save();

// Mass update
await User.update(
  { status: 'approved' },
  { where: { status: 'pending' } }
);
```

### Delete Operations

```php
// Laravel
$user = User::find(1);
$user->delete();

// Mass delete
User::where('is_active', false)->delete();

// Soft delete
$user->delete(); // Sets deleted_at
$user->forceDelete(); // Actually deletes

// Restore
$user->restore();
```

```typescript
// Sequelize
const user = await User.findByPk(1);
await user.destroy();

// Mass delete
await User.destroy({ where: { isActive: false } });

// Soft delete (with paranoid: true)
await user.destroy(); // Sets deletedAt
await user.destroy({ force: true }); // Actually deletes

// Restore
await user.restore();
```

### Operators Comparison

| Laravel | Sequelize |
|---------|-----------|
| `->where('status', 'active')` | `{ where: { status: 'active' } }` |
| `->where('age', '>', 18)` | `{ where: { age: { [Op.gt]: 18 } } }` |
| `->whereIn('role', ['admin', 'mod'])` | `{ where: { role: { [Op.in]: [...] } } }` |
| `->whereLike('name', '%john%')` | `{ where: { name: { [Op.like]: '%john%' } } }` |
| `->whereNull('deleted_at')` | `{ where: { deletedAt: { [Op.is]: null } } }` |
| `->whereRaw('LOWER(email) = ?')` | `Sequelize.where(Sequelize.fn('LOWER'...))` |

---

## Key Takeaways

1. **create() vs build()** - `create()` inserts immediately; `build()` creates an instance for manipulation before `save()`.

2. **findByPk() is most efficient** - For ID lookups, always prefer `findByPk()` over `findOne({ where: { id } })`.

3. **Bulk operations skip hooks** - Add `{ individualHooks: true }` if you need hooks on bulk operations.

4. **Static update/destroy don't fetch** - `Model.update()` and `Model.destroy()` execute SQL directly without loading instances.

5. **Use Op for complex queries** - Import operators from sequelize for comparison, string matching, and logical operations.

6. **Raw queries are an escape hatch** - When the query builder is insufficient, use `sequelize.query()`.

7. **findAndCountAll for pagination** - Returns both data and total count in one query.

---

## What's Next?

In the next phase, we'll explore **Sequelize Relations**:
- One-to-One, One-to-Many, Many-to-Many
- Eager and lazy loading
- Nested includes
- Association configuration
