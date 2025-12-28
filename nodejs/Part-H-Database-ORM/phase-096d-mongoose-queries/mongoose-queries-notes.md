# Phase 096d: Mongoose Advanced Queries - Comprehensive Notes

## Overview

Mongoose provides powerful querying capabilities that leverage MongoDB's rich query language and aggregation framework. This phase explores advanced querying techniques, from basic operators to complex aggregation pipelines, with deep insights into how MongoDB processes queries internally.

## Why Different Query Methods?

### The Fundamental Difference

**MongoDB vs SQL Query Models:**

```
SQL (Relational):                    MongoDB (Document):
┌──────────────────┐                ┌──────────────────┐
│  SELECT, WHERE   │                │  find(), filter  │
│  JOIN tables     │                │  $lookup docs    │
│  GROUP BY cols   │                │  $group fields   │
│  Rigid schema    │                │  Flexible schema │
└──────────────────┘                └──────────────────┘
```

**WHY MongoDB Uses Operators ($eq, $gt, etc.):**

1. **Schema-less Nature**: Documents can have different structures, operators provide flexible matching
2. **Nested Documents**: Need operators to query deeply nested fields (`{ 'address.city': 'NYC' }`)
3. **Array Handling**: Arrays are first-class citizens, requiring specialized operators ($elemMatch, $all)
4. **BSON Types**: Operators can work with various BSON types (ObjectId, Date, Binary, etc.)

**SQL Equivalent:**
```sql
-- SQL
SELECT * FROM users WHERE age >= 18 AND status = 'active';

-- MongoDB (same logic)
db.users.find({ age: { $gte: 18 }, status: 'active' })
```

### Aggregation Pipeline vs SQL GROUP BY

**WHY Aggregation Pipeline Exists:**

```
SQL Approach (Single Statement):
┌────────────────────────────────────┐
│ SELECT category,                   │
│        COUNT(*) as total,          │
│        AVG(price) as avg_price     │
│ FROM products                      │
│ WHERE status = 'active'            │
│ GROUP BY category                  │
│ HAVING total > 5                   │
│ ORDER BY avg_price DESC            │
└────────────────────────────────────┘

MongoDB Pipeline (Stage-by-Stage):
┌─────────────────────────────────────┐
│ Stage 1: $match (filter)            │
│   { status: 'active' }              │
├─────────────────────────────────────┤
│ Stage 2: $group (aggregate)         │
│   { _id: '$category',               │
│     total: { $sum: 1 },             │
│     avgPrice: { $avg: '$price' } }  │
├─────────────────────────────────────┤
│ Stage 3: $match (HAVING)            │
│   { total: { $gt: 5 } }             │
├─────────────────────────────────────┤
│ Stage 4: $sort (order)              │
│   { avgPrice: -1 }                  │
└─────────────────────────────────────┘
```

**Advantages of Pipeline Approach:**

1. **Composability**: Each stage transforms data, passing results to next stage
2. **Reusability**: Common pipeline stages can be extracted and reused
3. **Readability**: Complex queries broken into understandable steps
4. **Performance**: MongoDB query optimizer can reorder stages
5. **Flexibility**: Can add/remove stages easily without rewriting entire query

## How MongoDB Queries Work Internally

### BSON and Query Processing

**BSON (Binary JSON) Fundamentals:**

```
JSON Document:                        BSON Encoding:
┌──────────────────────┐            ┌──────────────────────────┐
│ {                    │            │ \x16\x00\x00\x00         │ (doc length)
│   name: "John",      │   ───→     │ \x02name\x00             │ (string type)
│   age: 30,           │            │ \x05\x00\x00\x00John\x00 │ (string value)
│   active: true       │            │ \x10age\x00              │ (int32 type)
│ }                    │            │ \x1e\x00\x00\x00         │ (30)
└──────────────────────┘            │ \x08active\x00\x01       │ (bool true)
                                    │ \x00                     │ (doc end)
                                    └──────────────────────────┘
```

**WHY BSON:**

1. **Type Information**: BSON includes type metadata (unlike JSON)
2. **Traversability**: Can skip fields without parsing entire document
3. **Performance**: Binary format = faster parsing than text
4. **Extended Types**: Supports Date, ObjectId, Binary, Regex, etc.

### Query Execution Pipeline

```
User Query → Query Parser → Query Planner → Execution Engine → Results

Query: User.find({ age: { $gte: 18 }, city: 'NYC' })

Step 1: Query Parser
┌─────────────────────────────────────┐
│ Parse query into query tree:       │
│                                     │
│         AND                         │
│        /   \                        │
│      age   city                     │
│      >=18   ='NYC'                  │
└─────────────────────────────────────┘

Step 2: Query Planner
┌─────────────────────────────────────┐
│ Available Indexes:                  │
│ - { age: 1 }                        │
│ - { city: 1, age: 1 }               │
│                                     │
│ Winning Plan:                       │
│ Use compound index (city, age)      │
│ Index scan → Filter                 │
│                                     │
│ Cost: 100 documents examined        │
└─────────────────────────────────────┘

Step 3: Execution
┌─────────────────────────────────────┐
│ 1. Index seek: city = 'NYC'         │
│    → 1000 documents                 │
│ 2. Index filter: age >= 18          │
│    → 800 documents                  │
│ 3. Fetch documents from disk        │
│ 4. Return to client                 │
└─────────────────────────────────────┘
```

**Memory Implications:**

- **Working Set**: MongoDB keeps frequently accessed data in RAM
- **Index Size**: All indexes must fit in RAM for optimal performance
- **Query Results**: Buffered in memory (16MB limit per cursor batch)
- **Aggregation**: $group and $sort stages can consume significant memory (100MB limit per stage)

