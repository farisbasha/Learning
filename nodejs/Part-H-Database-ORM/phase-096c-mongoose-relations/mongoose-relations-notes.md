# Phase 096c: Mongoose Relations - Comprehensive Notes

## Overview

Mongoose relationships differ fundamentally from SQL/relational ORMs because MongoDB is a document-oriented database. Understanding how Mongoose handles relationships requires understanding both the MongoDB document model and how Mongoose provides an abstraction layer over it.

**Key Principle**: MongoDB doesn't have native foreign keys or JOIN operations. Mongoose simulates relationships through references (ObjectId) and the `populate()` method.

## Theory: Document Model vs Relational Model

### Why Mongoose Uses References Differently

**SQL/Relational Databases**:
```sql
-- Native foreign keys enforced at database level
CREATE TABLE posts (
    id INT PRIMARY KEY,
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- JOIN operation happens in database
SELECT * FROM posts
JOIN users ON posts.author_id = users.id;
```

**MongoDB/Mongoose**:
```typescript
// References stored as ObjectId (just a 12-byte identifier)
const postSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
    // No database-level constraint!
});

// Population = separate query (or aggregation)
const post = await Post.findById(id).populate('author');
// Mongoose executes 2+ queries behind the scenes
```

**Critical Differences**:
1. **No referential integrity**: MongoDB won't prevent orphaned references
2. **No cascading deletes**: Deleting a user won't auto-delete their posts
3. **No JOIN optimization**: Populate runs separate queries (or uses $lookup aggregation)
4. **Flexible schema**: References are optional by design

### When to Use References vs Embedding

**Embedding (Denormalization)**:
```typescript
// Embed comments directly in post
const postSchema = new Schema({
    title: String,
    comments: [{
        text: String,
        author: String,
        createdAt: Date
    }]
});
```

**Pros**:
- Single query retrieval (faster reads)
- Atomic updates (single document transaction)
- No orphaned data

**Cons**:
- Document size limits (16MB in MongoDB)
- Data duplication (if comments appear elsewhere)
- Harder to query comments independently

**Referencing (Normalization)**:
```typescript
// Reference comments in separate collection
const postSchema = new Schema({
    title: String,
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

const commentSchema = new Schema({
    text: String,
    author: String,
    post: { type: Schema.Types.ObjectId, ref: 'Post' }
});
```

**Pros**:
- No duplication (single source of truth)
- Query flexibility (find all comments by author)
- Unlimited growth (no 16MB limit)

**Cons**:
- Multiple queries (slower reads)
- No referential integrity
- More complex code

**Decision Matrix**:
| Pattern | Use When |
|---------|----------|
| Embedding | 1:Few relationship, data rarely changes, always queried together |
| Referencing | 1:Many or M:N, data changes frequently, queried independently |

## References with ObjectId

### Understanding ObjectId

**What is ObjectId?**
```typescript
// ObjectId structure (12 bytes)
// [timestamp:4][machine:3][process:2][counter:3]

const id = new mongoose.Types.ObjectId();
console.log(id); // 507f1f77bcf86cd799439011

// Extract timestamp
console.log(id.getTimestamp()); // 2012-10-17T20:46:22.000Z

// Compare IDs
const id1 = new mongoose.Types.ObjectId();
const id2 = new mongoose.Types.ObjectId();
console.log(id1.equals(id2)); // false
```

**Why ObjectId for References?**
1. **Globally unique**: No coordination needed across servers
2. **Sortable**: Contains creation timestamp
3. **Compact**: Only 12 bytes
4. **Indexed**: MongoDB automatically indexes _id fields

### Defining References in Schema

**Basic Reference**:
```typescript
import { Schema, model, Types } from 'mongoose';

// User schema
const userSchema = new Schema({
    name: String,
    email: String
});

const User = model('User', userSchema);

// Post schema with reference
const postSchema = new Schema({
    title: String,
    content: String,
    // Single reference (one-to-one or many-to-one)
    author: {
        type: Schema.Types.ObjectId,  // Type is ObjectId
        ref: 'User'                    // References User model
    }
});

const Post = model('Post', postSchema);
```

**Why this works**:
- `type: Schema.Types.ObjectId`: Tells Mongoose to store 12-byte ObjectId
- `ref: 'User'`: Tells populate() which model to query
- Without `ref`, you can still store ObjectId but can't populate

**Required vs Optional References**:
```typescript
const postSchema = new Schema({
    // Required reference (must have author)
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Optional reference (post may not have category)
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }
});
```

