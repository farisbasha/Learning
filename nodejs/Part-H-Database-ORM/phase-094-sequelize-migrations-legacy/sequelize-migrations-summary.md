# Phase 094: Sequelize Migrations (Legacy) - Quick Reference

## What are Migrations?

**Migrations = Version Control for Database Schema**

```
Problem: Manual SQL changes → Team sync issues, no rollback
Solution: Timestamped migration files → Tracked, reversible, team-friendly
```

---

## Quick Start

### Installation
```bash
npm install --save-dev sequelize-cli

# Initialize project structure
npx sequelize-cli init
# Creates: config/, migrations/, models/, seeders/
```

### Create Migration
```bash
# Generate migration file
npx sequelize-cli migration:generate --name create-users

# Creates: migrations/20231218120000-create-users.js
```

---

## Essential Commands Cheatsheet

### Migration Commands
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Migrate to specific migration
npx sequelize-cli db:migrate --to 20231218120000-create-users.js

# Dry run (see what would happen)
npx sequelize-cli db:migrate --dry-run
```

### Seeder Commands
```bash
# Generate seeder
npx sequelize-cli seed:generate --name demo-users

# Run all seeders
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Run specific seeder
npx sequelize-cli db:seed --seed 20231218120000-demo-users.js

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed 20231218120000-demo-users.js
```

### Environment-Specific
```bash
NODE_ENV=production npx sequelize-cli db:migrate
NODE_ENV=test npx sequelize-cli db:migrate
```

---

## Migration File Structure

### Basic Template
```javascript
// migrations/20231218120000-create-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        // Apply changes
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
        // Reverse changes
        await queryInterface.dropTable('users');
    }
};
```

---

## Common Migration Patterns

### 1. Create Table
```javascript
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
        status: {
            type: Sequelize.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active'
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
}

async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
}
```

### 2. Add Column
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phoneNumber', {
        type: Sequelize.STRING(20),
        allowNull: true
    });
}

async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phoneNumber');
}
```

### 3. Remove Column
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'oldField');
}

async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'oldField', {
        type: Sequelize.STRING(100),
        allowNull: true
    });
}
```

### 4. Change Column Type
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'username', {
        type: Sequelize.STRING(100), // Changed from 50 to 100
        allowNull: false,
        unique: true
    });
}

async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'username', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
    });
}
```

### 5. Rename Column
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'name', 'fullName');
}

async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'fullName', 'name');
}
```

### 6. Rename Table
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('users', 'accounts');
}

async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('accounts', 'users');
}
```

### 7. Add Index
```javascript
async up(queryInterface, Sequelize) {
    // Single column index
    await queryInterface.addIndex('users', ['email'], {
        name: 'users_email_idx'
    });

    // Composite index
    await queryInterface.addIndex('orders', ['userId', 'createdAt'], {
        name: 'orders_user_date_idx'
    });

    // Unique index
    await queryInterface.addIndex('users', ['username'], {
        name: 'users_username_unique',
        unique: true
    });
}

async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_email_idx');
    await queryInterface.removeIndex('orders', 'orders_user_date_idx');
    await queryInterface.removeIndex('users', 'users_username_unique');
}
```

### 8. Add Foreign Key
```javascript
async up(queryInterface, Sequelize) {
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
}

async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('posts', 'posts_userId_fkey');
}
```

### 9. Add Unique Constraint
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
        fields: ['email'],
        type: 'unique',
        name: 'users_email_unique'
    });
}

async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'users_email_unique');
}
```

### 10. Add Check Constraint
```javascript
async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
        `ALTER TABLE products
         ADD CONSTRAINT products_price_positive
         CHECK (price >= 0)`
    );
}

async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
        `ALTER TABLE products DROP CONSTRAINT products_price_positive`
    );
}
```

---

## Data Types Reference

```javascript
// Strings
Sequelize.STRING(length)          // VARCHAR(length)
Sequelize.STRING                  // VARCHAR(255)
Sequelize.TEXT                    // TEXT
Sequelize.TEXT('tiny')            // TINYTEXT

// Numbers
Sequelize.INTEGER                 // INT
Sequelize.BIGINT                  // BIGINT
Sequelize.FLOAT                   // FLOAT
Sequelize.DOUBLE                  // DOUBLE
Sequelize.DECIMAL(precision, scale) // DECIMAL

