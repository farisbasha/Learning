# Phase 092: Sequelize CRUD - Cheatsheet

> **LEGACY**: Quick reference for Sequelize CRUD operations.

## Create

```typescript
// Insert single record
const user = await User.create({ name: 'John', email: 'john@example.com' });

// Build then save
const user = User.build({ name: 'John' });
user.email = 'john@example.com';
await user.save();

// Find or create
const [user, created] = await User.findOrCreate({
  where: { email: 'john@example.com' },
  defaults: { name: 'John' },
});

// Bulk insert
await User.bulkCreate([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);
```

## Read

```typescript
// All records
const users = await User.findAll();

// With conditions
const users = await User.findAll({
  where: { isActive: true },
  attributes: ['id', 'name', 'email'],
  order: [['createdAt', 'DESC']],
  limit: 10,
  offset: 0,
});

// Single record
const user = await User.findOne({ where: { email: 'john@example.com' } });

// By primary key
const user = await User.findByPk(1);

// With count (pagination)
const { count, rows } = await User.findAndCountAll({
  where: { isActive: true },
  limit: 10,
  offset: 0,
});

// Just count
const total = await User.count({ where: { isActive: true } });
```

## Update

```typescript
// Update instance
const user = await User.findByPk(1);
user.name = 'New Name';
await user.save();

// Update with object
await user.update({ name: 'New Name', email: 'new@example.com' });

// Mass update (no hooks by default!)
const [affectedCount] = await User.update(
  { isActive: false },
  { where: { lastLogin: { [Op.lt]: thirtyDaysAgo } } }
);

// Upsert
const [user, created] = await User.upsert({ email: 'john@example.com', name: 'John' });
```

## Delete

```typescript
// Delete instance
const user = await User.findByPk(1);
await user.destroy();

// Mass delete
const deletedCount = await User.destroy({ where: { isActive: false } });

// Force delete (paranoid models)
await user.destroy({ force: true });

// Restore soft-deleted
await user.restore();
```

## Common Operators

```typescript
import { Op } from 'sequelize';

// Comparison
{ age: { [Op.gt]: 18 } }        // >
{ age: { [Op.gte]: 18 } }       // >=
{ age: { [Op.lt]: 65 } }        // <
{ age: { [Op.lte]: 65 } }       // <=
{ age: { [Op.ne]: 0 } }         // !=
{ age: { [Op.between]: [18, 65] } }

// String
{ name: { [Op.like]: '%john%' } }
{ name: { [Op.iLike]: '%john%' } }  // PostgreSQL case-insensitive
{ email: { [Op.startsWith]: 'admin' } }
{ email: { [Op.endsWith]: '@gmail.com' } }

// Arrays
{ status: { [Op.in]: ['active', 'pending'] } }
{ status: { [Op.notIn]: ['banned'] } }

// Null
{ deletedAt: { [Op.is]: null } }
{ deletedAt: { [Op.not]: null } }

// Logical
{ [Op.or]: [{ role: 'admin' }, { role: 'moderator' }] }
{ [Op.and]: [{ isActive: true }, { isVerified: true }] }
```

## Query Options

```typescript
await User.findAll({
  where: { ... },                    // Conditions
  attributes: ['id', 'name'],        // Select columns
  attributes: { exclude: ['password'] },
  order: [['createdAt', 'DESC']],    // Sorting
  limit: 10,                         // Pagination
  offset: 0,
  include: [{ model: Post }],        // Eager load
  group: ['status'],                 // Grouping
  raw: true,                         // Plain objects
  paranoid: false,                   // Include soft-deleted
});
```

## Aggregations

```typescript
// Built-in
await User.count();
await Order.sum('amount');
await Product.max('price');
await Product.min('price');

// With Sequelize.fn
const stats = await User.findAll({
  attributes: [
    'status',
    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
  ],
  group: ['status'],
  raw: true,
});
```

## Raw Queries

```typescript
import { QueryTypes } from 'sequelize';

const results = await sequelize.query(
  'SELECT * FROM users WHERE is_active = :active',
  {
    replacements: { active: true },
    type: QueryTypes.SELECT,
  }
);
```

## Laravel Eloquent Mapping

| Eloquent | Sequelize |
|----------|-----------|
| `User::all()` | `User.findAll()` |
| `User::find(1)` | `User.findByPk(1)` |
| `User::where(...)->first()` | `User.findOne({ where: {...} })` |
| `User::where(...)->get()` | `User.findAll({ where: {...} })` |
| `User::create([...])` | `User.create({...})` |
| `$user->save()` | `user.save()` |
| `$user->delete()` | `user.destroy()` |
| `User::where(...)->update([...])` | `User.update({...}, { where: {...} })` |
| `User::where(...)->delete()` | `User.destroy({ where: {...} })` |
| `firstOrCreate()` | `findOrCreate()` |
| `updateOrCreate()` | `upsert()` |

## Remember

1. **findByPk() > findOne()** for ID lookups
2. **Bulk ops skip hooks** - use `{ individualHooks: true }`
3. **findAndCountAll()** for pagination
4. **Import Op** for complex where clauses
5. **raw: true** for plain objects instead of instances
