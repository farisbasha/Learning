# Phase 096: Mongoose Introduction

## Table of Contents
1. [What is MongoDB](#what-is-mongodb)
2. [MongoDB vs SQL Databases](#mongodb-vs-sql-databases)
3. [What is Mongoose](#what-is-mongoose)
4. [Installation](#installation)
5. [Connecting to MongoDB](#connecting-to-mongodb)
6. [Connection Events and Error Handling](#connection-events-and-error-handling)
7. [Mongoose with TypeScript](#mongoose-with-typescript)
8. [Core Concepts](#core-concepts)
9. [MongoDB vs SQL Terminology](#mongodb-vs-sql-terminology)
10. [Laravel Comparison](#laravel-comparison)

---

## What is MongoDB

MongoDB is a **document-oriented NoSQL database** that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional relational databases that store data in tables with rigid schemas, MongoDB allows for dynamic, schema-less data structures.

### Key Characteristics

```
Traditional SQL Database:
┌──────────────────────────────────────────────────────────┐
│                      users TABLE                          │
├────────┬──────────┬─────────────────┬───────────────────┤
│   id   │   name   │      email      │    created_at     │
├────────┼──────────┼─────────────────┼───────────────────┤
│   1    │  John    │ john@email.com  │ 2024-01-15        │
│   2    │  Jane    │ jane@email.com  │ 2024-01-16        │
└────────┴──────────┴─────────────────┴───────────────────┘

MongoDB Document Database:
┌──────────────────────────────────────────────────────────┐
│                   users COLLECTION                        │
├──────────────────────────────────────────────────────────┤
│ {                                                         │
│   "_id": ObjectId("507f1f77bcf86cd799439011"),           │
│   "name": "John",                                         │
│   "email": "john@email.com",                              │
│   "profile": {                    <-- Nested document     │
│     "bio": "Developer",                                   │
│     "social": ["twitter", "github"]                       │
│   },                                                      │
│   "createdAt": ISODate("2024-01-15")                      │
│ }                                                         │
├──────────────────────────────────────────────────────────┤
│ {                                                         │
│   "_id": ObjectId("507f1f77bcf86cd799439012"),           │
│   "name": "Jane",                                         │
│   "email": "jane@email.com",                              │
│   "tags": ["developer", "designer"]  <-- Flexible schema  │
│ }                                                         │
└──────────────────────────────────────────────────────────┘
```

### BSON (Binary JSON)

MongoDB stores data in BSON format, which extends JSON with additional data types:

```typescript
// BSON supports types not available in JSON
const document = {
  _id: ObjectId("507f1f77bcf86cd799439011"),  // 12-byte unique ID
  name: "John Doe",                             // String
  age: 30,                                       // NumberInt/NumberLong
  balance: NumberDecimal("1234.56"),            // High-precision decimal
  createdAt: new Date(),                         // Date object
  data: BinData(0, "base64encodeddata"),        // Binary data
  coordinates: [40.7128, -74.0060],             // Array
  isActive: true,                                // Boolean
  metadata: null,                                // Null
  profile: {                                     // Embedded document
    avatar: "avatar.jpg"
  }
};
```

---

## MongoDB vs SQL Databases

### When to Use MongoDB

```
✅ CHOOSE MongoDB WHEN:
┌──────────────────────────────────────────────────────────┐
│ 1. FLEXIBLE SCHEMA                                        │
│    - Rapidly evolving data models                        │
│    - Different documents need different fields           │
│    - Prototyping and MVP development                     │
│                                                          │
│ 2. DOCUMENT-CENTRIC DATA                                 │
│    - Blog posts with comments                            │
│    - Product catalogs with varying attributes            │
│    - User profiles with optional fields                  │
│                                                          │
│ 3. HIERARCHICAL/NESTED DATA                              │
│    - JSON-like structures                                │
│    - Embedded arrays and objects                         │
│    - Avoiding complex JOINs                              │
│                                                          │
│ 4. HIGH WRITE THROUGHPUT                                 │
│    - Logging and analytics                               │
│    - IoT sensor data                                     │
│    - Real-time data ingestion                            │
│                                                          │
│ 5. HORIZONTAL SCALING NEEDED                             │
│    - Sharding across multiple servers                    │
│    - Geographic distribution                             │
│    - Massive datasets (terabytes+)                       │
└──────────────────────────────────────────────────────────┘

✅ CHOOSE SQL (PostgreSQL/MySQL) WHEN:
┌──────────────────────────────────────────────────────────┐
│ 1. STRICT DATA INTEGRITY                                  │
│    - Financial transactions                              │
│    - Inventory management                                │
│    - Banking applications                                │
│                                                          │
│ 2. COMPLEX RELATIONSHIPS                                 │
│    - Many-to-many relationships                          │
│    - Complex reporting with JOINs                        │
│    - Relational integrity is critical                    │
│                                                          │
│ 3. ACID TRANSACTIONS                                     │
│    - Multi-table transactions                            │
│    - Rollback requirements                               │
│    - Strict consistency                                  │
│                                                          │
│ 4. STRUCTURED, PREDICTABLE DATA                          │
│    - Fixed schema applications                           │
│    - ERP systems                                         │
│    - Traditional business applications                   │
└──────────────────────────────────────────────────────────┘
```

### Real-World Use Case Comparison

```typescript
// MongoDB: E-commerce Product Catalog
// Products have varying attributes - perfect for MongoDB
const laptop = {
  _id: ObjectId("..."),
  name: "MacBook Pro",
  category: "electronics",
  price: 2499,
  specs: {
    processor: "M3 Pro",
    ram: "18GB",
    storage: "512GB SSD",
    display: "14-inch Retina"
  },
  colors: ["Space Gray", "Silver"]
};

const tshirt = {
  _id: ObjectId("..."),
  name: "Cotton T-Shirt",
  category: "clothing",
  price: 29.99,
  sizes: ["S", "M", "L", "XL"],
  material: "100% Cotton",
  careInstructions: "Machine wash cold"
  // No 'processor' or 'ram' - flexible schema!
};

// SQL Alternative: Would need many nullable columns or EAV pattern
// CREATE TABLE products (
//   id INT PRIMARY KEY,
//   name VARCHAR(255),
//   processor VARCHAR(100) NULL,  -- Only for electronics
//   ram VARCHAR(50) NULL,         -- Only for electronics
//   sizes TEXT NULL,              -- Only for clothing
//   material VARCHAR(100) NULL    -- Only for clothing
//   -- This becomes unwieldy with many product types!
// );
```

---

## What is Mongoose

Mongoose is an **Object Document Mapper (ODM)** for MongoDB in Node.js. It provides a schema-based solution to model your application data, similar to how ORMs work for SQL databases.

### ODM vs ORM Comparison

```
ORM (Object Relational Mapper) - SQL:
┌─────────────────────────────────────────────────────────┐
│  TypeScript Class  ──────►  SQL Table                   │
│                                                         │
│  class User {               CREATE TABLE users (        │
│    id: number;                id INT PRIMARY KEY,       │
│    name: string;              name VARCHAR(255),        │
│    email: string;             email VARCHAR(255)        │
│  }                          );                          │
│                                                         │
│  Examples: Sequelize, TypeORM, Prisma, Drizzle         │
└─────────────────────────────────────────────────────────┘

ODM (Object Document Mapper) - MongoDB:
┌─────────────────────────────────────────────────────────┐
│  Mongoose Schema  ──────►  MongoDB Collection           │
│                                                         │
│  const userSchema =         {                           │
│    new Schema({               "_id": ObjectId("..."),   │
│      name: String,            "name": "John",           │
│      email: String            "email": "john@..."       │
│    });                      }                           │
│                                                         │
│  Examples: Mongoose (the standard for MongoDB)          │
└─────────────────────────────────────────────────────────┘
```

### Why Use Mongoose Instead of Native MongoDB Driver?

```typescript
// Native MongoDB Driver - Verbose, no schema validation
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('myapp');

// No schema - any data can be inserted
await db.collection('users').insertOne({
  naem: 'John',  // Typo goes unnoticed!
  email: 123     // Wrong type goes unnoticed!
});

// ─────────────────────────────────────────────────────

// Mongoose - Clean, with schema validation
import mongoose, { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

const User = model('User', userSchema);

// This would throw a validation error!
await User.create({
  naem: 'John',  // 'name' is required, 'naem' is ignored
  email: 123     // Type validation fails
});
```

### Mongoose Key Features

```
┌─────────────────────────────────────────────────────────┐
│                  MONGOOSE FEATURES                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 SCHEMA DEFINITION                                   │
│     - Define document structure                         │
│     - Type validation                                   │
│     - Required fields                                   │
│     - Default values                                    │
│                                                         │
│  ✅ VALIDATION                                          │
│     - Built-in validators                               │
│     - Custom validators                                 │
│     - Async validation                                  │
│                                                         │
│  🔗 MIDDLEWARE (HOOKS)                                  │
│     - Pre/post save hooks                               │
│     - Pre/post validation                               │
│     - Query middleware                                  │
│                                                         │
│  🔍 QUERY BUILDING                                      │
│     - Chainable query API                               │
│     - Population (like JOINs)                           │
│     - Aggregation pipeline                              │
│                                                         │
│  📐 TYPESCRIPT SUPPORT                                  │
│     - Full type inference                               │
│     - Generic types                                     │
│     - Interface generation                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Installation

### Installing MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows - Download installer from mongodb.com
# Or use Docker (recommended for development)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Verify installation
mongosh  # MongoDB shell
```

### Installing Mongoose

```bash
# Install Mongoose
npm install mongoose

# For TypeScript projects (types are included in mongoose)
npm install mongoose typescript @types/node

# MongoDB Atlas (cloud) - no local installation needed
# Just use the connection string from Atlas dashboard
```

### Project Setup

```bash
# Initialize project
mkdir mongoose-project && cd mongoose-project
npm init -y

# Install dependencies
npm install mongoose dotenv
npm install -D typescript @types/node ts-node nodemon

# Create tsconfig.json
npx tsc --init

# Project structure
mongoose-project/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   └── User.ts
│   ├── index.ts
│   └── types/
│       └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

### tsconfig.json for Mongoose

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Connecting to MongoDB

### Basic Connection

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

// Connection options
const options: mongoose.ConnectOptions = {
  // Modern Mongoose (6.0+) has sensible defaults
  // These are commonly configured options:
  maxPoolSize: 10,           // Maximum number of connections in pool
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  socketTimeoutMS: 45000,    // Close sockets after 45s of inactivity
  family: 4                  // Use IPv4, skip trying IPv6
};

// Connect function
export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
      options
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Disconnect function (for graceful shutdown)
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log('MongoDB disconnected');
}
```

### Local MongoDB Connection

```typescript
// Local MongoDB - Default port 27017
const MONGODB_URI = 'mongodb://localhost:27017/myapp';

// With authentication
const MONGODB_URI = 'mongodb://username:password@localhost:27017/myapp';

// With replica set (for transactions)
const MONGODB_URI = 'mongodb://localhost:27017,localhost:27018,localhost:27019/myapp?replicaSet=rs0';

// Connection format breakdown:
// mongodb://[username:password@]host[:port]/database[?options]
```

### MongoDB Atlas (Cloud) Connection

```typescript
// MongoDB Atlas connection string format
const MONGODB_URI = 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority';

// Example with actual values
const MONGODB_URI = 'mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/myapp?retryWrites=true&w=majority';

// Using environment variables (recommended)
// .env file:
// MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/myapp?retryWrites=true&w=majority

import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI!);
```

### Multiple Database Connections

```typescript
// Sometimes you need to connect to multiple databases
import mongoose from 'mongoose';

// Default connection
await mongoose.connect('mongodb://localhost:27017/app1');

// Additional connections using createConnection
const analyticsDB = mongoose.createConnection('mongodb://localhost:27017/analytics');
const logsDB = mongoose.createConnection('mongodb://localhost:27017/logs');

// Create models on specific connections
const AnalyticsModel = analyticsDB.model('Event', eventSchema);
const LogModel = logsDB.model('Log', logSchema);

// Each connection can have its own options
const replicaConn = mongoose.createConnection('mongodb://localhost:27017/replica', {
  replicaSet: 'rs0'
});
```

---

## Connection Events and Error Handling

### Connection Events

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export function setupConnectionEvents(): void {
  const db = mongoose.connection;

  // Emitted when connected
  db.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
  });

  // Emitted when disconnected
  db.on('disconnected', () => {
    console.log('❌ Mongoose disconnected from MongoDB');
  });

  // Emitted when connection error occurs
  db.on('error', (error) => {
    console.error('🔥 Mongoose connection error:', error);
  });

  // Emitted when fully connected (ready to use)
  db.once('open', () => {
    console.log('🚀 MongoDB connection is open and ready');
  });

  // Emitted when starting to reconnect
  db.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
  });

  // Connection state changes
  db.on('connecting', () => console.log('⏳ Connecting to MongoDB...'));
  db.on('close', () => console.log('📕 MongoDB connection closed'));
}

// Connection states
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
console.log('Connection state:', mongoose.connection.readyState);
```

### Graceful Shutdown

```typescript
// src/index.ts
import mongoose from 'mongoose';
import { connectDB, setupConnectionEvents } from './config/database';

async function main() {
  setupConnectionEvents();
  await connectDB();

  // Your application code here...
}

// Graceful shutdown handling
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Closing MongoDB connection...`);

  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kill command

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch(console.error);
```

### Retry Logic

```typescript
// Robust connection with retry logic
export async function connectWithRetry(maxRetries = 5, delay = 5000): Promise<void> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Connection attempt ${retries}/${maxRetries} failed:`, error);

      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Mongoose with TypeScript

### Type-Safe Models

```typescript
// src/models/User.ts
import mongoose, { Schema, Model, Document, Types } from 'mongoose';

// 1. Define the interface for the document
export interface IUser {
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  tags: string[];
  profile?: {
    bio?: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 2. Interface for document methods (instance methods)
export interface IUserMethods {
  getFullName(): string;
  isAdult(): boolean;
}

// 3. Interface for static methods
export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
}

// 4. Combined document type (for use in code)
export type UserDocument = Document<Types.ObjectId, {}, IUser> & IUser & IUserMethods;

// 5. Define the schema
const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems unrealistic']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    tags: {
      type: [String],
      default: []
    },
    profile: {
      bio: String,
      avatar: String
    }
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 6. Instance methods
userSchema.methods.getFullName = function(): string {
  return `${this.name}`;
};

userSchema.methods.isAdult = function(): boolean {
  return (this.age || 0) >= 18;
};

// 7. Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// 8. Create and export the model
export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
```

### Using Type-Safe Models

```typescript
// src/services/userService.ts
import { User, IUser, UserDocument } from '../models/User';
import { Types } from 'mongoose';

// Create a user - fully typed
export async function createUser(userData: Partial<IUser>): Promise<UserDocument> {
  const user = new User(userData);
  await user.save();
  return user;
}

// Find user - return type is inferred
export async function findUserById(id: string): Promise<UserDocument | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  return User.findById(id);
}

// Use static method
export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findByEmail(email);  // TypeScript knows this exists
}

// Usage example
async function example() {
  // Create
  const user = await createUser({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  });

  // TypeScript knows all properties
  console.log(user.name);      // string
  console.log(user.email);     // string
  console.log(user.createdAt); // Date

  // Instance methods are typed
  console.log(user.isAdult()); // boolean

  // Static methods are typed
  const activeUsers = await User.findActiveUsers();
}
```

---

## Core Concepts

### Document vs Collection vs Database

```
MongoDB Hierarchy:
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Server                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  DATABASE: myapp                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │             COLLECTION: users               │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  DOCUMENT: { _id: ..., name: "John" } │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  DOCUMENT: { _id: ..., name: "Jane" } │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │             COLLECTION: posts               │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  DOCUMENT: { _id: ..., title: "..." } │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Understanding Each Concept

```typescript
// DATABASE
// A container for collections, like a schema in PostgreSQL
// Created automatically when you insert data
await mongoose.connect('mongodb://localhost:27017/myapp');
//                                                ^^^^^ database name

// COLLECTION
// A group of documents, like a table in SQL
// Created automatically when you use a model
const User = mongoose.model('User', userSchema);
// Creates 'users' collection (pluralized, lowercase)

// DOCUMENT
// A single record in a collection, like a row in SQL
// But it's a flexible JSON-like object, not a fixed structure
const doc = {
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Unique identifier
  name: "John Doe",
  email: "john@example.com",
  profile: {           // Embedded document
    bio: "Developer"
  },
  tags: ["nodejs", "mongodb"]  // Array
};
```

### The _id Field

```typescript
// Every MongoDB document has an _id field
// If not provided, MongoDB auto-generates an ObjectId

import { Types } from 'mongoose';

// ObjectId is a 12-byte identifier:
// - 4 bytes: timestamp (seconds since Unix epoch)
// - 5 bytes: random value (unique to machine/process)
// - 3 bytes: incrementing counter

const id = new Types.ObjectId();
console.log(id);                    // ObjectId("507f1f77bcf86cd799439011")
console.log(id.toString());         // "507f1f77bcf86cd799439011"
console.log(id.getTimestamp());     // Date when ObjectId was created

// Validate ObjectId
console.log(Types.ObjectId.isValid('507f1f77bcf86cd799439011')); // true
console.log(Types.ObjectId.isValid('invalid')); // false

// You can use custom _id values
const customIdDoc = {
  _id: 'custom-string-id',  // Not recommended but possible
  name: 'Custom'
};
```

---

## MongoDB vs SQL Terminology

### Terminology Comparison

```
┌────────────────────┬────────────────────┬────────────────────┐
│      SQL Term      │    MongoDB Term    │       Notes        │
├────────────────────┼────────────────────┼────────────────────┤
│ Database           │ Database           │ Same concept       │
├────────────────────┼────────────────────┼────────────────────┤
│ Table              │ Collection         │ No schema required │
├────────────────────┼────────────────────┼────────────────────┤
│ Row                │ Document           │ JSON-like, flexible│
├────────────────────┼────────────────────┼────────────────────┤
│ Column             │ Field              │ Can be any type    │
├────────────────────┼────────────────────┼────────────────────┤
│ Primary Key        │ _id                │ Auto-generated     │
├────────────────────┼────────────────────┼────────────────────┤
│ Foreign Key        │ Reference          │ Not enforced by DB │
├────────────────────┼────────────────────┼────────────────────┤
│ JOIN               │ $lookup/populate   │ Different approach │
├────────────────────┼────────────────────┼────────────────────┤
│ Index              │ Index              │ Same concept       │
├────────────────────┼────────────────────┼────────────────────┤
│ View               │ View               │ Same concept       │
├────────────────────┼────────────────────┼────────────────────┤
│ Schema             │ Validator/Mongoose │ Optional in MongoDB│
└────────────────────┴────────────────────┴────────────────────┘
```

### Query Comparison

```typescript
// SELECT * FROM users WHERE age > 21
const users = await User.find({ age: { $gt: 21 } });

// SELECT name, email FROM users
const users = await User.find({}).select('name email');

// SELECT * FROM users WHERE name LIKE '%john%'
const users = await User.find({ name: /john/i });

// SELECT * FROM users ORDER BY createdAt DESC LIMIT 10
const users = await User.find({})
  .sort({ createdAt: -1 })
  .limit(10);

// SELECT * FROM users WHERE status = 'active' AND age >= 18
const users = await User.find({
  status: 'active',
  age: { $gte: 18 }
});

// SELECT COUNT(*) FROM users WHERE isActive = true
const count = await User.countDocuments({ isActive: true });

// INSERT INTO users (name, email) VALUES ('John', 'john@email.com')
const user = await User.create({ name: 'John', email: 'john@email.com' });

// UPDATE users SET name = 'John Doe' WHERE _id = '...'
await User.updateOne({ _id: id }, { $set: { name: 'John Doe' } });

// DELETE FROM users WHERE _id = '...'
await User.deleteOne({ _id: id });
```

---

## Laravel Comparison

### Laravel MongoDB Package (jenssegers/mongodb)

```php
// Laravel uses jenssegers/mongodb package for MongoDB support
// Installation: composer require jenssegers/mongodb

// config/database.php
'mongodb' => [
    'driver' => 'mongodb',
    'host' => env('MONGODB_HOST', 'localhost'),
    'port' => env('MONGODB_PORT', 27017),
    'database' => env('MONGODB_DATABASE', 'laravel'),
    'username' => env('MONGODB_USERNAME'),
    'password' => env('MONGODB_PASSWORD'),
],
```

### Model Comparison

```php
// Laravel MongoDB Model
use Jenssegers\Mongodb\Eloquent\Model;

class User extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'users';  // Optional, auto-derived from class name

    protected $fillable = ['name', 'email', 'role'];

    protected $casts = [
        'created_at' => 'datetime',
        'tags' => 'array',
    ];

    // Relationships work similarly
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// Usage
$user = User::create(['name' => 'John', 'email' => 'john@email.com']);
$users = User::where('age', '>', 21)->get();
```

```typescript
// Mongoose Equivalent
import mongoose, { Schema, model } from 'mongoose';

interface IUser {
  name: string;
  email: string;
  role: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'user' },
  tags: [String]
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

// Usage
const user = await User.create({ name: 'John', email: 'john@email.com' });
const users = await User.find({ age: { $gt: 21 } });
```

### Feature Comparison

```
┌─────────────────────┬───────────────────────┬────────────────────────┐
│      Feature        │ Laravel MongoDB       │ Mongoose (Node.js)     │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Schema Definition   │ $fillable, $casts     │ Schema class           │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Validation          │ Form Requests         │ Schema validators      │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Relationships       │ Eloquent relations    │ ref + populate()       │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Hooks/Events        │ Model observers       │ Pre/post middleware    │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Soft Deletes        │ SoftDeletes trait     │ mongoose-delete plugin │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Pagination          │ ->paginate()          │ mongoose-paginate      │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Aggregation         │ Collection pipeline   │ aggregate() method     │
├─────────────────────┼───────────────────────┼────────────────────────┤
│ Transactions        │ DB::transaction()     │ session.withTransaction│
└─────────────────────┴───────────────────────┴────────────────────────┘
```

### Relationship Comparison

```php
// Laravel MongoDB - Relationships
class User extends Model
{
    // Embedded (stored in same document)
    public function profile()
    {
        return $this->embedsOne(Profile::class);
    }

    // Referenced (stored in separate collection)
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// Query with relationship
$user = User::with('posts')->find($id);
```

```typescript
// Mongoose - Relationships
const userSchema = new Schema({
  name: String,
  // Embedded
  profile: {
    bio: String,
    avatar: String
  },
  // Referenced
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

// Query with relationship (populate = eager loading)
const user = await User.findById(id).populate('posts');
```

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────┐
│              MONGOOSE INTRODUCTION SUMMARY               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. MongoDB is a document database - flexible schemas   │
│     storing JSON-like BSON documents                    │
│                                                         │
│  2. Use MongoDB for:                                    │
│     - Flexible, evolving schemas                        │
│     - Hierarchical/nested data                          │
│     - High write throughput                             │
│     - Horizontal scaling                                │
│                                                         │
│  3. Mongoose is the ODM (Object Document Mapper)        │
│     - Adds schema validation to MongoDB                 │
│     - Provides TypeScript support                       │
│     - Offers middleware, virtuals, plugins              │
│                                                         │
│  4. Connection handling:                                │
│     - Use mongoose.connect() for single connection      │
│     - Use createConnection() for multiple databases     │
│     - Handle events for robust applications             │
│                                                         │
│  5. TypeScript integration:                             │
│     - Define interfaces for documents                   │
│     - Use generics with Schema and model()              │
│     - Get full type safety for queries                  │
│                                                         │
│  6. Key terminology:                                    │
│     Database → Database                                 │
│     Table → Collection                                  │
│     Row → Document                                      │
│     Column → Field                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

In the next phases, we'll cover:
- **Phase 096a**: Schema definition in detail
- **Phase 096b**: CRUD operations with Mongoose
- **Phase 096c**: Relationships and population
- **Phase 096d**: Advanced queries and aggregation
