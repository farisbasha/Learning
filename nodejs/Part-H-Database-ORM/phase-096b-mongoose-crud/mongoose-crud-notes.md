# Phase 096b: Mongoose CRUD Operations

## Table of Contents
1. [Create Operations](#create-operations)
2. [Read Operations](#read-operations)
3. [Update Operations](#update-operations)
4. [Delete Operations](#delete-operations)
5. [Query Building](#query-building)
6. [Lean Queries](#lean-queries)
7. [Field Selection](#field-selection)
8. [Sorting, Pagination, and Limiting](#sorting-pagination-and-limiting)
9. [Count and Exists](#count-and-exists)

---

## CRUD Overview

```
┌─────────────────────────────────────────────────────────┐
│                 MONGOOSE CRUD METHODS                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CREATE                                                 │
│  ├── new Model() + save()  → Single document            │
│  ├── Model.create()        → Single or bulk             │
│  └── Model.insertMany()    → Bulk insert                │
│                                                         │
│  READ                                                   │
│  ├── Model.find()          → Array of documents         │
│  ├── Model.findOne()       → Single document or null    │
│  ├── Model.findById()      → By _id field               │
│  └── Model.distinct()      → Unique values              │
│                                                         │
│  UPDATE                                                 │
│  ├── doc.save()            → Save modified document     │
│  ├── Model.updateOne()     → Update first match         │
│  ├── Model.updateMany()    → Update all matches         │
│  ├── Model.findByIdAndUpdate() → Find, update, return   │
│  └── Model.findOneAndUpdate()  → Find, update, return   │
│                                                         │
│  DELETE                                                 │
│  ├── doc.deleteOne()       → Delete document instance   │
│  ├── Model.deleteOne()     → Delete first match         │
│  ├── Model.deleteMany()    → Delete all matches         │
│  ├── Model.findByIdAndDelete() → Find and delete        │
│  └── Model.findOneAndDelete()  → Find and delete        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Create Operations

### Using new Model() + save()

```typescript
import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IUser {
  name: string;
  email: string;
  age?: number;
  role: 'user' | 'admin';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tags: [String]
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

// ═══════════════════════════════════════════════════════
// CREATE WITH new Model() + save()
// ═══════════════════════════════════════════════════════

// Step 1: Create instance (not saved yet)
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  tags: ['developer', 'nodejs']
});

// Instance exists in memory but not in database
console.log(user._id);        // ObjectId already assigned
console.log(user.isNew);      // true - not saved yet

// Step 2: Save to database (triggers validation and middleware)
await user.save();

console.log(user.isNew);      // false - now saved
console.log(user.createdAt);  // Date - set by timestamps

// ═══════════════════════════════════════════════════════
// ADVANTAGES OF new + save()
// ═══════════════════════════════════════════════════════

// 1. Modify before saving
const user2 = new User({ name: 'Jane', email: 'jane@example.com' });
user2.tags.push('designer');  // Modify before save
user2.age = 25;
await user2.save();

// 2. Access _id before save (useful for relationships)
const post = new Post({ title: 'Hello' });
const comment = new Comment({
  text: 'Great post!',
  post: post._id  // Reference before post is saved
});
await post.save();
await comment.save();

// 3. Conditional save
const user3 = new User({ name: 'Bob', email: 'bob@example.com' });
if (someCondition) {
  await user3.save();
}

// 4. Try-catch for save-specific errors
try {
  await user.save();
} catch (error) {
  if (error.code === 11000) {
    console.log('Duplicate email');
  }
}
```

### Using Model.create()

```typescript
// ═══════════════════════════════════════════════════════
// CREATE WITH Model.create() - Single document
// ═══════════════════════════════════════════════════════

// Create and save in one step
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Returns the saved document with _id and timestamps
console.log(user._id);        // ObjectId
console.log(user.createdAt);  // Date

// ═══════════════════════════════════════════════════════
// CREATE MULTIPLE DOCUMENTS
// ═══════════════════════════════════════════════════════

// Pass an array to create multiple documents
const users = await User.create([
  { name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]);

console.log(users.length);  // 3
console.log(users[0].name); // 'Alice'

// ═══════════════════════════════════════════════════════
// CREATE WITH OPTIONS
// ═══════════════════════════════════════════════════════

// With ordered option for bulk insert
const result = await User.create(
  [
    { name: 'User1', email: 'user1@example.com' },
    { name: 'User2', email: 'user2@example.com' }
  ],
  { ordered: false }  // Continue on error (don't stop at first failure)
);

// With validateBeforeSave option
const user2 = await User.create(
  { name: 'Test', email: 'test@example.com' },
  { validateBeforeSave: true }  // Default is true
);
```

### Using Model.insertMany()

```typescript
// ═══════════════════════════════════════════════════════
// BULK INSERT WITH insertMany() - Most efficient for bulk
// ═══════════════════════════════════════════════════════

const docs = [
  { name: 'User1', email: 'user1@example.com' },
  { name: 'User2', email: 'user2@example.com' },
  { name: 'User3', email: 'user3@example.com' },
  { name: 'User4', email: 'user4@example.com' },
  { name: 'User5', email: 'user5@example.com' }
];

// Insert all documents in a single database operation
const inserted = await User.insertMany(docs);

console.log(inserted.length);  // 5

// ═══════════════════════════════════════════════════════
// insertMany() OPTIONS
// ═══════════════════════════════════════════════════════

// ordered: false - Continue inserting after errors
const result = await User.insertMany(docs, {
  ordered: false,  // Insert all valid docs, skip failures
  rawResult: true  // Return raw MongoDB result
});

// Lean insert (skip Mongoose document creation)
const result2 = await User.insertMany(docs, {
  lean: true  // Returns plain objects, not Mongoose documents
});

// ═══════════════════════════════════════════════════════
// COMPARISON: create() vs insertMany()
// ═══════════════════════════════════════════════════════
/*
┌─────────────────────┬─────────────────────────────────────┐
│     create()        │         insertMany()                │
├─────────────────────┼─────────────────────────────────────┤
│ Runs save middleware│ Does NOT run save middleware        │
│ Validates each doc  │ Validates all docs before insert    │
│ Multiple DB calls   │ Single DB call (bulk operation)     │
│ Slower for bulk     │ Faster for bulk operations          │
│ Returns Mongoose doc│ Returns Mongoose docs (or lean)     │
└─────────────────────┴─────────────────────────────────────┘
*/

// If you need middleware, use create()
// If you need performance for bulk, use insertMany()
```

---

## Read Operations

### Model.find()

```typescript
// ═══════════════════════════════════════════════════════
// FIND ALL - Model.find()
// ═══════════════════════════════════════════════════════

// Find all documents
const allUsers = await User.find();

// Find with filter
const activeUsers = await User.find({ isActive: true });

// Find with multiple conditions (AND)
const adminUsers = await User.find({
  role: 'admin',
  isActive: true
});

// ═══════════════════════════════════════════════════════
// COMPARISON OPERATORS
// ═══════════════════════════════════════════════════════

// $eq - Equal (default)
const users = await User.find({ age: 30 });
const users2 = await User.find({ age: { $eq: 30 } }); // Same as above

// $ne - Not equal
const nonAdmins = await User.find({ role: { $ne: 'admin' } });

// $gt, $gte - Greater than, greater than or equal
const adults = await User.find({ age: { $gte: 18 } });

// $lt, $lte - Less than, less than or equal
const young = await User.find({ age: { $lt: 30 } });

// $in - Matches any value in array
const specificUsers = await User.find({
  role: { $in: ['admin', 'moderator'] }
});

// $nin - Not in array
const regularUsers = await User.find({
  role: { $nin: ['admin', 'moderator'] }
});

// Combined range
const ageRange = await User.find({
  age: { $gte: 18, $lte: 65 }
});

// ═══════════════════════════════════════════════════════
// LOGICAL OPERATORS
// ═══════════════════════════════════════════════════════

// $and - All conditions must match
const result = await User.find({
  $and: [
    { age: { $gte: 18 } },
    { role: 'user' }
  ]
});

// Implicit AND (same as above)
const result2 = await User.find({
  age: { $gte: 18 },
  role: 'user'
});

// $or - At least one condition matches
const adminsOrMods = await User.find({
  $or: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
});

// $not - Inverts condition
const notYoung = await User.find({
  age: { $not: { $lt: 18 } }
});

// $nor - None of the conditions match
const neither = await User.find({
  $nor: [
    { role: 'admin' },
    { age: { $lt: 18 } }
  ]
});

// ═══════════════════════════════════════════════════════
// STRING MATCHING
// ═══════════════════════════════════════════════════════

// Regex matching
const johns = await User.find({
  name: /^john/i  // Starts with 'john', case-insensitive
});

// $regex operator
const containsJs = await User.find({
  name: { $regex: 'js', $options: 'i' }
});

// ═══════════════════════════════════════════════════════
// ARRAY QUERIES
// ═══════════════════════════════════════════════════════

// Contains element
const nodeDevs = await User.find({
  tags: 'nodejs'  // tags array contains 'nodejs'
});

// Contains all elements
const fullStack = await User.find({
  tags: { $all: ['nodejs', 'react'] }  // Must have both
});

// Array size
const threeTags = await User.find({
  tags: { $size: 3 }  // Exactly 3 tags
});

// $elemMatch - Match element with multiple conditions
const orders = await Order.find({
  items: {
    $elemMatch: {
      product: productId,
      quantity: { $gte: 2 }
    }
  }
});

// ═══════════════════════════════════════════════════════
// FIELD EXISTENCE
// ═══════════════════════════════════════════════════════

// Field exists
const hasAvatar = await User.find({
  'profile.avatar': { $exists: true }
});

// Field is null
const noAge = await User.find({
  age: null  // Field is null or doesn't exist
});

// Field exists and is not null
const hasAge = await User.find({
  age: { $exists: true, $ne: null }
});
```

### Model.findOne() and Model.findById()

```typescript
// ═══════════════════════════════════════════════════════
// FIND ONE - Returns single document or null
// ═══════════════════════════════════════════════════════

// Find first matching document
const user = await User.findOne({ email: 'john@example.com' });

if (user) {
  console.log(user.name);
} else {
  console.log('User not found');
}

// With multiple conditions
const admin = await User.findOne({
  role: 'admin',
  isActive: true
});

// ═══════════════════════════════════════════════════════
// FIND BY ID - Shorthand for findOne({ _id: id })
// ═══════════════════════════════════════════════════════

// With string ID (automatically cast to ObjectId)
const user1 = await User.findById('507f1f77bcf86cd799439011');

// With ObjectId
const user2 = await User.findById(new Types.ObjectId('507f1f77bcf86cd799439011'));

// Returns null if not found or invalid ID
const notFound = await User.findById('invalid-id');  // Returns null

// ═══════════════════════════════════════════════════════
// TYPE-SAFE PATTERN
// ═══════════════════════════════════════════════════════

async function getUser(id: string): Promise<IUser | null> {
  // Validate ObjectId format first
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id);
  return user;
}

// With error handling
async function getUserOrThrow(id: string): Promise<IUser> {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid user ID format');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
```

### Model.distinct()

```typescript
// ═══════════════════════════════════════════════════════
// DISTINCT - Get unique values for a field
// ═══════════════════════════════════════════════════════

// All unique roles
const roles = await User.distinct('role');
// ['user', 'admin', 'moderator']

// Unique values with filter
const activeTags = await User.distinct('tags', { isActive: true });

// Unique nested field values
const countries = await User.distinct('address.country');
```

---

## Update Operations

### Document save() for Updates

```typescript
// ═══════════════════════════════════════════════════════
// UPDATE WITH save() - Recommended for single doc updates
// ═══════════════════════════════════════════════════════

// Fetch, modify, save
const user = await User.findById(userId);

if (user) {
  // Modify document
  user.name = 'Jane Doe';
  user.age = 31;
  user.tags.push('typescript');

  // Save changes (triggers validation and middleware)
  await user.save();
}

// ═══════════════════════════════════════════════════════
// ADVANTAGES OF save()
// ═══════════════════════════════════════════════════════

// 1. Runs all validators
// 2. Runs pre/post save middleware
// 3. Updates only changed fields (uses $set internally)
// 4. Handles versioning (__v) for optimistic concurrency
// 5. Returns the updated document

// Check what was modified
console.log(user.isModified('name'));     // false (after save)
console.log(user.modifiedPaths());        // []

// Before save, you can check modifications
const user2 = await User.findById(userId);
user2.email = 'newemail@example.com';
console.log(user2.isModified('email'));   // true
console.log(user2.isModified('name'));    // false
```

### Model.updateOne() and Model.updateMany()

```typescript
// ═══════════════════════════════════════════════════════
// updateOne() - Update first matching document
// ═══════════════════════════════════════════════════════

// Basic update
const result = await User.updateOne(
  { email: 'john@example.com' },  // Filter
  { $set: { name: 'John Updated' } }  // Update
);

console.log(result.matchedCount);   // 1 - Found one match
console.log(result.modifiedCount);  // 1 - Modified one document
console.log(result.acknowledged);   // true

// ═══════════════════════════════════════════════════════
// updateMany() - Update all matching documents
// ═══════════════════════════════════════════════════════

// Update all inactive users
const result2 = await User.updateMany(
  { isActive: false },
  { $set: { status: 'archived' } }
);

console.log(result2.matchedCount);   // Number of matches
console.log(result2.modifiedCount);  // Number modified

// ═══════════════════════════════════════════════════════
// UPDATE OPERATORS
// ═══════════════════════════════════════════════════════

// $set - Set field values
await User.updateOne(
  { _id: userId },
  { $set: { name: 'New Name', 'profile.bio': 'Updated bio' } }
);

// $unset - Remove fields
await User.updateOne(
  { _id: userId },
  { $unset: { temporaryField: '' } }  // Value doesn't matter
);

// $inc - Increment numeric value
await User.updateOne(
  { _id: userId },
  { $inc: { loginCount: 1, balance: -10 } }  // Decrement with negative
);

// $mul - Multiply numeric value
await Product.updateOne(
  { _id: productId },
  { $mul: { price: 1.1 } }  // Increase by 10%
);

// $min / $max - Update only if new value is less/greater
await User.updateOne(
  { _id: userId },
  { $min: { lowestScore: 50 } }  // Set to 50 only if current > 50
);

// $currentDate - Set to current date
await User.updateOne(
  { _id: userId },
  { $currentDate: { lastModified: true } }
);

// $rename - Rename a field
await User.updateOne(
  { _id: userId },
  { $rename: { 'oldField': 'newField' } }
);

// ═══════════════════════════════════════════════════════
// ARRAY UPDATE OPERATORS
// ═══════════════════════════════════════════════════════

// $push - Add to array
await User.updateOne(
  { _id: userId },
  { $push: { tags: 'newTag' } }
);

// $push with modifiers
await User.updateOne(
  { _id: userId },
  {
    $push: {
      tags: {
        $each: ['tag1', 'tag2'],  // Multiple values
        $position: 0,             // Insert at beginning
        $slice: 10                // Keep only first 10
      }
    }
  }
);

// $addToSet - Add only if not exists
await User.updateOne(
  { _id: userId },
  { $addToSet: { tags: 'uniqueTag' } }
);

// $addToSet with $each
await User.updateOne(
  { _id: userId },
  { $addToSet: { tags: { $each: ['tag1', 'tag2'] } } }
);

// $pull - Remove matching elements
await User.updateOne(
  { _id: userId },
  { $pull: { tags: 'oldTag' } }
);

// $pull with condition
await User.updateOne(
  { _id: userId },
  { $pull: { scores: { $lt: 50 } } }  // Remove scores < 50
);

// $pop - Remove first (-1) or last (1) element
await User.updateOne(
  { _id: userId },
  { $pop: { tags: 1 } }  // Remove last element
);

// $ positional operator - Update specific array element
await User.updateOne(
  { _id: userId, 'items.productId': productId },
  { $set: { 'items.$.quantity': 5 } }
);

// $[] update all array elements
await User.updateOne(
  { _id: userId },
  { $inc: { 'scores.$[]': 10 } }  // Add 10 to all scores
);
```

### findByIdAndUpdate() and findOneAndUpdate()

```typescript
// ═══════════════════════════════════════════════════════
// findByIdAndUpdate() - Find, update, and return document
// ═══════════════════════════════════════════════════════

// Returns OLD document by default
const oldUser = await User.findByIdAndUpdate(
  userId,
  { $set: { name: 'New Name' } }
);
console.log(oldUser.name);  // Still shows old name!

// Return NEW document with { new: true }
const newUser = await User.findByIdAndUpdate(
  userId,
  { $set: { name: 'New Name' } },
  { new: true }  // Return updated document
);
console.log(newUser.name);  // Shows 'New Name'

// ═══════════════════════════════════════════════════════
// OPTIONS
// ═══════════════════════════════════════════════════════

const updated = await User.findByIdAndUpdate(
  userId,
  { $set: { name: 'New Name' } },
  {
    new: true,              // Return updated document
    runValidators: true,    // Run schema validators
    select: 'name email',   // Select specific fields
    lean: true,             // Return plain object
    timestamps: true,       // Update timestamps (default: true)
    upsert: false          // Don't create if not exists
  }
);

// ═══════════════════════════════════════════════════════
// findOneAndUpdate() - More flexible filter
// ═══════════════════════════════════════════════════════

const user = await User.findOneAndUpdate(
  { email: 'john@example.com', isActive: true },  // Complex filter
  { $set: { lastLogin: new Date() } },
  { new: true }
);

// ═══════════════════════════════════════════════════════
// UPSERT - Create if not exists
// ═══════════════════════════════════════════════════════

const user2 = await User.findOneAndUpdate(
  { email: 'new@example.com' },
  {
    $set: { email: 'new@example.com' },
    $setOnInsert: {
      name: 'New User',
      role: 'user',
      createdAt: new Date()
    }
  },
  {
    upsert: true,  // Create if not found
    new: true      // Return the document
  }
);

// Check if document was created or updated
// result.upsertedCount or check result.upsertedId
```

---

## Delete Operations

```typescript
// ═══════════════════════════════════════════════════════
// deleteOne() - Delete first matching document
// ═══════════════════════════════════════════════════════

const result = await User.deleteOne({ email: 'john@example.com' });
console.log(result.deletedCount);  // 1 or 0

// ═══════════════════════════════════════════════════════
// deleteMany() - Delete all matching documents
// ═══════════════════════════════════════════════════════

const result2 = await User.deleteMany({ isActive: false });
console.log(result2.deletedCount);  // Number of deleted docs

// Delete all documents in collection (careful!)
const result3 = await User.deleteMany({});

// ═══════════════════════════════════════════════════════
// findByIdAndDelete() - Find, delete, and return document
// ═══════════════════════════════════════════════════════

const deletedUser = await User.findByIdAndDelete(userId);

if (deletedUser) {
  console.log('Deleted:', deletedUser.email);
  // Can use the deleted document for logging, cleanup, etc.
}

// ═══════════════════════════════════════════════════════
// findOneAndDelete() - Delete with complex filter
// ═══════════════════════════════════════════════════════

const deleted = await User.findOneAndDelete({
  email: 'john@example.com',
  isActive: false
});

// ═══════════════════════════════════════════════════════
// SOFT DELETE PATTERN
// ═══════════════════════════════════════════════════════

// Instead of actually deleting, mark as deleted
const softDeleteSchema = new Schema({
  name: String,
  email: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
});

// Soft delete function
softDeleteSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// Exclude soft-deleted in queries
softDeleteSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});

softDeleteSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

// Static to find including deleted
softDeleteSchema.statics.findWithDeleted = function(filter = {}) {
  return this.find(filter).setOptions({ includeDeleted: true });
};
```

---

## Query Building

Mongoose queries are chainable, allowing you to build complex queries step by step.

```typescript
// ═══════════════════════════════════════════════════════
// QUERY CHAINING
// ═══════════════════════════════════════════════════════

// Basic chaining
const users = await User
  .find({ isActive: true })
  .where('age').gte(18).lte(65)
  .select('name email age')
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

// ═══════════════════════════════════════════════════════
// where() - Alternative filter syntax
// ═══════════════════════════════════════════════════════

const users2 = await User
  .find()
  .where('role').equals('admin')
  .where('age').gt(21)
  .where('tags').in(['nodejs', 'express']);

// ═══════════════════════════════════════════════════════
// QUERY METHODS
// ═══════════════════════════════════════════════════════

const query = User.find()
  // Comparison
  .where('age').equals(30)
  .where('age').ne(30)
  .where('age').gt(18)
  .where('age').gte(18)
  .where('age').lt(65)
  .where('age').lte(65)
  .where('role').in(['admin', 'mod'])
  .where('role').nin(['banned'])

  // Existence
  .where('profile').exists(true)

  // Array
  .where('tags').all(['a', 'b'])
  .where('tags').size(3)

  // Regex
  .where('name').regex(/john/i)

  // Logical
  .or([{ role: 'admin' }, { age: { $gt: 50 } }])
  .and([{ isActive: true }, { role: 'user' }]);

// ═══════════════════════════════════════════════════════
// BUILDING QUERIES DYNAMICALLY
// ═══════════════════════════════════════════════════════

interface QueryParams {
  role?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

async function searchUsers(params: QueryParams) {
  // Start with base query
  let query = User.find();

  // Add conditions dynamically
  if (params.role) {
    query = query.where('role').equals(params.role);
  }

  if (params.minAge !== undefined) {
    query = query.where('age').gte(params.minAge);
  }

  if (params.maxAge !== undefined) {
    query = query.where('age').lte(params.maxAge);
  }

  if (params.search) {
    query = query.where('name').regex(new RegExp(params.search, 'i'));
  }

  if (params.isActive !== undefined) {
    query = query.where('isActive').equals(params.isActive);
  }

  // Sorting
  if (params.sortBy) {
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    query = query.sort({ [params.sortBy]: sortOrder });
  }

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute and return
  const users = await query.lean();
  const total = await User.countDocuments(query.getFilter());

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Usage
const result = await searchUsers({
  role: 'user',
  minAge: 18,
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20
});
```

---

## Lean Queries

Lean queries return plain JavaScript objects instead of Mongoose documents, improving performance.

```typescript
// ═══════════════════════════════════════════════════════
// LEAN QUERIES - Plain objects for better performance
// ═══════════════════════════════════════════════════════

// Regular query - returns Mongoose documents
const users = await User.find();
console.log(users[0] instanceof mongoose.Document);  // true
console.log(users[0].save);  // Function exists

// Lean query - returns plain objects
const usersLean = await User.find().lean();
console.log(usersLean[0] instanceof mongoose.Document);  // false
console.log(usersLean[0].save);  // undefined - no methods

// ═══════════════════════════════════════════════════════
// WHEN TO USE LEAN
// ═══════════════════════════════════════════════════════
/*
USE LEAN when:
✅ You only need to read data (API responses)
✅ You don't need virtuals, methods, or getters/setters
✅ You want better performance (2-5x faster)
✅ You need to serialize to JSON

DON'T use lean when:
❌ You need to modify and save the document
❌ You need virtuals (unless using lean virtuals plugin)
❌ You need instance methods
❌ You need change tracking
*/

// ═══════════════════════════════════════════════════════
// PERFORMANCE COMPARISON
// ═══════════════════════════════════════════════════════

// Regular query (slower)
// - Creates Mongoose document instances
// - Adds getters, setters, virtuals
// - Enables change tracking
// - Memory overhead per document

// Lean query (faster)
// - Returns plain JavaScript objects
// - No Mongoose overhead
// - No change tracking
// - Lower memory usage

// Example API endpoint
async function getUsers(req, res) {
  // Use lean for read-only operations
  const users = await User
    .find({ isActive: true })
    .select('name email role')
    .lean();  // Returns plain objects for JSON response

  res.json(users);
}

// ═══════════════════════════════════════════════════════
// LEAN WITH VIRTUALS (plugin required)
// ═══════════════════════════════════════════════════════

// Install: npm install mongoose-lean-virtuals
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

userSchema.plugin(mongooseLeanVirtuals);

// Now virtuals work with lean
const users = await User.find().lean({ virtuals: true });
console.log(users[0].fullName);  // Works!

// ═══════════════════════════════════════════════════════
// LEAN WITH GETTERS
// ═══════════════════════════════════════════════════════

// Install: npm install mongoose-lean-getters
import mongooseLeanGetters from 'mongoose-lean-getters';

userSchema.plugin(mongooseLeanGetters);

const users2 = await User.find().lean({ getters: true });
```

---

## Field Selection

Select specific fields to return, improving performance and data security.

```typescript
// ═══════════════════════════════════════════════════════
// SELECT - Include specific fields
// ═══════════════════════════════════════════════════════

// String syntax (space-separated)
const users = await User.find().select('name email');

// Object syntax
const users2 = await User.find().select({ name: 1, email: 1 });

// ═══════════════════════════════════════════════════════
// EXCLUDE - Exclude specific fields
// ═══════════════════════════════════════════════════════

// Exclude with minus prefix
const users3 = await User.find().select('-password -__v');

// Object syntax with 0
const users4 = await User.find().select({ password: 0, __v: 0 });

// ═══════════════════════════════════════════════════════
// MIXED INCLUSION/EXCLUSION (Not allowed!)
// ═══════════════════════════════════════════════════════

// This will throw an error:
// await User.find().select({ name: 1, password: 0 });
// Can't mix inclusion and exclusion (except _id)

// _id is always included unless explicitly excluded
const noId = await User.find().select('name -_id');

// ═══════════════════════════════════════════════════════
// SELECT WITH findById/findOne
// ═══════════════════════════════════════════════════════

const user = await User.findById(id).select('name email profile');

// In options (second parameter)
const user2 = await User.findById(id, 'name email');
const user3 = await User.findById(id, { name: 1, email: 1 });

// ═══════════════════════════════════════════════════════
// INCLUDE EXCLUDED FIELDS
// ═══════════════════════════════════════════════════════

// Schema has password with select: false
const userSchema = new Schema({
  email: String,
  password: { type: String, select: false }
});

// Password not included by default
const user4 = await User.findById(id);
console.log(user4.password);  // undefined

// Explicitly include with + prefix
const user5 = await User.findById(id).select('+password');
console.log(user5.password);  // Now included!

// ═══════════════════════════════════════════════════════
// NESTED FIELD SELECTION
// ═══════════════════════════════════════════════════════

// Select nested fields
const users6 = await User.find().select('name profile.bio profile.avatar');

// Exclude nested fields
const users7 = await User.find().select('-profile.social -profile.bio');
```

---

## Sorting, Pagination, and Limiting

```typescript
// ═══════════════════════════════════════════════════════
// SORT - Order results
// ═══════════════════════════════════════════════════════

// String syntax: field (asc) or -field (desc)
const byName = await User.find().sort('name');           // A-Z
const byNameDesc = await User.find().sort('-name');      // Z-A
const multi = await User.find().sort('-createdAt name'); // Multiple fields

// Object syntax: 1 (asc) or -1 (desc)
const byAge = await User.find().sort({ age: 1 });        // Low to high
const byAgeDesc = await User.find().sort({ age: -1 });   // High to low

// Multiple fields
const sorted = await User.find().sort({
  role: 1,        // First by role (asc)
  createdAt: -1   // Then by date (desc)
});

// ═══════════════════════════════════════════════════════
// LIMIT - Restrict number of results
// ═══════════════════════════════════════════════════════

const first10 = await User.find().limit(10);

// Get the single most recent user
const latest = await User.findOne()
  .sort({ createdAt: -1 })
  .limit(1);

// ═══════════════════════════════════════════════════════
// SKIP - Skip documents (for pagination)
// ═══════════════════════════════════════════════════════

const page2 = await User.find()
  .skip(10)   // Skip first 10
  .limit(10); // Get next 10

// ═══════════════════════════════════════════════════════
// PAGINATION PATTERN
// ═══════════════════════════════════════════════════════

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

async function paginateUsers(
  filter: object = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<IUser>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  // Calculate skip
  const skip = (page - 1) * limit;

  // Build sort object
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1
  };

  // Execute queries in parallel
  const [data, totalCount] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

// Usage
const result = await paginateUsers(
  { isActive: true },
  { page: 2, limit: 20, sortBy: 'name', sortOrder: 'asc' }
);

console.log(result.data);               // Users array
console.log(result.pagination.totalPages);  // Number of pages

// ═══════════════════════════════════════════════════════
// CURSOR-BASED PAGINATION (Better for large datasets)
// ═══════════════════════════════════════════════════════

// Skip-based pagination has performance issues with large offsets
// Cursor-based pagination is more efficient

async function cursorPaginate(
  filter: object = {},
  cursor?: string,
  limit = 10
) {
  // Add cursor condition
  const query = { ...filter };
  if (cursor) {
    query._id = { $gt: new Types.ObjectId(cursor) };
  }

  const data = await User.find(query)
    .sort({ _id: 1 })
    .limit(limit + 1)  // Fetch one extra to check if more exist
    .lean();

  const hasMore = data.length > limit;
  if (hasMore) {
    data.pop();  // Remove the extra document
  }

  const nextCursor = hasMore ? data[data.length - 1]._id.toString() : null;

  return {
    data,
    nextCursor,
    hasMore
  };
}

// Usage
const page1 = await cursorPaginate({}, undefined, 10);
const page2 = await cursorPaginate({}, page1.nextCursor, 10);
```

---

## Count and Exists

```typescript
// ═══════════════════════════════════════════════════════
// countDocuments() - Count matching documents
// ═══════════════════════════════════════════════════════

// Count all
const totalUsers = await User.countDocuments();

// Count with filter
const activeCount = await User.countDocuments({ isActive: true });

// Count with complex filter
const adminCount = await User.countDocuments({
  role: 'admin',
  createdAt: { $gte: new Date('2024-01-01') }
});

// ═══════════════════════════════════════════════════════
// estimatedDocumentCount() - Fast approximate count
// ═══════════════════════════════════════════════════════

// Uses collection metadata (very fast, but no filter)
const estimated = await User.estimatedDocumentCount();

// Use for total counts when exact number isn't critical
// Much faster for large collections

// ═══════════════════════════════════════════════════════
// exists() - Check if document exists
// ═══════════════════════════════════════════════════════

// Returns document _id if exists, null if not
const exists = await User.exists({ email: 'john@example.com' });

if (exists) {
  console.log('User exists with ID:', exists._id);
} else {
  console.log('User not found');
}

// ═══════════════════════════════════════════════════════
// PRACTICAL EXAMPLES
// ═══════════════════════════════════════════════════════

// Check if username is taken
async function isUsernameTaken(username: string): Promise<boolean> {
  const exists = await User.exists({ username });
  return exists !== null;
}

// Get counts for dashboard
async function getDashboardStats() {
  const [total, active, admins, newToday] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    })
  ]);

  return { total, active, admins, newToday };
}

// Check before insert (avoiding unique constraint error)
async function createUserIfNotExists(email: string, data: Partial<IUser>) {
  const exists = await User.exists({ email });

  if (exists) {
    throw new Error('Email already registered');
  }

  return User.create({ ...data, email });
}
```

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────┐
│              MONGOOSE CRUD SUMMARY                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CREATE                                                 │
│  • new Model() + save() - Full middleware, pre-save    │
│  • Model.create() - Quick single/multi, with middleware │
│  • Model.insertMany() - Bulk, fastest, no save hooks   │
│                                                         │
│  READ                                                   │
│  • find() - Array of documents                         │
│  • findOne() - Single document or null                 │
│  • findById() - By _id (most common)                   │
│  • Use .lean() for read-only, better performance       │
│                                                         │
│  UPDATE                                                 │
│  • doc.save() - Best for single doc, runs middleware   │
│  • updateOne/Many() - Direct update, no document       │
│  • findByIdAndUpdate() - Update and return document    │
│  • Use { new: true } to get updated document           │
│                                                         │
│  DELETE                                                 │
│  • deleteOne/Many() - Direct delete                    │
│  • findByIdAndDelete() - Delete and return document    │
│  • Consider soft delete pattern for important data     │
│                                                         │
│  QUERY BUILDING                                         │
│  • Chain methods: find().where().sort().limit()        │
│  • Build queries dynamically for flexible APIs         │
│  • Use select() to limit returned fields               │
│                                                         │
│  PAGINATION                                             │
│  • Skip-based: skip() + limit()                        │
│  • Cursor-based: Better for large datasets             │
│  • Always run count query in parallel                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

In **Phase 096c**, we'll cover relationships:
- References with ObjectId
- Population (like SQL JOINs)
- Embedding vs Referencing
- Virtual populate
