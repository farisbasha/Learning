# Phase 096c: Mongoose Relations
## Agent Instructions

**Phase**: 096c | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. References with ObjectId
2. `ref` option for population
3. `populate()` method
4. Nested population
5. Virtual populate
6. Embedding vs referencing (design decision)
7. One-to-One references
8. One-to-Many references
9. Many-to-Many with arrays
10. Population with select/match

## Example
```typescript
// Schema with reference
const postSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Populate
const post = await Post.findById(id).populate('author');
console.log(post.author.email);

// Nested populate
const post = await Post.findById(id)
    .populate({
        path: 'author',
        populate: { path: 'followers' }
    });

// Virtual populate
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});
```

## Content Instructions
**Notes**: Mongoose relationships and population
**Summary**: Population patterns reference