// Dates
Sequelize.DATE                    // DATETIME
Sequelize.DATEONLY                // DATE (no time)

// Boolean
Sequelize.BOOLEAN                 // TINYINT(1)

// Other
Sequelize.UUID                    // UUID
Sequelize.JSON                    // JSON
Sequelize.JSONB                   // JSONB (Postgres)
Sequelize.ENUM('val1', 'val2')    // ENUM
Sequelize.BLOB                    // BLOB

// Special Values
Sequelize.literal('CURRENT_TIMESTAMP')
Sequelize.fn('NOW')
Sequelize.UUIDV4
```

---

## Foreign Key Actions

```javascript
onDelete: 'CASCADE'      // Delete child rows when parent deleted
onDelete: 'RESTRICT'     // Prevent deletion if children exist
onDelete: 'SET NULL'     // Set foreign key to NULL
onDelete: 'SET DEFAULT'  // Set to DEFAULT value
onDelete: 'NO ACTION'    // Similar to RESTRICT

onUpdate: 'CASCADE'      // Update child rows when parent updated
onUpdate: 'RESTRICT'     // Prevent update if children exist
// ... same options as onDelete
```

---

## QueryInterface Methods

### Table Operations
```javascript
queryInterface.createTable(tableName, attributes, options)
queryInterface.dropTable(tableName, options)
queryInterface.renameTable(before, after, options)
```

### Column Operations
```javascript
queryInterface.addColumn(tableName, columnName, dataType, options)
queryInterface.removeColumn(tableName, columnName, options)
queryInterface.changeColumn(tableName, columnName, dataType, options)
queryInterface.renameColumn(tableName, oldName, newName, options)
```

### Index Operations
```javascript
queryInterface.addIndex(tableName, attributes, options)
queryInterface.removeIndex(tableName, indexName, options)
```

### Constraint Operations
```javascript
queryInterface.addConstraint(tableName, options)
queryInterface.removeConstraint(tableName, constraintName, options)
```

### Bulk Operations
```javascript
queryInterface.bulkInsert(tableName, records, options)
queryInterface.bulkUpdate(tableName, values, where, options)
queryInterface.bulkDelete(tableName, where, options)
```

### Raw SQL
```javascript
queryInterface.sequelize.query('SELECT * FROM users')
```

---

## Seeder Patterns

### Basic Seeder
```javascript
// seeders/20231218120000-demo-users.js
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('users', [
            {
                username: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$hashed',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: '$2b$10$hashed',
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

### Idempotent Seeder
```javascript
async up(queryInterface, Sequelize) {
    // Check if data exists
    const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE username = 'admin'`
    );

    if (users.length === 0) {
        await queryInterface.bulkInsert('users', [{
            username: 'admin',
            email: 'admin@example.com',
            password: '$2b$10$hashed',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    }
}
```

### Seeder with Foreign Keys
```javascript
async up(queryInterface, Sequelize) {
    // Get user IDs
    const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE username = 'admin'`
    );

    const userId = users[0].id;

    // Insert related data
    await queryInterface.bulkInsert('posts', [{
        userId: userId,
        title: 'First Post',
        content: 'Hello World',
        createdAt: new Date(),
        updatedAt: new Date()
    }]);
}
```

---

## Best Practices Checklist

### DO:
- ✅ Write descriptive migration names
- ✅ Always implement down() functions
- ✅ Test migrations locally before production
- ✅ Use transactions for data migrations
- ✅ Add comments for complex logic
- ✅ Keep migrations small and focused
- ✅ Backup database before production migrations
- ✅ Process large data in batches
- ✅ Version control all migration files

### DON'T:
- ❌ Modify existing migrations after deployment
- ❌ Mix unrelated changes in one migration
- ❌ Use sync() in production
- ❌ Forget to handle data during schema changes
- ❌ Skip testing rollback functionality
- ❌ Process millions of rows at once
- ❌ Leave down() functions empty

---

## Configuration

### config/config.json
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

### .sequelizerc (Custom Paths)
```javascript
const path = require('path');

module.exports = {
    'config': path.resolve('src/config', 'database.json'),
    'models-path': path.resolve('src/db', 'models'),
    'seeders-path': path.resolve('src/db', 'seeders'),
    'migrations-path': path.resolve('src/db', 'migrations')
};
```

---

## Troubleshooting Guide

### Problem: Migration fails midway
**Solution:**
```bash
# Migration automatically rolls back due to transaction
# Fix the migration file, then run again:
npx sequelize-cli db:migrate
```

### Problem: "SequelizeMeta already exists" error
**Cause:** Table was created manually or by previous installation

**Solution:**
```bash
# Check existing migrations
npx sequelize-cli db:migrate:status

# If table exists but is empty, manually insert executed migrations
mysql -u root -p database
INSERT INTO SequelizeMeta (name) VALUES ('20231201-create-users.js');
```

### Problem: Migration marked as executed but changes not applied
**Cause:** Migration failed after being inserted into SequelizeMeta

**Solution:**
```bash
# 1. Manually remove from SequelizeMeta
mysql -u root -p database
DELETE FROM SequelizeMeta WHERE name = '20231218-problematic-migration.js';

# 2. Fix migration file
# 3. Run again
npx sequelize-cli db:migrate
```

### Problem: Can't rollback - constraint violation
**Cause:** Data exists that depends on the schema

**Solution:**
```javascript
// Modify down() to handle data first
async down(queryInterface, Sequelize) {
    // Remove dependent data
    await queryInterface.bulkDelete('posts', { userId: { [Op.ne]: null } });

    // Then remove constraint
    await queryInterface.removeConstraint('posts', 'posts_userId_fkey');
}
```

### Problem: Slow migration on large table
**Cause:** Adding index or altering large table locks it

**Solution (PostgreSQL):**
```javascript
async up(queryInterface, Sequelize) {
    // Use CONCURRENTLY to avoid locking
    await queryInterface.sequelize.query(
        `CREATE INDEX CONCURRENTLY users_email_idx ON users (email)`
    );
}
```

**Solution (MySQL):**
```javascript
async up(queryInterface, Sequelize) {
    // Use ALGORITHM=INPLACE to minimize locking
    await queryInterface.sequelize.query(
        `ALTER TABLE users ADD INDEX users_email_idx (email) ALGORITHM=INPLACE`
    );
}
```

### Problem: Different behavior in development vs production
**Cause:** Different database engines or versions

**Solution:**
```javascript
// Use raw SQL for database-specific operations
async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'mysql') {
        await queryInterface.sequelize.query('MySQL specific SQL');
    } else if (dialect === 'postgres') {
        await queryInterface.sequelize.query('PostgreSQL specific SQL');
    }
}
```

### Problem: Seeder runs multiple times, creating duplicates
**Solution 1: Use idempotent seeders**
```javascript
async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE username = 'admin'`
    );

    if (existing.length === 0) {
        // Only insert if doesn't exist
        await queryInterface.bulkInsert('users', [...]);
    }
}
```

**Solution 2: Enable seeder tracking**
```bash
npx sequelize-cli db:seed:all --seed-storage sequelize
# Creates SequelizeData table to track seeders
```

### Problem: Need to migrate production without downtime
**Strategy:**
```javascript
// Step 1: Add new column (compatible with old code)
// migrations/20231218-add-new-field.js
async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'newField', {
        type: Sequelize.STRING(100),
        allowNull: true
    });
}

// Step 2: Deploy code that writes to both old and new fields
// (No migration needed, just code deploy)

// Step 3: Migrate data from old to new field
// migrations/20231220-migrate-data.js
async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
        `UPDATE users SET newField = oldField WHERE newField IS NULL`
    );
}