### Index Types and Performance

**Index Structures:**

```
B-Tree Index (Standard):
                    [50]
                   /    \
              [25]        [75]
             /    \      /    \
         [10,20][30,40][60,70][80,90]
           |     |      |      |
         [docs][docs] [docs] [docs]

Text Index (Inverted):
┌──────────┬──────────────────┐
│ "mongo"  → [doc1, doc3]     │
│ "node"   → [doc1, doc2]     │
│ "express"→ [doc2, doc4]     │
└──────────┴──────────────────┘

Geospatial (2dsphere):
         ┌─────────────┐
         │  ┌───┐      │
         │  │   │ doc1 │
         ├──┼───┼──────┤
         │  │doc│      │
         │  └─2─┘ doc3 │
         └─────────────┘
```

## Query Operators Deep Dive

### Comparison Operators

**$eq, $ne, $gt, $gte, $lt, $lte:**

```typescript
import mongoose, { Schema, model } from 'mongoose';

// Product Schema
interface IProduct {
  name: string;
  price: number;
  stock: number;
  rating: number;
  category: string;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5 },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = model<IProduct>('Product', productSchema);

// Example 1: Exact match ($eq - implicit)
const laptops = await Product.find({ category: 'laptop' });
// Explicit: Product.find({ category: { $eq: 'laptop' } })

// Example 2: Not equal ($ne)
const inStock = await Product.find({ stock: { $ne: 0 } });

// Example 3: Range queries
const affordableProducts = await Product.find({
  price: { $gte: 10, $lte: 100 }
});

// Example 4: Multiple conditions
const premiumInStock = await Product.find({
  price: { $gt: 500 },
  stock: { $gte: 1 },
  rating: { $gte: 4.0 }
});
```

**WHY These Operators:**

- **Type Safety**: MongoDB compares values respecting BSON types
- **Index Optimization**: Range queries can use indexes efficiently
- **Null Handling**: `{ field: null }` matches null or missing fields
- **Performance**: Direct comparison in BSON is faster than regex

**SQL Comparison:**
```sql
-- SQL
SELECT * FROM products
WHERE price >= 10 AND price <= 100;

-- Mongoose
Product.find({ price: { $gte: 10, $lte: 100 } })
```

**Laravel Eloquent Comparison:**
```php
// Laravel Eloquent
Product::where('price', '>=', 10)
       ->where('price', '<=', 100)
       ->get();

// Mongoose (more compact)
Product.find({ price: { $gte: 10, $lte: 100 } })
```

### Logical Operators

**$and, $or, $not, $nor:**

```typescript
// Example 1: $and (implicit)
const result1 = await Product.find({
  category: 'laptop',
  price: { $lt: 1000 }
});
// Implicit AND: both conditions must match

// Example 2: $and (explicit - for same field)
const result2 = await Product.find({
  $and: [
    { price: { $gte: 500 } },
    { price: { $lte: 1000 } }
  ]
});

// Example 3: $or
const electronicsOrBooks = await Product.find({
  $or: [
    { category: 'electronics' },
    { category: 'books' }
  ]
});

// Example 4: Complex combination
const complexQuery = await Product.find({
  $and: [
    {
      $or: [
        { category: 'laptop' },
        { category: 'tablet' }
      ]
    },
    {
      $or: [
        { price: { $lt: 500 } },
        { rating: { $gte: 4.5 } }
      ]
    }
  ]
});

// Example 5: $nor (not or)
const neitherExpensiveNorOutOfStock = await Product.find({
  $nor: [
    { price: { $gt: 1000 } },
    { stock: 0 }
  ]
});

// Example 6: $not
const notExpensive = await Product.find({
  price: { $not: { $gt: 1000 } }
});
```

**Query Execution Flow:**

```
Complex Query: { $and: [{ $or: [A, B] }, { $or: [C, D] }] }

Step 1: Evaluate inner $or conditions
┌──────────────────────────────────┐
│ $or: [A, B]  → Set1: {doc1, doc2}│
│ $or: [C, D]  → Set2: {doc2, doc3}│
└──────────────────────────────────┘

Step 2: Apply $and (intersection)
┌──────────────────────────────────┐
│ Set1 ∩ Set2  → {doc2}            │
└──────────────────────────────────┘
```

**Performance Considerations:**

1. **$or with Index**: Each condition can use different index
2. **$and**: MongoDB can use index intersection
3. **$nor**: Requires full collection scan (no index)
4. **$not**: May prevent index usage

### Element Operators

**$exists, $type:**

```typescript
// Example 1: Check field existence
const withDiscount = await Product.find({
  discount: { $exists: true }
});

const withoutDescription = await Product.find({
  description: { $exists: false }
});

// Example 2: Type checking
interface IFlexibleDoc {
  value: any;
  data: any;
}

const flexSchema = new Schema<IFlexibleDoc>({
  value: Schema.Types.Mixed,
  data: Schema.Types.Mixed
});

const FlexModel = model<IFlexibleDoc>('FlexDoc', flexSchema);

// Find documents where value is a number
const numericValues = await FlexModel.find({
  value: { $type: 'number' }
});

// Find documents where value is a string
const stringValues = await FlexModel.find({
  value: { $type: 'string' }
});

// Multiple types
const numberOrString = await FlexModel.find({
  value: { $type: ['number', 'string'] }
});
```

**BSON Type Numbers:**

```
Type               | Number | Alias
─────────────────────────────────────
Double             | 1      | "double"
String             | 2      | "string"
Object             | 3      | "object"
Array              | 4      | "array"
Binary data        | 5      | "binData"
ObjectId           | 7      | "objectId"
Boolean            | 8      | "bool"
Date               | 9      | "date"
Null               | 10     | "null"
Regular Expression | 11     | "regex"
32-bit integer     | 16     | "int"
64-bit integer     | 18     | "long"
Decimal128         | 19     | "decimal"
```

