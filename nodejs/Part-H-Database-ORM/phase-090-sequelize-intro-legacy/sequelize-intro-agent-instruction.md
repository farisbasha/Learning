# Phase 090: Sequelize Introduction (Legacy ORM)
## Agent Instructions

**Phase**: 090 | **Part**: H - Database & ORM | **Language**: TypeScript

## Why Learn Sequelize (Legacy Context)
> Sequelize was THE dominant ORM for Node.js from 2014-2020.
> Many production systems still use it. You WILL encounter it.
> Modern alternative: Prisma (covered later)

## Topics
1. What is Sequelize — promise-based ORM
2. Installation and setup
3. Sequelize with TypeScript
4. `sequelize-typescript` package
5. Database connection
6. Supported databases: MySQL, PostgreSQL, SQLite, MSSQL
7. Sequelize instance creation
8. Sync vs migrations
9. Logging queries
10. Laravel comparison: Eloquent ORM

## Example
```typescript
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    database: 'myapp',
    username: 'user',
    password: 'pass',
    models: [User, Post],
    logging: console.log
});

await sequelize.authenticate();
console.log('Connected!');
```

## Content Instructions
**Notes**: Sequelize setup and introduction
**Summary**: Sequelize quick start guide
