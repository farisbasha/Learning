# Phase 095d: TypeORM Migrations - Quick Reference Summary

## Overview

TypeORM migrations are version-controlled database schema change files that enable safe, reversible schema evolution in production environments.

**Key Advantage**: Entity-first approach - define schema once in entities, generate migrations automatically.

---

## Quick Command Reference

### Essential Commands

```bash
# Generate migration from entity changes
npx typeorm migration:generate -n MigrationName -d src/data-source.ts

# Create empty migration file
npx typeorm migration:create src/migrations/MigrationName

# Run all pending migrations
npx typeorm migration:run -d src/data-source.ts

# Revert last migration
npx typeorm migration:revert -d src/data-source.ts

# Show migration status
npx typeorm migration:show -d src/data-source.ts

# Drop entire schema (WARNING: Destructive!)
npx typeorm schema:drop -d src/data-source.ts
```

### DataSource Configuration

```typescript
// data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'mydb',

  // Entity configuration
  entities: ['src/entities/**/*.ts'],

  // Migration configuration
  migrations: ['src/migrations/**/*.ts'],
  migrationsTableName: 'migrations',  // Default table name

  // Development only!
  synchronize: false,  // NEVER true in production
  logging: true
});
```

---

## Migration File Patterns

### Basic Table Creation

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1703548800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'email',
          type: 'varchar',
          length: '255',
          isUnique: true,
          isNullable: false
        },
        {
          name: 'age',
          type: 'int',
          isNullable: true
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### Add Column

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1703548900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phone',
      type: 'varchar',
      length: '20',
      isNullable: true
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### Modify Column

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEmailUnique1703549000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const emailColumn = table.findColumnByName('email');
    const newEmailColumn = emailColumn.clone();
    newEmailColumn.isUnique = true;

    await queryRunner.changeColumn('users', 'email', newEmailColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const emailColumn = table.findColumnByName('email');
    const newEmailColumn = emailColumn.clone();
    newEmailColumn.isUnique = false;

    await queryRunner.changeColumn('users', 'email', newEmailColumn);
  }
}
```

### Rename Column

```typescript
export class RenameUsernameToDisplayName implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'username', 'display_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'display_name', 'username');
  }
}
```

### Add Index

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddEmailIndex implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USER_EMAIL',
      columnNames: ['email']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');
  }
}
```

### Add Foreign Key

```typescript
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddUserOrderRelation implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey('orders', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'FK_ORDER_USER'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'FK_ORDER_USER');
  }
}
```

### Data Migration

```typescript
export class MigrateUserData implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.addColumn('users', new TableColumn({
      name: 'first_name',
      type: 'varchar',
      isNullable: true
    }));

    await queryRunner.addColumn('users', new TableColumn({
      name: 'last_name',
      type: 'varchar',
      isNullable: true
    }));

    // Migrate data
    await queryRunner.query(`
      UPDATE users
      SET
        first_name = SUBSTRING_INDEX(full_name, ' ', 1),
        last_name = SUBSTRING_INDEX(full_name, ' ', -1)
      WHERE full_name IS NOT NULL
    `);

    // Remove old column
    await queryRunner.dropColumn('users', 'full_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back old column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'full_name',
      type: 'varchar',
      isNullable: true
    }));

    // Restore data
    await queryRunner.query(`
      UPDATE users
      SET full_name = CONCAT(first_name, ' ', last_name)
      WHERE first_name IS NOT NULL
    `);

    // Remove new columns
    await queryRunner.dropColumn('users', 'first_name');
    await queryRunner.dropColumn('users', 'last_name');
  }
}
```

---

## QueryRunner API Reference

### Table Operations

```typescript
// Create table
await queryRunner.createTable(new Table({ /* ... */ }));

// Drop table
await queryRunner.dropTable('tableName');

// Rename table
await queryRunner.renameTable('oldName', 'newName');

// Get table metadata
const table = await queryRunner.getTable('tableName');

// Check if table exists
const hasTable = await queryRunner.hasTable('tableName');

// Clear table data
await queryRunner.clearTable('tableName');
```