### Array Operators

**$in, $nin, $all, $elemMatch, $size:**

```typescript
interface IUser {
  username: string;
  roles: string[];
  tags: string[];
  scores: number[];
  achievements: Array<{
    title: string;
    points: number;
    earnedAt: Date;
  }>;
}

const userSchema = new Schema<IUser>({
  username: String,
  roles: [String],
  tags: [String],
  scores: [Number],
  achievements: [{
    title: String,
    points: Number,
    earnedAt: Date
  }]
});

const User = model<IUser>('User', userSchema);

// Example 1: $in (match any value in array)
const adminsOrMods = await User.find({
  roles: { $in: ['admin', 'moderator'] }
});

// Example 2: $nin (match none of the values)
const regularUsers = await User.find({
  roles: { $nin: ['admin', 'moderator', 'superuser'] }
});

// Example 3: $all (match all values)
const expertUsers = await User.find({
  tags: { $all: ['expert', 'verified', 'contributor'] }
});

// Example 4: $elemMatch (complex array element matching)
const topAchievers = await User.find({
  achievements: {
    $elemMatch: {
      points: { $gte: 1000 },
      earnedAt: { $gte: new Date('2024-01-01') }
    }
  }
});

// Example 5: $size (array length)
const threeRoles = await User.find({
  roles: { $size: 3 }
});

// Example 6: Multiple array conditions
const complexArray = await User.find({
  scores: {
    $all: [90, 95],        // Must contain both
    $elemMatch: { $gte: 100 }  // At least one element >= 100
  }
});
```

**Array Query Memory Model:**

```
Document: { tags: ['javascript', 'node', 'mongodb'] }

Query 1: { tags: 'javascript' }
┌──────────────────────────────┐
│ Checks if array contains     │
│ 'javascript' → MATCH         │
└──────────────────────────────┘

Query 2: { tags: { $all: ['node', 'mongodb'] } }
┌──────────────────────────────┐
│ Checks if array contains     │
│ ALL of ['node', 'mongodb']   │
│ → MATCH                      │
└──────────────────────────────┘

Query 3: { tags: { $size: 3 } }
┌──────────────────────────────┐
│ Counts array elements: 3     │
│ → MATCH                      │
│ ⚠️  Cannot use index!        │
└──────────────────────────────┘
```

**Array Update Operators:**

```typescript
// $push - Add element to array
await User.updateOne(
  { username: 'john' },
  { $push: { tags: 'newTag' } }
);

// $push with $each (multiple elements)
await User.updateOne(
  { username: 'john' },
  { $push: { tags: { $each: ['tag1', 'tag2'] } } }
);

// $addToSet - Add only if not exists
await User.updateOne(
  { username: 'john' },
  { $addToSet: { tags: 'uniqueTag' } }
);

// $pull - Remove matching elements
await User.updateOne(
  { username: 'john' },
  { $pull: { tags: 'oldTag' } }
);

// $pop - Remove first or last element
await User.updateOne(
  { username: 'john' },
  { $pop: { tags: 1 } }  // 1 = last, -1 = first
);

// $pullAll - Remove multiple values
await User.updateOne(
  { username: 'john' },
  { $pullAll: { tags: ['tag1', 'tag2'] } }
);
```

## Aggregation Pipeline Deep Dive

### Pipeline Architecture

**HOW Aggregation Works:**

```
Collection → [$stage1] → [$stage2] → [$stage3] → Result

Each Stage:
┌─────────────────────────────────────┐
│ Input: Documents from previous stage│
│ ↓                                   │
│ Process: Transform/filter/group     │
│ ↓                                   │
│ Output: Modified documents          │
│ → Pass to next stage                │
└─────────────────────────────────────┘

Memory Limit per Stage: 100MB (default)
Override: allowDiskUse: true
```

**Internal Processing:**

```
Stage Execution Order (MongoDB Optimizer):

User Pipeline:
[$match] → [$sort] → [$group] → [$limit]

Optimized Pipeline:
[$match] → [$limit] → [$sort] → [$group]
   ↑          ↑          ↑          ↑
   │          │          │          │
Index use  Early     Index    Final
           cutoff     use      result

WHY: Reduce documents early for better performance
```

### $match Stage

```typescript
interface IOrder {
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderId: String,
  userId: String,
  amount: Number,
  status: String,
  items: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

const Order = model<IOrder>('Order', orderSchema);

// Example 1: Basic match
const completedOrders = await Order.aggregate([
  { $match: { status: 'completed' } }
]);

// Example 2: Match with date range
const recentOrders = await Order.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date('2024-01-01'),
        $lt: new Date('2024-12-31')
      }
    }
  }
]);

// Example 3: Complex match conditions
const highValueOrders = await Order.aggregate([
  {
    $match: {
      $and: [
        { amount: { $gte: 1000 } },
        { status: { $in: ['completed', 'pending'] } },
        { 'items.quantity': { $gte: 5 } }
      ]
    }
  }
]);

// Example 4: Match after grouping
const avgOrdersByUser = await Order.aggregate([
  { $group: { _id: '$userId', avgAmount: { $avg: '$amount' } } },
  { $match: { avgAmount: { $gte: 500 } } }  // Filter aggregated results
]);
```

**$match Performance:**

```
Early $match (GOOD):
Collection (1M docs) → $match (10K docs) → $group → Result
                          ↑
                    Uses index

Late $match (BAD):
Collection (1M docs) → $group (100K groups) → $match → Result
                                                  ↑
                                            No index benefit
```

