# Phase 096d: Mongoose Advanced Queries - Quick Reference

## Query Operators

### Comparison Operators

```typescript
// Equality
{ field: value }                    // Implicit $eq
{ field: { $eq: value } }           // Explicit equals
{ field: { $ne: value } }           // Not equals

// Comparison
{ age: { $gt: 18 } }                // Greater than
{ age: { $gte: 18 } }               // Greater than or equal
{ age: { $lt: 65 } }                // Less than
{ age: { $lte: 65 } }               // Less than or equal

// Range
{ price: { $gte: 10, $lte: 100 } }  // Between 10 and 100
```

### Logical Operators

```typescript
// AND (implicit)
{ field1: value1, field2: value2 }

// AND (explicit)
{
  $and: [
    { field1: value1 },
    { field2: value2 }
  ]
}

// OR
{
  $or: [
    { status: 'active' },
    { priority: 'high' }
  ]
}

// NOT
{ age: { $not: { $gt: 65 } } }

// NOR
{
  $nor: [
    { field1: value1 },
    { field2: value2 }
  ]
}
```

### Element Operators

```typescript
// Field existence
{ field: { $exists: true } }        // Field exists
{ field: { $exists: false } }       // Field doesn't exist

// Type checking
{ field: { $type: 'string' } }      // Field is string
{ field: { $type: 'number' } }      // Field is number
{ field: { $type: ['string', 'null'] } }  // Multiple types
```

### Array Operators

```typescript
// Contains value
{ tags: 'javascript' }              // Array contains 'javascript'

// Match any
{ status: { $in: ['active', 'pending'] } }

// Match none
{ status: { $nin: ['deleted', 'archived'] } }

// Match all
{ tags: { $all: ['node', 'express'] } }

// Array size
{ items: { $size: 3 } }             // Exactly 3 elements

// Element match (complex)
{
  items: {
    $elemMatch: {
      quantity: { $gte: 5 },
      price: { $lte: 100 }
    }
  }
}
```

### Array Update Operators

```typescript
// Add to array
{ $push: { tags: 'newTag' } }
{ $push: { tags: { $each: ['tag1', 'tag2'] } } }

// Add unique
{ $addToSet: { tags: 'uniqueTag' } }

// Remove from array
{ $pull: { tags: 'oldTag' } }
{ $pullAll: { tags: ['tag1', 'tag2'] } }

// Remove first/last
{ $pop: { tags: 1 } }               // Remove last
{ $pop: { tags: -1 } }              // Remove first
```

## Aggregation Pipeline

### Pipeline Structure

```typescript
Model.aggregate([
  { $stage1: { ... } },
  { $stage2: { ... } },
  { $stage3: { ... } }
]);
```

### Common Stages

```typescript
// $match - Filter documents
{ $match: { status: 'active', age: { $gte: 18 } } }

// $group - Aggregate data
{
  $group: {
    _id: '$category',
    total: { $sum: '$amount' },
    count: { $sum: 1 },
    avg: { $avg: '$price' }
  }
}

// $project - Select/transform fields
{
  $project: {
    name: 1,
    email: 1,
    _id: 0,
    fullName: { $concat: ['$firstName', ' ', '$lastName'] }
  }
}

// $sort - Order results
{ $sort: { amount: -1 } }           // Descending
{ $sort: { category: 1, price: -1 } }  // Multiple fields

// $limit - Limit results
{ $limit: 10 }

// $skip - Skip documents
{ $skip: 20 }

// $unwind - Deconstruct array
{ $unwind: '$items' }
{ $unwind: { path: '$items', preserveNullAndEmptyArrays: true } }

// $lookup - Join collections
{
  $lookup: {
    from: 'users',
    localField: 'userId',
    foreignField: '_id',
    as: 'userDetails'
  }
}

// $addFields - Add computed fields
{
  $addFields: {
    total: { $multiply: ['$price', '$quantity'] }
  }
}

// $count - Count documents
{ $count: 'totalDocuments' }

// $facet - Multiple pipelines
{
  $facet: {
    categorized: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
    priceStats: [{ $group: { _id: null, avg: { $avg: '$price' } } }]
  }
}
```