**Array of References (One-to-Many)**:
```typescript
const postSchema = new Schema({
    title: String,

    // Array of ObjectIds
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],

    // Alternative array syntax
    contributors: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }
});
```

### Creating Documents with References

**Manual Reference Assignment**:
```typescript
// Create user first
const user = await User.create({
    name: 'Alice',
    email: 'alice@example.com'
});

// Create post with reference to user's _id
const post = await Post.create({
    title: 'My First Post',
    content: 'Hello World',
    author: user._id  // Just the ObjectId
});

console.log(post.author); // 507f1f77bcf86cd799439011 (ObjectId)
console.log(typeof post.author); // 'object' (Types.ObjectId)
```

**What's Stored in Database**:
```javascript
// MongoDB document for post
{
    _id: ObjectId("507f191e810c19729de860ea"),
    title: "My First Post",
    content: "Hello World",
    author: ObjectId("507f1f77bcf86cd799439011")  // Just the ID
}
```

**Creating with String IDs** (Mongoose converts automatically):
```typescript
const post = await Post.create({
    title: 'Another Post',
    author: '507f1f77bcf86cd799439011'  // String
});

console.log(post.author instanceof Types.ObjectId); // true
// Mongoose converts string to ObjectId
```

**Creating with Array References**:
```typescript
const tag1 = await Tag.create({ name: 'JavaScript' });
const tag2 = await Tag.create({ name: 'MongoDB' });

const post = await Post.create({
    title: 'Database Post',
    tags: [tag1._id, tag2._id]
});

console.log(post.tags); // [ObjectId(...), ObjectId(...)]
```

## The ref Option and populate() Method

### How populate() Works Internally

**Without populate()** (just ObjectId):
```typescript
const post = await Post.findById(postId);
console.log(post.author); // ObjectId("507f1f77bcf86cd799439011")
console.log(post.author.name); // undefined (it's just an ID!)
```

**With populate()** (replaces ObjectId with full document):
```typescript
const post = await Post.findById(postId).populate('author');
console.log(post.author); // { _id: ..., name: 'Alice', email: '...' }
console.log(post.author.name); // 'Alice'
```

**What Happens Behind the Scenes**:
```typescript
// Step 1: Mongoose executes first query
db.posts.findOne({ _id: postId })
// Returns: { _id: ..., title: '...', author: ObjectId("507f...") }

// Step 2: Mongoose sees populate('author') and ref: 'User'
// Executes second query:
db.users.findOne({ _id: ObjectId("507f...") })
// Returns: { _id: ObjectId("507f..."), name: 'Alice', email: '...' }

// Step 3: Mongoose replaces author ObjectId with full document
// Returns to you: { ..., author: { _id: ..., name: 'Alice', ... } }
```

**Key Insight**: populate() is NOT a SQL JOIN. It's:
- 2+ separate queries (or 1 aggregation with $lookup)
- Happens in application layer (Mongoose), not database
- Less efficient than SQL JOINs for complex queries

### Basic populate() Usage

**Single Field Population**:
```typescript
// Populate author field
const post = await Post.findById(id).populate('author');

// Populate multiple fields
const post = await Post.findById(id)
    .populate('author')
    .populate('category');

// Or populate multiple at once
const post = await Post.findById(id)
    .populate(['author', 'category']);
```

**Population with find()**:
```typescript
// Populate all posts
const posts = await Post.find().populate('author');

// Each post has author populated
posts.forEach(post => {
    console.log(post.author.name);
});
```

**Population is Lazy** (only when called):
```typescript
// Without populate - author is ObjectId
const post1 = await Post.findById(id);
console.log(post1.author instanceof Types.ObjectId); // true

// With populate - author is full document
const post2 = await Post.findById(id).populate('author');
console.log(post2.author instanceof Types.ObjectId); // false
console.log(post2.author.name); // 'Alice'
```

### Advanced populate() Options

**Field Selection with select**:
```typescript
// Only populate specific fields
const post = await Post.findById(id).populate({
    path: 'author',
    select: 'name email'  // Only include name and email
});

console.log(post.author.name); // 'Alice'
console.log(post.author.password); // undefined (not selected)

// Exclude fields with minus
const post = await Post.findById(id).populate({
    path: 'author',
    select: '-password -__v'  // Exclude password and __v
});
```

**Why select matters**:
```typescript
// Without select - transfers entire user document
// Network: ~500 bytes per user (with all fields)

// With select - only needed fields
// Network: ~100 bytes per user
// 5x reduction in data transfer!
```

