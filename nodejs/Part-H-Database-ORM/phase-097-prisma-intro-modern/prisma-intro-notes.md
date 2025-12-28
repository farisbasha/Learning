# Phase 098: Prisma Introduction - The Modern Database Standard

## Table of Contents

1. [What is Prisma?](#what-is-prisma)
2. [Why Prisma is the Modern Standard](#why-prisma-is-the-modern-standard)
3. [Prisma Components](#prisma-components)
4. [Installation](#installation)
5. [Initializing Prisma](#initializing-prisma)
6. [The schema.prisma File](#the-schemaprisma-file)
7. [Datasource Configuration](#datasource-configuration)
8. [Generator Configuration](#generator-configuration)
9. [Generating the Prisma Client](#generating-the-prisma-client)
10. [Prisma Studio](#prisma-studio)
11. [Prisma vs Other ORMs](#prisma-vs-other-orms)

---

## What is Prisma?

Prisma is a **next-generation ORM** (Object-Relational Mapper) for Node.js and TypeScript. Unlike traditional ORMs that map tables to classes, Prisma takes a **schema-first** approach where you define your data model in a declarative schema file, and Prisma generates a fully type-safe client.

### The Evolution of Database Access

```
Generation 1: Raw SQL
├── Full control
├── No type safety
├── SQL injection risks
└── Verbose and error-prone

Generation 2: Query Builders (Knex)
├── SQL-like syntax
├── Database agnostic
├── Still manual typing
└── No model abstraction

Generation 3: Traditional ORMs (Sequelize, TypeORM)
├── Object-oriented models
├── Active Record / Data Mapper patterns
├── Partial type safety
└── Complex configuration

Generation 4: Prisma ← YOU ARE HERE (THE MODERN STANDARD)
├── Schema-first approach
├── 100% type-safe queries
├── Auto-generated client
└── Best developer experience
```

### Prisma's Core Philosophy

1. **Type Safety First**: Every query is fully typed - no runtime surprises
2. **Schema as Source of Truth**: One file defines your entire data model
3. **Auto-generation**: Client code is generated, not written
4. **Declarative**: You describe WHAT you want, not HOW to get it
5. **Modern Tooling**: Built for TypeScript from the ground up

### What Makes Prisma Different

```typescript
// Traditional ORM (Sequelize) - Runtime type checking
const user = await User.findOne({ where: { id: 1 } });
// user could be null, could have wrong shape
// No compile-time help

// Prisma - Compile-time type safety
const user = await prisma.user.findUnique({ where: { id: 1 } });
// TypeScript knows:
// - user is of type User | null
// - Only valid User fields can be selected
// - Only valid where conditions work
// IDE auto-completion for everything!
```

---

## Why Prisma is the Modern Standard

### 1. 100% Type Safety

This is Prisma's killer feature. Every single query is type-safe at compile time.

```typescript
// The magic of Prisma's type safety:

// ✅ Valid - TypeScript knows this works
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, email: true, name: true },
});
// Type: { id: number; email: string; name: string } | null

// ❌ Compile error - 'nonExistentField' doesn't exist
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { nonExistentField: true }, // TypeScript ERROR!
});

// ❌ Compile error - wrong type for 'id'
const user = await prisma.user.findUnique({
  where: { id: "not-a-number" }, // TypeScript ERROR if id is Int!
});

// The return type changes based on your select!
const justEmail = await prisma.user.findUnique({
  where: { id: 1 },
  select: { email: true },
});
// Type: { email: string } | null  ← Only email!

const withPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});
// Type: { id, email, name, posts: Post[] } | null  ← Includes posts!
```

### 2. Amazing Developer Experience

```typescript
// Auto-completion shows you exactly what's available:
prisma.user.  // IDE shows: findUnique, findFirst, findMany, create, update, delete, etc.

prisma.user.findMany({
  where: {
    // IDE shows all User fields and operators!
    email: { contains: '@' },
    age: { gte: 18 },
    role: 'ADMIN',  // If role is enum, only valid values shown!
  },
  orderBy: {
    // IDE shows all sortable fields
    createdAt: 'desc',
  },
});
```

### 3. Declarative Schema

```prisma
// One file to rule them all - schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]   // Relation - Prisma handles the foreign key
  profile   Profile? // Optional one-to-one
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

// From this schema, Prisma generates:
// 1. TypeScript types for User and Post
// 2. Type-safe CRUD methods
// 3. Relation handling
// 4. Migration SQL
```

### 4. Zero Boilerplate

```typescript
// Sequelize - Lots of boilerplate
class User extends Model {
  declare id: number;
  declare email: string;
  declare name: string | null;
  // ... many more declarations
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // ... more field definitions
}, { sequelize, modelName: 'User' });

// Prisma - Zero boilerplate
// Just define the schema, everything is generated!
// No model classes to write
// No type declarations to maintain
// No init() calls
```

### 5. Modern Async/Await First

```typescript
// Prisma is built for modern JavaScript
const users = await prisma.user.findMany();

// No callback hell
// No .then() chains needed
// Clean, readable code
```

### 6. Production Ready

Prisma is used in production by thousands of companies including:
- **Vercel** - Next.js platform
- **HashiCorp** - Infrastructure tools
- **Pleo** - Financial services
- **Cal.com** - Scheduling platform

---

## Prisma Components

Prisma consists of three main parts:

### 1. Prisma Client

The auto-generated, type-safe query builder.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This client is generated from your schema
// All methods are fully typed
await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'User',
  },
});
```

### 2. Prisma Migrate

Schema migration tool for evolving your database.

```bash
# Create a migration
npx prisma migrate dev --name add_user_table

# Apply migrations in production
npx prisma migrate deploy
```

### 3. Prisma Studio

Visual database browser and editor.

```bash
# Open Prisma Studio
npx prisma studio
```

Opens a GUI at `http://localhost:5555` where you can:
- Browse all your data
- Create, update, delete records
- View relationships
- Filter and search

### Component Flow

```
schema.prisma
     │
     ├─────────────────────────────────────┐
     │                                     │
     ▼                                     ▼
prisma generate                    prisma migrate dev
     │                                     │
     ▼                                     ▼
@prisma/client                      SQL migrations
(TypeScript types)                  (Database schema)
     │                                     │
     └─────────────────────────────────────┘
                      │
                      ▼
              Your Application
                      │
                      ▼
                  Database
```

---

## Installation

### Step 1: Install Dependencies

```bash
# Install Prisma CLI as dev dependency
npm install -D prisma

# Install Prisma Client (runtime dependency)
npm install @prisma/client

# Or with yarn
yarn add -D prisma
yarn add @prisma/client

# Or with pnpm
pnpm add -D prisma
pnpm add @prisma/client
```

### Step 2: Verify TypeScript Setup

Prisma requires TypeScript 4.1 or higher:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 3: Add Scripts

```json
// package.json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Initializing Prisma

### Initialize Prisma in Your Project

```bash
# Initialize with default (PostgreSQL)
npx prisma init

# Initialize with specific database
npx prisma init --datasource-provider postgresql
npx prisma init --datasource-provider mysql
npx prisma init --datasource-provider sqlite
npx prisma init --datasource-provider sqlserver
npx prisma init --datasource-provider mongodb
npx prisma init --datasource-provider cockroachdb
```

### What `prisma init` Creates

```
your-project/
├── prisma/
│   └── schema.prisma     # Your schema file
├── .env                   # Environment variables (DATABASE_URL)
└── ... (existing files)
```

### Initial schema.prisma

```prisma
// prisma/schema.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Initial .env

```env
# .env
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

---

## The schema.prisma File

The `schema.prisma` file is the **single source of truth** for your entire data model.

### File Structure

```prisma
// prisma/schema.prisma

// ================================================
// 1. GENERATOR - How to generate the client
// ================================================
generator client {
  provider = "prisma-client-js"
}

// ================================================
// 2. DATASOURCE - Database connection
// ================================================
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ================================================
// 3. MODELS - Your data models
// ================================================
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  avatar String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String?
  published Boolean   @default(false)
  author    User      @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      Tag[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

// ================================================
// 4. ENUMS - Enumerated types
// ================================================
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Schema Sections Explained

| Section | Purpose |
|---------|---------|
| `generator` | Specifies what code to generate (usually Prisma Client) |
| `datasource` | Database connection configuration |
| `model` | Defines a table/collection in your database |
| `enum` | Defines enumerated types |

---

## Datasource Configuration

### PostgreSQL

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
# Standard format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# Examples
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp?schema=public"
DATABASE_URL="postgresql://user:pass@db.example.com:5432/production"

# With SSL (cloud databases)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### MySQL

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
DATABASE_URL="mysql://root:password@localhost:3306/myapp"
```

### SQLite (Great for Development)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="file:./dev.db"
DATABASE_URL="file:../data/app.db"
```

### MongoDB

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority"
```

### SQL Server

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true"
```

### Multiple Environments

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
# .env.development
DATABASE_URL="postgresql://localhost:5432/myapp_dev"

# .env.test
DATABASE_URL="postgresql://localhost:5432/myapp_test"

# .env.production
DATABASE_URL="postgresql://prod-host:5432/myapp_prod"
```

---

## Generator Configuration

### Basic Prisma Client Generator

```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Generator Options

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"  // Custom output path
  binaryTargets   = ["native", "linux-musl-openssl-3.0.x"]  // For Docker
  previewFeatures = ["fullTextSearch", "metrics"]  // Enable preview features
}
```

### Binary Targets (for Docker/Deployment)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

// Common targets:
// "native" - Current platform
// "linux-musl-openssl-3.0.x" - Alpine Linux
// "debian-openssl-3.0.x" - Debian/Ubuntu
// "rhel-openssl-3.0.x" - RHEL/CentOS
```

### Multiple Generators

```prisma
// Generate TypeScript client
generator client {
  provider = "prisma-client-js"
}

// Generate documentation
generator docs {
  provider = "prisma-docs-generator"
  output   = "../docs"
}

// Generate ERD diagram
generator erd {
  provider = "prisma-erd-generator"
  output   = "../docs/erd.svg"
}

// Generate Zod schemas
generator zod {
  provider = "zod-prisma-types"
  output   = "../src/zod"
}
```

---

## Generating the Prisma Client

### The Generate Command

```bash
# Generate Prisma Client from schema
npx prisma generate
```

### What Happens

1. Prisma reads `schema.prisma`
2. Generates TypeScript types for all models
3. Generates Prisma Client with all CRUD methods
4. Places output in `node_modules/@prisma/client`

```
prisma generate
     │
     ▼
┌─────────────────────────────────────┐
│  Reads schema.prisma                │
│  - Model definitions                │
│  - Relations                        │
│  - Enums                            │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Generates TypeScript               │
│  - User, Post, Profile types        │
│  - UserCreateInput, UserWhereInput  │
│  - All possible query shapes        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Output to node_modules             │
│  @prisma/client/                    │
│  ├── index.d.ts (types)             │
│  ├── index.js (runtime)             │
│  └── schema.prisma (copy)           │
└─────────────────────────────────────┘
```

### Using the Generated Client

```typescript
// src/db.ts
import { PrismaClient } from '@prisma/client';

// Create a single instance
const prisma = new PrismaClient();

export default prisma;
```

```typescript
// src/app.ts
import prisma from './db';

async function main() {
  // Full type safety!
  const user = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
    },
  });
  console.log(user);
  // { id: 1, email: 'alice@prisma.io', name: 'Alice', ... }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### When to Run Generate

Run `prisma generate` when:
- After `prisma init` (first setup)
- After changing `schema.prisma`
- After pulling from git (someone else changed schema)
- After `prisma migrate dev` (automatically runs)
- After `npm install` (postinstall hook recommended)

### Postinstall Hook

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures the client is generated after `npm install`.

---

## Prisma Studio

Prisma Studio is a visual database browser included with Prisma.

### Launch Prisma Studio

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Features

1. **Browse Data**: View all records in any table
2. **Filter & Search**: Filter by any field
3. **Create Records**: Add new records with form UI
4. **Edit Records**: Update existing records
5. **Delete Records**: Remove records
6. **View Relations**: See related records
7. **Pagination**: Navigate large datasets

### Use Cases

- Development debugging
- Quick data inspection
- Manual data entry
- Demo data creation
- Database exploration

### Custom Port

```bash
npx prisma studio --port 5556
```

---

## Prisma vs Other ORMs

### Comparison Table

| Feature | Prisma | Sequelize | TypeORM | Knex |
|---------|--------|-----------|---------|------|
| **Type Safety** | 100% | Partial | Good | Manual |
| **Schema** | Prisma Schema | JavaScript/TS | Decorators/Entities | None |
| **Migrations** | ✅ Generated | ✅ Manual | ✅ Auto/Manual | ✅ Manual |
| **Relations** | Declarative | Defined in code | Decorators | Manual joins |
| **Learning Curve** | Low | Medium | High | Low |
| **Query Style** | Method chaining | Method chaining | Query Builder/Methods | SQL-like |
| **Raw SQL** | ✅ | ✅ | ✅ | ✅ Native |
| **GUI Tool** | Prisma Studio | No | No | No |
| **Bundle Size** | Medium | Large | Large | Small |

### Code Comparison

#### Creating a User

```typescript
// PRISMA - Clean and type-safe
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'User',
    profile: {
      create: {
        bio: 'Hello!',
      },
    },
  },
  include: {
    profile: true,
  },
});

// SEQUELIZE - More verbose
const user = await User.create({
  email: 'user@example.com',
  name: 'User',
});
await Profile.create({
  bio: 'Hello!',
  userId: user.id,
});
const userWithProfile = await User.findByPk(user.id, {
  include: [Profile],
});

// TYPEORM - Decorator-based
const user = new User();
user.email = 'user@example.com';
user.name = 'User';
await userRepository.save(user);

const profile = new Profile();
profile.bio = 'Hello!';
profile.user = user;
await profileRepository.save(profile);
```

#### Complex Query

```typescript
// PRISMA - Intuitive and fully typed
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@company.com' } },
      { role: 'ADMIN' },
    ],
    posts: {
      some: {
        published: true,
      },
    },
  },
  include: {
    posts: {
      where: { published: true },
      take: 5,
    },
    profile: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});

// SEQUELIZE - Complex nesting
const users = await User.findAll({
  where: {
    [Op.or]: [
      { email: { [Op.like]: '%@company.com' } },
      { role: 'ADMIN' },
    ],
  },
  include: [
    {
      model: Post,
      where: { published: true },
      required: true,
      limit: 5,
    },
    { model: Profile },
  ],
  order: [['createdAt', 'DESC']],
  limit: 10,
});
```

### When to Choose Prisma

**Choose Prisma when:**
- Starting a new TypeScript project
- Type safety is a priority
- You want the best developer experience
- You prefer declarative over imperative
- You want automatic migrations
- Your team varies in database experience

**Consider alternatives when:**
- Existing project with another ORM (migration cost)
- Need ultra-low-level SQL control (use Knex)
- MongoDB with complex aggregations (use native driver)
- Legacy database with unusual schema

### Migration from Other ORMs

Prisma provides introspection to pull existing database schemas:

```bash
# Pull existing database schema into Prisma
npx prisma db pull

# This creates/updates schema.prisma from your database
# Then generate the client
npx prisma generate
```

---

## Best Practices

### 1. Single Prisma Client Instance

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2. Environment Variables

```env
# .env
DATABASE_URL="postgresql://..."

# Never commit .env to git!
# Use .env.example for documentation
```

### 3. Schema Organization

```prisma
// Group related models together
// Use comments for documentation

/// User account model
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  // ...
}

/// User's public profile
model Profile {
  // ...
}
```

### 4. Version Control

```gitignore
# .gitignore
.env
node_modules/
# Don't ignore prisma/ folder - schema should be versioned!
```

---

## Summary

Prisma is the modern standard for database access in Node.js/TypeScript:

1. **100% Type Safety** - Every query is fully typed at compile time
2. **Schema-First** - One declarative file defines your entire data model
3. **Auto-Generated Client** - No boilerplate code to write or maintain
4. **Three Components** - Client (queries), Migrate (schema), Studio (GUI)
5. **Best DX** - Auto-completion, error messages, and tooling
6. **Production Ready** - Used by thousands of companies

For new TypeScript projects, Prisma should be your default choice for database access.