### Column Operations

```typescript
// Add column
await queryRunner.addColumn('tableName', new TableColumn({ /* ... */ }));

// Add multiple columns
await queryRunner.addColumns('tableName', [column1, column2]);

// Drop column
await queryRunner.dropColumn('tableName', 'columnName');

// Drop multiple columns
await queryRunner.dropColumns('tableName', ['col1', 'col2']);

// Change column
await queryRunner.changeColumn('tableName', 'oldColumn', newColumn);

// Rename column
await queryRunner.renameColumn('tableName', 'oldName', 'newName');
```

### Index Operations

```typescript
// Create index
await queryRunner.createIndex('tableName', new TableIndex({
  name: 'IDX_NAME',
  columnNames: ['column1', 'column2']
}));

// Drop index
await queryRunner.dropIndex('tableName', 'IDX_NAME');

// Create unique index
await queryRunner.createIndex('tableName', new TableIndex({
  name: 'UQ_NAME',
  columnNames: ['column'],
  isUnique: true
}));
```

### Foreign Key Operations

```typescript
// Create foreign key
await queryRunner.createForeignKey('tableName', new TableForeignKey({
  columnNames: ['userId'],
  referencedTableName: 'users',
  referencedColumnNames: ['id'],
  onDelete: 'CASCADE',
  name: 'FK_NAME'
}));

// Drop foreign key
await queryRunner.dropForeignKey('tableName', 'FK_NAME');
```

### Raw SQL

```typescript
// Execute raw query
await queryRunner.query('SELECT * FROM users');

// With parameters (safe from SQL injection)
await queryRunner.query(
  'UPDATE users SET email = ? WHERE id = ?',
  ['new@email.com', 1]
);
```

---

## Column Type Reference

### Common Types

```typescript
// Integer types
{ name: 'age', type: 'int' }
{ name: 'bigNumber', type: 'bigint' }
{ name: 'smallNumber', type: 'smallint' }

// String types
{ name: 'name', type: 'varchar', length: '255' }
{ name: 'description', type: 'text' }
{ name: 'code', type: 'char', length: '5' }

// Decimal types
{ name: 'price', type: 'decimal', precision: 10, scale: 2 }
{ name: 'amount', type: 'float' }
{ name: 'total', type: 'double' }

// Date/Time types
{ name: 'birthDate', type: 'date' }
{ name: 'createdAt', type: 'timestamp' }
{ name: 'updatedAt', type: 'datetime' }
{ name: 'startTime', type: 'time' }

// Boolean
{ name: 'isActive', type: 'boolean' }

// JSON
{ name: 'metadata', type: 'json' }
{ name: 'settings', type: 'jsonb' }  // PostgreSQL optimized

// UUID
{ name: 'id', type: 'uuid' }

// ENUM
{ name: 'status', type: 'enum', enum: ['active', 'inactive'] }

// Binary
{ name: 'data', type: 'blob' }
{ name: 'file', type: 'bytea' }  // PostgreSQL
```

### Column Options

```typescript
{
  name: 'columnName',
  type: 'varchar',

  // Constraints
  isPrimary: true,
  isNullable: false,
  isUnique: true,

  // Auto-generation
  isGenerated: true,
  generationStrategy: 'increment',  // or 'uuid', 'rowid'

  // Default value
  default: "'active'",  // String value
  default: 0,           // Number
  default: 'CURRENT_TIMESTAMP',  // SQL function

  // Length/Precision
  length: '100',        // For varchar/char
  precision: 10,        // For decimal
  scale: 2,             // For decimal

  // Other
  comment: 'User email address',
  charset: 'utf8mb4',   // MySQL
  collation: 'utf8mb4_unicode_ci',  // MySQL

  // Update trigger (MySQL)
  onUpdate: 'CURRENT_TIMESTAMP'
}
```