### $group Stage

**HOW $group Works:**

```
Input Documents:
{ userId: 'u1', amount: 100 }
{ userId: 'u2', amount: 200 }
{ userId: 'u1', amount: 150 }

$group: { _id: '$userId', total: { $sum: '$amount' } }

Internal Process:
┌─────────────────────────────────┐
│ Hash Table in Memory:           │
│ ┌─────┬───────────────┐        │
│ │ u1  │ [100, 150]    │→ 250   │
│ │ u2  │ [200]         │→ 200   │
│ └─────┴───────────────┘        │
└─────────────────────────────────┘

Output:
{ _id: 'u1', total: 250 }
{ _id: 'u2', total: 200 }
```

```typescript
// Example 1: Simple grouping with sum
const totalByUser = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      totalSpent: { $sum: '$amount' },
      orderCount: { $sum: 1 }
    }
  }
]);

// Example 2: Multiple accumulator operations
const userStats = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      totalSpent: { $sum: '$amount' },
      avgOrder: { $avg: '$amount' },
      minOrder: { $min: '$amount' },
      maxOrder: { $max: '$amount' },
      orders: { $push: '$orderId' }  // Collect all order IDs
    }
  }
]);

// Example 3: Group by multiple fields
const statusByDate = await Order.aggregate([
  {
    $group: {
      _id: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        status: '$status'
      },
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  }
]);

// Example 4: $push vs $addToSet
const userOrders = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      allStatuses: { $push: '$status' },      // May have duplicates
      uniqueStatuses: { $addToSet: '$status' } // Only unique values
    }
  }
]);

// Example 5: Complex accumulation
const detailedStats = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      orders: {
        $push: {
          orderId: '$orderId',
          amount: '$amount',
          status: '$status'
        }
      },
      totalSpent: { $sum: '$amount' },
      completedCount: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      }
    }
  }
]);
```

**Accumulator Operators:**

```
Operator    | Purpose                  | Memory Impact
──────────────────────────────────────────────────────────
$sum        | Sum values               | Low (single number)
$avg        | Average values           | Low (running average)
$min        | Minimum value            | Low (single value)
$max        | Maximum value            | Low (single value)
$first      | First document value     | Low (single value)
$last       | Last document value      | Low (single value)
$push       | Array of all values      | HIGH (grows with docs)
$addToSet   | Array of unique values   | HIGH (grows with unique)
$stdDevPop  | Population std deviation | Medium (statistical)
$stdDevSamp | Sample std deviation     | Medium (statistical)
```

### $project Stage

**Field Selection and Transformation:**

```typescript
// Example 1: Include/exclude fields
const projected = await Order.aggregate([
  {
    $project: {
      orderId: 1,           // Include
      amount: 1,            // Include
      userId: 1,            // Include
      _id: 0,               // Exclude
      items: 0              // Exclude
    }
  }
]);

// Example 2: Computed fields
const withDiscounts = await Order.aggregate([
  {
    $project: {
      orderId: 1,
      amount: 1,
      discount: { $multiply: ['$amount', 0.1] },
      finalAmount: { $subtract: ['$amount', { $multiply: ['$amount', 0.1] }] }
    }
  }
]);

// Example 3: String operations
const formatted = await Order.aggregate([
  {
    $project: {
      orderNumber: { $toUpper: '$orderId' },
      statusLabel: {
        $concat: ['Status: ', { $toUpper: '$status' }]
      },
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' }
    }
  }
]);

// Example 4: Array operations
const itemsInfo = await Order.aggregate([
  {
    $project: {
      orderId: 1,
      itemCount: { $size: '$items' },
      firstItem: { $arrayElemAt: ['$items', 0] },
      lastItem: { $arrayElemAt: ['$items', -1] },
      productIds: '$items.productId'  // Extract field from array
    }
  }
]);

// Example 5: Conditional projection
const categorized = await Order.aggregate([
  {
    $project: {
      orderId: 1,
      amount: 1,
      category: {
        $cond: {
          if: { $gte: ['$amount', 1000] },
          then: 'high-value',
          else: {
            $cond: {
              if: { $gte: ['$amount', 500] },
              then: 'medium-value',
              else: 'low-value'
            }
          }
        }
      }
    }
  }
]);

// Example 6: $switch for multiple conditions
const statusCategory = await Order.aggregate([
  {
    $project: {
      orderId: 1,
      statusType: {
        $switch: {
          branches: [
            { case: { $eq: ['$status', 'completed'] }, then: 'success' },
            { case: { $eq: ['$status', 'pending'] }, then: 'processing' },
            { case: { $eq: ['$status', 'cancelled'] }, then: 'failed' }
          ],
          default: 'unknown'
        }
      }
    }
  }
]);
```

**Projection Expressions:**

```
Arithmetic: $add, $subtract, $multiply, $divide, $mod
Comparison: $eq, $ne, $gt, $gte, $lt, $lte, $cmp
Logical: $and, $or, $not
String: $concat, $substr, $toUpper, $toLower, $split
Array: $size, $arrayElemAt, $slice, $filter, $map
Date: $year, $month, $dayOfMonth, $hour, $dateToString
Conditional: $cond, $ifNull, $switch
Type: $type, $convert, $toString, $toInt, $toDouble
```

### $sort and $limit

