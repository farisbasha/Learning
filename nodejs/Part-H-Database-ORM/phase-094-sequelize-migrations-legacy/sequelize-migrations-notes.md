# Phase 094: Sequelize Migrations (Legacy) - Comprehensive Notes

## Table of Contents
1. [What are Migrations? (The Problem)](#what-are-migrations)
2. [Why Migrations Over sync()](#why-migrations-over-sync)
3. [How sequelize-cli Works Internally](#how-sequelize-cli-works)
4. [Migration File Structure](#migration-file-structure)
5. [Creating Tables with Migrations](#creating-tables)
6. [Altering Tables](#altering-tables)
7. [Indexes and Constraints](#indexes-and-constraints)
8. [Running Migrations](#running-migrations)
9. [Rolling Back](#rolling-back)
10. [Seeders](#seeders)
11. [Migration Best Practices](#best-practices)
12. [Laravel Artisan Migrations Comparison](#laravel-comparison)

---

## 1. What are Migrations? (The Problem) {#what-are-migrations}

### The Fundamental Problem

Imagine you're working on a production application with a database containing millions of user records. You need to add a new column `phoneNumber` to the `users` table. What could go wrong?

**Without Migrations (Manual Approach):**
```
Developer A: "I added phoneNumber column locally"
Developer B: "My app crashed - I don't have that column!"
Production DB: Still has old schema
New Developer: "Which SQL scripts do I run to set up?"
```

**The Core Problems:**
1. **No Version Control** - Database schema changes aren't tracked like code
2. **No Synchronization** - Team members have different database states
3. **No Rollback Mechanism** - Can't undo a destructive change easily
4. **No Deployment History** - Don't know what's been applied to production
5. **Manual Error-Prone Process** - Forgetting to run SQL scripts

### What Migrations Solve

**Migrations** are version-controlled, timestamped database schema changes that treat your database structure like code.

```
Migrations = Git for Your Database Schema
```

**ASCII Flow Diagram:**
```
Code Repository                    Database State
================                   ==============

[Migration 001]  ──────────────►  [users table created]
[Migration 002]  ──────────────►  [posts table created]
[Migration 003]  ──────────────►  [users.email → unique]
[Migration 004]  ──────────────►  [comments table created]
      ↓                                    ↓
   Rollback?                          Undo changes
   [Undo 004]   ──────────────►  [comments table dropped]
```

### Real-World Analogy

Think of migrations like **building construction blueprints**:
- **Blueprint #1**: Pour foundation (create users table)
- **Blueprint #2**: Build first floor (add posts table)
- **Blueprint #3**: Add plumbing (add foreign keys)
- **Blueprint #4**: Install windows (add indexes)

Each blueprint:
- Has a timestamp/sequence number
- Can be applied in order
- Can be reversed (demolition instructions)
- Is stored in version control
- Works the same on any construction site (dev/staging/prod)

---

## 2. Why Migrations Over sync() {#why-migrations-over-sync}

### Understanding sync() and Its Dangers

Sequelize provides a `sync()` method that automatically creates/updates tables based on your models:

```javascript
// DON'T DO THIS IN PRODUCTION!
await sequelize.sync();           // Create tables if they don't exist
await sequelize.sync({ force: true });  // DROP and recreate ALL tables
await sequelize.sync({ alter: true });  // ALTER tables to match models
```

### The Problems with sync()

#### Problem 1: Data Loss Risk

```javascript
// Your model changes
class User extends Model {
    username!: string;
    email!: string;
    // NEW: Changed from 'name' to 'fullName'
    fullName!: string;
}

// sync({ alter: true }) does this:
// ALTER TABLE users DROP COLUMN name;
// ALTER TABLE users ADD COLUMN fullName VARCHAR(255);
// ❌ All existing 'name' data is LOST!
```

**With Migrations:**
```javascript
// You control the transformation
await queryInterface.renameColumn('users', 'name', 'fullName');
// ✅ Data is preserved
```

#### Problem 2: No History or Audit Trail

**sync() Approach:**
```
What changes were made? → Unknown
When were they made? → Unknown
Who made them? → Unknown
What's in production? → Unknown
Can we rollback? → No
```

**Migration Approach:**
```
SequelizeMeta table:
┌─────────────────────────────────┐
│ name                            │
├─────────────────────────────────┤
│ 20231201-create-users.js        │
│ 20231202-add-email-index.js     │
│ 20231203-add-phoneNumber.js     │
└─────────────────────────────────┘
✅ Complete history of changes
```

#### Problem 3: Non-Deterministic Behavior

**sync() can generate different SQL on different databases:**

```javascript
// PostgreSQL might generate:
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE
);

// MySQL might generate:
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME
);
```

**Migrations give you explicit control:**
```javascript
// You specify EXACTLY what happens
await queryInterface.createTable('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
});
```

#### Problem 4: Team Collaboration Chaos

**Scenario: Two developers work simultaneously**

```
Developer A (adds migration):          Developer B (uses sync):
─────────────────────────              ─────────────────────────
1. Creates migration file              1. Modifies User model
2. Commits to git                      2. Runs sync({ alter: true })
3. Pushes to repo                      3. Tables change locally
4. CI/CD runs migration                4. Commits only model code
5. Production updated                  5. Pushes to repo
                                       6. Production runs sync()
                                       7. ❌ UNPREDICTABLE CHANGES
```

### Performance and Memory Implications

#### sync() Performance Issues

```javascript
// sync() must:
// 1. Read all model definitions from memory
// 2. Query database for existing schema (SHOW TABLES, DESCRIBE)
// 3. Compare in-memory models with database
// 4. Generate ALTER statements
// 5. Execute changes

// For 50 models, this means:
// - 50+ schema queries
// - In-memory comparison logic
// - Potential table locking
// Time: 5-10 seconds on startup
```

#### Migration Performance

```javascript
// Migrations:
// 1. Query SequelizeMeta table (1 query)
// 2. Execute pending migrations only
// 3. Update SequelizeMeta

// Time: < 1 second (only runs new migrations)
// Memory: Minimal (no model comparison)
```

**Memory Usage Diagram:**
```
sync() Memory Footprint:
┌──────────────────────────────────┐
│ All Model Definitions    (2 MB)  │
│ Database Schema Query    (1 MB)  │
│ Comparison Algorithm     (1 MB)  │
│ ALTER SQL Generation     (500KB) │
└──────────────────────────────────┘
Total: ~4.5 MB + processing time

Migration Memory Footprint:
┌──────────────────────────────────┐
│ Migration File(s)        (100KB) │
│ SequelizeMeta Query      (10KB)  │
└──────────────────────────────────┘
Total: ~110KB + minimal processing
```

### When to Use Each Approach

**Use sync() ONLY for:**
- ✅ Local development (quick prototyping)
- ✅ Automated tests (create fresh DB per test)
- ✅ Proof of concepts

**Use Migrations for:**
- ✅ Production environments
- ✅ Staging environments
- ✅ Team collaboration
- ✅ Any database with real data
- ✅ CI/CD pipelines

---

## 3. How sequelize-cli Works Internally {#how-sequelize-cli-works}

### Installation and Setup

```bash
# Install sequelize-cli globally or as dev dependency
npm install --save-dev sequelize-cli

# Initialize sequelize project structure
npx sequelize-cli init
```

**Generated Structure:**
```
project/
├── config/
│   └── config.json          # Database configurations
├── migrations/              # Migration files (timestamped)
├── models/                  # Sequelize models
├── seeders/                 # Seed data files
└── .sequelizerc            # (Optional) Custom configuration
```

### Internal Architecture

**ASCII Architecture Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                     sequelize-cli                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Config     │      │  Migration   │                   │
│  │   Loader     │─────▶│   Runner     │                   │
│  └──────────────┘      └──────────────┘                   │
│         │                      │                           │
│         │                      │                           │
│         ▼                      ▼                           │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │  Database    │      │ SequelizeMeta│                   │
│  │  Connection  │◀─────│    Table     │                   │
│  └──────────────┘      └──────────────┘                   │
│         │                      │                           │
│         └──────────┬───────────┘                           │
│                    ▼                                       │
│            ┌──────────────┐                                │
│            │   Database   │                                │
│            │   (MySQL/    │                                │
│            │   Postgres)  │                                │
│            └──────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

### The SequelizeMeta Table

When you run your first migration, Sequelize automatically creates a tracking table:

```sql
CREATE TABLE "SequelizeMeta" (
    "name" VARCHAR(255) NOT NULL PRIMARY KEY
);
```

**Purpose:** Tracks which migrations have been executed.

**Example Data:**
```
SequelizeMeta:
┌──────────────────────────────────────┐
│ name                                 │
├──────────────────────────────────────┤
│ 20231201120000-create-users.js       │
│ 20231202093000-add-email-index.js    │
│ 20231203154500-add-posts-table.js    │
└──────────────────────────────────────┘
```

### Migration Execution Flow

**When you run `npx sequelize-cli db:migrate`:**

```
Step 1: Load Configuration
    ↓
    Read config/config.json
    Determine environment (development/production)
    Get database credentials

Step 2: Connect to Database
    ↓
    Establish connection using credentials
    Create SequelizeMeta if not exists

Step 3: Read Migration Files
    ↓
    Scan migrations/ directory
    Sort files by timestamp (oldest first)

Step 4: Determine Pending Migrations
    ↓
    Query SequelizeMeta table
    Compare with filesystem
    Pending = (Filesystem - SequelizeMeta)

Step 5: Execute Pending Migrations
    ↓
    For each pending migration:
        - Begin transaction
        - Execute up() function
        - Insert migration name into SequelizeMeta
        - Commit transaction

Step 6: Report Results
    ↓
    Display executed migrations
    Show success/error status
```

**Code Representation:**
```javascript
// Simplified internal logic
async function runMigrations() {
    // 1. Get all migration files
    const migrationFiles = fs.readdirSync('./migrations')
        .filter(f => f.endsWith('.js'))
        .sort(); // Timestamp sorting

    // 2. Get executed migrations from DB
    const executedMigrations = await sequelize.query(
        'SELECT name FROM "SequelizeMeta"',
        { type: QueryTypes.SELECT }
    );

    const executedNames = executedMigrations.map(m => m.name);

    // 3. Find pending migrations
    const pendingMigrations = migrationFiles.filter(
        file => !executedNames.includes(file)
    );

    // 4. Execute each pending migration
    for (const migrationFile of pendingMigrations) {
        const migration = require(`./migrations/${migrationFile}`);

        try {
            await sequelize.transaction(async (transaction) => {
                // Execute migration
                await migration.up(queryInterface, Sequelize);

                // Mark as executed
                await sequelize.query(
                    'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
                    { replacements: [migrationFile], transaction }
                );
            });

            console.log(`✓ ${migrationFile} executed successfully`);
        } catch (error) {
            console.error(`✗ ${migrationFile} failed:`, error);
            throw error; // Stop on first failure
        }
    }
}
```

### Configuration Deep Dive

**config/config.json:**
```json
{
  "development": {
    "username": "root",
    "password": "password",
    "database": "myapp_dev",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": console.log
  },
  "test": {
    "username": "root",
    "password": "password",
    "database": "myapp_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  },
  "production": {
    "username": "dbuser",
    "password": "securepass",
    "database": "myapp_prod",
    "host": "prod-db.example.com",
    "dialect": "mysql",
    "logging": false,
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
}
```

**Using .sequelizerc for Custom Paths:**
```javascript
// .sequelizerc
const path = require('path');

module.exports = {
    'config': path.resolve('src/config', 'database.json'),
    'models-path': path.resolve('src/db', 'models'),
    'seeders-path': path.resolve('src/db', 'seeders'),
    'migrations-path': path.resolve('src/db', 'migrations')
};
```

---

## 4. Migration File Structure {#migration-file-structure}

### Anatomy of a Migration File

Every migration file has a **timestamp prefix** and follows a strict structure:

```javascript
// migrations/20231215143022-create-users.js
//          ^^^^^^^^^^^^^^^^ Timestamp: YYYYMMDDHHmmss

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    /**
     * up() - Applied when migrating forward
     * @param {QueryInterface} queryInterface - Sequelize query interface
     * @param {Sequelize} Sequelize - Sequelize constructor
     */
    async up(queryInterface, Sequelize) {
        // Schema changes to apply
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    /**
     * down() - Applied when rolling back
     * Must REVERSE the changes made in up()
     */
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

### The QueryInterface Object

`queryInterface` is your primary tool for database operations in migrations. It provides methods that generate SQL.

**Key Methods:**
```javascript
// Table Operations
queryInterface.createTable(tableName, attributes, options)
queryInterface.dropTable(tableName, options)
queryInterface.renameTable(before, after, options)

// Column Operations
queryInterface.addColumn(tableName, columnName, dataType, options)
queryInterface.removeColumn(tableName, columnName, options)
queryInterface.changeColumn(tableName, columnName, dataType, options)
queryInterface.renameColumn(tableName, oldName, newName, options)

// Index Operations
queryInterface.addIndex(tableName, attributes, options)
queryInterface.removeIndex(tableName, indexName, options)

// Constraint Operations
queryInterface.addConstraint(tableName, options)
queryInterface.removeConstraint(tableName, constraintName, options)

// Raw Queries (last resort)
queryInterface.sequelize.query('SELECT * FROM users')
```

### The Sequelize Constructor Object

The `Sequelize` object provides data types and utilities:

```javascript
// Data Types
Sequelize.STRING(length)          // VARCHAR
Sequelize.TEXT                    // TEXT
Sequelize.INTEGER                 // INT
Sequelize.BIGINT                  // BIGINT
Sequelize.FLOAT                   // FLOAT
Sequelize.DOUBLE                  // DOUBLE
Sequelize.DECIMAL(precision, scale)
Sequelize.DATE                    // DATETIME
Sequelize.BOOLEAN                 // TINYINT(1)
Sequelize.ENUM('value1', 'value2')
Sequelize.JSON                    // JSON (MySQL 5.7+, Postgres)
Sequelize.JSONB                   // JSONB (Postgres only)
Sequelize.UUID                    // UUID

// Special Values
Sequelize.literal('CURRENT_TIMESTAMP')
Sequelize.fn('NOW')
```

### Timestamp Naming Convention

```
Format: YYYYMMDDHHmmss-descriptive-name.js

Examples:
20231215143022-create-users.js
20231215150000-add-email-index-to-users.js
20231216091500-add-role-column-to-users.js
20231216100000-create-posts-table.js
```

**Why Timestamps Matter:**
- Ensures chronological execution order
- Prevents naming conflicts in teams
- Makes it obvious when migration was created
- Allows sorting and querying by creation time

### Generating Migration Files

```bash
# Basic migration creation
npx sequelize-cli migration:generate --name create-users

# This creates:
# migrations/20231215143022-create-users.js (with empty up/down)

# You must fill in the up() and down() functions manually
```

**Generated Template:**
```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};
```

### TypeScript Support

For TypeScript projects, you can use TypeScript in migrations:

```typescript
// migrations/20231215143022-create-users.ts
import { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false
            }
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('users');
    }
};
```

**Note:** Requires `ts-node` configuration in `.sequelizerc`:
```javascript
// .sequelizerc
require('ts-node/register');

module.exports = {
    'migrations-path': './migrations',
    // ... other config
};
```

---

## 5. Creating Tables with Migrations {#creating-tables}

### Basic Table Creation

```javascript
// migrations/20231215-create-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

**Generated SQL (MySQL):**
```sql
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Advanced Column Options

```javascript
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            // UUID Primary Key Alternative
            uuid: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true
            },

            // String with default value
            name: {
                type: Sequelize.STRING(200),
                allowNull: false,
                defaultValue: 'Unnamed Product'
            },

            // Text field
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            // Decimal for prices
            price: {
                type: Sequelize.DECIMAL(10, 2),  // 10 digits, 2 decimal places
                allowNull: false,
                defaultValue: 0.00
            },

            // Integer with check constraint
            stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0  // Note: validate doesn't work in migrations
                }
            },

            // Enum field
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'discontinued'),
                defaultValue: 'active',
                allowNull: false
            },

            // Boolean field
            isAvailable: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },

            // JSON field (MySQL 5.7+, Postgres)
            metadata: {
                type: Sequelize.JSON,
                allowNull: true
            },

            // Date field
            launchDate: {
                type: Sequelize.DATEONLY,  // Date without time
                allowNull: true
            },

            // Timestamps
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};
```

### Real-World Example: E-commerce Orders Table

```javascript
// migrations/20231215-create-orders.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            orderNumber: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
                comment: 'Unique order number for customer reference'
            },

            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',      // Table name
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'     // Prevent deleting user with orders
            },

            totalAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },

            status: {
                type: Sequelize.ENUM(
                    'pending',
                    'processing',
                    'shipped',
                    'delivered',
                    'cancelled',
                    'refunded'
                ),
                defaultValue: 'pending',
                allowNull: false
            },

            shippingAddress: {
                type: Sequelize.JSON,
                allowNull: false,
                comment: 'Stored as JSON: {street, city, zip, country}'
            },

            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            placedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            shippedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

            deliveredAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('orders');
    }
};
```

### Edge Case: Creating Tables with Composite Primary Keys

```javascript
// migrations/20231215-create-user-roles.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_roles', {
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,  // Part of composite key
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,  // Part of composite key
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            assignedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_roles');
    }
};
```

**Generated SQL:**
```sql
CREATE TABLE `user_roles` (
    `userId` INT NOT NULL,
    `roleId` INT NOT NULL,
    `assignedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`userId`, `roleId`),
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
);
```

### Table Options

```javascript
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            // ... columns
        }, {
            // Table options
            engine: 'InnoDB',                    // MySQL storage engine
            charset: 'utf8mb4',                  // Character set
            collate: 'utf8mb4_unicode_ci',       // Collation
            comment: 'Application users table',  // Table comment
            indexes: [                           // Define indexes during creation
                {
                    name: 'email_idx',
                    fields: ['email']
                },
                {
                    name: 'username_idx',
                    fields: ['username']
                }
            ]
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

---

## 6. Altering Tables {#altering-tables}

### Adding Columns

**Basic Column Addition:**
```javascript
// migrations/20231216-add-phone-to-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'phoneNumber', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'phoneNumber');
    }
};
```

**Adding Multiple Columns:**
```javascript
// migrations/20231216-add-user-profile-fields.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add multiple columns sequentially
        await queryInterface.addColumn('users', 'firstName', {
            type: Sequelize.STRING(50),
            allowNull: true
        });

        await queryInterface.addColumn('users', 'lastName', {
            type: Sequelize.STRING(50),
            allowNull: true
        });

        await queryInterface.addColumn('users', 'birthDate', {
            type: Sequelize.DATEONLY,
            allowNull: true
        });

        await queryInterface.addColumn('users', 'bio', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'firstName');
        await queryInterface.removeColumn('users', 'lastName');
        await queryInterface.removeColumn('users', 'birthDate');
        await queryInterface.removeColumn('users', 'bio');
    }
};
```

**Adding Column with Default Value and Existing Data:**
```javascript
// migrations/20231216-add-status-to-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add column with default
        await queryInterface.addColumn('users', 'status', {
            type: Sequelize.ENUM('active', 'inactive', 'suspended'),
            allowNull: false,
            defaultValue: 'active'
        });

        // Optional: Update existing rows
        await queryInterface.sequelize.query(
            `UPDATE users SET status = 'active' WHERE status IS NULL`
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'status');
        // Note: ENUM type may need to be dropped separately in some databases
    }
};
```

### Removing Columns

```javascript
// migrations/20231217-remove-legacy-fields.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove single column
        await queryInterface.removeColumn('users', 'legacyId');

        // Remove multiple columns
        await queryInterface.removeColumn('users', 'oldField1');
        await queryInterface.removeColumn('users', 'oldField2');
    },

    async down(queryInterface, Sequelize) {
        // Must recreate columns with exact same specification
        await queryInterface.addColumn('users', 'legacyId', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('users', 'oldField1', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        await queryInterface.addColumn('users', 'oldField2', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
    }
};
```

**Important:** When removing columns, down() must recreate them EXACTLY as they were, including any indexes or constraints.

### Changing/Modifying Columns

**Change Column Type:**
```javascript
// migrations/20231217-change-username-length.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Change VARCHAR(50) to VARCHAR(100)
        await queryInterface.changeColumn('users', 'username', {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert to original type
        await queryInterface.changeColumn('users', 'username', {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        });
    }
};
```

**Change Column from Nullable to NOT NULL:**
```javascript
// migrations/20231217-make-email-required.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Update NULL values (important!)
        await queryInterface.sequelize.query(
            `UPDATE users SET email = CONCAT('user', id, '@placeholder.com') WHERE email IS NULL`
        );

        // Step 2: Change column to NOT NULL
        await queryInterface.changeColumn('users', 'email', {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'email', {
            type: Sequelize.STRING(100),
            allowNull: true,
            unique: true
        });
    }
};
```

**Real-World Edge Case: Change Type with Data Transformation:**
```javascript
// migrations/20231217-convert-price-to-cents.js
// Change from DECIMAL to INTEGER (store cents instead of dollars)
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Add temporary column
        await queryInterface.addColumn('products', 'priceInCents', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        // Step 2: Transform data (multiply by 100)
        await queryInterface.sequelize.query(
            `UPDATE products SET priceInCents = ROUND(price * 100)`
        );

        // Step 3: Remove old column
        await queryInterface.removeColumn('products', 'price');

        // Step 4: Rename new column
        await queryInterface.renameColumn('products', 'priceInCents', 'price');

        // Step 5: Make NOT NULL if needed
        await queryInterface.changeColumn('products', 'price', {
            type: Sequelize.INTEGER,
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        // Reverse transformation
        await queryInterface.addColumn('products', 'priceDecimal', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        });

        await queryInterface.sequelize.query(
            `UPDATE products SET priceDecimal = price / 100.0`
        );

        await queryInterface.removeColumn('products', 'price');

        await queryInterface.renameColumn('products', 'priceDecimal', 'price');

        await queryInterface.changeColumn('products', 'price', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        });
    }
};
```

### Renaming Columns

```javascript
// migrations/20231217-rename-name-to-fullname.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn('users', 'name', 'fullName');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn('users', 'fullName', 'name');
    }
};
```

**Database-Specific Behavior:**
- **MySQL/MariaDB**: `ALTER TABLE users CHANGE name fullName VARCHAR(100)`
- **PostgreSQL**: `ALTER TABLE users RENAME COLUMN name TO fullName`
- **SQLite**: Creates new table, copies data, drops old table (expensive!)

### Renaming Tables

```javascript
// migrations/20231217-rename-user-to-account.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameTable('users', 'accounts');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameTable('accounts', 'users');
    }
};
```

**Warning:** Renaming tables affects:
- Foreign key references
- Indexes (may be renamed automatically)
- Application code (must update model names)
- Existing queries

### Real-World Complex Example: Splitting a Column

```javascript
// migrations/20231217-split-fullname.js
// Split 'fullName' into 'firstName' and 'lastName'
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Add new columns
        await queryInterface.addColumn('users', 'firstName', {
            type: Sequelize.STRING(50),
            allowNull: true
        });

        await queryInterface.addColumn('users', 'lastName', {
            type: Sequelize.STRING(50),
            allowNull: true
        });

        // Step 2: Migrate data
        const [users] = await queryInterface.sequelize.query(
            `SELECT id, fullName FROM users`
        );

        for (const user of users) {
            if (user.fullName) {
                const parts = user.fullName.split(' ');
                const firstName = parts[0] || '';
                const lastName = parts.slice(1).join(' ') || '';

                await queryInterface.sequelize.query(
                    `UPDATE users SET firstName = ?, lastName = ? WHERE id = ?`,
                    { replacements: [firstName, lastName, user.id] }
                );
            }
        }

        // Step 3: Remove old column
        await queryInterface.removeColumn('users', 'fullName');
    },

    async down(queryInterface, Sequelize) {
        // Reverse the split
        await queryInterface.addColumn('users', 'fullName', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        await queryInterface.sequelize.query(
            `UPDATE users SET fullName = CONCAT(firstName, ' ', lastName)`
        );

        await queryInterface.removeColumn('users', 'firstName');
        await queryInterface.removeColumn('users', 'lastName');
    }
};
```

---

## 7. Indexes and Constraints {#indexes-and-constraints}

### Understanding Indexes

**What are Indexes?**
Indexes are data structures that improve query performance by creating a sorted reference to table data.

**Analogy:** Think of a book index. Instead of reading every page to find "migrations," you check the index which points you to pages 94, 107, 215.

**Performance Impact:**
```
Query without index:
SELECT * FROM users WHERE email = 'john@example.com';
→ Scans ALL 1,000,000 rows (SLOW)
→ Time: 2.5 seconds

