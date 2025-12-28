# Phase 090: Sequelize Introduction (LEGACY)

> **LEGACY NOTICE**: Sequelize was the dominant Node.js ORM from 2014-2020. While Prisma and Drizzle are now preferred for new projects, Sequelize remains important for maintaining existing codebases. Understanding Sequelize helps you work with legacy systems and appreciate ORM evolution.

## Table of Contents
1. [What is Sequelize?](#what-is-sequelize)
2. [Why Learn Sequelize in 2024+?](#why-learn-sequelize)
3. [Installation with TypeScript](#installation)
4. [Database Connection & Configuration](#database-connection)
5. [Sequelize Instance Options](#instance-options)
6. [Sync vs Migrations](#sync-vs-migrations)
7. [Query Logging](#query-logging)
8. [Laravel/Eloquent Comparison](#laravel-comparison)

---

## What is Sequelize?

Sequelize is a promise-based Node.js ORM (Object-Relational Mapping) that supports PostgreSQL, MySQL, MariaDB, SQLite, and Microsoft SQL Server. It provides:

- **Model Definition**: Define database tables as JavaScript/TypeScript classes
- **Associations**: Define relationships between models (1:1, 1:M, M:N)
- **Query Building**: Programmatic query construction without raw SQL
- **Migrations**: Version-controlled database schema changes
- **Transactions**: ACID-compliant database operations
- **Hooks/Lifecycle Events**: Callbacks at various stages of model operations

### Historical Context

```
Timeline of Node.js ORMs:
├── 2010-2014: Raw SQL with node-mysql, pg packages
├── 2014-2018: Sequelize dominates, becomes de facto standard
├── 2018-2020: TypeORM emerges with better TypeScript support
├── 2020-2022: Prisma gains popularity with schema-first approach
└── 2022-now: Drizzle challenges with SQL-like type safety
```

### The Active Record Pattern

Sequelize follows the **Active Record** pattern, where each model instance represents a database row and contains both data and behavior:

```typescript
// Active Record: Object knows how to save itself
const user = await User.create({ name: 'John' });
user.email = 'john@example.com';
await user.save(); // Instance method to persist changes
```

> **Theory Note**: Active Record was popularized by Ruby on Rails and is also used by Laravel's Eloquent. The alternative is the **Data Mapper** pattern (used by TypeORM with repositories), which separates data from persistence logic. Active Record is simpler but can lead to "fat models" as applications grow.

---

## Why Learn Sequelize in 2024+?

### 1. Legacy Codebase Maintenance

Thousands of production Node.js applications use Sequelize. You will encounter it:

```
Real-world scenarios:
├── Joining a team with an existing Sequelize codebase
├── Maintaining enterprise applications built in 2015-2020
├── Migrating from Sequelize to Prisma (need to understand both)
└── Reading open-source projects that use Sequelize
```

### 2. Understanding ORM Evolution

Sequelize's design decisions influenced every ORM that followed:

| Sequelize Concept | Prisma Equivalent | Drizzle Equivalent |
|-------------------|-------------------|-------------------|
| Model.findAll() | model.findMany() | db.select().from() |
| Model.create() | model.create() | db.insert().values() |
| include: [...] | include: {...} | with: {...} relations |
| Op.like | contains, startsWith | like() |

### 3. Skill Transferability

```
Laravel Eloquent ←→ Sequelize ←→ Prisma ←→ Drizzle
       ↓                ↓           ↓          ↓
   Active Record    Active Record  Generated   SQL Builder
   PHP ORM          JS/TS ORM      Client      Type-safe
```

---

## Installation with TypeScript

### Package Installation

```bash
# Core Sequelize
npm install sequelize

# TypeScript decorators support (recommended for TS projects)
npm install sequelize-typescript

# Database driver (choose one)
npm install pg pg-hstore        # PostgreSQL
npm install mysql2              # MySQL/MariaDB
npm install sqlite3             # SQLite
npm install tedious             # Microsoft SQL Server

# TypeScript dependencies
npm install -D typescript @types/node
```

### Project Structure

```
src/
├── config/
│   └── database.ts          # Sequelize configuration
├── models/
│   ├── index.ts             # Model exports & association setup
│   ├── User.ts              # User model
│   └── Post.ts              # Post model
├── migrations/              # Database migrations
├── seeders/                 # Seed data
└── app.ts                   # Application entry
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,        // Required for decorators
    "emitDecoratorMetadata": true,         // Required for type reflection
    "strictPropertyInitialization": false, // Sequelize handles initialization
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

> **Important**: `experimentalDecorators` and `emitDecoratorMetadata` are essential for sequelize-typescript decorators to work properly.

---

## Database Connection & Configuration

### Basic Connection Setup

```typescript
// src/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Post } from '../models/Post';

// Option 1: Connection URI
const sequelize = new Sequelize(
  'postgres://user:password@localhost:5432/database',
  {
    models: [User, Post], // Register models
  }
);

// Option 2: Separate parameters
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'myapp_development',
  models: [User, Post],
});

// Option 3: Environment-based configuration
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT as 'postgres' | 'mysql' | 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  models: [__dirname + '/../models/**/*.ts'], // Glob pattern
});

export default sequelize;
```

### Connection with SSL (Production)

```typescript
// Production configuration with SSL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For self-signed certs
    },
  },
  pool: {
    max: 20,
    min: 5,
    acquire: 30000, // Max time to acquire connection (ms)
    idle: 10000,    // Max time connection can be idle (ms)
  },
});
```

### Testing the Connection

```typescript
// src/app.ts
import sequelize from './config/database';

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
}

