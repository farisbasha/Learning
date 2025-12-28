# Phase 096c: Mongoose Relations - Quick Reference

## Core Concepts

### Document Model vs Relational
```typescript
// MongoDB: No native foreign keys or JOINs
// Mongoose: Simulates relationships with refs and populate()

// SQL: JOIN at database level
SELECT * FROM posts JOIN users ON posts.author_id = users.id;

// MongoDB: Separate queries at application level
db.posts.find()  // Query 1
db.users.find({ _id: { $in: [...] } })  // Query 2
```

### Embedding vs Referencing

**Embed When**:
- 1:Few relationship
- Data rarely changes
- Always queried together
- Data is small

**Reference When**:
- 1:Many or M:N
- Data changes frequently
- Queried independently
- Unlimited growth

## ObjectId References

### Basic Reference
```typescript
import { Schema, model, Types } from 'mongoose';

const postSchema = new Schema({
    title: String,
    author: {
        type: Schema.Types.ObjectId,  // Store ObjectId
        ref: 'User',                   // Reference User model
        required: true
    }
});

const Post = model('Post', postSchema);
```

### Array of References
```typescript
const postSchema = new Schema({
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }]
});
```

### Creating with References
```typescript
const user = await User.create({ name: 'Alice' });
const post = await Post.create({
    title: 'Hello',
    author: user._id  // Just the ObjectId
});

console.log(post.author); // ObjectId("507f...")
```

## populate() Method

### Basic Usage
```typescript
// Without populate
const post = await Post.findById(id);
console.log(post.author); // ObjectId only

// With populate
const post = await Post.findById(id).populate('author');
console.log(post.author.name); // Full user object
```

### Multiple Fields
```typescript
// Populate multiple fields
const post = await Post.findById(id)
    .populate('author')
    .populate('category');

// Or array syntax
const post = await Post.findById(id)
    .populate(['author', 'category']);
```

### Field Selection
```typescript
// Only specific fields
const post = await Post.findById(id).populate({
    path: 'author',
    select: 'name email'  // Include only
});

// Exclude fields
const post = await Post.findById(id).populate({
    path: 'author',
    select: '-password -__v'  // Exclude
});
```

### Filtering with match
```typescript
const user = await User.findById(id).populate({
    path: 'posts',
    match: { published: true }  // Only published
});
```

### Sorting and Limiting
```typescript
const user = await User.findById(id).populate({
    path: 'posts',
    options: {
        sort: { createdAt: -1 },
        limit: 10,
        skip: 0
    }
});
```

## Nested Population

### Two Levels
```typescript
const post = await Post.findById(id).populate({
    path: 'comments',
    populate: {
        path: 'author',
        select: 'name avatar'
    }
});

// Access: post.comments[0].author.name
```

### Multiple Nested
```typescript
const post = await Post.findById(id).populate([
    {
        path: 'author',
        populate: { path: 'company' }
    },
    {
        path: 'comments',
        populate: { path: 'author' }
    }
]);
```

## Virtual Populate

### Basic Virtual
```typescript
// User doesn't store posts array
const userSchema = new Schema({
    name: String
});

// Virtual for reverse relationship
userSchema.virtual('posts', {
    ref: 'Post',              // Model to query
    localField: '_id',        // User._id
    foreignField: 'author'    // Post.author
});

const User = model('User', userSchema);

// Usage
const user = await User.findById(id).populate('posts');
console.log(user.posts); // Array of posts
```

### Virtual with Count
```typescript
userSchema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author',
    count: true  // Only count
});

const user = await User.findById(id).populate('postCount');
console.log(user.postCount); // 42
```

### Enable Virtuals in JSON
```typescript
const userSchema = new Schema({
    name: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
```

## Relationship Patterns

### One-to-One
```typescript
const userSchema = new Schema({
    email: String,
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
        unique: true  // Ensures 1:1
    }
});

const profileSchema = new Schema({
    bio: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }
});

// Better: Embed for 1:1
const userSchema = new Schema({
    email: String,
    profile: {
        bio: String,
        avatar: String
    }
});
```