---

## Production Migration Scripts

### Run Migrations Script

```typescript
// scripts/run-migrations.ts
import { AppDataSource } from '../data-source';

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();

    console.log('Running pending migrations...');
    const migrations = await AppDataSource.runMigrations({
      transaction: 'all'
    });

    if (migrations.length === 0) {
      console.log('No pending migrations');
    } else {
      console.log(`Successfully executed ${migrations.length} migrations:`);
      migrations.forEach(m => console.log(`  - ${m.name}`));
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigrations();
```

### Check Migration Status

```typescript
// scripts/check-migrations.ts
import { AppDataSource } from '../data-source';

async function checkMigrations() {
  try {
    await AppDataSource.initialize();

    const hasPending = await AppDataSource.showMigrations();

    if (hasPending) {
      console.log('⚠️  Pending migrations detected');
      process.exit(1);
    } else {
      console.log('✓ Database is up to date');
      process.exit(0);
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error checking migrations:', error);
    process.exit(1);
  }
}

checkMigrations();
```

### Revert Migration Script

```typescript
// scripts/revert-migration.ts
import { AppDataSource } from '../data-source';

async function revertMigration() {
  const count = parseInt(process.argv[2] || '1');

  try {
    await AppDataSource.initialize();

    for (let i = 0; i < count; i++) {
      console.log(`Reverting migration ${i + 1}/${count}...`);
      await AppDataSource.undoLastMigration({
        transaction: 'all'
      });
    }

    console.log(`✓ Successfully reverted ${count} migration(s)`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Revert failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

revertMigration();
```

---

## Common Workflows

### Development Workflow

```bash
# 1. Update entity
# Edit src/entities/User.ts - add new column

# 2. Generate migration
npx typeorm migration:generate -n AddUserField -d src/data-source.ts

# 3. Review generated migration
cat src/migrations/1703553000000-AddUserField.ts

# 4. Run migration
npx typeorm migration:run -d src/data-source.ts

# 5. Test the change
npm run dev

# 6. If something is wrong, revert
npx typeorm migration:revert -d src/data-source.ts

# 7. Fix migration file and run again
npx typeorm migration:run -d src/data-source.ts

# 8. Commit when satisfied
git add src/entities/ src/migrations/
git commit -m "Add user field"
```

### Production Deployment Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Check for pending migrations
npm run migration:check

# 4. Create database backup
# (database-specific backup command)

# 5. Run migrations
npm run migration:run

# 6. Verify migration success
npm run migration:check

# 7. Start application
npm run start
```

### Emergency Rollback Workflow

```bash
# 1. Stop application
systemctl stop myapp

# 2. Revert migration
npm run migration:revert

# 3. Restore from backup (if needed)
# (database-specific restore command)

# 4. Verify database state
npm run migration:check

# 5. Restart application with previous version
git checkout previous-tag
npm ci
npm run start
```

---

## Troubleshooting Guide

### Problem: "No pending migrations"

**Symptom**: Running `migration:run` shows no pending migrations, but entity changes aren't reflected.

**Cause**: Migration was already executed or entities not properly scanned.

**Solution**:
```bash
# Check migration status
npx typeorm migration:show -d src/data-source.ts

# Verify DataSource entities configuration
# Ensure entities: ['src/entities/**/*.ts'] is correct

# Check if migration file exists
ls src/migrations/

# If migration exists but not in DB, manually insert it
# (Advanced: Use with caution)
```

### Problem: "Migration already exists"

**Symptom**: Running `migration:generate` fails with "no changes in schema"

**Cause**: Database already matches entity definitions.

**Solution**:
```bash
# 1. Verify entity changes are saved
# 2. Check if database is already up to date
# 3. If making manual migration, use migration:create instead