bootstrap();
```

---

## Sequelize Instance Options

### Complete Options Reference

```typescript
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  // Database connection
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'secret',
  database: 'myapp',

  // Connection pool
  pool: {
    max: 10,              // Maximum connections in pool
    min: 2,               // Minimum connections in pool
    acquire: 30000,       // Max ms to acquire connection before error
    idle: 10000,          // Max ms connection can be idle before release
    evict: 1000,          // Interval to check for idle connections
  },

  // Query behavior
  define: {
    timestamps: true,       // Add createdAt/updatedAt
    underscored: true,      // Use snake_case column names
    freezeTableName: true,  // Don't pluralize table names
    paranoid: false,        // Soft deletes (adds deletedAt)
  },

  // Logging
  logging: console.log,     // Log queries (or false to disable)
  benchmark: true,          // Log query execution time

  // Query formatting
  quoteIdentifiers: true,   // Quote table/column names

  // Timezone
  timezone: '+00:00',       // Store all times in UTC

  // Models
  models: [User, Post],     // Model classes to register

  // Hooks (global)
  hooks: {
    beforeConnect: (config) => {
      console.log('Connecting to database...');
    },
    afterConnect: (connection) => {
      console.log('Connected!');
    },
  },

  // Retry logic
  retry: {
    max: 3,                 // Retry failed queries up to 3 times
  },
});
```

### Environment-Specific Configuration

```typescript
// src/config/database.ts
type Environment = 'development' | 'test' | 'production';

const configs: Record<Environment, any> = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    database: 'myapp_development',
    username: 'developer',
    password: 'dev_password',
    logging: console.log,
    define: {
      underscored: true,
    },
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      underscored: true,
    },
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false, // Disable in production
    pool: {
      max: 20,
      min: 5,
    },
    dialectOptions: {
      ssl: { require: true },
    },
  },
};

const env = (process.env.NODE_ENV as Environment) || 'development';
export default new Sequelize(configs[env]);
```

---

## Sync vs Migrations

### The Sync Approach (Development Only!)

```typescript
// Sync creates/alters tables based on model definitions
// ⚠️ NEVER use in production!

// sync() - Create missing tables
await sequelize.sync();

// sync({ force: true }) - DROP and recreate all tables
// ☠️ DESTROYS ALL DATA!
await sequelize.sync({ force: true });

// sync({ alter: true }) - Modify tables to match models
// ⚠️ Can still cause data loss
await sequelize.sync({ alter: true });
```

> **LEGACY PATTERN WARNING**: Using `sync()` was common in early Sequelize projects but is now considered an anti-pattern. It can:
> - Destroy production data with `force: true`
> - Make unexpected schema changes with `alter: true`
> - Create untraceable schema changes
> - Cause issues in multi-server deployments

### Why Migrations Are Superior

```
Sync Problems:
├── No version control for schema changes
├── No rollback capability
├── Destructive in production
├── Can't coordinate across team
└── No audit trail

Migration Benefits:
├── Version-controlled schema changes
├── Reversible with down() function
├── Safe for production
├── Team coordination through git
└── Complete history of changes
```

### The Migration Approach (Best Practice)

```typescript
// migrations/20240101120000-create-users.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
```

> **Best Practice**: Use `sync()` only for rapid prototyping in development, then switch to migrations before any team collaboration or production deployment.

---

## Query Logging

### Basic Logging Options

```typescript
// Disable logging entirely
const sequelize = new Sequelize({
  logging: false,
});