### One-to-Many (Parent → Children)
```typescript
// Child references parent (recommended)
const postSchema = new Schema({
    title: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Virtual on parent
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

// Usage
const user = await User.findById(id).populate('posts');
const posts = await Post.find({ author: userId });
```

### One-to-Many (Array - Bounded)
```typescript
// Only for bounded relationships (max 10-100 items)
const userSchema = new Schema({
    addresses: [{
        type: Schema.Types.ObjectId,
        ref: 'Address'
    }]
});

// Add to array
user.addresses.push(addressId);
await user.save();
```

### Many-to-Many (Simple)
```typescript
const studentSchema = new Schema({
    name: String,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new Schema({
    title: String,
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
});

// Problem: Data duplication, no metadata
```

### Many-to-Many (Junction Model - Recommended)
```typescript
const studentSchema = new Schema({
    name: String
});

const courseSchema = new Schema({
    title: String
});

// Junction/join model
const enrollmentSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Metadata on relationship
    enrolledAt: Date,
    grade: String
});

// Prevent duplicates
enrollmentSchema.index(
    { student: 1, course: 1 },
    { unique: true }
);

// Virtual populates
studentSchema.virtual('enrollments', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'student'
});

courseSchema.virtual('enrollments', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'course'
});

// Usage
const student = await Student.findById(id).populate({
    path: 'enrollments',
    populate: { path: 'course' }
});

student.enrollments.forEach(enrollment => {
    console.log(enrollment.course.title);
    console.log(enrollment.grade);
});
```

## Advanced Patterns

### Polymorphic References (refPath)
```typescript
// Comments on posts OR photos
const commentSchema = new Schema({
    text: String,
    commentableType: {
        type: String,
        enum: ['Post', 'Photo']
    },
    commentable: {
        type: Schema.Types.ObjectId,
        refPath: 'commentableType'  // Dynamic ref
    }
});

// Auto-populates based on type
const comment = await Comment.findById(id).populate('commentable');
```

### Denormalization
```typescript
const postSchema = new Schema({
    title: String,

    // Full reference
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Denormalized for speed
    authorName: String,
    authorAvatar: String
});

// Middleware to sync
postSchema.pre('save', async function(next) {
    if (this.isModified('author')) {
        const user = await User.findById(this.author);
        this.authorName = user.name;
        this.authorAvatar = user.avatar;
    }
    next();
});

// Fast access without populate
const posts = await Post.find();
posts.forEach(post => {
    console.log(post.authorName); // No query needed
});
```

### Aggregation with $lookup
```typescript
const posts = await Post.aggregate([
    {
        $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorDetails'
        }
    },
    { $unwind: '$authorDetails' }
]);

// Single query, faster than populate
// But returns plain objects, not documents
```

## Performance Optimization

### Query Batching
```typescript
// Mongoose auto-batches
const posts = await Post.find().populate('author');

// Behind the scenes:
// db.posts.find()
// db.users.find({ _id: { $in: [id1, id2, ...] } })
// 2 queries, not N+1!
```

### Field Selection
```typescript
// Load only needed fields
const posts = await Post.find().populate({
    path: 'author',
    select: 'name avatar'  // Only 2 fields
});

// Memory: ~10KB instead of ~100KB
```

### Limit Nested Results
```typescript
const post = await Post.findById(id).populate({
    path: 'comments',
    options: { limit: 10 }  // Only 10 comments
});
```

### Indexing
```typescript
// Index reference fields
postSchema.index({ author: 1 });
commentSchema.index({ post: 1 });
enrollmentSchema.index({ student: 1, course: 1 });
```

### Pagination
```typescript
async function getPosts(page = 1, limit = 20) {
    return Post.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar');
}
```

## Comparison with Other ORMs