Query with index on email:
SELECT * FROM users WHERE email = 'john@example.com';
→ Uses index to jump directly to row (FAST)
→ Time: 0.003 seconds
```

### Adding Indexes

**Single Column Index:**
```javascript
// migrations/20231218-add-email-index.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('users', ['email'], {
            name: 'users_email_idx',
            unique: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('users', 'users_email_idx');
    }
};
```

**Generated SQL:**
```sql
CREATE INDEX users_email_idx ON users (email);
```

**Unique Index:**
```javascript
// migrations/20231218-add-unique-username-index.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('users', ['username'], {
            name: 'users_username_unique',
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('users', 'users_username_unique');
    }
};
```

**Composite Index (Multiple Columns):**
```javascript
// migrations/20231218-add-composite-index.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Index on (userId, createdAt) for efficient queries
        await queryInterface.addIndex('orders', ['userId', 'createdAt'], {
            name: 'orders_user_date_idx'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('orders', 'orders_user_date_idx');
    }
};
```

**Use Case for Composite Index:**
```sql
-- This query benefits from composite index:
SELECT * FROM orders
WHERE userId = 123
ORDER BY createdAt DESC;

-- Index (userId, createdAt) allows:
-- 1. Quick lookup by userId
-- 2. Results already sorted by createdAt
```

**Partial/Filtered Index (PostgreSQL):**
```javascript
// migrations/20231218-add-partial-index.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Index only active users (Postgres only)
        await queryInterface.addIndex('users', ['status'], {
            name: 'users_active_status_idx',
            where: {
                status: 'active'
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('users', 'users_active_status_idx');
    }
};
```

**Full-Text Index (MySQL):**
```javascript
// migrations/20231218-add-fulltext-index.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // For text search queries
        await queryInterface.sequelize.query(
            `CREATE FULLTEXT INDEX posts_content_fulltext
             ON posts (title, content)`
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP INDEX posts_content_fulltext ON posts`
        );
    }
};
```

### Index Best Practices

**When to Add Indexes:**
```
✅ Columns in WHERE clauses
✅ Columns in JOIN conditions
✅ Columns in ORDER BY clauses
✅ Foreign key columns
✅ Columns with high cardinality (many unique values)

❌ Columns rarely queried
❌ Columns with low cardinality (few unique values, e.g., boolean)
❌ Small tables (< 1000 rows)
❌ Tables with frequent writes (indexes slow down INSERT/UPDATE)
```

**Memory Cost of Indexes:**
```
Index Memory Usage (approximate):
─────────────────────────────────
Table: 1,000,000 rows

Index on INT column:
  Row size: 4 bytes (INT) + 6 bytes (pointer)
  Total: 1M * 10 bytes = 10 MB

Index on VARCHAR(100):
  Row size: ~50 bytes (avg) + 6 bytes (pointer)
  Total: 1M * 56 bytes = 56 MB

Index on (userId INT, createdAt DATE):
  Row size: 4 + 8 + 6 = 18 bytes
  Total: 1M * 18 bytes = 18 MB
```

### Constraints

**Foreign Key Constraints:**
```javascript
// migrations/20231218-add-foreign-keys.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint('posts', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'posts_userId_fkey',
            references: {
                table: 'users',
                field: 'id'
            },
            onDelete: 'CASCADE',    // Delete posts when user deleted
            onUpdate: 'CASCADE'     // Update posts when user id changes
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('posts', 'posts_userId_fkey');
    }
};
```

**ON DELETE/UPDATE Options:**
```
CASCADE:    Delete/update child rows automatically
RESTRICT:   Prevent deletion/update if child rows exist
SET NULL:   Set foreign key to NULL
SET DEFAULT: Set foreign key to DEFAULT value
NO ACTION:  Similar to RESTRICT (check at end of transaction)
```

**Real-World Example:**
```javascript
// migrations/20231218-setup-order-relationships.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Order belongs to User
        await queryInterface.addConstraint('orders', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'orders_userId_fkey',
            references: { table: 'users', field: 'id' },
            onDelete: 'RESTRICT',  // Can't delete user with orders
            onUpdate: 'CASCADE'
        });

        // OrderItem belongs to Order
        await queryInterface.addConstraint('order_items', {
            fields: ['orderId'],
            type: 'foreign key',
            name: 'order_items_orderId_fkey',
            references: { table: 'orders', field: 'id' },
            onDelete: 'CASCADE',   // Delete items when order deleted
            onUpdate: 'CASCADE'
        });

        // OrderItem references Product
        await queryInterface.addConstraint('order_items', {
            fields: ['productId'],
            type: 'foreign key',
            name: 'order_items_productId_fkey',
            references: { table: 'products', field: 'id' },
            onDelete: 'RESTRICT',  // Can't delete product in orders
            onUpdate: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('orders', 'orders_userId_fkey');
        await queryInterface.removeConstraint('order_items', 'order_items_orderId_fkey');
        await queryInterface.removeConstraint('order_items', 'order_items_productId_fkey');
    }
};
```

**Check Constraints:**
```javascript
// migrations/20231218-add-check-constraints.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Ensure price is positive
        await queryInterface.addConstraint('products', {
            fields: ['price'],
            type: 'check',
            name: 'products_price_positive',
            where: {
                price: {
                    [Sequelize.Op.gte]: 0
                }
            }
        });

        // Alternative: Raw SQL for complex checks
        await queryInterface.sequelize.query(
            `ALTER TABLE orders
             ADD CONSTRAINT orders_dates_valid
             CHECK (shippedAt IS NULL OR shippedAt >= placedAt)`
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('products', 'products_price_positive');
        await queryInterface.sequelize.query(
            `ALTER TABLE orders DROP CONSTRAINT orders_dates_valid`
        );
    }
};
```

**Unique Constraints:**
```javascript
// migrations/20231218-add-unique-constraints.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Single column unique
        await queryInterface.addConstraint('users', {
            fields: ['email'],
            type: 'unique',
            name: 'users_email_unique'
        });

        // Composite unique (userId + roleId must be unique together)
        await queryInterface.addConstraint('user_roles', {
            fields: ['userId', 'roleId'],
            type: 'unique',
            name: 'user_roles_composite_unique'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('users', 'users_email_unique');
        await queryInterface.removeConstraint('user_roles', 'user_roles_composite_unique');
    }
};
```

---

## 8. Running Migrations {#running-migrations}

### Basic Migration Commands

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Migrate to a specific migration
npx sequelize-cli db:migrate --to 20231218-add-indexes.js

# Dry run (see what would happen)
npx sequelize-cli db:migrate --dry-run
```

### Migration Execution Internals

**What happens when you run `db:migrate`:**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Load Configuration                                  │
│  - Read config/config.json                                  │
│  - Determine NODE_ENV (development/production)              │
│  - Get database credentials                                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Establish Database Connection                       │
│  - Create Sequelize instance                                │
│  - Test connection                                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Ensure SequelizeMeta Table Exists                  │
│  - CREATE TABLE IF NOT EXISTS SequelizeMeta (name VARCHAR)  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Query Executed Migrations                          │
│  - SELECT name FROM SequelizeMeta ORDER BY name             │
│  - Result: ['20231201-create-users.js', ...]               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Scan Filesystem for Migration Files                │
│  - Read ./migrations/ directory                             │
│  - Filter *.js files                                        │
│  - Sort by timestamp (filename prefix)                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Determine Pending Migrations                       │
│  - Pending = Filesystem - SequelizeMeta                     │
│  - Example: [20231218-add-indexes.js, 20231219-...]        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Execute Each Pending Migration                     │
│  For each migration:                                        │
│   ├─ BEGIN TRANSACTION                                      │
│   ├─ Require migration file                                │
│   ├─ Execute migration.up(queryInterface, Sequelize)       │
│   ├─ INSERT INTO SequelizeMeta VALUES (migration_name)     │
│   └─ COMMIT TRANSACTION                                     │
│                                                             │
│  If error:                                                  │
│   └─ ROLLBACK TRANSACTION (migration not marked executed)  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Report Results                                      │
│  - Display executed migrations                              │
│  - Show success/failure status                              │
│  - Exit with code 0 (success) or 1 (failure)               │
└─────────────────────────────────────────────────────────────┘
```

### Transaction Behavior

Each migration runs in a transaction:

```javascript
// Automatic transaction wrapping (pseudocode)
async function executeMigration(migration) {
    const transaction = await sequelize.transaction();

    try {
        // Execute up() function
        await migration.up(queryInterface, Sequelize);

        // Mark as executed
        await sequelize.query(
            'INSERT INTO SequelizeMeta (name) VALUES (?)',
            { replacements: [migration.name], transaction }
        );

        // Commit if successful
        await transaction.commit();
        console.log(`✓ ${migration.name} executed`);

    } catch (error) {
        // Rollback on error
        await transaction.rollback();
        console.error(`✗ ${migration.name} failed:`, error.message);
        throw error; // Stop further migrations
    }
}
```

**Key Points:**
- ✅ Migration changes are atomic (all-or-nothing)
- ✅ Failed migration doesn't get marked as executed
- ✅ Database state remains consistent
- ❌ If one migration fails, subsequent migrations don't run

### Environment-Specific Migrations

```javascript
// migrations/20231218-create-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', { /* ... */ });

        // Only in development: Create test users
        if (process.env.NODE_ENV === 'development') {
            await queryInterface.bulkInsert('users', [
                { username: 'admin', email: 'admin@test.com' },
                { username: 'user1', email: 'user1@test.com' }
            ]);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

**Run with specific environment:**
```bash
# Development
NODE_ENV=development npx sequelize-cli db:migrate

# Production
NODE_ENV=production npx sequelize-cli db:migrate
```

### Handling Migration Failures

**Scenario: Migration fails midway**

```javascript
// migrations/20231218-problematic-migration.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Success
        await queryInterface.addColumn('users', 'newField1', {
            type: Sequelize.STRING
        });

        // Step 2: Success
        await queryInterface.addColumn('users', 'newField2', {
            type: Sequelize.STRING
        });

        // Step 3: FAILS (syntax error or constraint violation)
        await queryInterface.addColumn('users', 'badField', {
            type: Sequelize.INVALID_TYPE  // ❌ Error!
        });

        // This is never reached
        await queryInterface.addColumn('users', 'newField3', {
            type: Sequelize.STRING
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'newField1');
        await queryInterface.removeColumn('users', 'newField2');
        await queryInterface.removeColumn('users', 'badField');
        await queryInterface.removeColumn('users', 'newField3');
    }
};
```

**What happens:**
```
1. Transaction begins
2. newField1 added (in transaction)
3. newField2 added (in transaction)
4. Error occurs
5. Transaction ROLLBACK
6. Database unchanged (no fields added)
7. Migration NOT marked as executed in SequelizeMeta
8. Process exits with error
```

**To fix:**
```bash
# 1. Fix the migration file
# 2. Run migrations again
npx sequelize-cli db:migrate
# Now it will retry the failed migration
```

### Checking Migration Status

```bash
# Show which migrations have been executed
npx sequelize-cli db:migrate:status

# Output:
# up 20231201-create-users.js
# up 20231202-add-email-index.js
# down 20231218-add-new-features.js  (pending)
```

### Production Migration Strategy

**Best Practices for Production:**

```bash
# 1. Always backup database before migrating
mysqldump -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run in maintenance mode (if possible)
# - Show maintenance page to users
# - Stop application servers

# 3. Test migration on production-like staging first
NODE_ENV=staging npx sequelize-cli db:migrate

# 4. Run production migration
NODE_ENV=production npx sequelize-cli db:migrate

# 5. Verify migration success
NODE_ENV=production npx sequelize-cli db:migrate:status

# 6. Start application servers

# 7. Monitor for errors
tail -f /var/log/app/error.log
```

**Zero-Downtime Migration Strategies:**

```javascript
// BAD: Causes downtime
// migrations/20231218-rename-column.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // ❌ Application breaks immediately
        await queryInterface.renameColumn('users', 'name', 'fullName');
    }
};