// Log to console (default)
const sequelize = new Sequelize({
  logging: console.log,
});

// Custom logging function
const sequelize = new Sequelize({
  logging: (sql, timing) => {
    console.log(`[${new Date().toISOString()}] ${sql}`);
    if (timing) console.log(`Execution time: ${timing}ms`);
  },
  benchmark: true, // Required for timing
});
```

### Advanced Logging with Winston

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'queries.log' }),
  ],
});

const sequelize = new Sequelize({
  logging: (sql, timing) => {
    logger.info({
      message: 'SQL Query',
      query: sql,
      executionTime: timing,
    });
  },
  benchmark: true,
});
```

### Conditional Logging

```typescript
// Log slow queries only
const sequelize = new Sequelize({
  logging: (sql, timing) => {
    if (timing && timing > 1000) {
      console.warn(`SLOW QUERY (${timing}ms): ${sql}`);
    }
  },
  benchmark: true,
});

// Environment-based logging
const sequelize = new Sequelize({
  logging: process.env.NODE_ENV === 'development'
    ? console.log
    : false,
});
```

### Query-Level Logging Control

```typescript
// Disable logging for specific query
const users = await User.findAll({
  logging: false,
});

// Custom logging for specific query
const user = await User.findByPk(1, {
  logging: (sql) => console.log('FINDING USER:', sql),
});
```

---

## Laravel/Eloquent Comparison

For developers coming from PHP/Laravel, Sequelize concepts map directly to Eloquent:

### ORM Philosophy Comparison

| Aspect | Laravel Eloquent | Sequelize |
|--------|-----------------|-----------|
| Pattern | Active Record | Active Record |
| Configuration | .env + config/database.php | JS config object |
| Model Definition | PHP class | TypeScript class with decorators |
| Migrations | artisan make:migration | sequelize-cli migration:generate |
| Query Builder | Fluent interface | Chained methods / options object |
| Relationships | Methods (hasMany, etc.) | Decorators (@HasMany, etc.) |

### Configuration Comparison

```php
// Laravel: config/database.php
return [
    'default' => env('DB_CONNECTION', 'pgsql'),
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
        ],
    ],
];
```

```typescript
// Sequelize: src/config/database.ts
export default new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'forge',
  username: process.env.DB_USERNAME || 'forge',
  password: process.env.DB_PASSWORD || '',
});
```

### Connection Testing

```php
// Laravel
try {
    DB::connection()->getPdo();
    echo "Connected successfully!";
} catch (\Exception $e) {
    die("Could not connect: " . $e->getMessage());
}
```

```typescript
// Sequelize
try {
  await sequelize.authenticate();
  console.log('Connected successfully!');
} catch (error) {
  console.error('Could not connect:', error);
  process.exit(1);
}
```

### Logging Comparison

```php
// Laravel: Enable query log
DB::enableQueryLog();
$users = User::all();
dd(DB::getQueryLog());

// Laravel: config/logging.php for persistent logging
```

```typescript
// Sequelize: Configure at initialization
const sequelize = new Sequelize({
  logging: console.log,
  benchmark: true,
});
```

### Environment Handling

```php
// Laravel: Automatic based on APP_ENV
// Different .env files per environment
// config() helper with env() fallbacks
```

```typescript
// Sequelize: Manual environment switching
const env = process.env.NODE_ENV || 'development';
const config = require('./config/database')[env];
```

---

## Key Takeaways

1. **Sequelize is legacy but relevant** - Many production systems use it; understanding it is valuable for maintenance and migration projects.

2. **Active Record pattern** - Like Eloquent, Sequelize instances contain both data and persistence methods.

3. **TypeScript requires setup** - The `sequelize-typescript` package and specific tsconfig options are needed for decorator support.

4. **Never sync in production** - Always use migrations for production database changes.

5. **Configuration is code** - Unlike Laravel's .env-driven config, Sequelize configuration is typically more explicit JavaScript/TypeScript.

6. **Eloquent experience transfers** - Most concepts (models, relationships, migrations) have direct Sequelize equivalents.

---

## What's Next?

In the next phase, we'll explore **Sequelize Models** in depth:
- Defining models with TypeScript decorators
- Column types and validation
- Hooks and lifecycle events
- Instance vs class methods