### Mongoose vs Sequelize
```typescript
// Sequelize (SQL): Single JOIN query
const posts = await Post.findAll({
    include: [{ model: User, as: 'author' }]
});
// SQL: SELECT * FROM posts LEFT JOIN users...

// Mongoose: Separate queries
const posts = await Post.find().populate('author');
// Query 1: db.posts.find()
// Query 2: db.users.find({ _id: { $in: [...] } })
```

### Mongoose vs TypeORM
```typescript
// TypeORM: Eager loading option
@Entity()
class Post {
    @ManyToOne(() => User, { eager: true })
    author: User;
}

const posts = await postRepo.find(); // Auto-loads author

// Mongoose: Explicit populate
const posts = await Post.find().populate('author');
```

### Mongoose vs Laravel Eloquent
```php
// Eloquent: Method-based relationships
class Post extends Model {
    public function author() {
        return $this->belongsTo(User::class);
    }
}

$posts = Post::with('author')->get();

// Mongoose: Schema-based references
const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

const posts = await Post.find().populate('author');
```

## Common Patterns

### Social Media Feed
```typescript
async function getFeed(userId: string, page = 1, limit = 20) {
    const user = await User.findById(userId);

    return Post.find({
        author: { $in: user.following }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username avatar')
    .populate({
        path: 'comments',
        options: { limit: 3 },
        populate: { path: 'author', select: 'username' }
    });
}
```

### Blog with Categories
```typescript
const postSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]
});

const post = await Post.findById(id)
    .populate('author', 'name bio')
    .populate('category', 'name')
    .populate('tags', 'name');
```

### E-commerce Orders
```typescript
const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }]
});

const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name image');
```

## Best Practices

1. **Choose Pattern Wisely**:
   - Embed: Small, bounded, static data
   - Reference: Large, unbounded, dynamic data

2. **Optimize Queries**:
   - Use select for field filtering
   - Limit nested results
   - Avoid deep nesting (max 2-3 levels)

3. **Index Reference Fields**:
   ```typescript
   postSchema.index({ author: 1 });
   ```

4. **Prevent N+1**:
   - Always populate in batch queries
   - Mongoose auto-batches with $in

5. **Consider Denormalization**:
   - For frequently accessed data
   - Trade space for speed

6. **Memory Management**:
   - Paginate large datasets
   - Select only needed fields
   - Stream for huge datasets

## Common Pitfalls

1. **Forgetting to populate**:
   ```typescript
   const post = await Post.findById(id);
   console.log(post.author.name); // Error: author is ObjectId
   ```

2. **Over-populating**:
   ```typescript
   // Bad: Loads entire database
   const users = await User.find().populate('posts');

   // Good: Limit results
   const users = await User.find()
       .limit(10)
       .populate({ path: 'posts', options: { limit: 5 } });
   ```

3. **Not indexing references**:
   ```typescript
   // Slow without index
   await Post.find({ author: userId });

   // Add index
   postSchema.index({ author: 1 });
   ```

4. **Deep nesting**:
   ```typescript
   // Bad: Too many queries
   .populate({
       path: 'a',
       populate: {
           path: 'b',
           populate: {
               path: 'c',
               populate: { path: 'd' }
           }
       }
   });

   // Good: Use aggregation or denormalize
   ```

5. **No referential integrity**:
   ```typescript
   // MongoDB won't prevent this
   await User.findByIdAndDelete(userId);
   // Posts still reference deleted user!

   // Solution: Manual cleanup
   await Post.deleteMany({ author: userId });
   ```

## Quick Reference Commands

```typescript
// Basic populate
.populate('author')

// Multiple fields
.populate('author category')
.populate(['author', 'category'])

// With options
.populate({
    path: 'author',
    select: 'name email',
    match: { active: true },
    options: { sort: { name: 1 }, limit: 10 }
})

// Nested
.populate({
    path: 'comments',
    populate: { path: 'author' }
})

// Virtual populate
schema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
})

// Dynamic ref
{
    commentable: {
        type: Schema.Types.ObjectId,
        refPath: 'commentableType'
    }
}
```