// GOOD: Multi-step zero-downtime approach
// Migration 1: Add new column
// migrations/20231218-add-fullname.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'fullName', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Copy data
        await queryInterface.sequelize.query(
            `UPDATE users SET fullName = name WHERE fullName IS NULL`
        );
    }
};

// Deploy application code that writes to BOTH columns
// Wait for all servers to update

// Migration 2: Remove old column (weeks later)
// migrations/20231225-remove-name.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'name');
    }
};
```

---

## 9. Rolling Back {#rolling-back}

### Understanding Rollback

Rollback executes the `down()` function of migrations, reversing their changes.

**When to Rollback:**
- Deployment failed
- Migration introduced bugs
- Need to test migration in development
- Data corruption detected

### Basic Rollback Commands

```bash
# Undo the most recent migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Undo to a specific migration (inclusive)
npx sequelize-cli db:migrate:undo --to 20231215-create-users.js
```

### Rollback Execution Internals

**What happens during rollback:**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Query SequelizeMeta Table                          │
│  - SELECT name FROM SequelizeMeta ORDER BY name DESC        │
│  - Get most recent migration                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Load Migration File                                │
│  - Find file matching SequelizeMeta entry                   │
│  - Require the migration module                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Execute Rollback in Transaction                    │
│  - BEGIN TRANSACTION                                        │
│  - Execute migration.down(queryInterface, Sequelize)        │
│  - DELETE FROM SequelizeMeta WHERE name = ?                 │
│  - COMMIT TRANSACTION                                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Report Results                                      │
│  - Display rolled back migration                            │
│  - Show success/failure status                              │
└─────────────────────────────────────────────────────────────┘
```

