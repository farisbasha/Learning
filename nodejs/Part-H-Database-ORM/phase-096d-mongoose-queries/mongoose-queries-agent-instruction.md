# Phase 096d: Mongoose Advanced Queries
## Agent Instructions

**Phase**: 096d | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Query operators: $eq, $ne, $gt, $lt, $in, $nin
2. Logical operators: $and, $or, $not
3. Array operators: $push, $pull, $addToSet
4. Aggregation pipeline
5. $match, $group, $project, $sort
6. $lookup for joins
7. Text search
8. Indexes
9. Transactions
10. Change streams (real-time)

## Example
```typescript
// Complex query
const users = await User.find({
    $and: [
        { age: { $gte: 18, $lte: 65 } },
        { $or: [{ role: 'admin' }, { role: 'moderator' }] }
    ]
});

// Aggregation
const stats = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 10 }
]);

// Text search
await User.createIndex({ name: 'text', bio: 'text' });
const results = await User.find({ $text: { $search: 'developer' } });
```

## Content Instructions
**Notes**: Mongoose advanced querying and aggregation
**Summary**: Query operators reference