```typescript
// Example 1: Simple sort
const sortedByAmount = await Order.aggregate([
  { $sort: { amount: -1 } }  // -1 = descending, 1 = ascending
]);

// Example 2: Multi-field sort
const multiSort = await Order.aggregate([
  { $sort: { status: 1, amount: -1 } }
  // First by status (asc), then by amount (desc)
]);

// Example 3: Sort with limit (top N pattern)
const top10Orders = await Order.aggregate([
  { $match: { status: 'completed' } },
  { $sort: { amount: -1 } },
  { $limit: 10 }
]);

// Example 4: Skip and limit (pagination)
const page2 = await Order.aggregate([
  { $sort: { createdAt: -1 } },
  { $skip: 20 },   // Skip first 20
  { $limit: 10 }   // Return next 10
]);

// Example 5: Sort after grouping
const topSpenders = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      totalSpent: { $sum: '$amount' }
    }
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 5 }
]);
```

**Sort Performance:**

```
Sort with Index (FAST):
Index: { createdAt: -1 }
Query: db.orders.aggregate([{ $sort: { createdAt: -1 } }])
┌──────────────────────────────┐
│ Index scan (already sorted)  │
│ No in-memory sort needed     │
│ Memory usage: LOW            │
└──────────────────────────────┘

Sort without Index (SLOW):
Query: db.orders.aggregate([{ $sort: { randomField: -1 } }])
┌──────────────────────────────┐
│ Collection scan              │
│ Load all docs into memory    │
│ Sort in memory (32MB limit)  │
│ Memory usage: HIGH           │
└──────────────────────────────┘

Solution: Use allowDiskUse: true for large sorts
```

### $lookup (Joins)

**HOW $lookup Works:**

```
Left Collection (Orders):          Right Collection (Users):
┌──────────────────┐              ┌──────────────────┐
│ _id, userId, ... │              │ _id, name, ...   │
└──────────────────┘              └──────────────────┘
         │                                 │
         └────────── $lookup ──────────────┘
                         ↓
            Joined Result (Nested):
        ┌─────────────────────────────┐
        │ _id, userId, ...,           │
        │ userDetails: {              │
        │   _id, name, ...            │
        │ }                           │
        └─────────────────────────────┘
```

```typescript
interface IUserProfile {
  userId: string;
  name: string;
  email: string;
}

const userProfileSchema = new Schema<IUserProfile>({
  userId: { type: String, unique: true },
  name: String,
  email: String
});

const UserProfile = model<IUserProfile>('UserProfile', userProfileSchema);

// Example 1: Basic lookup
const ordersWithUsers = await Order.aggregate([
  {
    $lookup: {
      from: 'userprofiles',        // Collection name (lowercase plural)
      localField: 'userId',         // Field in orders
      foreignField: 'userId',       // Field in users
      as: 'userDetails'             // Output array field
    }
  }
]);

// Example 2: Unwind lookup result
const ordersWithUser = await Order.aggregate([
  {
    $lookup: {
      from: 'userprofiles',
      localField: 'userId',
      foreignField: 'userId',
      as: 'userDetails'
    }
  },
  { $unwind: '$userDetails' },  // Convert array to object
  {
    $project: {
      orderId: 1,
      amount: 1,
      userName: '$userDetails.name',
      userEmail: '$userDetails.email'
    }
  }
]);

// Example 3: Pipeline lookup (complex join)
const ordersWithUserStats = await Order.aggregate([
  {
    $lookup: {
      from: 'userprofiles',
      let: { user_id: '$userId' },  // Variables to pass to pipeline
      pipeline: [
        { $match: { $expr: { $eq: ['$userId', '$$user_id'] } } },
        { $project: { name: 1, email: 1, _id: 0 } }
      ],
      as: 'user'
    }
  }
]);

// Example 4: Multiple lookups
const enrichedOrders = await Order.aggregate([
  {
    $lookup: {
      from: 'userprofiles',
      localField: 'userId',
      foreignField: 'userId',
      as: 'user'
    }
  },
  { $unwind: '$user' },
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: 'productId',
      as: 'productDetails'
    }
  }
]);

// Example 5: Left outer join with filtering
const ordersWithOptionalUser = await Order.aggregate([
  {
    $lookup: {
      from: 'userprofiles',
      let: { userId: '$userId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
        { $match: { active: true } }  // Additional filter
      ],
      as: 'activeUser'
    }
  },
  {
    $addFields: {
      hasActiveUser: { $gt: [{ $size: '$activeUser' }, 0] }
    }
  }
]);
```

**$lookup Performance:**

```
Memory Model:
┌─────────────────────────────────────┐
│ For each document in left:          │
│   1. Execute query on right         │
│   2. Buffer matching docs           │
│   3. Append to left doc             │
│                                     │
│ Memory = (left docs × right matches)│
└─────────────────────────────────────┘

Optimization:
1. Index foreignField (CRITICAL)
2. Limit left docs with $match first
3. Use pipeline to filter right early
4. Consider denormalization for frequent joins
```

**Comparison with SQL JOIN:**

```sql
-- SQL INNER JOIN
SELECT o.*, u.name, u.email
FROM orders o
INNER JOIN users u ON o.userId = u.userId;

-- Mongoose $lookup equivalent
Order.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: 'userId',
      as: 'user'
    }
  },
  { $unwind: '$user' },
  {
    $project: {
      orderId: 1,
      amount: 1,
      'user.name': 1,
      'user.email': 1
    }
  }
]);
```

**Laravel Eloquent Comparison:**

```php
// Laravel Eloquent (with eager loading)
Order::with('user')->get();

// Mongoose (requires manual $lookup)
Order.aggregate([
  { $lookup: { from: 'users', ... } }
]);

WHY: MongoDB doesn't enforce relationships, requires explicit joins
```

### $unwind

**Array Deconstruction:**

```
Input Document:
{ _id: 1, items: ['a', 'b', 'c'] }

$unwind: '$items'

Output Documents:
{ _id: 1, items: 'a' }
{ _id: 1, items: 'b' }
{ _id: 1, items: 'c' }
```