// Step 4: Deploy code that only uses new field
// (No migration needed, just code deploy)

// Step 5: Remove old column (weeks later)
// migrations/20231225-remove-old-field.js
async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'oldField');
}
```

---

## Production Migration Workflow

```bash
# 1. Test in development
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate

# 2. Test in staging (production-like environment)
NODE_ENV=staging npx sequelize-cli db:migrate

# 3. Backup production database
mysqldump -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Enable maintenance mode (optional)
# Show maintenance page to users

# 5. Run production migration
NODE_ENV=production npx sequelize-cli db:migrate

# 6. Verify success
NODE_ENV=production npx sequelize-cli db:migrate:status

# 7. Deploy application code
git pull origin main
npm install
pm2 restart all

# 8. Monitor logs
tail -f /var/log/app/error.log

# 9. Disable maintenance mode
```

---

## Migration vs Seeder

```
┌──────────────────────────────────────────────────────────────┐
│                 │ Migrations        │ Seeders               │
├──────────────────────────────────────────────────────────────┤
│ Purpose         │ Schema changes    │ Insert data           │
│ Tracked by      │ SequelizeMeta     │ Not tracked (default) │
│ Run in prod?    │ Yes, always       │ Rarely                │
│ Reversible?     │ Yes (down())      │ Yes (down())          │
│ Idempotent?     │ Yes (via tracking)│ No (runs each time)   │
│ Use for         │ Tables, columns   │ Test data, defaults   │
└──────────────────────────────────────────────────────────────┘
```

---

## Common SQL Generated

### CREATE TABLE
```sql
-- Sequelize:
queryInterface.createTable('users', {...})

