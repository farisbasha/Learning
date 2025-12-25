# Phase 096a: Mongoose Schemas
## Agent Instructions

**Phase**: 096a | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Schema definition
2. Schema types: String, Number, Boolean, Date, ObjectId, Array, Mixed
3. Schema options: required, default, unique, index
4. Custom validators
5. Virtual properties
6. Instance methods
7. Static methods
8. Pre/Post hooks (middleware)
9. Schema to TypeScript interface
10. Timestamps

## Example
```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    email: string;
    password: string;
    posts: mongoose.Types.ObjectId[];
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
```

## Content Instructions
**Notes**: Mongoose schema definition with TypeScript
**Summary**: Mongoose schema options reference