```typescript
// Example 1: Basic unwind
const unwoundOrders = await Order.aggregate([
  { $unwind: '$items' }
]);
// Each item becomes a separate document

// Example 2: Unwind with preserveNullAndEmptyArrays
const allOrders = await Order.aggregate([
  {
    $unwind: {
      path: '$items',
      preserveNullAndEmptyArrays: true  // Keep orders with no items
    }
  }
]);

// Example 3: Unwind with index
const itemsWithPosition = await Order.aggregate([
  {
    $unwind: {
      path: '$items',
      includeArrayIndex: 'itemPosition'  // Add position (0, 1, 2, ...)
    }
  }
]);

// Example 4: Unwind for aggregation
const productSales = await Order.aggregate([
  { $match: { status: 'completed' } },
  { $unwind: '$items' },
  {
    $group: {
      _id: '$items.productId',
      totalQuantity: { $sum: '$items.quantity' },
      totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);

// Example 5: Multiple unwinds
const nestedUnwind = await Order.aggregate([
  { $unwind: '$items' },
  { $unwind: '$items.variants' },  // If items have variants array
  {
    $group: {
      _id: '$items.variants.sku',
      count: { $sum: 1 }
    }
  }
]);
```

## Text Search

**Full-Text Search Capabilities:**

```typescript
interface IArticle {
  title: string;
  content: string;
  tags: string[];
  author: string;
}

const articleSchema = new Schema<IArticle>({
  title: String,
  content: String,
  tags: [String],
  author: String
});

// Create text index
articleSchema.index({ title: 'text', content: 'text' });

const Article = model<IArticle>('Article', articleSchema);

// Example 1: Basic text search
const results = await Article.find({
  $text: { $search: 'mongodb database' }
});

// Example 2: Text search with score
const scored = await Article
  .find(
    { $text: { $search: 'advanced aggregation' } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } });

// Example 3: Exact phrase search
const exactPhrase = await Article.find({
  $text: { $search: '"exact phrase here"' }
});

// Example 4: Exclude terms
const excluding = await Article.find({
  $text: { $search: 'database -sql' }  // Find 'database' but not 'sql'
});

// Example 5: Case-sensitive search
const caseSensitive = await Article.find({
  $text: { $search: 'MongoDB', $caseSensitive: true }
});

// Example 6: Language-specific search
const frenchSearch = await Article.find({
  $text: { $search: 'données', $language: 'fr' }
});
```

**Text Index Internals:**

```
Document: { title: "MongoDB Advanced Guide", content: "..." }

Tokenization Process:
┌─────────────────────────────────────┐
│ 1. Split: ["MongoDB", "Advanced",  │
│            "Guide"]                 │
│ 2. Lowercase: ["mongodb",          │
│                "advanced", "guide"] │
│ 3. Stem: ["mongodb", "advanc",     │
│           "guid"]                   │
│ 4. Remove stop words               │
└─────────────────────────────────────┘

Inverted Index:
┌────────────┬─────────────────┐
│ "mongodb"  → [doc1, doc5]    │
│ "advanc"   → [doc1, doc3]    │
│ "guid"     → [doc1, doc2]    │
└────────────┴─────────────────┘

Search: "MongoDB Guide"
→ Find docs containing ["mongodb", "guid"]
→ Score by relevance (term frequency)
```

## Indexes Deep Dive

### Index Types

```typescript
// Example 1: Single field index
productSchema.index({ price: 1 });  // 1 = ascending, -1 = descending

// Example 2: Compound index
productSchema.index({ category: 1, price: -1 });

// Example 3: Unique index
userProfileSchema.index({ email: 1 }, { unique: true });

// Example 4: Sparse index (only index documents with the field)
productSchema.index({ discount: 1 }, { sparse: true });

// Example 5: TTL index (auto-delete after expiry)
const sessionSchema = new Schema({
  data: String,
  createdAt: { type: Date, default: Date.now }
});
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Example 6: Partial index (conditional indexing)
orderSchema.index(
  { amount: 1 },
  {
    partialFilterExpression: {
      status: 'completed',
      amount: { $gte: 100 }
    }
  }
);

// Example 7: Geospatial index
const locationSchema = new Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  }
});
locationSchema.index({ location: '2dsphere' });

const Location = model('Location', locationSchema);

// Geospatial query
const nearby = await Location.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-73.9667, 40.78]  // NYC
      },
      $maxDistance: 5000  // 5km
    }
  }
});
```

### Index Performance Analysis

**Using explain():**

```typescript
// Example: Analyze query performance
const explanation = await Product
  .find({ category: 'laptop', price: { $gte: 500 } })
  .explain('executionStats');

console.log(explanation.executionStats);
```

**Explain Output:**

```javascript
{
  executionSuccess: true,
  nReturned: 150,           // Documents returned
  executionTimeMillis: 5,   // Query time
  totalKeysExamined: 150,   // Index keys scanned
  totalDocsExamined: 150,   // Documents examined
  executionStages: {
    stage: 'FETCH',
    inputStage: {
      stage: 'IXSCAN',      // Index scan (GOOD)
      indexName: 'category_1_price_1',
      keysExamined: 150,
      direction: 'forward'
    }
  }
}

// Bad query (no index):
{
  executionStages: {
    stage: 'COLLSCAN',      // Collection scan (BAD)
    docsExamined: 100000    // Scanned all documents
  }
}
```

**Index Selection Logic:**

