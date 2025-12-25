# Phase 099: Prisma Schema Design
## Agent Instructions

**Phase**: 099 | **Part**: H - Database & ORM | **Language**: Prisma Schema

## Topics
1. Model definition
2. Field types: String, Int, Float, Boolean, DateTime, Json
3. Field modifiers: @id, @unique, @default, @map
4. Optional fields with `?`
5. Arrays with `[]`
6. Enums
7. Relations: one-to-one, one-to-many, many-to-many
8. Implicit vs explicit many-to-many
9. Indexes: @@index, @@unique
10. Database mapping: @map, @@map
11. Composite keys: @@id
12. Schema best practices

## Example
```prisma
enum Role {
    USER
    ADMIN
}

model User {
    id        String   @id @default(uuid())
    email     String   @unique
    name      String?
    role      Role     @default(USER)
    posts     Post[]
    profile   Profile?
    
    @@index([email, role])
}

model Post {
    id       Int      @id @default(autoincrement())
    title    String
    content  String?
    author   User     @relation(fields: [authorId], references: [id])
    authorId String
    tags     Tag[]
}

model Tag {
    id    Int    @id @default(autoincrement())
    name  String @unique
    posts Post[]
}
```

## Content Instructions
**Notes**: Comprehensive Prisma schema design guide
**Summary**: Prisma schema syntax reference