**Filtering with match**:
```typescript
// Only populate if condition matches
const user = await User.findById(id).populate({
    path: 'posts',
    match: { published: true }  // Only published posts
});

// posts will be [] if no matches
console.log(user.posts); // [{ title: '...', published: true }, ...]

// Complex match conditions
const user = await User.findById(id).populate({
    path: 'posts',
    match: {
        published: true,
        createdAt: { $gte: new Date('2024-01-01') }
    }
});
```

**Sorting Populated Documents**:
```typescript
const user = await User.findById(id).populate({
    path: 'posts',
    options: {
        sort: { createdAt: -1 },  // Newest first
        limit: 10                  // Only 10 posts
    }
});
```

**Limiting and Pagination**:
```typescript
const user = await User.findById(id).populate({
    path: 'posts',
    options: {
        limit: 20,
        skip: 0,
        sort: { createdAt: -1 }
    }
});

// Get next page
const userPage2 = await User.findById(id).populate({
    path: 'posts',
    options: {
        limit: 20,
        skip: 20,
        sort: { createdAt: -1 }
    }
});
```

### Nested Population (Populate of Populated Documents)

**Two-Level Population**:
```typescript
// Schema setup
const commentSchema = new Schema({
    text: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

const postSchema = new Schema({
    title: String,
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

// Nested populate
const post = await Post.findById(id).populate({
    path: 'comments',
    populate: {
        path: 'author',
        select: 'name avatar'
    }
});

// Result structure
console.log(post.comments[0].author.name); // 'Bob'
```

**What Happens**:
```typescript
// Query 1: Get post
db.posts.findOne({ _id: postId })
// Returns: { ..., comments: [ObjectId("..."), ObjectId("...")] }

// Query 2: Get comments
db.comments.find({ _id: { $in: [ObjectId("..."), ObjectId("...")] } })
// Returns: [{ text: '...', author: ObjectId("...") }, ...]

// Query 3: Get comment authors
db.users.find({ _id: { $in: [ObjectId("..."), ...] } })
// Returns: [{ name: 'Bob', avatar: '...' }, ...]

// Mongoose assembles the result
```

**Three-Level Population**:
```typescript
const userSchema = new Schema({
    name: String,
    company: { type: Schema.Types.ObjectId, ref: 'Company' }
});

const companySchema = new Schema({
    name: String,
    industry: { type: Schema.Types.ObjectId, ref: 'Industry' }
});

// Triple nesting
const post = await Post.findById(id).populate({
    path: 'comments',
    populate: {
        path: 'author',
        populate: {
            path: 'company',
            populate: {
                path: 'industry'
            }
        }
    }
});

console.log(post.comments[0].author.company.industry.name);
// 'Technology'
```

**Performance Warning**: Each level = additional query!
```typescript
// 3-level populate = 4 queries minimum
// 100 comments, 50 unique authors, 20 companies, 5 industries
// = 1 + 1 + 1 + 1 = 4 queries (with Mongoose optimization)
// vs SQL: 1 query with JOINs
```

**Multiple Nested Populates**:
```typescript
const post = await Post.findById(id).populate([
    {
        path: 'author',
        select: 'name email',
        populate: {
            path: 'followers',
            select: 'name'
        }
    },
    {
        path: 'comments',
        populate: {
            path: 'author',
            select: 'name avatar'
        }
    }
]);
```

## Virtual Populate

### What are Virtual Populates?

**Problem**: Reverse relationships without storing redundant data

**Example Scenario**:
```typescript
// Post stores author reference
const postSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// But User doesn't store posts array
const userSchema = new Schema({
    name: String,
    email: String
    // No posts: [] field
});

// How do we get user.posts? Virtual populate!
```

**Without Virtual Populate** (manual query):
```typescript
const user = await User.findById(userId);
const posts = await Post.find({ author: userId });
// Separate queries, not integrated
```

**With Virtual Populate** (automatic):
```typescript
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

const user = await User.findById(userId).populate('posts');
console.log(user.posts); // Array of posts by this user
```

### How Virtual Populate Works

**Virtual Field Definition**:
```typescript
userSchema.virtual('posts', {
    ref: 'Post',              // Model to query
    localField: '_id',        // Field in User
    foreignField: 'author'    // Field in Post to match
});

// Equivalent query:
// db.posts.find({ author: user._id })
```