### Writing Safe down() Functions

**Critical Rule:** `down()` must EXACTLY reverse `up()`

```javascript
// migrations/20231218-example.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create table
        await queryInterface.createTable('users', {
            id: { type: Sequelize.INTEGER, primaryKey: true },
            email: { type: Sequelize.STRING(100), allowNull: false }
        });

        // Add index
        await queryInterface.addIndex('users', ['email'], {
            name: 'users_email_idx'
        });
    },

    async down(queryInterface, Sequelize) {
        // Must reverse in OPPOSITE order

        // 1. Remove index first (depends on table)
        await queryInterface.removeIndex('users', 'users_email_idx');

        // 2. Drop table last
        await queryInterface.dropTable('users');
    }
};
```

**Common Mistake:**
```javascript
// ❌ BAD: Wrong order
async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');  // Drops table with index
    await queryInterface.removeIndex('users', 'users_email_idx'); // Error! Table doesn't exist
}
```

### Edge Cases and Challenges

#### Edge Case 1: Data Loss During Rollback

```javascript
// migrations/20231218-remove-legacy-column.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove old column
        await queryInterface.removeColumn('users', 'legacyField');
    },

    async down(queryInterface, Sequelize) {
        // Add column back
        await queryInterface.addColumn('users', 'legacyField', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // ❌ PROBLEM: Original data is LOST!
        // Column is recreated but empty
    }
};
```