npx typeorm migration:create src/migrations/MyCustomMigration
```

### Problem: Migration fails mid-execution

**Symptom**: Migration crashes, leaving database in inconsistent state.

**Cause**: SQL error, constraint violation, or insufficient permissions.

**Solution**:
```bash
# 1. Check error message for specific cause
npm run migration:run

# 2. If using transaction: 'each', database may be partially migrated
# Check migrations table:
# SELECT * FROM migrations ORDER BY timestamp;

# 3. Manually fix database or restore from backup

# 4. Delete failed migration entry from migrations table
# DELETE FROM migrations WHERE name = 'FailedMigration';

# 5. Fix migration file and run again
npm run migration:run
```

### Problem: "Cannot find module" error

**Symptom**: CLI can't find entity or migration files.

**Cause**: Incorrect paths in DataSource configuration.

**Solution**:
```typescript
// data-source.ts
export const AppDataSource = new DataSource({
  // For development (TypeScript)
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],

  // For production (JavaScript)
  // entities: ['dist/entities/**/*.js'],
  // migrations: ['dist/migrations/**/*.js'],
});
```

### Problem: Foreign key constraint violation

**Symptom**: Migration fails when adding foreign key or cascading delete.

**Cause**: Orphaned records or circular dependencies.

**Solution**:
```typescript
// Clean up orphaned records first
export class AddForeignKeySafe implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove orphaned records
    await queryRunner.query(`
      DELETE FROM orders
      WHERE user_id NOT IN (SELECT id FROM users)
    `);

    // 2. Now safe to add foreign key
    await queryRunner.createForeignKey('orders', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));
  }
}
```

### Problem: Column type mismatch

**Symptom**: Migration changes column type but data is lost or corrupted.

**Cause**: Incompatible type conversion.

**Solution**:
```typescript
// Use temporary column for safe conversion
export class ConvertAgeSafe implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new column with correct type
    await queryRunner.addColumn('users', new TableColumn({
      name: 'age_new',
      type: 'int',
      isNullable: true
    }));

    // 2. Convert and copy data
    await queryRunner.query(`
      UPDATE users
      SET age_new = CAST(age AS INTEGER)
      WHERE age IS NOT NULL
    `);

    // 3. Drop old column
    await queryRunner.dropColumn('users', 'age');

    // 4. Rename new column
    await queryRunner.renameColumn('users', 'age_new', 'age');
  }
}
```

### Problem: Migrations out of sync across team

**Symptom**: Different team members have different migration histories.

**Cause**: Migrations created in parallel without coordination.

**Solution**:
```bash
# 1. Always pull latest before creating migration
git pull origin main

# 2. Generate migration
npx typeorm migration:generate -n MyChange -d src/data-source.ts

# 3. If conflicts, resolve by:
#    a. Revert your local migration
#    b. Pull remote migrations
#    c. Run remote migrations
#    d. Re-generate your migration

# 4. Commit and push immediately
git add src/migrations/
git commit -m "Add migration: MyChange"
git push origin main
```

---

## Best Practices Checklist

### Before Creating Migration

- [ ] Pull latest code from repository
- [ ] Run existing pending migrations
- [ ] Update entity with desired changes
- [ ] Test entity changes compile without errors

### Creating Migration

- [ ] Use descriptive migration name (verb-first)
- [ ] Review auto-generated migration code
- [ ] Add data migration logic if needed
- [ ] Ensure down() properly reverses up()
- [ ] Add comments for complex operations

### Testing Migration

- [ ] Run migration on local database
- [ ] Verify schema changes are correct
- [ ] Test application functionality
- [ ] Revert migration and verify restore
- [ ] Run migration again (test idempotency)

### Before Production

- [ ] Test on staging environment with production-like data
- [ ] Estimate migration execution time
- [ ] Create database backup plan
- [ ] Plan for rollback if needed
- [ ] Schedule during low-traffic window (if long-running)

### After Production

- [ ] Monitor application for errors
- [ ] Verify data integrity
- [ ] Check performance metrics
- [ ] Document any issues encountered
- [ ] Keep backup for at least 24 hours

---

## Comparison: Sequelize vs TypeORM

### Command Comparison

| Task | Sequelize | TypeORM |
|------|-----------|---------|
| Generate migration | `sequelize migration:generate --name NAME` | `typeorm migration:generate -n NAME` |
| Create empty migration | `sequelize migration:create --name NAME` | `typeorm migration:create src/migrations/NAME` |
| Run migrations | `sequelize db:migrate` | `typeorm migration:run` |
| Revert migration | `sequelize db:migrate:undo` | `typeorm migration:revert` |
| Show status | `sequelize db:migrate:status` | `typeorm migration:show` |

### Code Comparison

**Sequelize:**
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'age');
  }
};
```

