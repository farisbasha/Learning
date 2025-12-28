# Prisma Schema - Quick Reference

## Schema Structure

```prisma
// 1. Generator
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Models
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

// 4. Enums
enum Role {
  USER
  ADMIN
}
```

---

## Field Types

| Prisma Type | TypeScript | PostgreSQL | MySQL |
|-------------|------------|------------|-------|
| `String` | `string` | `TEXT` | `VARCHAR(191)` |
| `Boolean` | `boolean` | `BOOLEAN` | `TINYINT(1)` |
| `Int` | `number` | `INTEGER` | `INT` |
| `BigInt` | `bigint` | `BIGINT` | `BIGINT` |
| `Float` | `number` | `DOUBLE PRECISION` | `DOUBLE` |
| `Decimal` | `Decimal` | `DECIMAL` | `DECIMAL` |
| `DateTime` | `Date` | `TIMESTAMP` | `DATETIME` |
| `Json` | `JsonValue` | `JSONB` | `JSON` |
| `Bytes` | `Buffer` | `BYTEA` | `BLOB` |

---

## Field Modifiers

```prisma
model Example {
  // Primary key
  id Int @id                          // Primary key
  id Int @id @default(autoincrement()) // Auto-increment
  id String @id @default(uuid())       // UUID
  id String @id @default(cuid())       // CUID

  // Constraints
  email String @unique                 // Unique constraint
  field String?                        // Nullable (optional)
  tags String[]                        // Array (PostgreSQL)

  // Defaults
  role String @default("user")         // Static default
  active Boolean @default(true)        // Boolean default
  count Int @default(0)                // Number default
  createdAt DateTime @default(now())   // Current timestamp

  // Auto-update
  updatedAt DateTime @updatedAt        // Auto-update on change

  // Database mapping
  firstName String @map("first_name")  // Column name

  // Database-specific types
  content String @db.Text              // TEXT type
  price Decimal @db.Decimal(10, 2)     // DECIMAL(10,2)
  uuid String @db.Uuid                 // UUID type

  // Skip field in client
  internal String @ignore
}
```

---

## Relations

### One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique // MUST be unique for 1:1
}
```

### One-to-Many

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Many-to-Many (Implicit)

```prisma
model Post {
  id   Int        @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
// Prisma creates: _PostToTag join table
```

### Many-to-Many (Explicit)

```prisma
model Post {
  id   Int       @id @default(autoincrement())
  tags PostTag[]
}

model Tag {
  id    Int       @id @default(autoincrement())
  posts PostTag[]
}

model PostTag {
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int
  tag        Tag      @relation(fields: [tagId], references: [id])
  tagId      Int
  assignedAt DateTime @default(now())

  @@id([postId, tagId])
}
```

### Self-Relation

```prisma
model Category {
  id       Int        @id @default(autoincrement())
  name     String
  parent   Category?  @relation("Hierarchy", fields: [parentId], references: [id])
  parentId Int?
  children Category[] @relation("Hierarchy")
}
```

---

## Referential Actions

```prisma
model Post {
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  authorId Int
}
```

| Action | On Delete | On Update |
|--------|-----------|-----------|
| `Cascade` | Delete related | Update foreign key |
| `Restrict` | Prevent delete | Prevent update |
| `NoAction` | Database decides | Database decides |
| `SetNull` | Set FK to NULL | Set FK to NULL |
| `SetDefault` | Set FK to default | Set FK to default |

---

## Indexes

```prisma
model Post {
  id        Int      @id
  authorId  Int
  status    String
  createdAt DateTime

  // Single field index
  @@index([authorId])

  // Composite index
  @@index([status, createdAt])

  // Unique constraint
  @@unique([authorId, status])

  // Full-text search (PostgreSQL/MySQL)
  @@fulltext([title, content])
}
```

---

## Composite Keys

```prisma
model PostTag {
  postId Int
  tagId  Int

  @@id([postId, tagId])           // Composite primary key
}

model Subscription {
  userId Int
  planId Int

  @@unique([userId, planId])       // Composite unique
}
```

---

## Database Mapping

```prisma
model User {
  id        Int    @map("user_id")
  firstName String @map("first_name")

  @@map("users")                   // Table name
}

enum Status {
  ACTIVE @map("active")

  @@map("status_enum")
}
```

---

## Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  role Role @default(USER)
}
```

---

## Database-Specific Types

### PostgreSQL

```prisma
model Example {
  text    String   @db.Text
  varchar String   @db.VarChar(255)
  char    String   @db.Char(2)
  uuid    String   @db.Uuid
  json    Json     @db.JsonB
  decimal Decimal  @db.Decimal(10, 2)
  money   Decimal  @db.Money
  time    DateTime @db.Time
  date    DateTime @db.Date
  ts      DateTime @db.Timestamp
  tstz    DateTime @db.Timestamptz
}
```

### MySQL

```prisma
model Example {
  text     String   @db.Text
  longtext String   @db.LongText
  varchar  String   @db.VarChar(255)
  tinyint  Int      @db.TinyInt
  smallint Int      @db.SmallInt
  decimal  Decimal  @db.Decimal(10, 2)
  datetime DateTime @db.DateTime
}
```

---

## Complete Example

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
  @@index([email])
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String @db.Text
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int    @unique @map("user_id")

  @@map("profiles")
}

model Post {
  id        Int        @id @default(autoincrement())
  title     String     @db.VarChar(255)
  content   String     @db.Text
  status    PostStatus @default(DRAFT)
  author    User       @relation(fields: [authorId], references: [id])
  authorId  Int        @map("author_id")
  tags      Tag[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("posts")
  @@index([authorId])
  @@index([status])
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]

  @@map("tags")
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Model | PascalCase | `User`, `BlogPost` |
| Field | camelCase | `firstName`, `createdAt` |
| Enum | PascalCase | `UserRole`, `PostStatus` |
| Enum Value | SCREAMING_SNAKE | `USER`, `ADMIN` |
| Table (mapped) | snake_case | `users`, `blog_posts` |
| Column (mapped) | snake_case | `first_name`, `created_at` |