**Solution: Backup data before removal**
```javascript
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Create backup table
        await queryInterface.sequelize.query(`
            CREATE TABLE users_backup_legacyField AS
            SELECT id, legacyField FROM users
        `);

        // Step 2: Remove column
        await queryInterface.removeColumn('users', 'legacyField');
    },

    async down(queryInterface, Sequelize) {
        // Step 1: Recreate column
        await queryInterface.addColumn('users', 'legacyField', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Step 2: Restore data from backup
        await queryInterface.sequelize.query(`
            UPDATE users u
            JOIN users_backup_legacyField b ON u.id = b.id
            SET u.legacyField = b.legacyField
        `);

        // Step 3: Drop backup table
        await queryInterface.dropTable('users_backup_legacyField');
    }
};
```

#### Edge Case 2: Irreversible Migrations

Some operations cannot be reversed:

```javascript
// migrations/20231218-hash-passwords.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Hash all plaintext passwords
        const [users] = await queryInterface.sequelize.query(
            'SELECT id, password FROM users'
        );

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await queryInterface.sequelize.query(
                'UPDATE users SET password = ? WHERE id = ?',
                { replacements: [hashedPassword, user.id] }
            );
        }
    },

    async down(queryInterface, Sequelize) {
        // ❌ IMPOSSIBLE: Can't reverse hash
        throw new Error('This migration cannot be rolled back');
    }
};
```