### Accumulator Operators

```typescript
{
  $group: {
    _id: '$userId',
    total: { $sum: '$amount' },           // Sum
    avg: { $avg: '$amount' },             // Average
    min: { $min: '$amount' },             // Minimum
    max: { $max: '$amount' },             // Maximum
    first: { $first: '$amount' },         // First value
    last: { $last: '$amount' },           // Last value
    count: { $sum: 1 },                   // Count documents
    values: { $push: '$amount' },         // All values (with duplicates)
    unique: { $addToSet: '$status' },     // Unique values
    stdDev: { $stdDevPop: '$amount' }     // Standard deviation
  }
}
```

### Projection Expressions

```typescript
{
  $project: {
    // Arithmetic
    total: { $add: ['$price', '$tax'] },
    discounted: { $subtract: ['$price', '$discount'] },
    totalPrice: { $multiply: ['$price', '$quantity'] },
    perUnit: { $divide: ['$total', '$quantity'] },
    remainder: { $mod: ['$value', 10] },

    // String
    upper: { $toUpper: '$name' },
    lower: { $toLower: '$name' },
    combined: { $concat: ['$firstName', ' ', '$lastName'] },
    substring: { $substr: ['$text', 0, 10] },
    split: { $split: ['$fullName', ' '] },

    // Array
    itemCount: { $size: '$items' },
    firstItem: { $arrayElemAt: ['$items', 0] },
    lastItem: { $arrayElemAt: ['$items', -1] },
    sliced: { $slice: ['$items', 2] },

    // Date
    year: { $year: '$createdAt' },
    month: { $month: '$createdAt' },
    day: { $dayOfMonth: '$createdAt' },
    hour: { $hour: '$createdAt' },
    formatted: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },

    // Conditional
    category: {
      $cond: {
        if: { $gte: ['$amount', 1000] },
        then: 'high',
        else: 'low'
      }
    },

    // Switch
    tier: {
      $switch: {
        branches: [
          { case: { $gte: ['$score', 90] }, then: 'A' },
          { case: { $gte: ['$score', 80] }, then: 'B' },
          { case: { $gte: ['$score', 70] }, then: 'C' }
        ],
        default: 'F'
      }
    },

    // Type conversion
    stringId: { $toString: '$_id' },
    numericPrice: { $toInt: '$price' },
    decimalValue: { $toDouble: '$value' }
  }
}
```

## Text Search

### Creating Text Index

```typescript
// Schema-level
schema.index({ title: 'text', content: 'text' });

// Model-level
await Model.createIndex({ title: 'text', description: 'text' });

// With weights
schema.index(
  { title: 'text', content: 'text' },
  { weights: { title: 10, content: 5 } }
);
```

### Text Search Queries

```typescript
// Basic search
{ $text: { $search: 'mongodb database' } }

// Exact phrase
{ $text: { $search: '"exact phrase"' } }

// Exclude terms
{ $text: { $search: 'database -sql' } }

// Case sensitive
{ $text: { $search: 'MongoDB', $caseSensitive: true } }

// Language-specific
{ $text: { $search: 'données', $language: 'fr' } }

// With score
Model.find(
  { $text: { $search: 'query' } },
  { score: { $meta: 'textScore' } }
).sort({ score: { $meta: 'textScore' } });
```

## Indexes

### Index Types

```typescript
// Single field
schema.index({ email: 1 });                    // Ascending
schema.index({ price: -1 });                   // Descending

// Compound
schema.index({ category: 1, price: -1 });

// Unique
schema.index({ email: 1 }, { unique: true });

// Sparse (only index documents with field)
schema.index({ phone: 1 }, { sparse: true });

// TTL (auto-delete)
schema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Partial (conditional)
schema.index(
  { amount: 1 },
  {
    partialFilterExpression: {
      status: 'active',
      amount: { $gte: 100 }
    }
  }
);

// Text
schema.index({ title: 'text', content: 'text' });

// Geospatial
schema.index({ location: '2dsphere' });
```