**Behind the Scenes**:
```typescript
// When you call .populate('posts')
const user = await User.findById(userId);
// Mongoose executes: Post.find({ author: user._id })
// Assigns result to virtual 'posts' field
```

**Complete Example**:
```typescript
import { Schema, model } from 'mongoose';

// User Schema with virtual
const userSchema = new Schema({
    name: String,
    email: String
}, {
    toJSON: { virtuals: true },  // Include virtuals in JSON
    toObject: { virtuals: true }  // Include virtuals in toObject()
});

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

const User = model('User', userSchema);

// Post Schema
const postSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Post = model('Post', postSchema);

// Usage
const user = await User.findById(userId).populate('posts');
console.log(user.posts); // [{ title: '...', ... }, ...]
```

### Virtual Populate with Options

**Counting Instead of Loading**:
```typescript
userSchema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author',
    count: true  // Only count, don't load documents
});

const user = await User.findById(userId).populate('postCount');
console.log(user.postCount); // 42 (number)
```

**Filtering Virtual Populate**:
```typescript
userSchema.virtual('publishedPosts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author',
    match: { published: true }  // Only published posts
});

const user = await User.findById(userId).populate('publishedPosts');
```

**Sorting and Limiting**:
```typescript
const user = await User.findById(userId).populate({
    path: 'posts',
    options: {
        sort: { createdAt: -1 },
        limit: 10
    }
});
```

### Bidirectional Virtual Populates

**Scenario**: Both models can populate the other

```typescript
// User can populate posts
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

// Post can populate author (normal reference)
const postSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Usage
const user = await User.findById(userId).populate('posts');
const post = await Post.findById(postId).populate('author');
```

**Many-to-Many Virtual Example**:
```typescript
// Student schema
const studentSchema = new Schema({
    name: String
});

studentSchema.virtual('courses', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'student'
});

// Course schema
const courseSchema = new Schema({
    title: String
});

courseSchema.virtual('students', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'course'
});

// Enrollment (junction) schema
const enrollmentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt: Date,
    grade: String
});

// Query both directions
const student = await Student.findById(id).populate('courses');
const course = await Course.findById(id).populate('students');
```

## Relationship Patterns

### One-to-One Relationships

**Example**: User and Profile (one user has one profile)

**Schema Definition**:
```typescript
const userSchema = new Schema({
    email: String,
    password: String,
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
        unique: true  // Ensures one-to-one
    }
});

const profileSchema = new Schema({
    bio: String,
    avatar: String,
    dateOfBirth: Date,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true  // Ensures one-to-one
    }
});

const User = model('User', userSchema);
const Profile = model('Profile', profileSchema);
```

**Creating One-to-One**:
```typescript
// Create user and profile
const user = await User.create({
    email: 'alice@example.com',
    password: 'hashed...'
});

const profile = await Profile.create({
    bio: 'Software Engineer',
    avatar: 'avatar.jpg',
    user: user._id
});

// Link profile to user
user.profile = profile._id;
await user.save();

// Query with populate
const userWithProfile = await User.findById(user._id).populate('profile');
console.log(userWithProfile.profile.bio); // 'Software Engineer'
```

**Alternative: Embedding (Better for 1:1)**:
```typescript
// More efficient for one-to-one
const userSchema = new Schema({
    email: String,
    password: String,
    profile: {
        bio: String,
        avatar: String,
        dateOfBirth: Date
    }
});

// Single document, single query, atomic updates
const user = await User.findById(id);
console.log(user.profile.bio); // No populate needed!
```

**When to Reference vs Embed**:
- Reference: Large profile data, profile queried independently
- Embed: Small profile data, always queried together (recommended)

### One-to-Many Relationships

**Example**: User has many posts

**Pattern 1: Child References Parent** (Recommended)
```typescript
const userSchema = new Schema({
    name: String,
    email: String
    // No posts array!
});

const postSchema = new Schema({
    title: String,
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Virtual populate to get user's posts
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

const User = model('User', userSchema);
const Post = model('Post', postSchema);
```

**Usage**:
```typescript
// Get user with posts
const user = await User.findById(userId).populate('posts');
console.log(user.posts.length); // 42

// Get post with author
const post = await Post.findById(postId).populate('author');
console.log(post.author.name); // 'Alice'

// Find all posts by user (without populate)
const posts = await Post.find({ author: userId });
```

**Why This Pattern?**:
1. No array size limit (user can have millions of posts)
2. Easy to query posts independently
3. Virtual populate provides reverse relationship