```
Query: { category: 'laptop', price: { $gte: 500 } }

Available Indexes:
1. { category: 1 }
2. { price: 1 }
3. { category: 1, price: 1 }

Query Planner Process:
┌─────────────────────────────────────┐
│ Candidate 1: category index        │
│   - Seek: category='laptop'         │
│   - Filter: price >= 500            │
│   Cost: 1000 docs examined          │
├─────────────────────────────────────┤
│ Candidate 2: price index            │
│   - Seek: price >= 500              │
│   - Filter: category='laptop'       │
│   Cost: 5000 docs examined          │
├─────────────────────────────────────┤
│ Candidate 3: compound index ✓       │
│   - Seek: category='laptop',        │
│           price >= 500              │
│   Cost: 150 docs examined           │
└─────────────────────────────────────┘

Winner: Candidate 3 (lowest cost)
```

## Transactions

**WHY Transactions in MongoDB:**

MongoDB 4.0+ supports multi-document ACID transactions for consistency across multiple operations.

```typescript
import mongoose from 'mongoose';

// Example 1: Basic transaction
async function transferMoney(fromUserId: string, toUserId: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Deduct from sender
    await UserProfile.updateOne(
      { userId: fromUserId },
      { $inc: { balance: -amount } },
      { session }
    );

    // Add to receiver
    await UserProfile.updateOne(
      { userId: toUserId },
      { $inc: { balance: amount } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    console.log('Transfer successful');
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    console.error('Transfer failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

// Example 2: Transaction with multiple operations
async function createOrderWithInventory(
  userId: string,
  productId: string,
  quantity: number
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check and update inventory
    const product = await Product.findOneAndUpdate(
      { productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { session, new: true }
    );

    if (!product) {
      throw new Error('Insufficient stock');
    }

    // Create order
    const order = await Order.create([{
      userId,
      items: [{ productId, quantity, price: product.price }],
      amount: product.price * quantity,
      status: 'pending'
    }], { session });

    // Update user stats
    await UserProfile.updateOne(
      { userId },
      { $inc: { totalOrders: 1 } },
      { session }
    );

    await session.commitTransaction();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Example 3: Transaction with retries
async function withRetry<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    } finally {
      session.endSession();
    }
  }

  throw lastError!;
}

function isRetryableError(error: any): boolean {
  return error.hasErrorLabel?.('TransientTransactionError') ||
         error.code === 112;  // WriteConflict
}
```

**Transaction Internals:**

```
Transaction Lifecycle:

1. Start Session
┌──────────────────────────────┐
│ session = startSession()     │
│ Generate txnNumber           │
│ State: NO_TRANSACTION        │
└──────────────────────────────┘

2. Start Transaction
┌──────────────────────────────┐
│ startTransaction()           │
│ State: IN_PROGRESS           │
│ Write operations → oplog     │
│ (not visible to others)      │
└──────────────────────────────┘

3. Commit
┌──────────────────────────────┐
│ commitTransaction()          │
│ Write commit entry → oplog   │
│ State: COMMITTED             │
│ Changes visible globally     │
└──────────────────────────────┘

4. Abort (on error)
┌──────────────────────────────┐
│ abortTransaction()           │
│ Write abort entry → oplog    │
│ State: ABORTED               │
│ Changes discarded            │
└──────────────────────────────┘
```

## Change Streams (Real-time)

**WHY Change Streams:**

Monitor real-time changes to collections for reactive applications (notifications, caching, data sync).

```typescript
// Example 1: Basic change stream
async function watchOrders() {
  const changeStream = Order.watch();

  changeStream.on('change', (change) => {
    console.log('Change detected:', change);

    switch (change.operationType) {
      case 'insert':
        console.log('New order:', change.fullDocument);
        break;
      case 'update':
        console.log('Order updated:', change.documentKey);
        break;
      case 'delete':
        console.log('Order deleted:', change.documentKey);
        break;
    }
  });

  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
}

// Example 2: Filtered change stream
async function watchHighValueOrders() {
  const pipeline = [
    {
      $match: {
        'fullDocument.amount': { $gte: 1000 }
      }
    }
  ];

  const changeStream = Order.watch(pipeline, {
    fullDocument: 'updateLookup'  // Include full document on updates
  });

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      sendNotification('High value order received', change.fullDocument);
    }
  });
}

// Example 3: Resume after interruption
async function resilientWatch() {
  let resumeToken: any;

  function startWatch() {
    const options = resumeToken ? { resumeAfter: resumeToken } : {};
    const changeStream = Order.watch([], options);

    changeStream.on('change', (change) => {
      // Store resume token
      resumeToken = change._id;
      processChange(change);
    });

    changeStream.on('error', (error) => {
      console.error('Stream error, restarting...', error);
      changeStream.close();
      setTimeout(startWatch, 1000);  // Restart after 1s
    });
  }

  startWatch();
}

// Example 4: Aggregate on change stream
async function watchUserStats() {
  const pipeline = [
    { $match: { operationType: 'insert' } },
    {
      $group: {
        _id: '$fullDocument.userId',
        orderCount: { $sum: 1 }
      }
    }
  ];

  const changeStream = Order.watch(pipeline);

  changeStream.on('change', (change) => {
    console.log('User order stats:', change);
  });
}

function processChange(change: any) {
  // Process change
  console.log('Processing:', change.operationType);
}

function sendNotification(message: string, data: any) {
  // Send notification
  console.log(message, data);
}
```

**Change Stream Architecture:**