#### Edge Case 3: Constraint Dependencies

```javascript
// migrations/20231218-add-foreign-key.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint('posts', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'posts_userId_fkey',
            references: { table: 'users', field: 'id' },
            onDelete: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        // Must specify exact constraint name
        await queryInterface.removeConstraint('posts', 'posts_userId_fkey');
    }
};
```

**If you forget constraint name:**
```javascript
// Find constraint name first
async down(queryInterface, Sequelize) {
    // MySQL
    const [constraints] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = 'posts' AND COLUMN_NAME = 'userId'
    `);

    if (constraints.length > 0) {
        await queryInterface.removeConstraint('posts', constraints[0].CONSTRAINT_NAME);
    }
}
```

### Rollback in Production

**Production Rollback Strategy:**

```bash
# 1. Identify problematic migration
npx sequelize-cli db:migrate:status

# Output:
# up 20231218120000-add-feature.js    ← This one caused issues
# up 20231218100000-add-index.js
# up 20231217093000-create-users.js

# 2. Check if application is compatible with rollback
# - Will removing the feature break current code?
# - Is there data that will be lost?

# 3. Stop application (if necessary)
pm2 stop all

# 4. Backup database
mysqldump -u user -p database > rollback_backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Perform rollback
NODE_ENV=production npx sequelize-cli db:migrate:undo

# 6. Verify database state
NODE_ENV=production npx sequelize-cli db:migrate:status

# 7. Restart application with previous code version
git checkout <previous-commit>
npm install
pm2 restart all

# 8. Monitor application
tail -f /var/log/app/error.log
```

### Testing Rollbacks

**Always test rollback in development:**

```bash
# 1. Run migration
npx sequelize-cli db:migrate

# 2. Verify migration applied correctly
# Check database schema

# 3. Test rollback
npx sequelize-cli db:migrate:undo

# 4. Verify rollback worked
# Check database schema (should be reverted)

# 5. Re-run migration to confirm it still works
npx sequelize-cli db:migrate
```

---

## 10. Seeders {#seeders}

### What are Seeders?

**Seeders** populate your database with test or initial data.

**Use Cases:**
- Development: Test data for local development
- Testing: Consistent data for automated tests
- Production: Initial/default data (admin user, default settings)

### Creating Seeders

```bash
# Generate seeder file
npx sequelize-cli seed:generate --name demo-users