**Pattern 2: Parent Stores Array** (For bounded relationships)
```typescript
const userSchema = new Schema({
    name: String,
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const postSchema = new Schema({
    title: String,
    content: String
    // No author field needed if only accessing from user
});
```

**Creating with Array Pattern**:
```typescript
const user = await User.findById(userId);
const post = await Post.create({
    title: 'New Post',
    content: 'Content...'
});

// Add to user's posts array
user.posts.push(post._id);
await user.save();

// Populate
const userWithPosts = await User.findById(userId).populate('posts');
```

**When to Use Array**:
- Bounded relationship (user has max 10 addresses)
- Always query from parent
- Need array order

**When NOT to Use Array**:
- Unbounded growth (user posts, product reviews)
- Document approaching 16MB limit
- Query children independently

### Many-to-Many Relationships

**Example**: Students and Courses (students have many courses, courses have many students)

**Pattern 1: Array of References (Simple)**
```typescript
const studentSchema = new Schema({
    name: String,
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

const courseSchema = new Schema({
    title: String,
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

const Student = model('Student', studentSchema);
const Course = model('Course', courseSchema);
```

**Creating Relationships**:
```typescript
const student = await Student.create({ name: 'Alice' });
const course = await Course.create({ title: 'Database Systems' });

// Add relationship from both sides
student.courses.push(course._id);
await student.save();

course.students.push(student._id);
await course.save();

// Query
const studentWithCourses = await Student.findById(student._id)
    .populate('courses');

const courseWithStudents = await Course.findById(course._id)
    .populate('students');
```

**Problem with Simple Pattern**:
1. Data duplication (relationship stored twice)
2. No metadata (when enrolled? grade?)
3. Must update both documents

**Pattern 2: Junction/Join Collection** (Recommended)
```typescript
const studentSchema = new Schema({
    name: String,
    email: String
});

const courseSchema = new Schema({
    title: String,
    credits: Number
});

// Junction model with metadata
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
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    grade: String,
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped']
    }
});

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Student = model('Student', studentSchema);
const Course = model('Course', courseSchema);
const Enrollment = model('Enrollment', enrollmentSchema);
```

**Virtual Populates for M:N**:
```typescript
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
```

**Creating M:N Relationships**:
```typescript
const student = await Student.create({
    name: 'Alice',
    email: 'alice@example.com'
});

const course = await Course.create({
    title: 'Database Systems',
    credits: 4
});

// Create enrollment
const enrollment = await Enrollment.create({
    student: student._id,
    course: course._id,
    status: 'active'
});
```

**Querying M:N Relationships**:
```typescript
// Get student's courses
const student = await Student.findById(studentId).populate({
    path: 'enrollments',
    populate: {
        path: 'course'
    }
});

student.enrollments.forEach(enrollment => {
    console.log(enrollment.course.title);
    console.log(enrollment.grade);
    console.log(enrollment.enrolledAt);
});

// Get course's students
const course = await Course.findById(courseId).populate({
    path: 'enrollments',
    populate: {
        path: 'student'
    }
});

// Find all active enrollments for a student
const activeEnrollments = await Enrollment.find({
    student: studentId,
    status: 'active'
}).populate('course');
```

## Performance and Memory Implications

### populate() Performance Analysis

**Single Document Population**:
```typescript
// Query 1: Get post
const post = await Post.findById(id).populate('author');

// Behind the scenes:
// 1. db.posts.findOne({ _id: id })        ~1-5ms
// 2. db.users.findOne({ _id: authorId }) ~1-5ms
// Total: ~2-10ms for 2 queries
```

**Multiple Documents Population** (N+1 Problem):
```typescript
// Inefficient approach
const posts = await Post.find().populate('author'); // 100 posts

// Behind the scenes:
// Query 1: db.posts.find() - returns 100 posts
// Query 2: db.users.find({ _id: { $in: [id1, id2, ...] } })
// Mongoose is smart: uses $in for batch query
// Total: 2 queries (not 101!)
```

**Mongoose Optimization**:
```typescript
// Mongoose batches populate queries
const posts = await Post.find().populate('author');

// NOT:
// for (const post of posts) {
//     db.users.findOne({ _id: post.author })
// }

// BUT:
// const authorIds = posts.map(p => p.author);
// db.users.find({ _id: { $in: authorIds } })
//
// 1 query instead of N queries!
```