-- Generates:
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL
);
```

### ADD COLUMN
```sql
-- Sequelize:
queryInterface.addColumn('users', 'phoneNumber', {...})

-- Generates:
ALTER TABLE `users` ADD `phoneNumber` VARCHAR(20);
```

### ADD INDEX
```sql
-- Sequelize:
queryInterface.addIndex('users', ['email'], {...})

-- Generates:
CREATE INDEX `users_email_idx` ON `users` (`email`);
```

### ADD FOREIGN KEY
```sql
-- Sequelize:
queryInterface.addConstraint('posts', {...})

-- Generates:
ALTER TABLE `posts`
ADD CONSTRAINT `posts_userId_fkey`
FOREIGN KEY (`userId`)
REFERENCES `users` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

---

## Quick Reference: sync() vs Migrations

```
sync():
❌ No version control
❌ Risky in production (can drop tables)
❌ No rollback
❌ Non-deterministic
✅ Fast for development

Migrations:
✅ Version controlled
✅ Safe for production
✅ Rollback support
✅ Deterministic
✅ Team-friendly
❌ Requires more setup
```

---

## Environment Variables

```bash
# Set environment
export NODE_ENV=production

# Or inline
NODE_ENV=production npx sequelize-cli db:migrate

# Common environments
NODE_ENV=development
NODE_ENV=test
NODE_ENV=staging
NODE_ENV=production
```

---

## TypeScript Support

### tsconfig.json
```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

### .sequelizerc
```javascript
require('ts-node/register');

module.exports = {
    'config': './src/config/database.ts',
    'migrations-path': './src/migrations',
    'models-path': './src/models',
    'seeders-path': './src/seeders'
};
```

### TypeScript Migration
```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false
            }
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('users');
    }
};
```

---

## Laravel Artisan Equivalent Commands

```
┌────────────────────────────────────────────────────────────┐
│ Sequelize CLI                │ Laravel Artisan            │
├────────────────────────────────────────────────────────────┤
│ migration:generate           │ make:migration             │
│ db:migrate                   │ migrate                    │
│ db:migrate:undo              │ migrate:rollback           │
│ db:migrate:undo:all          │ migrate:reset              │
│ db:migrate:status            │ migrate:status             │
│ seed:generate                │ make:seeder                │
│ db:seed:all                  │ db:seed                    │
└────────────────────────────────────────────────────────────┘
```

---

## Resources

- Official Docs: https://sequelize.org/docs/v6/other-topics/migrations/
- CLI Docs: https://github.com/sequelize/cli
- Data Types: https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types

---

## Key Takeaways

1. **Migrations = Version Control for Database**
   - Timestamped, tracked, reversible

2. **Always Write down() Functions**
   - Every migration must be reversible

3. **Never Modify Executed Migrations**
   - Create new migration instead

4. **Test Before Production**
   - Run → Verify → Rollback → Re-run

5. **Use Migrations in Production, Seeders in Development**
   - Migrations: Schema changes (production-safe)
   - Seeders: Test data (development only)

6. **Backup Before Migrating Production**
   - Always have a rollback plan

7. **Keep Migrations Small and Focused**
   - One concern per migration file
