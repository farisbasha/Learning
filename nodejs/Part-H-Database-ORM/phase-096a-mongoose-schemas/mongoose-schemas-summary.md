# Phase 096a: Mongoose Schemas - Quick Reference

## Schema Types

| Type | Example | Notes |
|------|---------|-------|
| `String` | `name: String` | Text data |
| `Number` | `age: Number` | Integers and floats |
| `Boolean` | `isActive: Boolean` | true/false |
| `Date` | `createdAt: Date` | Timestamps |
| `ObjectId` | `{ type: Schema.Types.ObjectId, ref: 'User' }` | References |
| `Array` | `tags: [String]` | Lists |
| `Mixed` | `Schema.Types.Mixed` | Any type (use sparingly) |
| `Buffer` | `Buffer` | Binary data |
| `Map` | `{ type: Map, of: String }` | Key-value pairs |
| `Decimal128` | `Schema.Types.Decimal128` | High-precision decimals |

## Field Options

```typescript
const schema = new Schema({
  // Required
  name: { type: String, required: true },
  email: { type: String, required: [true, 'Email is required'] },

  // Default
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },

  // Unique & Index
  username: { type: String, unique: true },
  score: { type: Number, index: true },

  // String Transformations
  email: { type: String, lowercase: true, trim: true },
  code: { type: String, uppercase: true },

  // Constraints
  age: { type: Number, min: 0, max: 150 },
  title: { type: String, minlength: 3, maxlength: 100 },
  role: { type: String, enum: ['user', 'admin'] },
  phone: { type: String, match: /^\+?[1-9]\d{1,14}$/ },

  // Special
  password: { type: String, select: false },  // Exclude by default
  createdBy: { type: ObjectId, immutable: true }  // Cannot change
});
```

## Schema-Level Options

```typescript
new Schema({...}, {
  timestamps: true,                    // Add createdAt, updatedAt
  collection: 'custom_name',           // Custom collection name
  strict: true,                        // Only save defined fields
  versionKey: '__v',                   // Optimistic concurrency
  toJSON: { virtuals: true },          // Include virtuals in JSON
  toObject: { virtuals: true }         // Include virtuals in objects
});
```

## Custom Validators

```typescript
// Simple
age: {
  type: Number,
  validate: (v) => v >= 0 && v <= 150
}

// With message
email: {
  type: String,
  validate: {
    validator: (v) => /\S+@\S+\.\S+/.test(v),
    message: props => `${props.value} is not a valid email`
  }
}

// Async
username: {
  type: String,
  validate: {
    validator: async (v) => {
      const count = await User.countDocuments({ username: v });
      return count === 0;
    },
    message: 'Username already exists'
  }
}
```

## Virtuals

```typescript
// Getter virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Setter virtual
userSchema.virtual('fullName').set(function(v) {
  const [first, ...last] = v.split(' ');
  this.firstName = first;
  this.lastName = last.join(' ');
});

// Virtual populate
authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author'
});
```

## Instance Methods

```typescript
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Usage
const isMatch = await user.comparePassword('test123');
```

## Static Methods

```typescript
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Usage
const user = await User.findByEmail('john@example.com');
```

## Middleware (Hooks)

```typescript
// Pre-save
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Post-save
userSchema.post('save', function(doc) {
  console.log('User saved:', doc.email);
});

// Pre-find (query middleware)
userSchema.pre('find', function() {
  this.where({ isActive: true });
});

// Error handling
userSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Duplicate key'));
  } else {
    next(error);
  }
});
```

## TypeScript Pattern

```typescript
// 1. Document interface
interface IUser {
  name: string;
  email: string;
}

// 2. Methods interface
interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

// 3. Model interface
interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUser | null>;
}

// 4. Schema with types
const userSchema = new Schema<IUser, IUserModel, IUserMethods>({...});

// 5. Create model
const User = model<IUser, IUserModel>('User', userSchema);
```

## Nested Documents

```typescript
// Inline nested
const userSchema = new Schema({
  profile: {
    bio: String,
    avatar: String
  }
});

// Separate schema
const addressSchema = new Schema({
  street: String,
  city: String
}, { _id: false });

const userSchema = new Schema({
  address: addressSchema,
  addresses: [addressSchema]  // Array of subdocuments
});
```

## Common Patterns

```typescript
// Timestamps
{ timestamps: true }
// Adds: createdAt, updatedAt

// Custom timestamps
{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }

// Soft delete pattern
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}

// Auto-increment (use counter collection)
// Or use mongoose-sequence plugin
```