**Nested Population Performance**:
```typescript
const posts = await Post.find().populate({
    path: 'comments',      // 100 posts, avg 10 comments each
    populate: {
        path: 'author'     // 1000 comments, 200 unique authors
    }
});

// Queries executed:
// 1. db.posts.find()                                    1 query
// 2. db.comments.find({ _id: { $in: [...] } })        1 query
// 3. db.users.find({ _id: { $in: [...] } })           1 query
// Total: 3 queries (not 1101!)

// But memory usage:
// - 100 post documents
// - 1000 comment documents
// - 200 user documents
// = Large memory footprint
```

### Memory Considerations

**Embedding vs Referencing Memory**:
```typescript
// Embedded (single query)
const postWithEmbeddedComments = await Post.findById(id);
// Memory: 1 post + embedded comments
// Query: 1 query
// Network: Transfer all data at once

// Referenced (multiple queries)
const postWithReferencedComments = await Post.findById(id)
    .populate('comments');
// Memory: 1 post + N comment documents
// Query: 2 queries
// Network: Transfer in 2 roundtrips
```

**Large Population Memory Usage**:
```typescript
// Dangerous: Load all users with all posts
const users = await User.find().populate('posts');
// If 10,000 users with avg 50 posts each
// = 10,000 + 500,000 = 510,000 documents in memory!
// Memory: ~500MB+

// Better: Limit and paginate
const users = await User.find()
    .limit(100)
    .populate({
        path: 'posts',
        options: { limit: 10 }
    });
// Memory: ~1MB
```

**Field Selection Reduces Memory**:
```typescript
// Load full author documents (assume 20 fields each)
const posts = await Post.find().populate('author');
// 100 posts × 20 fields × ~50 bytes = ~100KB

// Load only needed fields
const posts = await Post.find().populate({
    path: 'author',
    select: 'name avatar'  // Only 2 fields
});
// 100 posts × 2 fields × ~50 bytes = ~10KB
// 10x memory reduction!
```

### Comparison with SQL ORMs

**Mongoose vs Sequelize (SQL)**:

**Sequelize (SQL)**:
```typescript
// Single optimized query with JOIN
const posts = await Post.findAll({
    include: [{
        model: User,
        as: 'author'
    }]
});

// SQL executed:
// SELECT posts.*, users.*
// FROM posts
// LEFT JOIN users ON posts.author_id = users.id;
//
// 1 query, database does the join
```

**Mongoose (MongoDB)**:
```typescript
// Multiple queries (or aggregation)
const posts = await Post.find().populate('author');

// Queries executed:
// 1. db.posts.find()
// 2. db.users.find({ _id: { $in: [...] } })
//
// 2 queries, application does the join
```

**Performance Comparison**:
| Aspect | Sequelize/SQL | Mongoose/MongoDB |
|--------|---------------|------------------|
| Queries | 1 (JOIN) | 2+ (or $lookup) |
| Network | 1 roundtrip | 2+ roundtrips |
| Memory | Database joins | App joins |
| Speed | Faster for joins | Slower for joins |
| Flexibility | Rigid schema | Flexible schema |

**When MongoDB/Mongoose is Better**:
```typescript
// Flexible schema
const postSchema = new Schema({
    title: String,
    metadata: Schema.Types.Mixed  // Any structure
});

// Horizontal scaling
// MongoDB shards easily across servers
// SQL sharding is complex

// Large embedded arrays
const postSchema = new Schema({
    title: String,
    tags: [String],  // Array field
    comments: [commentSchema]  // Nested documents
});
// Single query retrieval
```

**When SQL/Sequelize is Better**:
```typescript
// Complex joins
SELECT posts.*, users.*, categories.*, tags.*
FROM posts
JOIN users ON posts.author_id = users.id
JOIN categories ON posts.category_id = categories.id
JOIN post_tags ON posts.id = post_tags.post_id
JOIN tags ON post_tags.tag_id = tags.id;
// 1 query in SQL vs 4+ in MongoDB

// Transactions across multiple tables
// SQL has ACID guarantees
// MongoDB has limited multi-document transactions
```

### Comparison with TypeORM

**TypeORM (SQL with decorators)**:
```typescript
// Similar include syntax to Sequelize
const posts = await postRepository.find({
    relations: ['author', 'category']
});

// Or eager loading
@Entity()
class Post {
    @ManyToOne(() => User, { eager: true })
    author: User;
}

const posts = await postRepository.find();
// Author automatically loaded
```

**Mongoose**:
```typescript
// Explicit populate
const posts = await Post.find().populate('author category');

// No eager loading by default
// Must call populate() each time
```

