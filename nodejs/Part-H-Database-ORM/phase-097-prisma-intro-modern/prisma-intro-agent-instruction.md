# Phase 098: Prisma Introduction (Modern)
## Agent Instructions

**Phase**: 098 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Prisma is the Modern Standard
> Prisma is the recommended ORM for new TypeScript projects (2020+).
> It provides 100% type-safe database access with auto-generated types.
> This is the MODERN approach we'll use for most projects.

## Topics
1. What is Prisma — next-generation ORM
2. Schema-first approach
3. Prisma components: Client, Migrate, Studio
4. Installation: `npm install prisma @prisma/client`
5. `prisma init`
6. `schema.prisma` file structure
7. Datasource configuration
8. Generator configuration
9. `prisma generate` — generating client
10. Prisma Studio — GUI
11. Comparison: Prisma vs Sequelize vs TypeORM

## Example
```typescript
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}

model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    posts     Post[]
    createdAt DateTime @default(now())
}
```

## Content Instructions
**Notes**: Prisma setup and core concepts (detailed)
**Summary**: Prisma quick start checklist
