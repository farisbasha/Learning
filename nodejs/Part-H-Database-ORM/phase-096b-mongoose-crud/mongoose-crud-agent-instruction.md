# Phase 096b: Mongoose CRUD
## Agent Instructions

**Phase**: 096b | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Create: `new Model()` + `save()`, `Model.create()`
2. Read: `find()`, `findOne()`, `findById()`
3. Update: `updateOne()`, `updateMany()`, `findByIdAndUpdate()`
4. Delete: `deleteOne()`, `deleteMany()`, `findByIdAndDelete()`
5. Query building with chaining
6. Lean queries for performance
7. Select specific fields
8. Sort, limit, skip
9. Count documents
10. Exists check

## Example
```typescript
// Create
const user = new User({ email: 'test@test.com', password: '123456' });
await user.save();
// or
const user = await User.create({ email: 'test@test.com' });

// Read
const users = await User.find({ email: /@gmail.com$/ })
    .select('email createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

// Update
await User.findByIdAndUpdate(id, { $set: { name: 'New' } }, { new: true });

// Delete
await User.findByIdAndDelete(id);
```

## Content Instructions
**Notes**: Mongoose CRUD operations guide
**Summary**: Mongoose query methods cheatsheet
