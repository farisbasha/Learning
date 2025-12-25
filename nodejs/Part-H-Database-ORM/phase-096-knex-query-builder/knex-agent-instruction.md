# Phase 097: Knex.js Query Builder
## Agent Instructions

**Phase**: 097 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Learn Knex
> Knex is a SQL query builder — sits between raw SQL and full ORM.
> Useful when you want type safety without the ORM overhead.
> Many projects use Knex directly without an ORM.

## Topics
1. What is Knex — SQL query builder
2. Installation and configuration
3. Knex with TypeScript
4. Connection configuration
5. Select, insert, update, delete
6. Where clauses
7. Joins
8. Transactions
9. Migrations with Knex
10. Seeds
11. Raw queries
12. Comparison: Knex vs ORM

## Example
```typescript
import Knex from 'knex';

const db = Knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
});

// Type-safe queries
interface User {
    id: number;
    email: string;
}

const users = await db<User>('users')
    .select('id', 'email')
    .where('email', 'like', '%@gmail.com')
    .orderBy('created_at', 'desc')
    .limit(10);

// Joins
const posts = await db('posts')
    .join('users', 'posts.user_id', 'users.id')
    .select('posts.*', 'users.email as author_email');
```

## Content Instructions
**Notes**: Knex query builder complete guide
**Summary**: Knex API reference