**TypeORM:**
```typescript
export class AddAge implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'age',
      type: 'int',
      isNullable: true
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'age');
  }
}
```

### Key Differences

| Feature | Sequelize | TypeORM |
|---------|-----------|---------|
| **Auto-generation** | No | Yes (from entities) |
| **Type safety** | Weak | Strong (TypeScript) |
| **API style** | queryInterface | QueryRunner (OOP) |
| **Source of truth** | Migrations | Entities |
| **Learning curve** | Lower | Higher |
| **Flexibility** | Higher (manual control) | Medium (auto-gen + manual) |

---

## Quick Tips

### 1. Always Use Transactions in Production
```typescript
await AppDataSource.runMigrations({
  transaction: 'all'  // All-or-nothing
});
```

### 2. Batch Large Data Migrations
```typescript
// Instead of updating 1 million rows at once:
const batchSize = 1000;
let offset = 0;

while (true) {
  const result = await queryRunner.query(`
    UPDATE users SET status = 'active'
    WHERE id IN (
      SELECT id FROM users WHERE status IS NULL
      LIMIT ${batchSize}
    )
  `);

  if (result.affectedRows === 0) break;
  offset += batchSize;
}
```

### 3. Use Raw SQL for Complex Operations
```typescript
// QueryRunner methods are great, but sometimes raw SQL is clearer
await queryRunner.query(`
  CREATE INDEX CONCURRENTLY idx_user_email ON users (email)
`);
```

### 4. Document Risky Migrations
```typescript
/**
 * RISKY: This migration drops the 'phone' column
 * Data will be lost if reverted
 * Backup created: 2024-01-15 10:00 UTC
 */
export class RemovePhone implements MigrationInterface {
  // ...
}
```

### 5. Test Migrations on Staging First
```bash
# Never run untested migrations in production
# Always test on staging with production-like data first
```

---

## Resources

- [TypeORM Migration Documentation](https://typeorm.io/migrations)
- [TypeORM CLI Commands](https://typeorm.io/using-cli)
- [Database Migration Best Practices](https://www.brunton-spall.co.uk/post/2014/05/06/database-migrations-done-right/)
- [Zero-Downtime Database Migrations](https://spring.io/blog/2016/05/31/zero-downtime-deployment-with-a-database)

---

## Package.json Scripts Template

```json
{
  "scripts": {
    "migration:generate": "typeorm migration:generate -d src/data-source.ts",
    "migration:create": "typeorm migration:create",
    "migration:run": "typeorm migration:run -d src/data-source.ts",
    "migration:revert": "typeorm migration:revert -d src/data-source.ts",
    "migration:show": "typeorm migration:show -d src/data-source.ts",
    "schema:drop": "typeorm schema:drop -d src/data-source.ts",
    "schema:sync": "typeorm schema:sync -d src/data-source.ts"
  }
}
```

Usage:
```bash
npm run migration:generate -- -n AddUserField
npm run migration:run
npm run migration:revert
npm run migration:show
```

---

**Remember**: Migrations are a critical part of production database management. Always test thoroughly, create backups, and plan for rollbacks!
