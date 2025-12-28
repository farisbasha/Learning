# Phase 096: Mongoose Introduction - Setup Guide

## Quick Setup

### 1. Install MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Docker (recommended for development)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Verify
mongosh  # Opens MongoDB shell
```

### 2. Install Mongoose

```bash
npm install mongoose
npm install -D typescript @types/node
```

### 3. Project Structure

```
project/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   └── User.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

### 4. Database Connection

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

// Connection events
mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', (err) => console.error('Error:', err));
mongoose.connection.on('disconnected', () => console.log('Disconnected'));
```

### 5. Environment Variables

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/myapp

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/myapp
```

### 6. Basic Model

```typescript
// src/models/User.ts
import mongoose, { Schema, model } from 'mongoose';

interface IUser {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
```

### 7. Usage

```typescript
// src/index.ts
import { connectDB } from './config/database';
import { User } from './models/User';

async function main() {
  await connectDB();

  // Create
  const user = await User.create({ name: 'John', email: 'john@example.com' });

  // Read
  const users = await User.find();
  const one = await User.findById(user._id);

  // Update
  await User.updateOne({ _id: user._id }, { name: 'John Doe' });

  // Delete
  await User.deleteOne({ _id: user._id });
}

main().catch(console.error);
```

---

## Quick Reference

### Connection Options

```typescript
const options: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};
```

### Connection Strings

| Environment | Connection String |
|-------------|-------------------|
| Local | `mongodb://localhost:27017/dbname` |
| Local + Auth | `mongodb://user:pass@localhost:27017/dbname` |
| Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| Replica Set | `mongodb://host1,host2,host3/dbname?replicaSet=rs0` |

### MongoDB vs SQL Terminology

| SQL | MongoDB |
|-----|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary Key | _id |
| JOIN | $lookup / populate |

### When to Use MongoDB

**Choose MongoDB:**
- Flexible, evolving schemas
- Nested/hierarchical data
- High write throughput
- Horizontal scaling needed

**Choose SQL:**
- Strict data integrity
- Complex relationships
- ACID transactions critical
- Fixed schema applications

---

## Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Check MongoDB is running |
| Authentication failed | Verify credentials |
| ECONNREFUSED | Start MongoDB service |
| Network error | Check firewall/Atlas whitelist |