**Key Difference**: TypeORM uses database JOINs, Mongoose uses application-level joins

## Comparison with Laravel Eloquent

### Eloquent (PHP/Laravel) vs Mongoose

**Eloquent (Active Record Pattern)**:
```php
// Define relationship
class Post extends Model {
    public function author() {
        return $this->belongsTo(User::class);
    }
}

// Lazy loading (N+1 problem)
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->author->name;  // Query per post!
}

// Eager loading
$posts = Post::with('author')->get();
// Single JOIN query
```

**Mongoose (Data Mapper Pattern)**:
```typescript
// Define reference
const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Must use populate
const posts = await Post.find().populate('author');
```

**Key Similarities**:
1. Both support lazy and eager loading
2. Both have N+1 problem if not careful
3. Both support nested relationships

**Key Differences**:
| Feature | Eloquent | Mongoose |
|---------|----------|----------|
| Pattern | Active Record | Data Mapper |
| Relationships | Methods | Schema refs |
| Loading | Automatic properties | Explicit populate() |
| Database | SQL (JOINs) | MongoDB (queries) |

**Eloquent Relationship Types**:
```php
// One-to-One
$user->profile()
$profile->user()

// One-to-Many
$user->posts()
$post->author()

// Many-to-Many
$student->courses()
$course->students()
```

**Mongoose Equivalent**:
```typescript
// One-to-One
user.profile (ref)
profile.user (ref)

// One-to-Many
user (virtual populate)
post.author (ref)

// Many-to-Many
student.enrollments (virtual)
course.enrollments (virtual)
enrollment.student/course (refs)
```

## Advanced Patterns and Best Practices

### Dynamic References (Polymorphic)

**Scenario**: Comments can be on posts OR photos

```typescript
const commentSchema = new Schema({
    text: String,

    // Polymorphic reference
    commentableType: {
        type: String,
        enum: ['Post', 'Photo'],
        required: true
    },
    commentableId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

// Helper to populate based on type
commentSchema.methods.populateCommentable = async function() {
    await this.populate({
        path: 'commentableId',
        model: this.commentableType
    });
    return this;
};

const Comment = model('Comment', commentSchema);

// Usage
const comment = await Comment.findById(id);
await comment.populateCommentable();

if (comment.commentableType === 'Post') {
    console.log(comment.commentableId.title);
} else {
    console.log(comment.commentableId.url);
}
```

**Mongoose refPath** (Cleaner Syntax):
```typescript
const commentSchema = new Schema({
    text: String,
    commentableType: {
        type: String,
        enum: ['Post', 'Photo'],
        required: true
    },
    commentable: {
        type: Schema.Types.ObjectId,
        refPath: 'commentableType'  // Dynamic ref!
    }
});

// Auto-populates based on commentableType
const comment = await Comment.findById(id).populate('commentable');
```

### Populate with Aggregation

**Using $lookup for Population**:
```typescript
// More efficient than populate for complex queries
const posts = await Post.aggregate([
    {
        $lookup: {
            from: 'users',           // Collection name
            localField: 'author',    // Field in posts
            foreignField: '_id',     // Field in users
            as: 'authorDetails'      // Output array
        }
    },
    {
        $unwind: '$authorDetails'    // Convert array to object
    }
]);

// Result has authorDetails instead of author ObjectId
```

**Advantages over populate()**:
1. Single database operation (faster)
2. More control over pipeline
3. Can combine with other aggregations

**Disadvantages**:
1. More complex syntax
2. Returns plain objects (not Mongoose documents)
3. No Mongoose middleware

### Caching Populated Data

**Problem**: Repeated populates waste queries

```typescript
// Without caching
const post1 = await Post.findById(id).populate('author');
const post2 = await Post.findById(id).populate('author');
// 4 queries total (2 for posts, 2 for authors)
```

**With Caching** (using Redis):
```typescript
import { createClient } from 'redis';

const redis = createClient();

async function findPostWithAuthor(id: string) {
    // Check cache
    const cached = await redis.get(`post:${id}:populated`);
    if (cached) {
        return JSON.parse(cached);
    }

    // Query database
    const post = await Post.findById(id).populate('author');

    // Cache result (expire in 5 minutes)
    await redis.setex(
        `post:${id}:populated`,
        300,
        JSON.stringify(post)
    );

    return post;
}
```

### Denormalization Strategy

**Hybrid Approach**: Store both reference and frequently accessed fields