### Index Analysis

```typescript
// Explain query
const explanation = await Model.find({ field: value }).explain('executionStats');

// Key metrics
explanation.executionStats.nReturned          // Docs returned
explanation.executionStats.totalDocsExamined  // Docs scanned
explanation.executionStats.totalKeysExamined  // Index keys scanned
explanation.executionStats.executionTimeMillis // Time in ms

// Check index usage
explanation.executionStages.stage  // 'IXSCAN' (good) or 'COLLSCAN' (bad)
```

## Transactions

### Basic Transaction

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Model1.updateOne({ ... }, { ... }, { session });
  await Model2.create([{ ... }], { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Transaction Options

```typescript
session.startTransaction({
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary'
});
```

## Change Streams

### Basic Change Stream

```typescript
const changeStream = Model.watch();

changeStream.on('change', (change) => {
  console.log(change.operationType);  // 'insert', 'update', 'delete', etc.
  console.log(change.fullDocument);   // The document
  console.log(change.documentKey);    // { _id: ... }
});

changeStream.on('error', (error) => {
  console.error(error);
});
```

### Filtered Change Stream

```typescript
const pipeline = [
  { $match: { 'fullDocument.amount': { $gte: 1000 } } }
];

const changeStream = Model.watch(pipeline, {
  fullDocument: 'updateLookup'  // Include full doc on updates
});
```

### Resume After Disconnect

```typescript
let resumeToken;

const changeStream = Model.watch([],
  resumeToken ? { resumeAfter: resumeToken } : {}
);

changeStream.on('change', (change) => {
  resumeToken = change._id;  // Store resume token
  // Process change
});
```

## Query Performance Tips

### Optimization Patterns

```typescript
// ✅ Use indexes
schema.index({ email: 1 });
Model.find({ email: 'test@example.com' });

// ✅ Select only needed fields
Model.find({ ... }).select('name email');

// ✅ Use lean() for read-only
Model.find({ ... }).lean();  // Returns plain objects (faster)

// ✅ Limit results
Model.find({ ... }).limit(100);

// ✅ Early filtering in aggregation
[
  { $match: { status: 'active' } },  // Filter first
  { $group: { ... } }
]

// ✅ Use allowDiskUse for large aggregations
Model.aggregate([...], { allowDiskUse: true });

// ❌ Avoid $where (JavaScript execution)
{ $where: 'this.price > 100' }  // BAD
{ price: { $gt: 100 } }         // GOOD

// ❌ Avoid large $in arrays
{ category: { $in: hugeArray } }  // BAD

// ❌ Avoid N+1 queries
for (const doc of docs) {
  await Related.findOne({ ... });  // BAD
}
// Use $lookup or batch queries instead
```

### Index Strategy

```
1. Index fields used in queries frequently
2. Create compound indexes for multi-field queries
3. Order compound index fields: equality → sort → range
4. Use partial indexes for subset queries
5. Monitor index usage with explain()
6. Remove unused indexes (they slow writes)
7. Keep total index size < available RAM
```

## Memory Considerations

```
Operation          | Memory Usage
─────────────────────────────────────────
find()             | 16MB per cursor batch
aggregate($match)  | Low (streaming)
aggregate($group)  | High (100MB default)
aggregate($sort)   | High (32MB default)
$lookup            | Medium-High
$push              | High (grows with data)
Text search        | Medium (index scan)
Regex without ^    | High (full scan)

Solutions:
- Use allowDiskUse: true for large aggregations
- Use pagination with limit/skip
- Use lean() to skip Mongoose overhead
- Create appropriate indexes
- Use projection to limit fields
```

## Common Patterns

### Pagination

```typescript
const page = 1;
const limit = 20;

const results = await Model.find({ ... })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

const total = await Model.countDocuments({ ... });

// With aggregation
[
  { $match: { ... } },
  {
    $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ],
      total: [
        { $count: 'count' }
      ]
    }
  }
]
```

### Top N Pattern

```typescript
// Top 10 by amount
await Model.find({ status: 'active' })
  .sort({ amount: -1 })
  .limit(10);

// With aggregation
[
  { $match: { status: 'active' } },
  { $sort: { amount: -1 } },
  { $limit: 10 }
]
```

### Group and Count

```typescript
await Model.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### Date Ranges

```typescript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');

await Model.find({
  createdAt: { $gte: startDate, $lt: endDate }
});

// With aggregation
[
  {
    $match: {
      createdAt: { $gte: startDate, $lt: endDate }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 }
    }
  }
]
```

### Conditional Updates

```typescript
// Increment if exists, set if not
await Model.updateOne(
  { userId: 'user123' },
  {
    $inc: { loginCount: 1 },
    $setOnInsert: { createdAt: new Date() }
  },
  { upsert: true }
);

// Conditional set
await Model.updateOne(
  { _id: id },
  {
    $set: {
      status: 'active',
      updatedAt: new Date()
    },
    $inc: { version: 1 }
  }
);
```

### Bulk Operations

```typescript
const bulkOps = [
  {
    insertOne: {
      document: { name: 'John', age: 30 }
    }
  },
  {
    updateOne: {
      filter: { name: 'Jane' },
      update: { $set: { age: 25 } }
    }
  },
  {
    deleteOne: {
      filter: { name: 'Old' }
    }
  }
];

await Model.bulkWrite(bulkOps);
```

## Geospatial Queries

### Setup

```typescript
const locationSchema = new Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  }
});