# Creates: seeders/20231218120000-demo-users.js
```

**Basic Seeder Structure:**
```javascript
// seeders/20231218120000-demo-users.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('users', [
            {
                username: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$hashed_password',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: '$2b$10$hashed_password',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                password: '$2b$10$hashed_password',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};
```

### Running Seeders

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed 20231218120000-demo-users.js

# Undo most recent seeder
npx sequelize-cli db:seed:undo

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed 20231218120000-demo-users.js
```

### Real-World Seeder Examples

**Seeder with Foreign Keys:**
```javascript
// seeders/20231218-demo-posts.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // First, get user IDs
        const [users] = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE username IN ('admin', 'user1')`
        );

        const adminId = users.find(u => u.username === 'admin')?.id;
        const user1Id = users.find(u => u.username === 'user1')?.id;

        // Insert posts with valid foreign keys
        await queryInterface.bulkInsert('posts', [
            {
                userId: adminId,
                title: 'First Post',
                content: 'Welcome to the blog!',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: user1Id,
                title: 'User Post',
                content: 'Hello from user1',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('posts', {
            title: ['First Post', 'User Post']
        });
    }
};
```

**Conditional Seeding (Environment-Specific):**
```javascript
// seeders/20231218-production-defaults.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Only seed in production if no data exists
        if (process.env.NODE_ENV === 'production') {
            const [users] = await queryInterface.sequelize.query(
                'SELECT COUNT(*) as count FROM users'
            );

            if (users[0].count === 0) {
                // Create default admin user
                await queryInterface.bulkInsert('users', [{
                    username: 'admin',
                    email: 'admin@company.com',
                    password: '$2b$10$default_hash',
                    role: 'admin',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }]);
            }
        } else {
            // Development: Create many test users
            const testUsers = Array.from({ length: 100 }, (_, i) => ({
                username: `user${i}`,
                email: `user${i}@test.com`,
                password: '$2b$10$test_hash',
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            await queryInterface.bulkInsert('users', testUsers);
        }
    },

    async down(queryInterface, Sequelize) {
        if (process.env.NODE_ENV === 'production') {
            await queryInterface.bulkDelete('users', {
                username: 'admin'
            });
        } else {
            await queryInterface.bulkDelete('users', null, {});
        }
    }
};
```

**Seeding with Raw SQL:**
```javascript
// seeders/20231218-complex-data.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Use raw SQL for complex inserts
        await queryInterface.sequelize.query(`
            INSERT INTO categories (name, slug, description, createdAt, updatedAt)
            VALUES
                ('Technology', 'technology', 'Tech articles', NOW(), NOW()),
                ('Business', 'business', 'Business news', NOW(), NOW()),
                ('Lifestyle', 'lifestyle', 'Lifestyle tips', NOW(), NOW())
        `);

        // Insert posts with category references
        await queryInterface.sequelize.query(`
            INSERT INTO posts (userId, categoryId, title, content, createdAt, updatedAt)
            SELECT
                u.id as userId,
                c.id as categoryId,
                CONCAT('Post in ', c.name) as title,
                CONCAT('Content about ', c.name) as content,
                NOW() as createdAt,
                NOW() as updatedAt
            FROM users u
            CROSS JOIN categories c
            LIMIT 10
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('posts', null, {});
        await queryInterface.bulkDelete('categories', null, {});
    }
};
```

### Seeder vs Migration Tracking

**Important Difference:**

```
Migrations:
- Tracked in SequelizeMeta table
- Running db:migrate again won't re-run executed migrations
- Version-controlled schema changes

Seeders:
- NOT tracked by default (can be run multiple times)
- Running db:seed:all will INSERT data again (duplicates!)
- Intended for development/testing

Solution: Use --seed-storage option
npx sequelize-cli db:seed:all --seed-storage sequelize
```

**With tracking enabled:**
```
SequelizeData table created:
┌──────────────────────────────────────┐
│ name                                 │
├──────────────────────────────────────┤
│ 20231218120000-demo-users.js         │
│ 20231218130000-demo-posts.js         │
└──────────────────────────────────────┘
```

### Best Practices for Seeders

```javascript
// GOOD: Idempotent seeder (can run multiple times safely)
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if data already exists
        const [existingUsers] = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE username = 'admin'`
        );

        if (existingUsers.length === 0) {
            await queryInterface.bulkInsert('users', [{
                username: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$hash',
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', {
            username: 'admin'
        });
    }
};
```

---

## 11. Migration Best Practices {#best-practices}

### 1. One Concern Per Migration

**BAD: Multiple unrelated changes**
```javascript
// ❌ migrations/20231218-various-changes.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Adding user fields
        await queryInterface.addColumn('users', 'phoneNumber', {
            type: Sequelize.STRING(20)
        });

        // Creating posts table (unrelated!)
        await queryInterface.createTable('posts', { /* ... */ });

        // Adding product index (also unrelated!)
        await queryInterface.addIndex('products', ['sku']);
    }
};
```

**GOOD: Separate migrations**
```javascript
// ✅ migrations/20231218-add-phone-to-users.js
// ✅ migrations/20231219-create-posts-table.js
// ✅ migrations/20231220-add-sku-index-to-products.js
```

**Why?**
- Easier to understand
- Easier to rollback specific changes
- Better git history
- Clearer deployment logs

### 2. Always Write down() Functions

```javascript
// ❌ BAD
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', { /* ... */ });
    },
    async down(queryInterface, Sequelize) {
        // Left empty - can't rollback!
    }
};

// ✅ GOOD
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', { /* ... */ });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

### 3. Never Modify Existing Migrations

**Once a migration is in production, NEVER edit it!**

```
❌ DON'T:
- Edit 20231201-create-users.js after it's been deployed
- Fix bugs by modifying old migrations

✅ DO:
- Create a new migration to fix the issue
- Example: 20231220-fix-user-email-constraint.js
```

**Why?**
```
Developer A's SequelizeMeta:
- 20231201-create-users.js (OLD VERSION, already executed)

Developer B modifies migration file on main branch

Developer C clones repo:
- 20231201-create-users.js (NEW VERSION, not executed yet)

Result: Developer C's database is DIFFERENT from A's!
```

### 4. Use Descriptive Migration Names

```javascript
// ❌ BAD
20231218-update.js
20231218-fix.js
20231218-changes.js

// ✅ GOOD
20231218-add-email-index-to-users.js
20231218-make-product-sku-unique.js
20231218-add-soft-deletes-to-posts.js
```

### 5. Add Comments for Complex Logic

```javascript
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Migration: Convert prices from dollars to cents
         *
         * Background: We're changing price storage from DECIMAL(10,2) to INTEGER
         * to avoid floating-point precision issues.
         *
         * Steps:
         * 1. Add temporary priceInCents column
         * 2. Transform data (multiply by 100, round)
         * 3. Remove old price column
         * 4. Rename priceInCents to price
         */

        // Step 1: Add temporary column
        await queryInterface.addColumn('products', 'priceInCents', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        // Step 2: Transform data
        await queryInterface.sequelize.query(
            `UPDATE products SET priceInCents = ROUND(price * 100)`
        );

        // ... rest of migration
    }
};
```

### 6. Handle Large Data Migrations in Batches

```javascript
// ❌ BAD: Process all rows at once (may timeout or run out of memory)
module.exports = {
    async up(queryInterface, Sequelize) {
        const [users] = await queryInterface.sequelize.query(
            'SELECT id, password FROM users'
        );

        // Processing 1,000,000 users at once - will crash!
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await queryInterface.sequelize.query(
                'UPDATE users SET password = ? WHERE id = ?',
                { replacements: [hashedPassword, user.id] }
            );
        }
    }
};

// ✅ GOOD: Process in batches
module.exports = {
    async up(queryInterface, Sequelize) {
        const BATCH_SIZE = 1000;
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const [users] = await queryInterface.sequelize.query(
                `SELECT id, password FROM users LIMIT ${BATCH_SIZE} OFFSET ${offset}`
            );

            if (users.length === 0) {
                hasMore = false;
                break;
            }

            for (const user of users) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await queryInterface.sequelize.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    { replacements: [hashedPassword, user.id] }
                );
            }

            offset += BATCH_SIZE;
            console.log(`Processed ${offset} users...`);
        }
    }
};
```

### 7. Test Migrations Before Production

```bash
# Test cycle:
# 1. Run migration
npx sequelize-cli db:migrate

# 2. Verify schema
mysql -u root -p database -e "DESCRIBE users;"

# 3. Test application
npm run dev

# 4. Test rollback
npx sequelize-cli db:migrate:undo

# 5. Verify rollback
mysql -u root -p database -e "DESCRIBE users;"

# 6. Re-run migration
npx sequelize-cli db:migrate

# 7. Run tests
npm test
```

### 8. Use Transactions for Data Migrations

