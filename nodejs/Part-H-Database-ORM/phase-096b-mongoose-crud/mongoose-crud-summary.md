# Phase 096b: Mongoose CRUD - Query Methods Cheatsheet

## Create

```typescript
// Single document with save()
const doc = new Model(data);
await doc.save();

// Single document with create()
const doc = await Model.create(data);

// Multiple documents
const docs = await Model.create([data1, data2, data3]);

// Bulk insert (fastest, no middleware)
const docs = await Model.insertMany([data1, data2, data3]);
```

## Read

```typescript
// Find all
const all = await Model.find();

// Find with filter
const filtered = await Model.find({ status: 'active' });

// Find one
const one = await Model.findOne({ email: 'test@example.com' });

// Find by ID
const byId = await Model.findById('507f1f77bcf86cd799439011');

// Distinct values
const unique = await Model.distinct('category');
```

## Update

```typescript
// Update with save()
const doc = await Model.findById(id);
doc.name = 'New Name';
await doc.save();

// Update one (no document returned)
await Model.updateOne({ _id: id }, { $set: { name: 'New' } });

// Update many
await Model.updateMany({ status: 'draft' }, { $set: { status: 'published' } });

// Find, update, and return document
const doc = await Model.findByIdAndUpdate(
  id,
  { $set: { name: 'New' } },
  { new: true }  // Return updated doc
);

// Upsert (create if not exists)
await Model.findOneAndUpdate(
  { email: 'new@example.com' },
  { $setOnInsert: { name: 'New User' } },
  { upsert: true, new: true }
);
```

## Delete

```typescript
// Delete one
await Model.deleteOne({ _id: id });

// Delete many
await Model.deleteMany({ status: 'archived' });

// Find and delete (returns deleted doc)
const deleted = await Model.findByIdAndDelete(id);
const deleted = await Model.findOneAndDelete({ email: 'test@example.com' });
```

---

## Query Operators

### Comparison

| Operator | Example | Description |
|----------|---------|-------------|
| `$eq` | `{ age: { $eq: 30 } }` | Equal (default) |
| `$ne` | `{ role: { $ne: 'admin' } }` | Not equal |
| `$gt` | `{ age: { $gt: 18 } }` | Greater than |
| `$gte` | `{ age: { $gte: 18 } }` | Greater than or equal |
| `$lt` | `{ age: { $lt: 65 } }` | Less than |
| `$lte` | `{ age: { $lte: 65 } }` | Less than or equal |
| `$in` | `{ role: { $in: ['admin', 'mod'] } }` | In array |
| `$nin` | `{ role: { $nin: ['banned'] } }` | Not in array |

### Logical

| Operator | Example | Description |
|----------|---------|-------------|
| `$and` | `{ $and: [{...}, {...}] }` | All conditions |
| `$or` | `{ $or: [{...}, {...}] }` | Any condition |
| `$not` | `{ age: { $not: { $lt: 18 } } }` | Negate condition |
| `$nor` | `{ $nor: [{...}, {...}] }` | Neither condition |

### Element

| Operator | Example | Description |
|----------|---------|-------------|
| `$exists` | `{ avatar: { $exists: true } }` | Field exists |
| `$type` | `{ age: { $type: 'number' } }` | Field type |

### Array

| Operator | Example | Description |
|----------|---------|-------------|
| `$all` | `{ tags: { $all: ['a', 'b'] } }` | Contains all |
| `$size` | `{ tags: { $size: 3 } }` | Array length |
| `$elemMatch` | `{ items: { $elemMatch: {...} } }` | Match element |

---

## Update Operators

### Field

| Operator | Example | Description |
|----------|---------|-------------|
| `$set` | `{ $set: { name: 'New' } }` | Set value |
| `$unset` | `{ $unset: { temp: '' } }` | Remove field |
| `$inc` | `{ $inc: { count: 1 } }` | Increment |
| `$mul` | `{ $mul: { price: 1.1 } }` | Multiply |
| `$min` | `{ $min: { low: 50 } }` | Set if lower |
| `$max` | `{ $max: { high: 100 } }` | Set if higher |
| `$rename` | `{ $rename: { old: 'new' } }` | Rename field |
| `$currentDate` | `{ $currentDate: { updated: true } }` | Set to now |

### Array

| Operator | Example | Description |
|----------|---------|-------------|
| `$push` | `{ $push: { tags: 'new' } }` | Add to array |
| `$addToSet` | `{ $addToSet: { tags: 'unique' } }` | Add if not exists |
| `$pull` | `{ $pull: { tags: 'old' } }` | Remove matches |
| `$pop` | `{ $pop: { tags: 1 } }` | Remove last (1) or first (-1) |
| `$` | `{ $set: { 'items.$.qty': 5 } }` | Update matched element |
| `$[]` | `{ $inc: { 'scores.$[]': 10 } }` | Update all elements |

---

## Query Chaining

```typescript
const results = await Model
  .find({ status: 'active' })    // Filter
  .where('age').gte(18)          // Additional filter
  .select('name email -_id')     // Select fields
  .sort({ createdAt: -1 })       // Sort (descending)
  .skip(20)                      // Skip for pagination
  .limit(10)                     // Limit results
  .populate('author')            // Populate refs
  .lean();                       // Plain objects
```

## Select Fields

```typescript
// Include fields
.select('name email')
.select({ name: 1, email: 1 })

// Exclude fields
.select('-password -__v')
.select({ password: 0 })

// Include normally excluded
.select('+password')
```

## Sort

```typescript
// String syntax
.sort('name')           // Ascending
.sort('-createdAt')     // Descending
.sort('-date name')     // Multiple

// Object syntax
.sort({ createdAt: -1 })
.sort({ role: 1, name: 1 })
```

## Pagination

```typescript
const page = 2;
const limit = 10;
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  Model.find(filter).skip(skip).limit(limit),
  Model.countDocuments(filter)
]);

const pages = Math.ceil(total / limit);
```

## Count & Exists

```typescript
// Count matching documents
const count = await Model.countDocuments({ status: 'active' });

// Fast approximate count (no filter)
const estimated = await Model.estimatedDocumentCount();

// Check existence
const exists = await Model.exists({ email: 'test@example.com' });
if (exists) console.log('Found:', exists._id);
```

## Lean Queries

```typescript
// Regular: Mongoose documents (with methods)
const docs = await Model.find();

// Lean: Plain objects (faster, no methods)
const objects = await Model.find().lean();
```

## findByIdAndUpdate Options

```typescript
const updated = await Model.findByIdAndUpdate(id, update, {
  new: true,           // Return updated doc (default: false)
  runValidators: true, // Run schema validators
  upsert: false,       // Create if not exists
  select: 'name email', // Select fields
  lean: true           // Return plain object
});
```
