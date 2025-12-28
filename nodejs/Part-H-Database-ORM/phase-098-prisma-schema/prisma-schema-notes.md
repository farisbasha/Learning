# Phase 099: Prisma Schema Design - Complete Guide

## Table of Contents

1. [Model Definition](#model-definition)
2. [Field Types](#field-types)
3. [Field Modifiers](#field-modifiers)
4. [Optional Fields](#optional-fields)
5. [Arrays](#arrays)
6. [Enums](#enums)
7. [Relations](#relations)
8. [Indexes](#indexes)
9. [Database Mapping](#database-mapping)
10. [Composite Keys](#composite-keys)
11. [Schema Best Practices](#schema-best-practices)

---

## Model Definition

Models in Prisma represent tables in your database. Each model becomes a table and generates TypeScript types.

### Basic Model Syntax

```prisma
model ModelName {
  fieldName FieldType Modifiers?
}
```

### Example Model

```prisma
model User {
  // Primary key with auto-increment
  id        Int      @id @default(autoincrement())

  // Required string field with unique constraint
  email     String   @unique

  // Optional string field (nullable)
  name      String?

  // Field with default value
  role      String   @default("user")

  // Boolean with default
  isActive  Boolean  @default(true)

  // Auto-managed timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Generated TypeScript Type

```typescript
// Prisma generates this type automatically:
type User = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### Model Naming Conventions

```prisma
// PascalCase for model names (becomes table name in snake_case by default)
model User { }          // Table: User (or user in some DBs)
model BlogPost { }      // Table: BlogPost

// Use @@map to customize table name
model User {
  id Int @id
  @@map("users")        // Table: users
}

model BlogPost {
  id Int @id
  @@map("blog_posts")   // Table: blog_posts
}
```

---

## Field Types

Prisma supports various scalar types that map to database-specific types.

### String Types

```prisma
model Article {
  // Standard string (VARCHAR)
  title       String              // VARCHAR(191) default
  slug        String              // VARCHAR(191)

  // Explicit length (database-specific)
  shortCode   String   @db.VarChar(10)    // VARCHAR(10)
  description String   @db.VarChar(500)   // VARCHAR(500)

  // Text type (unlimited length)
  content     String   @db.Text           // TEXT

  // Char (fixed length)
  countryCode String   @db.Char(2)        // CHAR(2)

  // UUID
  uuid        String   @default(uuid())   // UUID with auto-generation
  externalId  String   @db.Uuid           // UUID type (PostgreSQL)
}
```

### Numeric Types

```prisma
model Product {
  // Integer types
  id          Int      @id @default(autoincrement())
  stock       Int      @default(0)
  views       Int      @db.Integer                    // INT
  bigNumber   BigInt                                  // BIGINT

  // Small integers
  quantity    Int      @db.SmallInt                   // SMALLINT
  priority    Int      @db.TinyInt                    // TINYINT (MySQL)

  // Floating point
  rating      Float                                   // DOUBLE PRECISION
  percentage  Float    @db.Real                       // REAL (4 bytes)
  precise     Float    @db.DoublePrecision            // DOUBLE (8 bytes)

  // Decimal (EXACT precision - use for money!)
  price       Decimal  @db.Decimal(10, 2)             // DECIMAL(10,2)
  tax         Decimal  @db.Money                      // MONEY (PostgreSQL)
}
```

### Boolean Type

```prisma
model Post {
  id        Int     @id
  published Boolean @default(false)
  featured  Boolean @default(false)
  archived  Boolean @default(false)
}
```

### DateTime Types

```prisma
model Event {
  id         Int       @id

  // DateTime (timestamp with timezone)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  publishAt  DateTime?

  // Date only (no time)
  eventDate  DateTime  @db.Date

  // Time only (no date)
  startTime  DateTime  @db.Time

  // Timestamp variations
  timestamp  DateTime  @db.Timestamp
  timestampz DateTime  @db.Timestamptz     // With timezone (PostgreSQL)
}
```

### JSON Type

```prisma
model User {
  id          Int   @id
  preferences Json  @default("{}")
  metadata    Json?
  settings    Json  @default("[]")
}
```

```typescript
// Usage in code
const user = await prisma.user.create({
  data: {
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
    metadata: {
      signupSource: 'google',
      referralCode: 'ABC123',
    },
  },
});

// TypeScript type for JSON is `JsonValue`
// You may want to type it yourself:
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}
```

### Bytes Type

```prisma
model File {
  id       Int    @id
  data     Bytes           // Binary data
  checksum Bytes  @db.ByteA // PostgreSQL BYTEA
}
```

```typescript
// Working with Bytes
const file = await prisma.file.create({
  data: {
    data: Buffer.from('Hello World'),
  },
});
```

### Unsupported Type

```prisma
model Legacy {
  id   Int    @id
  // For database types Prisma doesn't support natively
  data Unsupported("geometry")
  geo  Unsupported("point")
}
```

---

## Field Modifiers

Field modifiers (attributes) customize how fields behave.

### @id - Primary Key

```prisma
model User {
  // Auto-increment integer (most common)
  id Int @id @default(autoincrement())
}

model Post {
  // UUID primary key
  id String @id @default(uuid())
}

model ExternalEntity {
  // CUID (Collision-resistant Unique Identifier)
  id String @id @default(cuid())
}
```

### @unique - Unique Constraint

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique                    // Single field unique
  username String @unique

  // Compound unique (model-level)
  @@unique([firstName, lastName])            // firstName + lastName must be unique
}

model TeamMember {
  id     Int @id
  teamId Int
  userId Int

  // Unique combination
  @@unique([teamId, userId])                 // Can't add same user twice to team
}
```

### @default - Default Values

```prisma
model Post {
  id        Int      @id @default(autoincrement())  // Auto-increment
  uuid      String   @default(uuid())               // Generate UUID
  cuid      String   @default(cuid())               // Generate CUID
  createdAt DateTime @default(now())                // Current timestamp
  status    String   @default("draft")              // Static value
  views     Int      @default(0)                    // Static number
  isActive  Boolean  @default(true)                 // Static boolean

  // Database-specific defaults
  dbDefault String   @default(dbgenerated("gen_random_uuid()"))  // PostgreSQL
}
```

### @map - Column Name Mapping

```prisma
model User {
  id        Int    @id
  firstName String @map("first_name")    // Column: first_name
  lastName  String @map("last_name")     // Column: last_name
  createdAt DateTime @map("created_at")  // Column: created_at
}
```

### @updatedAt - Auto-Update Timestamp

```prisma
model Post {
  id        Int      @id
  title     String
  updatedAt DateTime @updatedAt  // Automatically set on every update
}
```

### @relation - Relation Configuration

```prisma
model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### @ignore - Skip Field

```prisma
model User {
  id       Int     @id
  email    String
  password String  @ignore  // Not included in Prisma Client
}
```

---

## Optional Fields

Use `?` to make a field nullable (optional).

```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String                                // Required (NOT NULL)
  name        String?                               // Optional (NULL allowed)
  bio         String?                               // Optional
  avatarUrl   String?                               // Optional
  phoneNumber String?                               // Optional
  birthDate   DateTime?                             // Optional
  deletedAt   DateTime?                             // Optional (soft delete)
}
```

### TypeScript Result

```typescript
// Generated type
type User = {
  id: number;
  email: string;        // string (required)
  name: string | null;  // string | null (optional)
  bio: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  birthDate: Date | null;
  deletedAt: Date | null;
};

// Querying
const user = await prisma.user.findUnique({ where: { id: 1 } });

if (user) {
  console.log(user.email);  // string - safe to use
  console.log(user.name);   // string | null - must check!

  // TypeScript will warn you:
  console.log(user.name.toUpperCase());  // Error: Object possibly null

  // Correct approach:
  if (user.name) {
    console.log(user.name.toUpperCase());  // OK
  }
  // Or use optional chaining:
  console.log(user.name?.toUpperCase());   // OK - returns undefined if null
}
```

---

## Arrays

Use `[]` for array fields (PostgreSQL and MongoDB support native arrays).

### PostgreSQL Arrays

```prisma
model Post {
  id     Int      @id
  title  String
  tags   String[]                          // Text array
  scores Int[]                             // Integer array
  prices Float[]                           // Float array
}
```

```typescript
// Creating with arrays
const post = await prisma.post.create({
  data: {
    title: 'My Post',
    tags: ['typescript', 'prisma', 'nodejs'],
    scores: [95, 87, 92],
    prices: [19.99, 29.99, 39.99],
  },
});

// Querying arrays
const posts = await prisma.post.findMany({
  where: {
    tags: {
      has: 'typescript',         // Contains 'typescript'
    },
  },
});

const posts2 = await prisma.post.findMany({
  where: {
    tags: {
      hasEvery: ['typescript', 'prisma'],  // Contains all
    },
  },
});

const posts3 = await prisma.post.findMany({
  where: {
    tags: {
      hasSome: ['typescript', 'javascript'], // Contains any
    },
  },
});
```

### Relation Arrays (All Databases)

```prisma
model User {
  id    Int    @id
  posts Post[] // One-to-many relation
  roles Role[] // Many-to-many relation
}
```

---

## Enums

Enums define a fixed set of allowed values.

### Defining Enums

```prisma
// Define enum
enum Role {
  USER
  ADMIN
  MODERATOR
  GUEST
}

enum Status {
  DRAFT
  PENDING
  PUBLISHED
  ARCHIVED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// Use in models
model User {
  id   Int  @id
  role Role @default(USER)
}

model Post {
  id       Int      @id
  status   Status   @default(DRAFT)
  priority Priority @default(MEDIUM)
}
```

### TypeScript Usage

```typescript
// Prisma generates enum type
import { Role, Status, Priority } from '@prisma/client';

// Create with enum
const user = await prisma.user.create({
  data: {
    role: Role.ADMIN,  // or just 'ADMIN'
  },
});

// Query with enum
const admins = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
  },
});

// TypeScript ensures type safety
const invalid = await prisma.user.create({
  data: {
    role: 'INVALID',  // TypeScript Error!
  },
});
```

### Enum with Database Mapping

```prisma
enum Status {
  DRAFT     @map("draft")
  PUBLISHED @map("published")
  ARCHIVED  @map("archived")
}
```

---

## Relations

Relations define how models connect to each other.

### One-to-One Relation

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile? // Optional one-to-one
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique // Must be unique for one-to-one!
}
```

### One-to-Many Relation

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[] // One user has many posts
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int    // Foreign key
}
```

### Many-to-Many (Implicit)

Prisma automatically creates the join table.

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]  // Many posts have many categories
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] // Many categories have many posts
}

// Prisma creates: _CategoryToPost (postId, categoryId)
```

### Many-to-Many (Explicit)

When you need extra fields on the join table.

```prisma
model Post {
  id         Int           @id @default(autoincrement())
  title      String
  tags       PostTag[]     // Relation to join table
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  posts PostTag[] // Relation to join table
}

// Explicit join table with extra fields
model PostTag {
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  tag       Tag      @relation(fields: [tagId], references: [id])
  tagId     Int
  assignedAt DateTime @default(now())  // Extra field!
  assignedBy String?                    // Extra field!

  @@id([postId, tagId])                 // Composite primary key
}
```

### Self-Relation

A model relating to itself.

```prisma
// Hierarchical categories (parent-child)
model Category {
  id       Int        @id @default(autoincrement())
  name     String
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  parentId Int?
  children Category[] @relation("CategoryHierarchy")
}

// User followers (many-to-many self-relation)
model User {
  id        Int    @id @default(autoincrement())
  name      String
  followers User[] @relation("UserFollows")
  following User[] @relation("UserFollows")
}

// Employees with managers
model Employee {
  id         Int        @id @default(autoincrement())
  name       String
  manager    Employee?  @relation("ManagerReports", fields: [managerId], references: [id])
  managerId  Int?
  reports    Employee[] @relation("ManagerReports")
}
```

### Referential Actions

Control what happens when related records are deleted/updated.

```prisma
model Post {
  id       Int    @id
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}

model Comment {
  id     Int   @id
  post   Post  @relation(fields: [postId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  postId Int
}
```

| Action | Description |
|--------|-------------|
| `Cascade` | Delete/update all related records |
| `Restrict` | Prevent deletion if related records exist |
| `NoAction` | Similar to Restrict (database-dependent) |
| `SetNull` | Set foreign key to NULL |
| `SetDefault` | Set foreign key to default value |

---

## Indexes

Indexes improve query performance.

### Single-Field Index

```prisma
model User {
  id        Int      @id
  email     String   @unique          // Unique index automatically
  name      String

  @@index([name])                     // Regular index on name
}
```

### Composite Index

```prisma
model Post {
  id        Int      @id
  authorId  Int
  published Boolean
  createdAt DateTime

  // Composite index - order matters!
  @@index([authorId, published])
  @@index([published, createdAt])
}
```

### Unique Index

```prisma
model TeamMember {
  id     Int @id
  teamId Int
  userId Int

  @@unique([teamId, userId])          // Unique constraint
  @@index([userId])                   // Additional index for lookups
}
```

### Full-Text Index (PostgreSQL/MySQL)

```prisma
model Post {
  id      Int    @id
  title   String
  content String

  @@fulltext([title, content])        // Full-text search index
}
```

### Index Types (PostgreSQL)

```prisma
model Location {
  id   Int   @id
  lat  Float
  lng  Float
  data Json

  @@index([lat, lng], type: BTree)           // B-tree (default)
  @@index([data], type: Gin)                 // GIN for JSON
  @@index([lat, lng], type: Gist)            // GiST for geometric
}
```

---

## Database Mapping

### @map - Field/Column Mapping

```prisma
model User {
  id        Int      @id @map("user_id")
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  createdAt DateTime @map("created_at")
  updatedAt DateTime @map("updated_at")

  @@map("users")  // Table name
}
```

### @@map - Table/Model Mapping

```prisma
model BlogPost {
  id    Int    @id
  title String

  @@map("blog_posts")  // Table: blog_posts
}

model UserProfile {
  id  Int    @id
  bio String

  @@map("user_profiles")
}
```

### Mapping Enums

```prisma
enum UserRole {
  ADMIN      @map("admin")
  USER       @map("user")
  MODERATOR  @map("moderator")

  @@map("user_role")
}
```

---

## Composite Keys

### Composite Primary Key

```prisma
// No single @id field - use @@id
model PostTag {
  postId Int
  tagId  Int
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])  // Composite primary key
}

model OrderItem {
  orderId   Int
  productId Int
  quantity  Int
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])

  @@id([orderId, productId])
}
```

### Querying Composite Keys

```typescript
// Find by composite key
const postTag = await prisma.postTag.findUnique({
  where: {
    postId_tagId: {
      postId: 1,
      tagId: 2,
    },
  },
});

// Delete by composite key
await prisma.postTag.delete({
  where: {
    postId_tagId: {
      postId: 1,
      tagId: 2,
    },
  },
});
```

### Composite Unique

```prisma
model Subscription {
  id        Int @id @default(autoincrement())
  userId    Int
  planId    Int
  startDate DateTime

  @@unique([userId, planId])  // User can only have one subscription per plan
}
```

---

## Schema Best Practices

### 1. Use Consistent Naming

```prisma
// Models: PascalCase
model User {}
model BlogPost {}
model OrderItem {}

// Fields: camelCase
model User {
  id        Int
  email     String
  firstName String
  createdAt DateTime
}

// Enums: PascalCase with SCREAMING_SNAKE values
enum UserRole {
  ADMIN
  USER
  MODERATOR
}
```

### 2. Map to Database Conventions

```prisma
model User {
  id        Int      @id @map("id")
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  createdAt DateTime @map("created_at")

  @@map("users")
}
```

### 3. Always Include Timestamps

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Soft Deletes Pattern

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  deletedAt DateTime?  // NULL = not deleted

  @@index([deletedAt])
}
```

### 5. Use Descriptive Relation Names

```prisma
model User {
  id            Int       @id
  writtenPosts  Post[]    @relation("PostAuthor")
  likedPosts    Post[]    @relation("PostLikes")
}

model Post {
  id       Int    @id
  author   User   @relation("PostAuthor", fields: [authorId], references: [id])
  authorId Int
  likedBy  User[] @relation("PostLikes")
}
```

### 6. Document with Comments

```prisma
/// User account in the system
/// Used for authentication and profile
model User {
  id    Int    @id @default(autoincrement())

  /// Primary email for login and notifications
  email String @unique

  /// Display name (optional)
  name  String?

  /// Hashed password - never expose in API responses
  passwordHash String @map("password_hash")
}
```

### 7. Optimize with Indexes

```prisma
model Post {
  id        Int      @id
  authorId  Int
  status    Status
  createdAt DateTime

  // Index for common queries
  @@index([authorId])
  @@index([status, createdAt])
  @@index([createdAt])
}
```

### 8. Complete Real-World Example

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// ENUMS
// ==========================================

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum PostStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  ARCHIVED
}

// ==========================================
// USER MODELS
// ==========================================

/// User account
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String?
  role         UserRole  @default(USER)

  // Relations
  profile      Profile?
  posts        Post[]    @relation("PostAuthor")
  comments     Comment[]
  likedPosts   PostLike[]

  // Timestamps
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  @@map("users")
  @@index([email])
  @@index([role])
  @@index([deletedAt])
}

/// User profile (optional extension of User)
model Profile {
  id        Int     @id @default(autoincrement())
  bio       String? @db.Text
  avatarUrl String? @map("avatar_url")
  website   String?

  // Relation
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int     @unique @map("user_id")

  @@map("profiles")
}

// ==========================================
// CONTENT MODELS
// ==========================================

/// Blog post
model Post {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(255)
  slug        String     @unique @db.VarChar(255)
  excerpt     String?    @db.VarChar(500)
  content     String     @db.Text
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?  @map("published_at")

  // Relations
  author      User       @relation("PostAuthor", fields: [authorId], references: [id])
  authorId    Int        @map("author_id")
  comments    Comment[]
  likes       PostLike[]
  tags        PostTag[]

  // Timestamps
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  @@map("posts")
  @@index([authorId])
  @@index([status, publishedAt])
  @@index([slug])
}

/// Comment on a post
model Comment {
  id        Int       @id @default(autoincrement())
  content   String    @db.Text

  // Relations
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    Int       @map("post_id")
  author    User      @relation(fields: [authorId], references: [id])
  authorId  Int       @map("author_id")

  // Self-relation for nested comments
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  Int?      @map("parent_id")
  replies   Comment[] @relation("CommentReplies")

  // Timestamps
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("comments")
  @@index([postId])
  @@index([authorId])
  @@index([parentId])
}

// ==========================================
// TAXONOMIES
// ==========================================

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique @db.VarChar(50)
  slug  String    @unique @db.VarChar(50)
  posts PostTag[]

  @@map("tags")
}

/// Explicit join table for Post-Tag (with metadata)
model PostTag {
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId     Int      @map("post_id")
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId      Int      @map("tag_id")
  assignedAt DateTime @default(now()) @map("assigned_at")

  @@id([postId, tagId])
  @@map("post_tags")
}

/// Post likes (explicit many-to-many with timestamp)
model PostLike {
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    Int      @map("post_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@id([postId, userId])
  @@map("post_likes")
}
```

---

## Summary

Prisma Schema is the foundation of your type-safe database access:

1. **Models** represent database tables
2. **Field Types** map to database column types
3. **Modifiers** (@id, @unique, @default) add constraints
4. **Relations** define how models connect
5. **Indexes** optimize query performance
6. **Mappings** customize database naming
7. **Enums** provide type-safe constants

The schema is the **single source of truth** - from it, Prisma generates:
- TypeScript types
- Database migrations
- Fully type-safe Prisma Client