```
Application Layer:
┌────────────────────────────────┐
│ changeStream.on('change', ...) │
└────────────────────────────────┘
         ↑
         │ Change events
         │
MongoDB Oplog:
┌────────────────────────────────┐
│ Timestamp | Operation | Doc    │
│ ─────────────────────────────  │
│ t1        | insert    | {...}  │
│ t2        | update    | {...}  │
│ t3        | delete    | {...}  │
└────────────────────────────────┘
         ↑
         │ Real-time writes
         │
Collection:
┌────────────────────────────────┐
│ Documents                      │
└────────────────────────────────┘

Resume Token:
┌────────────────────────────────┐
│ { _id: { timestamp, ... } }    │
│ Marks position in oplog        │
│ Allows resume after disconnect │
└────────────────────────────────┘
```

## Comparison Summary

### MongoDB vs SQL Queries

```
MongoDB                          SQL
─────────────────────────────────────────────────────
find({ age: { $gte: 18 } })     SELECT * WHERE age >= 18
aggregate([...])                 SELECT with GROUP BY
$lookup                          JOIN
$match                           WHERE
$group                           GROUP BY
$project                         SELECT columns
$sort                            ORDER BY
$limit                           LIMIT
$skip                            OFFSET
updateOne()                      UPDATE ... WHERE
deleteOne()                      DELETE ... WHERE
```

### MongoDB vs Laravel Eloquent

```php
// Laravel Eloquent (Active Record)
User::where('age', '>=', 18)
    ->where('status', 'active')
    ->orderBy('created_at', 'desc')
    ->take(10)
    ->get();

// Mongoose (Query Builder)
User.find({ age: { $gte: 18 }, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();
```

**Key Differences:**

1. **Eloquent**: Chainable methods, ORM-style
2. **Mongoose**: Object-based queries, MongoDB operators
3. **Eloquent**: Automatic relationships via methods
4. **Mongoose**: Manual $lookup for joins

## Performance Best Practices

### Query Optimization

```typescript
// ❌ BAD: No index, loads all fields
const users = await User.find({ email: 'test@example.com' });

// ✅ GOOD: Index + field selection
userSchema.index({ email: 1 });
const users = await User.find({ email: 'test@example.com' })
  .select('name email')
  .lean();  // Return plain objects (faster)

// ❌ BAD: $where with JavaScript
const users = await User.find({
  $where: 'this.price > 100'
});

// ✅ GOOD: Use operators
const users = await User.find({ price: { $gt: 100 } });

// ❌ BAD: Large $in array
const products = await Product.find({
  category: { $in: largeArray }  // 1000+ items
});

// ✅ GOOD: Limit $in size or use aggregation
const products = await Product.find({
  category: { $in: largeArray.slice(0, 100) }
});

// ❌ BAD: N+1 queries
for (const order of orders) {
  order.user = await User.findOne({ userId: order.userId });
}

// ✅ GOOD: Batch lookup
const userIds = orders.map(o => o.userId);
const users = await User.find({ userId: { $in: userIds } });
const userMap = new Map(users.map(u => [u.userId, u]));
orders.forEach(o => o.user = userMap.get(o.userId));
```

### Aggregation Optimization

```typescript
// ❌ BAD: Filter after grouping
const stats = await Order.aggregate([
  { $group: { _id: '$userId', total: { $sum: '$amount' } } },
  { $match: { total: { $gte: 1000 } } }
]);

// ✅ GOOD: Filter before grouping
const stats = await Order.aggregate([
  { $match: { amount: { $gte: 100 } } },  // Reduce input size
  { $group: { _id: '$userId', total: { $sum: '$amount' } } },
  { $match: { total: { $gte: 1000 } } }
]);

// ❌ BAD: Large $push accumulation
const userOrders = await Order.aggregate([
  { $group: { _id: '$userId', orders: { $push: '$$ROOT' } } }
]);

// ✅ GOOD: Limit pushed data
const userOrders = await Order.aggregate([
  {
    $group: {
      _id: '$userId',
      orders: { $push: { orderId: '$orderId', amount: '$amount' } }
    }
  }
]);

// ✅ BETTER: Use allowDiskUse for large datasets
const stats = await Order.aggregate([...], { allowDiskUse: true });
```

## Memory and Performance Implications

### Query Memory Usage

```
Operation              | Memory Impact        | Limit
─────────────────────────────────────────────────────
find()                 | Per-cursor batch     | 16MB
aggregate($match)      | Low (streaming)      | -
aggregate($group)      | High (in-memory)     | 100MB
aggregate($sort)       | High (in-memory)     | 32MB
$lookup                | Medium-High          | Depends on result
$push accumulator      | High (grows)         | 100MB
Text search            | Medium (index scan)  | -
Regex                  | High (no index)      | -
```

### Index Memory Requirements

```
Index Size Calculation:
─────────────────────────────────────
Index on { email: 1 }
- Average email length: 30 bytes
- Number of documents: 1,000,000
- Index size ≈ 30 × 1,000,000 = 30MB

Compound index { category: 1, price: 1 }
- Average category: 20 bytes
- Price: 8 bytes (number)
- Total per doc: 28 bytes
- For 1M docs: 28MB

Rule of Thumb:
─────────────────────────────────────
Total RAM needed = (Working Set + Indexes) × 1.5
Working Set = Frequently accessed documents
```

## Conclusion

Mongoose queries leverage MongoDB's powerful query language and aggregation framework. Understanding the internal mechanics—from BSON encoding to query planning—enables writing efficient, scalable database operations. Key takeaways:

1. **Use operators** for type-safe, indexed queries
2. **Leverage aggregation** for complex data transformations
3. **Create appropriate indexes** for query patterns
4. **Monitor performance** with explain()
5. **Optimize memory usage** with lean(), select(), and allowDiskUse
6. **Use transactions** for multi-document consistency
7. **Implement change streams** for real-time features

The pipeline-based approach, while different from SQL, provides composability and flexibility essential for document-oriented data modeling.
