# Phase 090: Sequelize Introduction - Quick Start Guide

> **LEGACY**: Sequelize is the classic Node.js ORM. Learn it for existing codebases, not new projects.

## Quick Installation

```bash
# Core packages
npm install sequelize sequelize-typescript

# Database driver (pick one)
npm install pg pg-hstore      # PostgreSQL
npm install mysql2            # MySQL
npm install sqlite3           # SQLite

# TypeScript
npm install -D typescript @types/node
```

## tsconfig.json (Essential)

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

## Basic Connection

```typescript
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'myapp',
  logging: console.log,
  models: [__dirname + '/models'],
});

// Test connection
await sequelize.authenticate();
```

## Key Configuration Options

| Option | Purpose |
|--------|---------|
| `dialect` | Database type (postgres, mysql, sqlite) |
| `logging` | Query logging (console.log or false) |
| `pool.max` | Maximum connection pool size |
| `define.timestamps` | Auto createdAt/updatedAt |
| `define.underscored` | Use snake_case columns |

## Sync vs Migrations

```typescript
// DEV ONLY - Creates tables from models
await sequelize.sync();           // Create missing
await sequelize.sync({ force: true });  // DROP & recreate (data loss!)
await sequelize.sync({ alter: true });  // Alter to match

// PRODUCTION - Use migrations instead!
npx sequelize-cli db:migrate
```

## Laravel Eloquent Mapping

| Eloquent | Sequelize |
|----------|-----------|
| `DB::connection()->getPdo()` | `sequelize.authenticate()` |
| `config/database.php` | `new Sequelize({...})` |
| `php artisan migrate` | `npx sequelize-cli db:migrate` |
| Active Record pattern | Active Record pattern |

## Quick Environment Setup

```typescript
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === 'development',
});
```

## Remember

1. **Never `sync({ force: true })` in production** - destroys all data
2. **Always use migrations** for production schema changes
3. **sequelize-typescript** is required for TypeScript decorators
4. **Test connection early** with `authenticate()`
