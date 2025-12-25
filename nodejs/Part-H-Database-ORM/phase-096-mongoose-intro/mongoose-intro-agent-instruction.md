# Phase 096: Mongoose Introduction (MongoDB)
## Agent Instructions

**Phase**: 096 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Learn MongoDB/Mongoose
> MongoDB is the most popular NoSQL database in the Node.js ecosystem.
> Many startups and real-time applications use it.
> Mongoose is the standard ODM (Object Document Mapper).

## Topics
1. What is MongoDB — document database
2. When to use MongoDB vs SQL
3. Installing Mongoose
4. Connecting to MongoDB
5. Connection events
6. MongoDB Atlas (cloud)
7. Local MongoDB setup
8. Mongoose with TypeScript
9. Document vs Collection vs Database
10. Laravel comparison: MongoDB package

## Example
```typescript
import mongoose from 'mongoose';

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string, {
        dbName: 'myapp'
    });
    console.log('MongoDB connected');
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});
```

## Content Instructions
**Notes**: MongoDB and Mongoose introduction
**Summary**: Mongoose setup guide
