# Phase 079-088: Database & ORM Instructions

## Phases in this Part

| Phase | Topic |
|-------|-------|
| 079 | Database Drivers (mysql2, pg) |
| 080 | Connection Pooling |
| 081 | Knex.js Query Builder |
| 082 | Prisma Introduction |
| 083 | Prisma Schema Design |
| 084 | Prisma CRUD Operations |
| 085 | Prisma Advanced Queries |
| 086 | Prisma Relations |
| 087 | Prisma Migrations & Seeding |
| 088 | Prisma Transactions |

## Key Topics Per Phase

### 079: Database Drivers
- `mysql2` and `pg` packages
- Connection configuration
- Raw queries with types
- Parameterized queries (SQL injection prevention)

### 080: Connection Pooling
- Why pooling is critical in Node
- Pool configuration
- Handling pool errors

### 081: Knex.js
- Query builder with TypeScript
- Building typed queries
- Transactions, Migrations

### 082-088: Prisma (Modern ORM)
- Schema-first approach
- Type generation from schema
- CRUD operations
- Relations (1:1, 1:N, M:N)
- Advanced queries (filtering, pagination)
- Migrations and seeding
- Transactions

## PHP Comparison Reference
| Laravel/Eloquent | Prisma |
|-----------------|--------|
| Migration files | `schema.prisma` |
| `User::find($id)` | `prisma.user.findUnique()` |
| `User::create([])` | `prisma.user.create()` |
| `->with('posts')` | `include: { posts: true }` |
