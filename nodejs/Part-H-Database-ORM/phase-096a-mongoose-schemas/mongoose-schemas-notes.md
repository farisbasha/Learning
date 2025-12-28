# Phase 096a: Mongoose Schemas

## Table of Contents
1. [Schema Definition](#schema-definition)
2. [Schema Types](#schema-types)
3. [Schema Options](#schema-options)
4. [Custom Validators](#custom-validators)
5. [Virtual Properties](#virtual-properties)
6. [Instance Methods](#instance-methods)
7. [Static Methods](#static-methods)
8. [Pre/Post Hooks (Middleware)](#prepost-hooks-middleware)
9. [Schema to TypeScript Interface](#schema-to-typescript-interface)
10. [Timestamps Option](#timestamps-option)

---

## Schema Definition

A Mongoose Schema defines the structure, default values, validators, and other characteristics of documents in a MongoDB collection. It's the blueprint for your data.

### Basic Schema Creation

```typescript
import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Basic schema definition
const userSchema = new Schema({
  name: String,           // Shorthand for { type: String }
  email: String,
  age: Number,
  isActive: Boolean
});

// More detailed schema definition
const detailedUserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create model from schema
const User = model('User', userSchema);
```

### Schema Architecture

```
Schema Definition Flow:
┌──────────────────────────────────────────────────────────┐
│                    MONGOOSE SCHEMA                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   Schema Definition          Model                       │
│   ┌──────────────┐          ┌──────────────┐            │
│   │ const schema │  ─────►  │ model('User' │            │
│   │ = new Schema │          │   , schema)  │            │
│   │   ({...})    │          └──────────────┘            │
│   └──────────────┘                 │                    │
│                                    ▼                    │
│                          MongoDB Collection             │
│                          ┌──────────────┐               │
│                          │    users     │               │
│                          │  (lowercase  │               │
│                          │  + plural)   │               │
│                          └──────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Types

Mongoose supports a rich set of schema types to define your document structure.

### Core Schema Types

```typescript
import { Schema, Types } from 'mongoose';

const comprehensiveSchema = new Schema({
  // ═══════════════════════════════════════════════════════
  // STRING
  // ═══════════════════════════════════════════════════════
  name: String,                          // Simple declaration
  description: { type: String },         // Object notation
  slug: {
    type: String,
    lowercase: true,     // Convert to lowercase
    trim: true,          // Remove whitespace
    maxlength: 100,      // Maximum length
    minlength: 3,        // Minimum length
    match: /^[a-z0-9-]+$/, // Regex pattern
    enum: ['draft', 'published', 'archived']  // Allowed values
  },

  // ═══════════════════════════════════════════════════════
  // NUMBER
  // ═══════════════════════════════════════════════════════
  age: Number,
  price: {
    type: Number,
    min: 0,              // Minimum value
    max: 1000000,        // Maximum value
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },

  // ═══════════════════════════════════════════════════════
  // BOOLEAN
  // ═══════════════════════════════════════════════════════
  isActive: Boolean,
  isVerified: {
    type: Boolean,
    default: false
  },

  // ═══════════════════════════════════════════════════════
  // DATE
  // ═══════════════════════════════════════════════════════
  createdAt: Date,
  publishedAt: {
    type: Date,
    default: Date.now    // Function reference (called on creation)
  },
  expiresAt: {
    type: Date,
    min: Date.now,       // Must be in future
    index: true          // Create index for queries
  },

  // ═══════════════════════════════════════════════════════
  // OBJECTID (References)
  // ═══════════════════════════════════════════════════════
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',         // Reference to User model (for populate)
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },

  // ═══════════════════════════════════════════════════════
  // ARRAY
  // ═══════════════════════════════════════════════════════
  tags: [String],        // Array of strings
  scores: [Number],      // Array of numbers

  // Array of ObjectIds (references)
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],

  // Array of embedded documents
  reviews: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // ═══════════════════════════════════════════════════════
  // MIXED (Any type - use sparingly!)
  // ═══════════════════════════════════════════════════════
  metadata: Schema.Types.Mixed,
  settings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // Alternative syntax for mixed
  flexible: Object,

  // ═══════════════════════════════════════════════════════
  // BUFFER (Binary data)
  // ═══════════════════════════════════════════════════════
  avatar: Buffer,
  thumbnail: {
    type: Buffer,
    contentType: String  // Often stored alongside
  },

  // ═══════════════════════════════════════════════════════
  // MAP (Key-value pairs)
  // ═══════════════════════════════════════════════════════
  socialLinks: {
    type: Map,
    of: String
    // { twitter: 'url', github: 'url', ... }
  },
  attributes: {
    type: Map,
    of: Schema.Types.Mixed
  },

  // ═══════════════════════════════════════════════════════
  // DECIMAL128 (High-precision decimals)
  // ═══════════════════════════════════════════════════════
  accountBalance: {
    type: Schema.Types.Decimal128
    // For financial data requiring precision
  },

  // ═══════════════════════════════════════════════════════
  // UUID
  // ═══════════════════════════════════════════════════════
  externalId: {
    type: Schema.Types.UUID
  }
});
```

### Nested Documents (Subdocuments)

```typescript
// Embedded/Nested document schema
const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  country: { type: String, default: 'USA' },
  zipCode: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { _id: false });  // Disable _id for subdocuments if not needed

const userSchema = new Schema({
  name: String,
  email: String,

  // Single embedded document
  address: addressSchema,

  // Alternative: inline definition
  profile: {
    bio: { type: String, maxlength: 500 },
    avatar: String,
    website: String
  },

  // Array of embedded documents
  addresses: [addressSchema],

  // Deeply nested
  company: {
    name: String,
    position: String,
    department: {
      name: String,
      floor: Number
    }
  }
});

// Access nested properties
const user = await User.findOne();
console.log(user.address.city);
console.log(user.company.department.name);
```

### Type Comparison Chart

```
┌─────────────────┬─────────────────┬───────────────────────────┐
│  Mongoose Type  │   JavaScript    │       MongoDB BSON        │
├─────────────────┼─────────────────┼───────────────────────────┤
│ String          │ string          │ String                    │
│ Number          │ number          │ Double / Int32 / Int64    │
│ Boolean         │ boolean         │ Boolean                   │
│ Date            │ Date            │ Date                      │
│ Buffer          │ Buffer          │ BinData                   │
│ ObjectId        │ ObjectId        │ ObjectId                  │
│ Array           │ Array           │ Array                     │
│ Mixed           │ any             │ (varies)                  │
│ Decimal128      │ Decimal128      │ Decimal128                │
│ Map             │ Map             │ Object                    │
│ UUID            │ Buffer          │ BinData (subtype 4)       │
└─────────────────┴─────────────────┴───────────────────────────┘
```

---

## Schema Options

Schema options control field behavior, validation, and data transformation.

### Field-Level Options

```typescript
const productSchema = new Schema({
  // ═══════════════════════════════════════════════════════
  // REQUIRED - Field must have a value
  // ═══════════════════════════════════════════════════════
  name: {
    type: String,
    required: true                    // Simple required
  },
  email: {
    type: String,
    required: [true, 'Email is required']  // With custom message
  },
  category: {
    type: String,
    required: function() {            // Conditional required
      return this.isPublished;        // Required only if published
    }
  },

  // ═══════════════════════════════════════════════════════
  // DEFAULT - Default value if not provided
  // ═══════════════════════════════════════════════════════
  status: {
    type: String,
    default: 'draft'                  // Static default
  },
  createdAt: {
    type: Date,
    default: Date.now                 // Function (called on each doc)
  },
  slug: {
    type: String,
    default: function() {             // Dynamic default
      return this.name?.toLowerCase().replace(/\s+/g, '-');
    }
  },
  uuid: {
    type: String,
    default: () => crypto.randomUUID()  // Arrow function
  },

  // ═══════════════════════════════════════════════════════
  // UNIQUE - Create unique index
  // ═══════════════════════════════════════════════════════
  sku: {
    type: String,
    unique: true        // Creates unique index
    // Note: null values are considered unique!
  },
  // Sparse unique - allows multiple null values
  optionalUniqueField: {
    type: String,
    unique: true,
    sparse: true        // Only index non-null values
  },

  // ═══════════════════════════════════════════════════════
  // INDEX - Create database index for faster queries
  // ═══════════════════════════════════════════════════════
  price: {
    type: Number,
    index: true         // Simple index
  },
  publishedAt: {
    type: Date,
    index: -1           // Descending index
  },

  // ═══════════════════════════════════════════════════════
  // STRING TRANSFORMATIONS
  // ═══════════════════════════════════════════════════════
  email: {
    type: String,
    lowercase: true     // Convert to lowercase before saving
  },
  code: {
    type: String,
    uppercase: true     // Convert to uppercase before saving
  },
  description: {
    type: String,
    trim: true          // Remove leading/trailing whitespace
  },

  // ═══════════════════════════════════════════════════════
  // ENUM - Restrict to specific values
  // ═══════════════════════════════════════════════════════
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority'
    }
  },
  // TypeScript enum integration
  status: {
    type: String,
    enum: Object.values(ProductStatus)  // Use TS enum values
  },

  // ═══════════════════════════════════════════════════════
  // MIN/MAX - Numeric and date constraints
  // ═══════════════════════════════════════════════════════
  quantity: {
    type: Number,
    min: [0, 'Quantity cannot be negative'],
    max: [10000, 'Quantity too large']
  },
  discount: {
    type: Number,
    min: 0,
    max: 100             // Percentage 0-100
  },

  // ═══════════════════════════════════════════════════════
  // MINLENGTH/MAXLENGTH - String length constraints
  // ═══════════════════════════════════════════════════════
  title: {
    type: String,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  // ═══════════════════════════════════════════════════════
  // MATCH - Regex pattern validation
  // ═══════════════════════════════════════════════════════
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  slug: {
    type: String,
    match: /^[a-z0-9-]+$/
  },

  // ═══════════════════════════════════════════════════════
  // IMMUTABLE - Cannot be modified after creation
  // ═══════════════════════════════════════════════════════
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    immutable: true     // Cannot change after document is saved
  },

  // ═══════════════════════════════════════════════════════
  // SELECT - Exclude from query results by default
  // ═══════════════════════════════════════════════════════
  password: {
    type: String,
    select: false       // Not returned in queries by default
    // Use .select('+password') to include
  },

  // ═══════════════════════════════════════════════════════
  // ALIAS - Alternative name for a field
  // ═══════════════════════════════════════════════════════
  n: {
    type: String,
    alias: 'name'       // Access as doc.name (maps to doc.n in DB)
  },

  // ═══════════════════════════════════════════════════════
  // GET/SET - Transform on read/write
  // ═══════════════════════════════════════════════════════
  creditCard: {
    type: String,
    get: (v: string) => v ? `****-****-****-${v.slice(-4)}` : v,
    set: (v: string) => v.replace(/\D/g, '')  // Store only digits
  },
  temperature: {
    type: Number,
    get: (v: number) => Math.round(v * 10) / 10  // Round on read
  }
});
```

### Schema-Level Options

```typescript
const userSchema = new Schema({
  name: String,
  email: String
}, {
  // ═══════════════════════════════════════════════════════
  // TIMESTAMPS - Auto-manage createdAt/updatedAt
  // ═══════════════════════════════════════════════════════
  timestamps: true,
  // Or customize field names:
  // timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },

  // ═══════════════════════════════════════════════════════
  // COLLECTION - Custom collection name
  // ═══════════════════════════════════════════════════════
  collection: 'app_users',  // Instead of auto-generated 'users'

  // ═══════════════════════════════════════════════════════
  // STRICT - Enforce schema (default: true)
  // ═══════════════════════════════════════════════════════
  strict: true,         // Only save fields defined in schema
  // strict: false,     // Allow any fields
  // strict: 'throw',   // Throw error for undefined fields

  // ═══════════════════════════════════════════════════════
  // STRICT QUERY - Enforce schema in queries
  // ═══════════════════════════════════════════════════════
  strictQuery: true,    // Filter out invalid query fields

  // ═══════════════════════════════════════════════════════
  // VERSION KEY - Optimistic concurrency control
  // ═══════════════════════════════════════════════════════
  versionKey: '__v',    // Default field name
  // versionKey: false, // Disable versioning

  // ═══════════════════════════════════════════════════════
  // MINIMIZE - Remove empty objects
  // ═══════════════════════════════════════════════════════
  minimize: true,       // Remove empty objects from doc (default)
  // minimize: false,   // Keep empty objects: {}

  // ═══════════════════════════════════════════════════════
  // VIRTUALS IN JSON/OBJECT
  // ═══════════════════════════════════════════════════════
  toJSON: { virtuals: true },
  toObject: { virtuals: true },

  // ═══════════════════════════════════════════════════════
  // AUTO INDEX - Auto-build indexes (disable in production)
  // ═══════════════════════════════════════════════════════
  autoIndex: true,      // Build indexes automatically
  // autoIndex: false,  // Disable for production performance

  // ═══════════════════════════════════════════════════════
  // ID VIRTUAL - Create 'id' virtual from '_id'
  // ═══════════════════════════════════════════════════════
  id: true,             // doc.id returns doc._id as string

  // ═══════════════════════════════════════════════════════
  // READ PREFERENCE - For replica sets
  // ═══════════════════════════════════════════════════════
  read: 'primary',      // primary, secondary, nearest, etc.

  // ═══════════════════════════════════════════════════════
  // DISCRIMINATOR KEY - For inheritance
  // ═══════════════════════════════════════════════════════
  discriminatorKey: 'kind'  // For model inheritance
});
```

---

## Custom Validators

Create custom validation logic beyond built-in validators.

### Basic Custom Validators

```typescript
const userSchema = new Schema({
  // Synchronous validator
  username: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(v);
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid username! Use 3-20 alphanumeric characters.`
    }
  },

  // Async validator (e.g., check database)
  email: {
    type: String,
    validate: {
      validator: async function(email: string): Promise<boolean> {
        // Check if email is already in use
        const existingUser = await mongoose.model('User').findOne({ email });
        // Return false if found (and it's not the current document)
        return !existingUser || existingUser._id.equals(this._id);
      },
      message: 'Email is already registered'
    }
  },

  // Multiple validators
  password: {
    type: String,
    validate: [
      {
        validator: (v: string) => v.length >= 8,
        message: 'Password must be at least 8 characters'
      },
      {
        validator: (v: string) => /[A-Z]/.test(v),
        message: 'Password must contain at least one uppercase letter'
      },
      {
        validator: (v: string) => /[a-z]/.test(v),
        message: 'Password must contain at least one lowercase letter'
      },
      {
        validator: (v: string) => /[0-9]/.test(v),
        message: 'Password must contain at least one number'
      }
    ]
  },

  // Simple function validator
  age: {
    type: Number,
    validate: (v: number) => v >= 0 && v <= 150
  }
});
```

### Advanced Validation Patterns

```typescript
// Cross-field validation using 'this' context
const eventSchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(endDate: Date): boolean {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  }
});

// Array validation
const orderSchema = new Schema({
  items: {
    type: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, min: 1 }
    }],
    validate: {
      validator: function(items: any[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  }
});

// Conditional validation with required
const paymentSchema = new Schema({
  method: {
    type: String,
    enum: ['card', 'bank', 'paypal'],
    required: true
  },
  cardNumber: {
    type: String,
    required: function() {
      return this.method === 'card';
    },
    validate: {
      validator: function(v: string) {
        if (this.method !== 'card') return true;
        return /^\d{16}$/.test(v);
      },
      message: 'Invalid card number'
    }
  },
  bankAccount: {
    type: String,
    required: function() {
      return this.method === 'bank';
    }
  }
});

// Validation with external library (e.g., validator.js)
import validator from 'validator';

const contactSchema = new Schema({
  email: {
    type: String,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Invalid email format'
    }
  },
  url: {
    type: String,
    validate: {
      validator: (v: string) => !v || validator.isURL(v),
      message: 'Invalid URL format'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: (v: string) => validator.isMobilePhone(v, 'any'),
      message: 'Invalid phone number'
    }
  }
});
```

---

## Virtual Properties

Virtuals are computed properties that don't persist to MongoDB. They're derived from other fields.

### Basic Virtuals

```typescript
import { Schema, model, Document } from 'mongoose';

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
}

// Extend with virtuals
interface IUserVirtuals {
  fullName: string;
  age: number;
  emailDomain: string;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  birthDate: Date
}, {
  toJSON: { virtuals: true },   // Include virtuals in JSON
  toObject: { virtuals: true }  // Include virtuals in objects
});

// ═══════════════════════════════════════════════════════
// GETTER VIRTUAL - Computed on read
// ═══════════════════════════════════════════════════════
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ═══════════════════════════════════════════════════════
// SETTER VIRTUAL - Decompose on write
// ═══════════════════════════════════════════════════════
userSchema.virtual('fullName').set(function(fullName: string) {
  const [firstName, ...lastNameParts] = fullName.split(' ');
  this.firstName = firstName;
  this.lastName = lastNameParts.join(' ');
});

// ═══════════════════════════════════════════════════════
// COMPUTED VIRTUAL
// ═══════════════════════════════════════════════════════
userSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birth = new Date(this.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('emailDomain').get(function() {
  return this.email?.split('@')[1];
});

const User = model<IUser>('User', userSchema);

// Usage
const user = new User({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  birthDate: new Date('1990-05-15')
});

console.log(user.fullName);     // "John Doe"
console.log(user.age);          // 34 (computed)
console.log(user.emailDomain);  // "example.com"

// Using setter
user.fullName = 'Jane Smith';
console.log(user.firstName);    // "Jane"
console.log(user.lastName);     // "Smith"
```

### Virtual Populate (Reverse References)

```typescript
// Author has many books (but books have the reference)
const authorSchema = new Schema({
  name: String,
  bio: String
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get all books by this author
authorSchema.virtual('books', {
  ref: 'Book',           // Model to populate from
  localField: '_id',     // Author's _id
  foreignField: 'author', // Book's author field
  justOne: false,        // Array of results
  options: { sort: { publishedAt: -1 } }  // Optional query options
});

const bookSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'Author' },
  publishedAt: Date
});

const Author = model('Author', authorSchema);
const Book = model('Book', bookSchema);

// Usage - get author with all their books
const author = await Author.findById(authorId).populate('books');
console.log(author.books);  // Array of book documents
```

---

## Instance Methods

Instance methods are functions available on individual document instances.

```typescript
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser {
  email: string;
  password: string;
  loginAttempts: number;
  lockUntil?: Date;
}

// Define method signatures
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  getPublicProfile(): { email: string; id: string };
}

// Combined type for documents
type UserDocument = Document<Types.ObjectId> & IUser & IUserMethods;

const userSchema = new Schema<IUser, {}, IUserMethods>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
});

// ═══════════════════════════════════════════════════════
// ASYNC INSTANCE METHOD
// ═══════════════════════════════════════════════════════
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  // 'this' refers to the document instance
  return bcrypt.compare(candidatePassword, this.password);
};

// ═══════════════════════════════════════════════════════
// SYNC INSTANCE METHOD
// ═══════════════════════════════════════════════════════
userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// ═══════════════════════════════════════════════════════
// METHOD THAT MODIFIES AND SAVES
// ═══════════════════════════════════════════════════════
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  // If lock has expired, reset
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// ═══════════════════════════════════════════════════════
// METHOD RETURNING PLAIN OBJECT
// ═══════════════════════════════════════════════════════
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id.toString(),
    email: this.email
  };
};

const User = model<IUser, Model<IUser, {}, IUserMethods>>('User', userSchema);

// Usage
async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isLocked()) {
    throw new Error('Account is locked. Try again later.');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid password');
  }

  await user.resetLoginAttempts();
  return user.getPublicProfile();
}
```

---

## Static Methods

Static methods are functions available on the Model itself (not on documents).

```typescript
import { Schema, model, Model, Document, Types } from 'mongoose';

interface IProduct {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  soldCount: number;
}

// Define static method signatures
interface IProductModel extends Model<IProduct> {
  findByCategory(category: string): Promise<IProduct[]>;
  findInStock(): Promise<IProduct[]>;
  findBestSellers(limit?: number): Promise<IProduct[]>;
  getAveragePrice(category?: string): Promise<number>;
  bulkUpdatePrices(percentage: number): Promise<number>;
}

const productSchema = new Schema<IProduct, IProductModel>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 }
});

// ═══════════════════════════════════════════════════════
// BASIC STATIC METHODS
// ═══════════════════════════════════════════════════════
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category });
};

productSchema.statics.findInStock = function() {
  return this.find({ inStock: true });
};

productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find()
    .sort({ soldCount: -1 })
    .limit(limit);
};

// ═══════════════════════════════════════════════════════
// AGGREGATION STATIC METHOD
// ═══════════════════════════════════════════════════════
productSchema.statics.getAveragePrice = async function(category?: string) {
  const match = category ? { category } : {};

  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);

  return result[0]?.avgPrice || 0;
};

// ═══════════════════════════════════════════════════════
// BULK OPERATION STATIC METHOD
// ═══════════════════════════════════════════════════════
productSchema.statics.bulkUpdatePrices = async function(percentage: number) {
  const result = await this.updateMany(
    {},
    { $mul: { price: 1 + (percentage / 100) } }
  );
  return result.modifiedCount;
};

const Product = model<IProduct, IProductModel>('Product', productSchema);

// Usage
async function examples() {
  // Find products by category
  const electronics = await Product.findByCategory('electronics');

  // Get in-stock products
  const inStock = await Product.findInStock();

  // Get best sellers
  const topProducts = await Product.findBestSellers(5);

  // Get average price
  const avgPrice = await Product.getAveragePrice('electronics');
  console.log(`Average electronics price: $${avgPrice.toFixed(2)}`);

  // Increase all prices by 10%
  const updated = await Product.bulkUpdatePrices(10);
  console.log(`Updated ${updated} products`);
}
```

### Instance vs Static Methods Comparison

```
┌─────────────────────────────────────────────────────────┐
│        INSTANCE METHODS vs STATIC METHODS               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSTANCE METHODS                                       │
│  ─────────────────                                      │
│  • Operate on a single document                         │
│  • Access document data via 'this'                      │
│  • Called on document: user.comparePassword()           │
│  • Use for: validation, transformation, actions         │
│                                                         │
│  STATIC METHODS                                         │
│  ──────────────                                         │
│  • Operate on the collection                            │
│  • Access model via 'this'                              │
│  • Called on model: User.findByEmail()                  │
│  • Use for: queries, aggregations, bulk operations      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pre/Post Hooks (Middleware)

Middleware are functions that execute before or after certain operations.

### Document Middleware

```typescript
import { Schema, model, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser {
  email: string;
  password: string;
  passwordChangedAt?: Date;
  slug?: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  passwordChangedAt: Date,
  slug: String,
  name: { type: String, required: true }
});

// ═══════════════════════════════════════════════════════
// PRE SAVE - Runs before document.save()
// ═══════════════════════════════════════════════════════
userSchema.pre('save', async function(next) {
  // Only hash password if it was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Update password changed timestamp
  this.passwordChangedAt = new Date();

  next();
});

// Generate slug from name
userSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// ═══════════════════════════════════════════════════════
// POST SAVE - Runs after document.save()
// ═══════════════════════════════════════════════════════
userSchema.post('save', function(doc, next) {
  console.log(`User ${doc.email} was saved`);
  // Send welcome email, trigger analytics, etc.
  next();
});

// ═══════════════════════════════════════════════════════
// PRE VALIDATE - Runs before validation
// ═══════════════════════════════════════════════════════
userSchema.pre('validate', function(next) {
  // Normalize email before validation
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// ═══════════════════════════════════════════════════════
// POST VALIDATE - Runs after validation (before save)
// ═══════════════════════════════════════════════════════
userSchema.post('validate', function(doc) {
  console.log('Validation passed for:', doc.email);
});

// ═══════════════════════════════════════════════════════
// PRE REMOVE / DELETE
// ═══════════════════════════════════════════════════════
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // 'this' is the document being removed
  console.log(`About to delete user: ${this.email}`);

  // Clean up related data
  // await Post.deleteMany({ author: this._id });
  // await Comment.deleteMany({ user: this._id });

  next();
});
```

### Query Middleware

```typescript
// ═══════════════════════════════════════════════════════
// PRE FIND - Runs before find queries
// ═══════════════════════════════════════════════════════
userSchema.pre('find', function(next) {
  // 'this' is the query object
  // Automatically exclude soft-deleted documents
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Apply to multiple query types
userSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function(next) {
  this.where({ isActive: true });
  next();
});

// ═══════════════════════════════════════════════════════
// PRE FIND ONE
// ═══════════════════════════════════════════════════════
userSchema.pre('findOne', function(next) {
  // Auto-populate certain fields
  this.populate('profile');
  next();
});

// ═══════════════════════════════════════════════════════
// PRE UPDATE
// ═══════════════════════════════════════════════════════
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;

  // Hash password if being updated
  if (update.$set?.password) {
    const salt = await bcrypt.genSalt(10);
    update.$set.password = await bcrypt.hash(update.$set.password, salt);
    update.$set.passwordChangedAt = new Date();
  }

  // Set updatedAt
  update.$set = update.$set || {};
  update.$set.updatedAt = new Date();

  next();
});

// ═══════════════════════════════════════════════════════
// POST FIND - Process results
// ═══════════════════════════════════════════════════════
userSchema.post('find', function(docs, next) {
  console.log(`Found ${docs.length} users`);
  next();
});

userSchema.post('findOne', function(doc, next) {
  if (doc) {
    console.log(`Found user: ${doc.email}`);
  }
  next();
});
```

### Aggregation Middleware

```typescript
// ═══════════════════════════════════════════════════════
// PRE AGGREGATE
// ═══════════════════════════════════════════════════════
userSchema.pre('aggregate', function(next) {
  // Add match stage at the beginning to exclude deleted docs
  this.pipeline().unshift({
    $match: { isDeleted: { $ne: true } }
  });
  next();
});
```

### Error Handling Middleware

```typescript
// ═══════════════════════════════════════════════════════
// ERROR HANDLING - Handle errors from middleware
// ═══════════════════════════════════════════════════════
userSchema.post('save', function(error: any, doc: any, next: Function) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    // Duplicate key error
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

userSchema.post('findOneAndUpdate', function(error: any, doc: any, next: Function) {
  if (error) {
    console.error('Update error:', error);
  }
  next(error);
});
```

### Middleware Execution Order

```
Document Middleware Order:
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  doc.save() called                                      │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────────┐                                        │
│  │ pre validate│ → validation runs                      │
│  └─────────────┘                                        │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────┐                                       │
│  │ post validate│                                       │
│  └──────────────┘                                       │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────┐                                           │
│  │ pre save │ → document saved to DB                    │
│  └──────────┘                                           │
│       │                                                 │
│       ▼                                                 │
│  ┌───────────┐                                          │
│  │ post save │                                          │
│  └───────────┘                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Schema to TypeScript Interface

Best practices for type-safe Mongoose schemas.

### Complete Type-Safe Schema Pattern

```typescript
import mongoose, {
  Schema,
  model,
  Document,
  Model,
  Types,
  HydratedDocument
} from 'mongoose';

// ═══════════════════════════════════════════════════════
// 1. DEFINE BASE INTERFACE (raw data)
// ═══════════════════════════════════════════════════════
export interface IUser {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  profile?: {
    bio?: string;
    avatar?: string;
    social?: {
      twitter?: string;
      github?: string;
    };
  };
  tags: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════
// 2. DEFINE VIRTUALS INTERFACE
// ═══════════════════════════════════════════════════════
export interface IUserVirtuals {
  displayName: string;
  isAdmin: boolean;
}

// ═══════════════════════════════════════════════════════
// 3. DEFINE INSTANCE METHODS INTERFACE
// ═══════════════════════════════════════════════════════
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  updateLastLogin(): Promise<void>;
}

// ═══════════════════════════════════════════════════════
// 4. DEFINE STATIC METHODS INTERFACE
// ═══════════════════════════════════════════════════════
export interface IUserModel extends Model<IUser, {}, IUserMethods, IUserVirtuals> {
  findByEmail(email: string): Promise<HydratedDocument<IUser, IUserMethods & IUserVirtuals> | null>;
  findActiveUsers(): Promise<HydratedDocument<IUser, IUserMethods & IUserVirtuals>[]>;
  countByRole(role: string): Promise<number>;
}

// ═══════════════════════════════════════════════════════
// 5. DEFINE DOCUMENT TYPE (for function parameters)
// ═══════════════════════════════════════════════════════
export type UserDocument = HydratedDocument<IUser, IUserMethods & IUserVirtuals>;

// ═══════════════════════════════════════════════════════
// 6. CREATE SCHEMA WITH TYPES
// ═══════════════════════════════════════════════════════
const userSchema = new Schema<IUser, IUserModel, IUserMethods, {}, IUserVirtuals>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      avatar: String,
      social: {
        twitter: String,
        github: String
      }
    },
    tags: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ═══════════════════════════════════════════════════════
// 7. ADD VIRTUALS
// ═══════════════════════════════════════════════════════
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// ═══════════════════════════════════════════════════════
// 8. ADD INSTANCE METHODS
// ═══════════════════════════════════════════════════════
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function(): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
};

userSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLoginAt = new Date();
  await this.save();
};

// ═══════════════════════════════════════════════════════
// 9. ADD STATIC METHODS
// ═══════════════════════════════════════════════════════
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.countByRole = function(role: string) {
  return this.countDocuments({ role });
};

// ═══════════════════════════════════════════════════════
// 10. ADD MIDDLEWARE
// ═══════════════════════════════════════════════════════
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const bcrypt = await import('bcrypt');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ═══════════════════════════════════════════════════════
// 11. CREATE AND EXPORT MODEL
// ═══════════════════════════════════════════════════════
export const User = model<IUser, IUserModel>('User', userSchema);

// ═══════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════
async function examples() {
  // Create - types are inferred
  const user = await User.create({
    email: 'john@example.com',
    password: 'securePassword123',
    name: 'John Doe'
  });

  // TypeScript knows about all properties and methods
  console.log(user.name);           // string
  console.log(user.displayName);    // string (virtual)
  console.log(user.isAdmin);        // boolean (virtual)

  // Instance methods are typed
  const token = user.generateAuthToken();  // string
  await user.updateLastLogin();            // Promise<void>

  // Static methods are typed
  const found = await User.findByEmail('john@example.com');
  const active = await User.findActiveUsers();
  const adminCount = await User.countByRole('admin');

  // Function accepting document
  async function processUser(user: UserDocument) {
    console.log(user.email);
    const isValid = await user.comparePassword('test');
  }
}
```

---

## Timestamps Option

Automatic management of `createdAt` and `updatedAt` fields.

```typescript
const postSchema = new Schema({
  title: String,
  content: String
}, {
  // Enable timestamps
  timestamps: true
});

// Results in documents like:
// {
//   _id: ObjectId("..."),
//   title: "My Post",
//   content: "...",
//   createdAt: ISODate("2024-01-15T10:30:00Z"),
//   updatedAt: ISODate("2024-01-15T14:45:00Z")
// }

// ═══════════════════════════════════════════════════════
// CUSTOM FIELD NAMES
// ═══════════════════════════════════════════════════════
const articleSchema = new Schema({
  title: String
}, {
  timestamps: {
    createdAt: 'created_at',    // Use snake_case
    updatedAt: 'updated_at'
  }
});

// ═══════════════════════════════════════════════════════
// DISABLE ONE TIMESTAMP
// ═══════════════════════════════════════════════════════
const logSchema = new Schema({
  message: String
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false  // Only track creation, not updates
  }
});

// ═══════════════════════════════════════════════════════
// WITH TYPESCRIPT
// ═══════════════════════════════════════════════════════
interface IPost {
  title: string;
  content: string;
  createdAt: Date;  // Added by timestamps: true
  updatedAt: Date;  // Added by timestamps: true
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

// ═══════════════════════════════════════════════════════
// QUERYING BY TIMESTAMPS
// ═══════════════════════════════════════════════════════
// Find posts created today
const today = new Date();
today.setHours(0, 0, 0, 0);

const todaysPosts = await Post.find({
  createdAt: { $gte: today }
});

// Find posts updated in last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

const recentlyUpdated = await Post.find({
  updatedAt: { $gte: oneHourAgo }
});

// Sort by newest first
const newest = await Post.find()
  .sort({ createdAt: -1 })
  .limit(10);
```

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────┐
│              MONGOOSE SCHEMAS SUMMARY                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SCHEMA TYPES                                           │
│  • String, Number, Boolean, Date - core types           │
│  • ObjectId - references to other documents             │
│  • Array - for lists and embedded documents             │
│  • Mixed - flexible but avoid if possible               │
│  • Buffer - binary data                                 │
│                                                         │
│  SCHEMA OPTIONS                                         │
│  • required, default, unique - common constraints       │
│  • lowercase, trim - string transformations             │
│  • min, max, enum - value restrictions                  │
│  • index - create database indexes                      │
│  • select: false - exclude from queries by default      │
│                                                         │
│  VIRTUALS                                               │
│  • Computed properties (not stored in DB)               │
│  • Getters and setters                                  │
│  • Virtual populate for reverse references              │
│                                                         │
│  METHODS                                                │
│  • Instance methods - operate on documents              │
│  • Static methods - operate on collections              │
│                                                         │
│  MIDDLEWARE (HOOKS)                                     │
│  • pre/post save, validate, remove                      │
│  • pre/post find, findOne, update                       │
│  • Use for: validation, hashing, logging, cleanup       │
│                                                         │
│  TYPESCRIPT                                             │
│  • Define interfaces for documents                      │
│  • Separate interfaces for methods and virtuals         │
│  • Use generics with Schema<T, M, Methods>              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

In **Phase 096b**, we'll cover CRUD operations in detail:
- Creating documents with save() and create()
- Reading with find(), findOne(), findById()
- Updating documents
- Deleting documents
- Query chaining and optimization
