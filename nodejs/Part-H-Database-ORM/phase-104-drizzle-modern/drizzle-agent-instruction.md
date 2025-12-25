# Phase 105: Drizzle ORM (Modern Alternative)
## Agent Instructions

**Phase**: 105 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Learn Drizzle
> Drizzle is the newest ORM (2023+) gaining rapid adoption.
> It's lighter than Prisma with similar type safety.
> Good to know as it may become the next standard.

## Topics
1. What is Drizzle — lightweight TypeScript ORM
2. Drizzle vs Prisma comparison
3. SQL-like syntax
4. Schema definition in TypeScript
5. Drizzle Kit for migrations
6. Query building
7. Relations
8. Transactions
9. When to use Drizzle vs Prisma
10. Migration from other ORMs

## Example
```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';

// Schema
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow()
});

// Client
const db = drizzle(pool);

// Queries
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.email, 'test@test.com'));
await db.insert(users).values({ email: 'new@test.com' });
```

## Content Instructions
**Notes**: Drizzle ORM introduction and patterns
**Summary**: Drizzle vs Prisma comparison