locationSchema.index({ location: '2dsphere' });
```

### Queries

```typescript
// Find nearby
await Model.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-73.9667, 40.78]  // [lng, lat]
      },
      $maxDistance: 5000  // meters
    }
  }
});

// Within polygon
await Model.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[
          [-73.9, 40.7],
          [-73.8, 40.7],
          [-73.8, 40.8],
          [-73.9, 40.8],
          [-73.9, 40.7]
        ]]
      }
    }
  }
});

// Within circle
await Model.find({
  location: {
    $geoWithin: {
      $centerSphere: [[-73.9667, 40.78], 5 / 6378.1]  // radius in radians
    }
  }
});
```

## Regex Queries

```typescript
// Case-insensitive match
{ name: { $regex: /john/i } }
{ name: { $regex: 'john', $options: 'i' } }

// Starts with (uses index if exists)
{ name: { $regex: /^John/ } }

// Contains (no index)
{ name: { $regex: /search/ } }

// Ends with (no index)
{ name: { $regex: /smith$/ } }

// Multiple patterns
{
  $or: [
    { name: { $regex: /john/i } },
    { email: { $regex: /john/i } }
  ]
}
```

## Query Operators Reference

```
Comparison: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin
Logical: $and, $or, $not, $nor
Element: $exists, $type
Evaluation: $regex, $text, $where, $expr, $mod
Array: $all, $elemMatch, $size
Bitwise: $bitsAllClear, $bitsAllSet, $bitsAnyClear, $bitsAnySet
Geospatial: $geoWithin, $geoIntersects, $near, $nearSphere
```

## Quick Troubleshooting

```
Issue: Slow queries
→ Check with explain(), add indexes

Issue: High memory usage
→ Use allowDiskUse, limit results, use lean()

Issue: No results returned
→ Check query operators, verify data types

Issue: Transaction fails
→ Ensure replica set, check error labels, implement retry

Issue: Change stream disconnects
→ Store resume token, implement reconnect logic

Issue: Index not being used
→ Check explain(), verify query pattern matches index
```

This summary provides a quick reference for Mongoose advanced queries. Refer to the comprehensive notes for detailed explanations and internal mechanics.