```typescript
const postSchema = new Schema({
    title: String,

    // Full reference for populate
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Denormalized data for quick access
    authorName: String,
    authorAvatar: String
});

// Middleware to sync denormalized data
postSchema.pre('save', async function(next) {
    if (this.isModified('author')) {
        const user = await User.findById(this.author);
        this.authorName = user.name;
        this.authorAvatar = user.avatar;
    }
    next();
});

// Usage
const posts = await Post.find();
// No populate needed for name/avatar!
posts.forEach(post => {
    console.log(post.authorName);  // Fast, no query
});

// But can still populate for full data
const post = await Post.findById(id).populate('author');
console.log(post.author.email);  // Full user object
```

**Trade-offs**:
- Pros: Faster reads, fewer queries
- Cons: Data duplication, sync complexity, stale data risk

### Best Practices Summary

1. **Choose the Right Pattern**:
   - Embed: Small, bounded, rarely queried separately
   - Reference: Large, unbounded, queried independently

2. **Optimize Queries**:
   - Use field selection: `.populate('author', 'name email')`
   - Limit results: `options: { limit: 10 }`
   - Avoid deep nesting: Max 2-3 levels

3. **Prevent N+1 Problems**:
   - Always use populate() for batch queries
   - Mongoose auto-batches with $in

4. **Memory Management**:
   - Paginate large result sets
   - Select only needed fields
   - Stream for very large datasets

5. **Index Properly**:
   ```typescript
   postSchema.index({ author: 1 });  // For author queries
   commentSchema.index({ post: 1 }); // For comment queries
   ```

6. **Consider Alternatives**:
   - Aggregation for complex queries
   - Denormalization for read-heavy apps
   - Caching for frequently accessed data

## Complete Real-World Example

**Social Media Application**:

```typescript
import { Schema, model, Types } from 'mongoose';

// User Model
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: String,
    profile: {
        avatar: String,
        bio: String
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Virtual for posts
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

// Virtual for follower count
userSchema.virtual('followerCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'following',
    count: true
});

const User = model('User', userSchema);

// Post Model
const postSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Denormalized for performance
    authorUsername: String,
    authorAvatar: String,

    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    media: [{
        type: String,  // URLs
    }]
}, {
    timestamps: true
});

// Index for queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Virtual for comments
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

// Sync denormalized data
postSchema.pre('save', async function(next) {
    if (this.isModified('author')) {
        const user = await User.findById(this.author);
        this.authorUsername = user.username;
        this.authorAvatar = user.profile.avatar;
    }
    next();
});

const Post = model('Post', postSchema);

// Comment Model
const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        maxlength: 500
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

commentSchema.index({ post: 1, createdAt: -1 });

const Comment = model('Comment', commentSchema);

// Usage Examples

// Create user and post
async function createPost(userId: string, content: string) {
    const post = await Post.create({
        content,
        author: userId
    });
    return post;
}

// Get feed (posts from following users)
async function getFeed(userId: string, page = 1, limit = 20) {
    const user = await User.findById(userId);

    const posts = await Post.find({
        author: { $in: user.following }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.avatar')
    .populate({
        path: 'comments',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: {
            path: 'author',
            select: 'username profile.avatar'
        }
    });

    return posts;
}

// Get user profile with posts
async function getUserProfile(username: string) {
    const user = await User.findOne({ username })
        .populate('followers', 'username profile.avatar')
        .populate('following', 'username profile.avatar')
        .populate({
            path: 'posts',
            options: { limit: 10, sort: { createdAt: -1 } }
        });

    return user;
}

// Like a post
async function likePost(postId: string, userId: string) {
    await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId }  // Prevent duplicates
    });
}

// Follow user
async function followUser(followerId: string, followingId: string) {
    await User.findByIdAndUpdate(followerId, {
        $addToSet: { following: followingId }
    });

    await User.findByIdAndUpdate(followingId, {
        $addToSet: { followers: followerId }
    });
}
```

## Conclusion

Mongoose relationships differ fundamentally from SQL ORMs:

1. **No native JOINs**: populate() runs separate queries
2. **Flexible schemas**: Can choose embedding vs referencing
3. **Application-level joins**: More control, more responsibility
4. **Trade-offs**: Performance vs flexibility

**Key Takeaways**:
- Understand when to embed vs reference
- Use virtual populate for reverse relationships
- Optimize with field selection and limits
- Consider denormalization for read-heavy apps
- Index reference fields
- Be aware of memory implications

**Next Steps**: Learn about Mongoose middleware, validation, and performance optimization techniques for production applications.