```javascript
// ✅ GOOD: Explicit transaction control
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Complex data migration
            await queryInterface.sequelize.query(
                `UPDATE users SET status = 'active' WHERE lastLogin > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                { transaction }
            );

            await queryInterface.sequelize.query(
                `UPDATE users SET status = 'inactive' WHERE lastLogin <= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
```

### 9. Document Breaking Changes

```javascript
/**
 * BREAKING CHANGE MIGRATION
 *
 * This migration removes the 'name' column from users table.
 *
 * Before deploying:
 * 1. Ensure application code no longer references user.name
 * 2. Update to use user.firstName and user.lastName instead
 * 3. Deploy code changes BEFORE running this migration
 *
 * Rollback strategy:
 * If issues occur, rollback will restore 'name' column but data will be lost
 * unless backup is restored.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'name');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'name', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Attempt to reconstruct from firstName/lastName
        await queryInterface.sequelize.query(
            `UPDATE users SET name = CONCAT(firstName, ' ', lastName)`
        );
    }
};
```

### 10. Keep Migrations Small and Fast

**Target:** Migrations should complete in < 30 seconds

```javascript
// ❌ BAD: Slow migration (adding index on large table)
module.exports = {
    async up(queryInterface, Sequelize) {
        // On 10M row table, this could take 10+ minutes
        await queryInterface.addIndex('orders', ['userId', 'createdAt']);
    }
};

// ✅ BETTER: Add index concurrently (PostgreSQL)
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE INDEX CONCURRENTLY orders_user_date_idx
             ON orders (userId, createdAt)`
        );
    }
};
```

---

## 12. Laravel Artisan Migrations Comparison {#laravel-comparison}

### Overview

Laravel's Artisan migration system is similar to Sequelize CLI but with some key differences.

**Similarities:**
- Timestamped migration files
- up/down methods
- Migration tracking table
- Rollback support
- Seeder support

**Differences:**
- Language (PHP vs JavaScript)
- Schema builder syntax
- Command structure
- Default behaviors

### Command Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│ Operation          │ Sequelize CLI        │ Laravel Artisan     │
├─────────────────────────────────────────────────────────────────┤
│ Create migration   │ migration:generate   │ make:migration      │
│ Run migrations     │ db:migrate           │ migrate             │
│ Rollback latest    │ db:migrate:undo      │ migrate:rollback    │
│ Rollback all       │ db:migrate:undo:all  │ migrate:reset       │
│ Refresh (reset+run)│ (manual)             │ migrate:refresh     │
│ Migration status   │ db:migrate:status    │ migrate:status      │
│ Create seeder      │ seed:generate        │ make:seeder         │
│ Run seeders        │ db:seed:all          │ db:seed             │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure Comparison

**Sequelize (JavaScript):**
```javascript
// migrations/20231218120000-create-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
```

**Laravel (PHP):**
```php
// database/migrations/2023_12_18_120000_create_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email', 100)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### Schema Builder Comparison

**Creating Table:**

```javascript
// Sequelize
await queryInterface.createTable('products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING(200), allowNull: false },
    price: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
    inStock: { type: Sequelize.BOOLEAN, defaultValue: true },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
});
```

```php
// Laravel
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name', 200);
    $table->decimal('price', 10, 2)->default(0.00);
    $table->boolean('inStock')->default(true);
    $table->timestamps();
});
```

**Adding Column:**

```javascript
// Sequelize
await queryInterface.addColumn('users', 'phoneNumber', {
    type: Sequelize.STRING(20),
    allowNull: true
});
```

```php
// Laravel
Schema::table('users', function (Blueprint $table) {
    $table->string('phoneNumber', 20)->nullable();
});
```

**Adding Foreign Key:**

```javascript
// Sequelize
await queryInterface.addConstraint('posts', {
    fields: ['userId'],
    type: 'foreign key',
    name: 'posts_userId_fkey',
    references: {
        table: 'users',
        field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
```

```php
// Laravel
Schema::table('posts', function (Blueprint $table) {
    $table->foreign('userId')
          ->references('id')
          ->on('users')
          ->onDelete('cascade')
          ->onUpdate('cascade');
});

// Or shorter syntax:
$table->foreignId('userId')->constrained('users')->cascadeOnDelete();
```

**Adding Index:**

```javascript
// Sequelize
await queryInterface.addIndex('users', ['email'], {
    name: 'users_email_idx',
    unique: false
});
```

```php
// Laravel
Schema::table('users', function (Blueprint $table) {
    $table->index('email');
});
```

### Migration Tracking Table

**Sequelize:**
```sql
-- SequelizeMeta table
CREATE TABLE "SequelizeMeta" (
    "name" VARCHAR(255) NOT NULL PRIMARY KEY
);

-- Data:
-- 20231218120000-create-users.js
-- 20231218130000-add-email-index.js
```

**Laravel:**
```sql
-- migrations table
CREATE TABLE migrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL
);

-- Data:
-- | 1 | 2023_12_18_120000_create_users_table | 1 |
-- | 2 | 2023_12_18_130000_add_email_index    | 1 |
-- | 3 | 2023_12_19_090000_create_posts_table | 2 |
```

**Key Difference:** Laravel tracks **batches** (groups of migrations run together), allowing:

```bash
# Rollback last batch only
php artisan migrate:rollback

# Rollback last 2 batches
php artisan migrate:rollback --step=2
```

Sequelize doesn't have batch concept - only rolls back one migration at a time.

### Advanced Features

**Laravel Advantages:**

```php
// 1. Schema builder is more fluent
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->string('password');
    $table->rememberToken();
    $table->softDeletes();  // Built-in soft delete support
    $table->timestamps();   // createdAt + updatedAt
});

// 2. Eloquent model generation
php artisan make:model User -m  // Create model + migration together

// 3. Migration squashing (Laravel 9+)
php artisan schema:dump  // Export schema to SQL file

// 4. Anonymous class migrations (modern Laravel)
return new class extends Migration {
    // Prevents namespace conflicts
};
```

**Sequelize Advantages:**

```javascript
// 1. JavaScript/TypeScript ecosystem
// Works naturally with Node.js applications

// 2. Direct SQL access when needed
await queryInterface.sequelize.query('CUSTOM SQL');

// 3. Promise-based (async/await)
// Modern JavaScript async patterns

// 4. Works with multiple dialects
// MySQL, Postgres, SQLite, MSSQL, MariaDB
```

### Real-World Migration Example Comparison

**Scenario:** Add `profileImageUrl` column, populate with default images

**Sequelize:**
```javascript
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add column
        await queryInterface.addColumn('users', 'profileImageUrl', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        // Populate with defaults
        await queryInterface.sequelize.query(`
            UPDATE users
            SET profileImageUrl = CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', username)
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'profileImageUrl');
    }
};
```

**Laravel:**
```php
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profileImageUrl', 255)->nullable();
        });

        DB::table('users')->get()->each(function ($user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'profileImageUrl' => "https://api.dicebear.com/7.x/avataaars/svg?seed={$user->username}"
                ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profileImageUrl');
        });
    }
};
```

### Which to Choose?

**Choose Sequelize migrations if:**
- Building Node.js applications
- Team is JavaScript/TypeScript focused
- Need multi-dialect support
- Want async/await patterns

**Choose Laravel migrations if:**
- Building PHP/Laravel applications
- Want fluent schema builder
- Need batch rollback support
- Want integrated model generation

Both systems are mature, well-documented, and production-ready. The choice depends on your application stack and team expertise.

---

## Summary

Sequelize migrations provide **version-controlled, team-friendly, production-safe database schema management**. They solve the critical problems of database schema synchronization, change tracking, and deployment consistency.

**Key Takeaways:**
1. Migrations are Git for your database schema
2. Always write reversible down() functions
3. Never modify migrations after deployment
4. Test migrations thoroughly before production
5. Use seeders for development/test data
6. Plan for zero-downtime migrations in production
7. Keep migrations small, focused, and fast

By mastering Sequelize migrations, you can confidently manage database changes across development, staging, and production environments with minimal risk and maximum control.
