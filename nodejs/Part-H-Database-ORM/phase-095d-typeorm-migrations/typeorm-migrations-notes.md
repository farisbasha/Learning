# Phase 095d: TypeORM Migrations - Comprehensive Notes

## Table of Contents
1. [What are TypeORM Migrations?](#what-are-typeorm-migrations)
2. [Why Migrations Over synchronize()?](#why-migrations-over-synchronize)
3. [How TypeORM CLI Works Internally](#how-typeorm-cli-works-internally)
4. [Migration File Structure](#migration-file-structure)
5. [Creating Tables with Migrations](#creating-tables-with-migrations)
6. [Altering Tables](#altering-tables)
7. [Indexes and Constraints](#indexes-and-constraints)
8. [Running Migrations](#running-migrations)
9. [Rolling Back Migrations](#rolling-back-migrations)
10. [Generating Migrations from Entities](#generating-migrations-from-entities)
11. [Migration Best Practices](#migration-best-practices)
12. [Framework Comparison](#framework-comparison)

---

## What are TypeORM Migrations?

### The Problem: Schema Evolution in Production

**TypeORM migrations** are version-controlled database schema change files that allow you to:
- Track database schema changes over time
- Apply schema changes safely in production
- Rollback changes if something goes wrong
- Collaborate with team members on schema evolution
- Maintain consistency across environments (dev, staging, prod)

### Evolution from Sequelize Migrations

```
EVOLUTION OF MIGRATION SYSTEMS IN NODE.JS:

Sequelize (ORM-first, 2011)          TypeORM (Entity-first, 2016)
┌─────────────────────┐              ┌─────────────────────┐
│  Migration File     │              │  Entity Definition  │
│  (queryInterface)   │              │  (with decorators)  │
└──────────┬──────────┘              └──────────┬──────────┘
           │                                    │
           │ 1. Define schema                   │ 1. Define schema
           │    manually                        │    via decorators
           │                                    │
           v                                    v
    ┌─────────────┐                      ┌─────────────┐
    │  Models     │                      │  Migration  │
    │  (separate) │                      │  Generator  │
    └─────────────┘                      └──────┬──────┘
                                                │
                                                │ 2. Auto-generate
                                                │    or manual
                                                v
                                         ┌─────────────┐
                                         │  Migration  │
                                         │  File       │
                                         └─────────────┘

Key Difference: TypeORM can GENERATE migrations from entity changes,
                Sequelize requires manual migration writing
```

### TypeORM vs Sequelize Migration Philosophy

| Aspect | Sequelize | TypeORM |
|--------|-----------|---------|
| **Primary Definition** | Migration files | Entity decorators |
| **Migration Creation** | Always manual | Auto-generated OR manual |
| **Schema Source of Truth** | Migration history | Entity definitions |
| **Database API** | queryInterface | QueryRunner |
| **TypeScript Support** | Added later | Built-in from start |
| **Development Flow** | Write migration → Run → Update model | Update entity → Generate migration → Run |

**Why This Matters:**

1. **Sequelize Approach (Migration-First)**:
   ```typescript
   // Step 1: Write migration
   module.exports = {
     up: (queryInterface, Sequelize) => {
       return queryInterface.createTable('users', {
         id: { type: Sequelize.INTEGER, primaryKey: true },
         email: { type: Sequelize.STRING }
       });
     }
   };

   // Step 2: Update model separately
   class User extends Model {}
   User.init({
     id: { type: DataTypes.INTEGER, primaryKey: true },
     email: { type: DataTypes.STRING }
   });

   // PROBLEM: Two places to maintain schema definition!
   ```

2. **TypeORM Approach (Entity-First)**:
   ```typescript
   // Step 1: Define entity
   @Entity()
   class User {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     email: string;
   }

   // Step 2: Generate migration automatically
   // $ typeorm migration:generate -n CreateUsers

   // TypeORM compares entity vs database and generates:
   export class CreateUsers1703548800000 implements MigrationInterface {
     async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.createTable(new Table({
         name: 'users',
         columns: [/*...*/]
       }));
     }
   }

   // BENEFIT: Single source of truth (the entity)!
   ```

---

## Why Migrations Over synchronize()?

### The synchronize: true Problem

TypeORM offers `synchronize: true` in DataSource configuration:

```typescript
const AppDataSource = new DataSource({
  // ... other config
  synchronize: true  // Auto-sync schema on app start
});
```

**How synchronize Works:**

```
APP STARTUP WITH synchronize: true:

┌─────────────┐
│  App Starts │
└──────┬──────┘
       │
       v
┌─────────────────────────────────┐
│  TypeORM Entity Scanner         │
│  - Reads @Entity() decorators   │
│  - Builds expected schema        │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│  Database Schema Introspection  │
│  - Queries current schema        │
│  - Compares with entities        │
└──────┬──────────────────────────┘
       │
       v
┌─────────────────────────────────┐
│  Automatic ALTER/CREATE         │
│  - Adds missing tables           │
│  - Adds missing columns          │
│  - ⚠️  MAY DROP COLUMNS!          │
└─────────────────────────────────┘
```

**Why synchronize is DANGEROUS in Production:**

1. **Data Loss Risk**:
   ```typescript
   // Version 1 (deployed)
   @Entity()
   class User {
     @Column()
     fullName: string;
   }

   // Version 2 (new deployment)
   @Entity()
   class User {
     @Column()
     firstName: string;

     @Column()
     lastName: string;
   }

   // With synchronize: true
   // Result: fullName column DROPPED (data lost!)
   //         firstName and lastName added (empty data)
   ```

2. **No Rollback Capability**:
   - synchronize changes are immediate and irreversible
   - No way to revert if something goes wrong
   - No audit trail of what changed

3. **Race Conditions with Multiple Instances**:
   ```
   PRODUCTION WITH 3 APP INSTANCES:

   Instance 1 starts ──┐
   Instance 2 starts ──┼──> All try to synchronize
   Instance 3 starts ──┘     at the same time!

   Result: Potential conflicts, locks, timeouts
   ```

4. **Performance Impact**:
   - Schema introspection on every startup
   - Adds 500ms-2000ms to startup time
   - Not acceptable for microservices that scale frequently

5. **No Data Migration**:
   ```typescript
   // Migration can include data transformation
   async up(queryRunner: QueryRunner) {
     // Add column
     await queryRunner.addColumn('users', new TableColumn({
       name: 'first_name',
       type: 'varchar'
     }));

     // Migrate data from old column
     await queryRunner.query(`
       UPDATE users
       SET first_name = SUBSTRING_INDEX(full_name, ' ', 1)
     `);

     // Drop old column
     await queryRunner.dropColumn('users', 'full_name');
   }

   // synchronize CAN'T do this!
   ```

### When to Use synchronize

```typescript
// ✅ GOOD: Local development
const DevDataSource = new DataSource({
  synchronize: process.env.NODE_ENV === 'development',
  // Fast iteration, no risk
});

// ❌ BAD: Production
const ProdDataSource = new DataSource({
  synchronize: true,  // NEVER do this!
  // Use migrations instead
});

// ✅ GOOD: Testing
const TestDataSource = new DataSource({
  synchronize: true,  // OK for ephemeral test databases
  dropSchema: true    // Clean slate for each test run
});
```

### Memory and Performance Implications

**synchronize Memory Usage:**

```
Entity Metadata Loading:
┌────────────────────────┐
│  Entity Classes        │  ~50KB per entity
├────────────────────────┤
│  Metadata Cache        │  ~100KB per entity
├────────────────────────┤
│  Schema Introspection  │  ~200KB (query results)
├────────────────────────┤
│  Diff Calculation      │  ~50KB (algorithm overhead)
└────────────────────────┘
Total: ~400KB overhead per entity during sync

Migration Approach:
┌────────────────────────┐
│  Migration Table Read  │  ~1KB (just version numbers)
├────────────────────────┤
│  Pending Migrations    │  ~10KB (only if pending)
└────────────────────────┘
Total: ~11KB overhead (97% less memory!)
```

**Performance Comparison:**

| Operation | synchronize | Migrations |
|-----------|-------------|-----------|
| Startup time (10 entities) | 800ms | 50ms |
| Startup time (100 entities) | 5000ms | 100ms |
| Memory overhead | ~4MB | ~50KB |
| Network queries | 50+ | 1-2 |
| Production safety | ❌ Dangerous | ✅ Safe |

---

## How TypeORM CLI Works Internally

### TypeORM CLI Architecture

```
TYPEORM CLI INTERNALS:

┌─────────────────────────────────────────────┐
│  $ typeorm migration:generate -n AddAge     │
└───────────────┬─────────────────────────────┘
                │
                v
┌───────────────────────────────────────────┐
│  1. DataSource Loader                     │
│     - Finds data-source.ts                │
│     - Imports and initializes connection  │
└───────────┬───────────────────────────────┘
            │
            v
┌───────────────────────────────────────────┐
│  2. Schema Introspection                  │
│     - Queries INFORMATION_SCHEMA          │
│     - Builds current database schema      │
└───────────┬───────────────────────────────┘
            │
            v
┌───────────────────────────────────────────┐
│  3. Entity Metadata Scanner               │
│     - Scans @Entity() decorated classes   │
│     - Builds expected schema from code    │
└───────────┬───────────────────────────────┘
            │
            v
┌───────────────────────────────────────────┐
│  4. Schema Comparator                     │
│     - Diffs current vs expected           │
│     - Generates QueryRunner commands      │
└───────────┬───────────────────────────────┘
            │
            v
┌───────────────────────────────────────────┐
│  5. Migration File Generator              │
│     - Creates TypeScript file             │
│     - Writes up() and down() methods      │
└───────────────────────────────────────────┘
```

### QueryRunner vs queryInterface (Sequelize)

**Sequelize queryInterface:**

```javascript
// Sequelize: Direct SQL operations, limited abstraction
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // queryInterface is wrapper around raw SQL
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    });

    // Limited to predefined methods
    // Doesn't understand TypeORM concepts
  }
};
```

**TypeORM QueryRunner:**

```typescript
// TypeORM: Object-oriented, database-agnostic abstraction
export class CreateUsers implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // QueryRunner is sophisticated abstraction layer
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        new TableColumn({
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        })
      ]
    }));

    // QueryRunner features:
    // - Transaction management
    // - Database type mapping
    // - Relationship-aware operations
    // - Connection pooling integration
  }
}
```

**QueryRunner Internal Architecture:**

```
QUERYRUNNER ARCHITECTURE:

┌─────────────────────────────────────┐
│  QueryRunner (Abstract Interface)   │
├─────────────────────────────────────┤
│  + createTable()                    │
│  + dropTable()                      │
│  + addColumn()                      │
│  + createIndex()                    │
│  + query() [raw SQL fallback]       │
└──────────┬──────────────────────────┘
           │
           │ Implemented by:
           │
    ┌──────┴─────────────────────────┐
    │                                │
    v                                v
┌─────────────────┐     ┌────────────────────┐
│ PostgresQuery   │     │ MysqlQueryRunner   │
│ Runner          │     │                    │
├─────────────────┤     ├────────────────────┤
│ - Maps types    │     │ - Maps types       │
│   int → integer │     │   int → INT        │
│ - Uses SERIAL   │     │ - Uses AUTO_INC    │
│ - RETURNING     │     │ - LAST_INSERT_ID   │
└─────────────────┘     └────────────────────┘

Each database driver has optimized QueryRunner implementation
that translates generic operations to database-specific SQL
```

**Key Advantages of QueryRunner:**

1. **Database Agnostic**:
   ```typescript
   // Same code works for MySQL, PostgreSQL, SQLite, etc.
   await queryRunner.createTable(new Table({
     name: 'users',
     columns: [
       new TableColumn({
         name: 'id',
         type: 'int',  // Mapped to INT/INTEGER/SERIAL automatically
         isGenerated: true
       })
     ]
   }));

   // PostgreSQL: CREATE TABLE users (id SERIAL PRIMARY KEY)
   // MySQL:      CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY)
   // SQLite:     CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT)
   ```

2. **Transaction Management**:
   ```typescript
   async up(queryRunner: QueryRunner): Promise<void> {
     // QueryRunner automatically wraps in transaction
     await queryRunner.createTable(/* ... */);
     await queryRunner.createIndex(/* ... */);
     // If any fails, entire migration rolls back automatically
   }
   ```

3. **Type Safety**:
   ```typescript
   // TypeORM: Compile-time type checking
   await queryRunner.createTable(new Table({
     columns: [
       new TableColumn({
         name: 'age',
         type: 'int',  // TypeScript ensures this is valid
         isNullable: false  // IDE autocomplete!
       })
     ]
   }));

   // Sequelize: Runtime string-based (typos possible)
   await queryInterface.addColumn('users', 'age', {
     type: Sequelize.INTEGER,
     allowNull: false  // Easy to typo
   });
   ```

---

## Migration File Structure

### Anatomy of a TypeORM Migration

```typescript
// migrations/1703548800000-CreateUsers.ts

import { MigrationInterface, QueryRunner, Table } from 'typeorm';
//       ↑                  ↑            ↑
//       Interface to      Database      Schema
//       implement          operations   definition

export class CreateUsers1703548800000 implements MigrationInterface {
  //           ↑                ↑                     ↑
  //        Descriptive      Timestamp         Interface contract
  //        name             (unique ID)

  // Name must match: ClassName + Timestamp
  public async up(queryRunner: QueryRunner): Promise<void> {
    // FORWARD migration: Apply changes
    // Must be idempotent (safe to run multiple times)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // REVERSE migration: Undo changes
    // Must exactly reverse up()
  }
}
```

### Migration Naming Convention

```
MIGRATION FILE NAMING:

Format: {TIMESTAMP}-{DescriptiveName}.ts
Example: 1703548800000-CreateUsersTable.ts

┌──────────────┬───────────────────┐
│  Timestamp   │  Descriptive Name │
├──────────────┼───────────────────┤
│ 1703548800000│ CreateUsersTable  │
└──────────────┴───────────────────┘
      │                  │
      │                  └─> PascalCase, verb-first
      │                      (Create, Add, Remove, Alter)
      │
      └─> Unix timestamp (milliseconds)
          Ensures chronological order
          Prevents naming conflicts
```

**Why Timestamps Matter:**

```typescript
// Team collaboration scenario:

// Developer A creates (2pm):
1703548800000-AddEmailColumn.ts

// Developer B creates simultaneously (2pm):
1703548801000-AddPhoneColumn.ts
         ↑
    1ms difference ensures unique ordering!

// Without timestamps:
001-AddEmailColumn.ts  // Who decides numbering?
002-AddPhoneColumn.ts  // Merge conflicts!
```

### Migration Interface Contract

```typescript
interface MigrationInterface {
  /**
   * Run migration (apply changes)
   * @throws Error if migration fails (triggers rollback)
   */
  up(queryRunner: QueryRunner): Promise<void>;

  /**
   * Revert migration (undo changes)
   * @throws Error if revert fails
   */
  down(queryRunner: QueryRunner): Promise<void>;

  // Optional: Custom migration name
  name?: string;
}
```

### Migration File Template Patterns

**Pattern 1: Table Creation**

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1703548800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true  // createForeignKeys (if table has references)
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

**Pattern 2: Column Addition**

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAgeToUsers1703548900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'age',
        type: 'int',
        isNullable: true,  // Existing rows won't have this
        default: null
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'age');
  }
}
```

**Pattern 3: Data Migration**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateFullNameToFirstLast1703549000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns
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

    // 2. Migrate data
    await queryRunner.query(`
      UPDATE users
      SET
        first_name = SUBSTRING_INDEX(full_name, ' ', 1),
        last_name = SUBSTRING_INDEX(full_name, ' ', -1)
      WHERE full_name IS NOT NULL
    `);

    // 3. Remove old column
    await queryRunner.dropColumn('users', 'full_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order!

    // 1. Add back old column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'full_name',
      type: 'varchar',
      isNullable: true
    }));

    // 2. Restore data
    await queryRunner.query(`
      UPDATE users
      SET full_name = CONCAT(first_name, ' ', last_name)
      WHERE first_name IS NOT NULL AND last_name IS NOT NULL
    `);

    // 3. Remove new columns
    await queryRunner.dropColumn('users', 'first_name');
    await queryRunner.dropColumn('users', 'last_name');
  }
}
```

---

## Creating Tables with Migrations

### Basic Table Creation

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProducts1703550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'products',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: 'varchar',
          length: '100',
          isNullable: false
        },
        {
          name: 'price',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: false
        },
        {
          name: 'description',
          type: 'text',
          isNullable: true
        },
        {
          name: 'in_stock',
          type: 'boolean',
          default: true
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'  // MySQL only
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

### Column Type Mapping

```typescript
// TypeORM abstracts database-specific types:

// INTEGER TYPES
{
  name: 'quantity',
  type: 'int'  // → MySQL: INT, PostgreSQL: INTEGER, SQLite: INTEGER
}

{
  name: 'big_number',
  type: 'bigint'  // → MySQL: BIGINT, PostgreSQL: BIGINT
}

// STRING TYPES
{
  name: 'code',
  type: 'varchar',
  length: '50'  // → MySQL: VARCHAR(50), PostgreSQL: VARCHAR(50)
}

{
  name: 'bio',
  type: 'text'  // → MySQL: TEXT, PostgreSQL: TEXT
}

// DECIMAL TYPES
{
  name: 'price',
  type: 'decimal',
  precision: 10,  // Total digits
  scale: 2        // Decimal places
  // → MySQL: DECIMAL(10,2), PostgreSQL: NUMERIC(10,2)
}

// DATE/TIME TYPES
{
  name: 'birth_date',
  type: 'date'  // → MySQL: DATE, PostgreSQL: DATE
}

{
  name: 'created_at',
  type: 'timestamp'  // → MySQL: TIMESTAMP, PostgreSQL: TIMESTAMP
}

{
  name: 'updated_at',
  type: 'datetime'  // → MySQL: DATETIME, PostgreSQL: TIMESTAMP
}

// BOOLEAN TYPES
{
  name: 'is_active',
  type: 'boolean'  // → MySQL: TINYINT(1), PostgreSQL: BOOLEAN, SQLite: INTEGER
}

// JSON TYPES
{
  name: 'metadata',
  type: 'json'  // → MySQL: JSON, PostgreSQL: JSON, SQLite: TEXT
}

{
  name: 'settings',
  type: 'jsonb'  // → PostgreSQL: JSONB (optimized), MySQL: JSON
}

// UUID TYPE
{
  name: 'id',
  type: 'uuid'  // → PostgreSQL: UUID, MySQL: CHAR(36), SQLite: TEXT
}

// ENUM TYPE
{
  name: 'status',
  type: 'enum',
  enum: ['active', 'inactive', 'pending']
  // → MySQL: ENUM('active','inactive','pending')
  // → PostgreSQL: Creates custom type first
}
```

### Table with Foreign Keys

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrders1703550100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'orders',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'user_id',
          type: 'int',
          isNullable: false
        },
        {
          name: 'total',
          type: 'decimal',
          precision: 10,
          scale: 2
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['pending', 'completed', 'cancelled'],
          default: "'pending'"
        }
      ]
    }));

    // Add foreign key separately (more control)
    await queryRunner.createForeignKey('orders', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',  // Delete orders when user deleted
      onUpdate: 'CASCADE'   // Update order.user_id when user.id changes
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first (important order!)
    const table = await queryRunner.getTable('orders');
    const foreignKey = table.foreignKeys.find(
      fk => fk.columnNames.indexOf('user_id') !== -1
    );
    await queryRunner.dropForeignKey('orders', foreignKey);

    // Then drop table
    await queryRunner.dropTable('orders');
  }
}
```

### Advanced Table Creation Patterns

**Pattern: UUID Primary Keys (PostgreSQL)**

```typescript
export class CreateUsersWithUUID1703550200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension (PostgreSQL only)
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          default: 'uuid_generate_v4()'
        },
        {
          name: 'email',
          type: 'varchar'
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    // Note: We don't drop the extension (might be used elsewhere)
  }
}
```

**Pattern: Composite Primary Key**

```typescript
export class CreateUserRoles1703550300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'user_roles',
      columns: [
        {
          name: 'user_id',
          type: 'int',
          isPrimary: true  // Part of composite key
        },
        {
          name: 'role_id',
          type: 'int',
          isPrimary: true  // Part of composite key
        },
        {
          name: 'assigned_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        }
      ]
    }));

    // Add foreign keys for both columns
    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));

    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['role_id'],
      referencedTableName: 'roles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_roles');
    const foreignKeys = table.foreignKeys;
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('user_roles', fk);
    }
    await queryRunner.dropTable('user_roles');
  }
}
```

---

## Altering Tables

### Adding Columns

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1703551000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phone',
      type: 'varchar',
      length: '20',
      isNullable: true,  // Important: existing rows need nullable
      comment: 'User phone number'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### Adding Multiple Columns

```typescript
export class AddAddressFields1703551100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'street',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'city',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'postal_code',
        type: 'varchar',
        length: '10',
        isNullable: true
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['street', 'city', 'postal_code']);
  }
}
```

### Modifying Columns

```typescript
export class ChangeEmailToUnique1703551200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get current column definition
    const table = await queryRunner.getTable('users');
    const emailColumn = table.findColumnByName('email');

    // Create modified column
    const newEmailColumn = emailColumn.clone();
    newEmailColumn.isUnique = true;

    // Replace column
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

### Renaming Columns

```typescript
export class RenameUsernameToDisplayName1703551300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'username', 'display_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'display_name', 'username');
  }
}
```

### Changing Column Type

```typescript
export class ChangePhoneToText1703551400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Approach 1: Using changeColumn
    const table = await queryRunner.getTable('users');
    const oldColumn = table.findColumnByName('phone');

    await queryRunner.changeColumn('users', 'phone', new TableColumn({
      name: 'phone',
      type: 'text',  // Changed from varchar(20)
      isNullable: oldColumn.isNullable
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const oldColumn = table.findColumnByName('phone');

    await queryRunner.changeColumn('users', 'phone', new TableColumn({
      name: 'phone',
      type: 'varchar',
      length: '20',
      isNullable: oldColumn.isNullable
    }));
  }
}
```

### Adding NOT NULL to Existing Column

```typescript
export class MakeEmailNotNull1703551500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Ensure no null values exist
    await queryRunner.query(`
      UPDATE users
      SET email = 'noemail@example.com'
      WHERE email IS NULL
    `);

    // Step 2: Make column NOT NULL
    const table = await queryRunner.getTable('users');
    const emailColumn = table.findColumnByName('email');

    const newEmailColumn = emailColumn.clone();
    newEmailColumn.isNullable = false;

    await queryRunner.changeColumn('users', 'email', newEmailColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const emailColumn = table.findColumnByName('email');

    const newEmailColumn = emailColumn.clone();
    newEmailColumn.isNullable = true;

    await queryRunner.changeColumn('users', 'email', newEmailColumn);
  }
}
```

### Complex Column Alteration with Data Migration

```typescript
export class ConvertStatusToEnum1703551600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Current: status VARCHAR with values like "active", "INACTIVE", "Pending"
    // Target: status ENUM with normalized values

    // Step 1: Add temporary column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'status_new',
      type: 'enum',
      enum: ['active', 'inactive', 'pending'],
      isNullable: true
    }));

    // Step 2: Migrate data with normalization
    await queryRunner.query(`
      UPDATE users
      SET status_new = CASE
        WHEN LOWER(status) = 'active' THEN 'active'
        WHEN LOWER(status) = 'inactive' THEN 'inactive'
        WHEN LOWER(status) = 'pending' THEN 'pending'
        ELSE 'pending'
      END
    `);

    // Step 3: Drop old column
    await queryRunner.dropColumn('users', 'status');

    // Step 4: Rename new column
    await queryRunner.renameColumn('users', 'status_new', 'status');

    // Step 5: Make it NOT NULL
    const table = await queryRunner.getTable('users');
    const statusColumn = table.findColumnByName('status');
    const newStatusColumn = statusColumn.clone();
    newStatusColumn.isNullable = false;
    newStatusColumn.default = "'pending'";

    await queryRunner.changeColumn('users', 'status', newStatusColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the process
    await queryRunner.addColumn('users', new TableColumn({
      name: 'status_old',
      type: 'varchar',
      isNullable: true
    }));

    await queryRunner.query(`
      UPDATE users
      SET status_old = status
    `);

    await queryRunner.dropColumn('users', 'status');
    await queryRunner.renameColumn('users', 'status_old', 'status');
  }
}
```

---

## Indexes and Constraints

### Creating Indexes

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexes1703552000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Single column index
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USER_EMAIL',
      columnNames: ['email']
    }));

    // Composite index
    await queryRunner.createIndex('orders', new TableIndex({
      name: 'IDX_ORDER_USER_STATUS',
      columnNames: ['user_id', 'status']
    }));

    // Unique index
    await queryRunner.createIndex('products', new TableIndex({
      name: 'IDX_PRODUCT_SKU',
      columnNames: ['sku'],
      isUnique: true
    }));

    // Full-text index (MySQL)
    await queryRunner.createIndex('articles', new TableIndex({
      name: 'IDX_ARTICLE_CONTENT_FULLTEXT',
      columnNames: ['title', 'content'],
      isFulltext: true  // MySQL only
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');
    await queryRunner.dropIndex('orders', 'IDX_ORDER_USER_STATUS');
    await queryRunner.dropIndex('products', 'IDX_PRODUCT_SKU');
    await queryRunner.dropIndex('articles', 'IDX_ARTICLE_CONTENT_FULLTEXT');
  }
}
```

### Index Performance Implications

```
INDEX MEMORY AND PERFORMANCE:

Without Index (Full Table Scan):
┌──────────────────────────────┐
│  Table: users (1M rows)      │
├──────────────────────────────┤
│  Query: WHERE email = '...'  │
│  Scans: 1,000,000 rows       │
│  Time: 2000ms                │
│  Memory: 100MB loaded        │
└──────────────────────────────┘

With B-Tree Index on email:
┌──────────────────────────────┐
│  Index: IDX_USER_EMAIL       │
├──────────────────────────────┤
│  Query: WHERE email = '...'  │
│  Scans: ~log₂(1M) = 20 nodes │
│  Time: 5ms                   │
│  Memory: 50KB loaded         │
│  Index Size: ~40MB           │
└──────────────────────────────┘

Trade-off:
- Read performance: ↑ 400x faster
- Write performance: ↓ 10% slower (index must be updated)
- Storage: ↑ 40MB additional space
- Memory: Index may be cached in RAM
```

### Composite Index Strategy

```typescript
// ❌ BAD: Multiple single-column indexes
await queryRunner.createIndex('orders', new TableIndex({
  name: 'IDX_ORDER_USER',
  columnNames: ['user_id']
}));

await queryRunner.createIndex('orders', new TableIndex({
  name: 'IDX_ORDER_STATUS',
  columnNames: ['status']
}));

// Query: WHERE user_id = 1 AND status = 'pending'
// Uses: Only ONE index (database picks one)
// Result: Still scans thousands of rows

// ✅ GOOD: Composite index
await queryRunner.createIndex('orders', new TableIndex({
  name: 'IDX_ORDER_USER_STATUS',
  columnNames: ['user_id', 'status']  // Order matters!
}));

// Query: WHERE user_id = 1 AND status = 'pending'
// Uses: Composite index
// Result: Direct lookup, only matching rows

// Column order matters:
// [user_id, status] good for:
//   - WHERE user_id = ?
//   - WHERE user_id = ? AND status = ?
//
// [user_id, status] NOT good for:
//   - WHERE status = ?  (can't use index efficiently)
```

### Unique Constraints

```typescript
export class AddUniqueConstraints1703552100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Approach 1: Using unique index
    await queryRunner.createIndex('users', new TableIndex({
      name: 'UQ_USER_EMAIL',
      columnNames: ['email'],
      isUnique: true
    }));

    // Approach 2: Using unique constraint (PostgreSQL)
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT UQ_USER_USERNAME UNIQUE (username)
    `);

    // Composite unique constraint
    await queryRunner.createIndex('user_roles', new TableIndex({
      name: 'UQ_USER_ROLE',
      columnNames: ['user_id', 'role_id'],
      isUnique: true
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'UQ_USER_EMAIL');
    await queryRunner.query(`
      ALTER TABLE users
      DROP CONSTRAINT UQ_USER_USERNAME
    `);
    await queryRunner.dropIndex('user_roles', 'UQ_USER_ROLE');
  }
}
```

### Check Constraints

```typescript
export class AddCheckConstraints1703552200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure age is positive
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT CHK_USER_AGE_POSITIVE
      CHECK (age > 0 AND age < 150)
    `);

    // Ensure price is positive
    await queryRunner.query(`
      ALTER TABLE products
      ADD CONSTRAINT CHK_PRODUCT_PRICE_POSITIVE
      CHECK (price >= 0)
    `);

    // Ensure discount is between 0 and 100
    await queryRunner.query(`
      ALTER TABLE products
      ADD CONSTRAINT CHK_PRODUCT_DISCOUNT_RANGE
      CHECK (discount >= 0 AND discount <= 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT CHK_USER_AGE_POSITIVE
    `);
    await queryRunner.query(`
      ALTER TABLE products DROP CONSTRAINT CHK_PRODUCT_PRICE_POSITIVE
    `);
    await queryRunner.query(`
      ALTER TABLE products DROP CONSTRAINT CHK_PRODUCT_DISCOUNT_RANGE
    `);
  }
}
```

### Foreign Key Constraints with Actions

```typescript
export class AddForeignKeyWithActions1703552300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // CASCADE: Delete child records when parent deleted
    await queryRunner.createForeignKey('orders', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',  // DELETE user → DELETE orders
      onUpdate: 'CASCADE',
      name: 'FK_ORDER_USER'
    }));

    // SET NULL: Set foreign key to NULL when parent deleted
    await queryRunner.createForeignKey('posts', new TableForeignKey({
      columnNames: ['author_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',  // DELETE user → SET author_id = NULL
      onUpdate: 'CASCADE',
      name: 'FK_POST_AUTHOR'
    }));

    // RESTRICT: Prevent deletion if child records exist
    await queryRunner.createForeignKey('order_items', new TableForeignKey({
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',  // Can't delete product with order_items
      onUpdate: 'CASCADE',
      name: 'FK_ORDER_ITEM_PRODUCT'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'FK_ORDER_USER');
    await queryRunner.dropForeignKey('posts', 'FK_POST_AUTHOR');
    await queryRunner.dropForeignKey('order_items', 'FK_ORDER_ITEM_PRODUCT');
  }
}
```

---

## Running Migrations

### Migration Execution Flow

```
TYPEORM MIGRATION:RUN INTERNALS:

$ typeorm migration:run
         │
         v
┌─────────────────────────────────┐
│ 1. Load DataSource              │
│    - Read data-source.ts        │
│    - Initialize connection      │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ 2. Ensure migrations table      │
│    CREATE TABLE IF NOT EXISTS   │
│    migrations (                 │
│      id INT PRIMARY KEY,        │
│      timestamp BIGINT,          │
│      name VARCHAR               │
│    )                            │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ 3. Query executed migrations    │
│    SELECT * FROM migrations     │
│    ORDER BY timestamp           │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ 4. Load migration files         │
│    - Scan migrations directory  │
│    - Import all .ts/.js files   │
│    - Sort by timestamp          │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ 5. Calculate pending            │
│    pending = all - executed     │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ 6. Execute pending migrations   │
│    FOR EACH pending migration:  │
│      a. BEGIN TRANSACTION       │
│      b. Run up() method         │
│      c. INSERT INTO migrations  │
│      d. COMMIT                  │
│    If error: ROLLBACK           │
└─────────────────────────────────┘
```

### Running Migrations (Command)

```bash
# Run all pending migrations
npx typeorm migration:run -d src/data-source.ts

# Output:
# query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
# 0 migrations are already loaded in database
# 2 migrations were found in source code
# 2 migrations are new migrations that needs to be executed
# query: START TRANSACTION
# query: CREATE TABLE "users" ("id" SERIAL PRIMARY KEY, ...)
# query: INSERT INTO "migrations"("timestamp", "name") VALUES ($1, $2)
# Migration CreateUsers1703548800000 has been executed successfully
# query: COMMIT
# query: START TRANSACTION
# query: ALTER TABLE "users" ADD "age" integer
# query: INSERT INTO "migrations"("timestamp", "name") VALUES ($1, $2)
# Migration AddAgeToUsers1703548900000 has been executed successfully
# query: COMMIT
```

### Programmatic Migration Execution

```typescript
// src/scripts/run-migrations.ts
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function runMigrations() {
  try {
    // Initialize connection
    await AppDataSource.initialize();
    console.log('Database connected');

    // Run pending migrations
    const migrations = await AppDataSource.runMigrations({
      transaction: 'all'  // Run all migrations in single transaction
    });

    console.log(`Executed ${migrations.length} migrations:`);
    migrations.forEach(migration => {
      console.log(`  - ${migration.name}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

### Migration Transactions

```typescript
// Default: Each migration in separate transaction
await AppDataSource.runMigrations({
  transaction: 'each'  // Default behavior
});

// Scenario:
// Migration 1: SUCCESS (committed)
// Migration 2: FAIL (rolled back)
// Result: Migration 1 changes persist, Migration 2 reverted

// All in one transaction
await AppDataSource.runMigrations({
  transaction: 'all'
});

// Scenario:
// Migration 1: SUCCESS
// Migration 2: FAIL
// Result: BOTH rolled back (all-or-nothing)

// No transactions (dangerous!)
await AppDataSource.runMigrations({
  transaction: 'none'
});

// Scenario:
// Migration 1: Partial execution
// Error occurs mid-migration
// Result: Database in inconsistent state!
```

### Migration Table Structure

```sql
-- TypeORM automatically creates this table:
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  timestamp BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- Example data:
-- +----+---------------+---------------------------+
-- | id | timestamp     | name                      |
-- +----+---------------+---------------------------+
-- | 1  | 1703548800000 | CreateUsers1703548800000  |
-- | 2  | 1703548900000 | AddAgeToUsers1703548900000|
-- +----+---------------+---------------------------+

-- Query to check migration status:
SELECT * FROM migrations ORDER BY timestamp;
```

### Checking Migration Status

```bash
# Show migration status
npx typeorm migration:show -d src/data-source.ts

# Output:
# [X] CreateUsers1703548800000 (executed)
# [X] AddAgeToUsers1703548900000 (executed)
# [ ] AddEmailToUsers1703549000000 (pending)
```

### Production Migration Strategy

```typescript
// production-migrate.ts
import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';

async function productionMigrate() {
  console.log('=== Production Migration Script ===');

  try {
    // 1. Initialize connection
    console.log('Connecting to database...');
    await AppDataSource.initialize();

    // 2. Check pending migrations
    const pendingMigrations = await AppDataSource.showMigrations();
    if (!pendingMigrations) {
      console.log('No pending migrations. Database is up to date.');
      await AppDataSource.destroy();
      return;
    }

    // 3. Create backup (pseudo-code)
    console.log('Creating database backup...');
    // await createDatabaseBackup();

    // 4. Run migrations
    console.log('Running migrations...');
    const executedMigrations = await AppDataSource.runMigrations({
      transaction: 'all'  // All-or-nothing in production
    });

    console.log(`✓ Successfully executed ${executedMigrations.length} migrations`);
    executedMigrations.forEach(m => console.log(`  - ${m.name}`));

    // 5. Verify migration
    const stillPending = await AppDataSource.showMigrations();
    if (stillPending) {
      throw new Error('Migrations completed but some are still pending!');
    }

    console.log('✓ Database schema is up to date');

    await AppDataSource.destroy();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Rolling back...');

    // Restore from backup (pseudo-code)
    // await restoreDatabaseBackup();

    await AppDataSource.destroy();
    process.exit(1);
  }
}

productionMigrate();
```

---

## Rolling Back Migrations

### Revert Command

```bash
# Revert last migration
npx typeorm migration:revert -d src/data-source.ts

# Output:
# query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
# 2 migrations are loaded in database
# Reverting AddAgeToUsers1703548900000
# query: START TRANSACTION
# query: ALTER TABLE "users" DROP COLUMN "age"
# query: DELETE FROM "migrations" WHERE "timestamp" = $1 AND "name" = $2
# Migration AddAgeToUsers1703548900000 has been reverted successfully
# query: COMMIT
```

### Programmatic Revert

```typescript
// src/scripts/revert-migration.ts
import { AppDataSource } from '../data-source';

async function revertLastMigration() {
  try {
    await AppDataSource.initialize();

    // Revert the last executed migration
    await AppDataSource.undoLastMigration({
      transaction: 'all'
    });

    console.log('Migration reverted successfully');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Revert failed:', error);
    process.exit(1);
  }
}

revertLastMigration();
```

### Revert Multiple Migrations

```bash
# Revert last 3 migrations
npx typeorm migration:revert -d src/data-source.ts
npx typeorm migration:revert -d src/data-source.ts
npx typeorm migration:revert -d src/data-source.ts

# Or create a script:
```

```typescript
// revert-multiple.ts
async function revertMultiple(count: number) {
  await AppDataSource.initialize();

  for (let i = 0; i < count; i++) {
    const migrations = await AppDataSource.showMigrations();
    if (!migrations) {
      console.log(`No more migrations to revert. Reverted ${i} migrations.`);
      break;
    }

    console.log(`Reverting migration ${i + 1}/${count}...`);
    await AppDataSource.undoLastMigration();
  }

  await AppDataSource.destroy();
}

revertMultiple(3);
```

### Writing Reversible Migrations

```typescript
// ✅ GOOD: Perfectly reversible
export class AddAgeToUsers implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'age',
      type: 'int',
      isNullable: true
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'age');
    // Perfect reversal: column removed, back to original state
  }
}

// ⚠️ PROBLEMATIC: Data loss on revert
export class RemovePhoneFromUsers implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
    // Phone data is deleted!
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phone',
      type: 'varchar',
      isNullable: true
    }));
    // Column is back, but data is LOST!
  }
}

// ✅ BETTER: Preserve data during risky changes
export class ArchiveAndRemovePhone implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create archive table
    await queryRunner.query(`
      CREATE TABLE user_phone_archive AS
      SELECT id, phone FROM users WHERE phone IS NOT NULL
    `);

    // 2. Now safe to drop
    await queryRunner.dropColumn('users', 'phone');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add column back
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phone',
      type: 'varchar',
      isNullable: true
    }));

    // 2. Restore data from archive
    await queryRunner.query(`
      UPDATE users u
      JOIN user_phone_archive a ON u.id = a.id
      SET u.phone = a.phone
    `);

    // 3. Drop archive
    await queryRunner.dropTable('user_phone_archive');
  }
}
```

### Irreversible Migrations

```typescript
// Some migrations can't be perfectly reversed
export class HashPasswords implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Load users
    const users = await queryRunner.query('SELECT id, password FROM users');

    // Hash passwords
    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      await queryRunner.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashed, user.id]
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Can't unhash passwords!
    throw new Error(
      'This migration cannot be reverted. ' +
      'Passwords have been hashed and original values are lost.'
    );
  }
}

// Alternative: Mark as irreversible but safe
export class HashPasswordsSafe implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new column for hashed password
    await queryRunner.addColumn('users', new TableColumn({
      name: 'password_hash',
      type: 'varchar',
      isNullable: true
    }));

    // 2. Populate hashed passwords
    const users = await queryRunner.query('SELECT id, password FROM users');
    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      await queryRunner.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashed, user.id]
      );
    }

    // 3. Keep old 'password' column for now (can be removed in next migration)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Revert is safe: just drop the new column
    await queryRunner.dropColumn('users', 'password_hash');
    // Original passwords still exist in 'password' column
  }
}
```

---

## Generating Migrations from Entities

### Auto-Generation Workflow

```
MIGRATION GENERATION PROCESS:

1. Define/Update Entity
   ┌─────────────────────┐
   │  @Entity()          │
   │  class User {       │
   │    @Column()        │
   │    age: number;     │ ← Add new column
   │  }                  │
   └──────────┬──────────┘
              │
              v
2. Generate Migration
   $ typeorm migration:generate -n AddAge -d src/data-source.ts
              │
              v
   ┌─────────────────────────────────┐
   │  TypeORM compares:              │
   │  - Entity metadata (code)       │
   │  - Database schema (actual DB)  │
   │  - Calculates diff              │
   └──────────┬──────────────────────┘
              │
              v
3. Auto-Generated File
   ┌─────────────────────────────────┐
   │  export class AddAge... {       │
   │    async up(queryRunner) {      │
   │      await queryRunner          │
   │        .addColumn(...)           │
   │    }                            │
   │    async down(queryRunner) {    │
   │      await queryRunner          │
   │        .dropColumn(...)          │
   │    }                            │
   │  }                              │
   └─────────────────────────────────┘
```

### Example: Auto-Generation

**Step 1: Update Entity**

```typescript
// entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // Add new column
  @Column({ nullable: true })
  age: number;  // NEW!
}
```

**Step 2: Generate Migration**

```bash
npx typeorm migration:generate \
  -n AddAgeToUsers \
  -d src/data-source.ts

# Output:
# Migration /path/to/migrations/1703552500000-AddAgeToUsers.ts has been generated successfully.
```

**Step 3: Review Generated Migration**

```typescript
// migrations/1703552500000-AddAgeToUsers.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgeToUsers1703552500000 implements MigrationInterface {
  name = 'AddAgeToUsers1703552500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "age" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "age"`
    );
  }
}
```

### Complex Entity Changes

**Multiple Changes at Once:**

```typescript
// Before:
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;
}

// After:
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;  // Changed type

  @Column({ nullable: true })
  description: string;  // Added

  @Column({ default: true })
  inStock: boolean;  // Added

  @CreateDateColumn()
  createdAt: Date;  // Added
}
```

**Generated migration:**

```typescript
export class UpdateProduct1703552600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change price column type
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric(10,2)`
    );

    // Add description column
    await queryRunner.query(
      `ALTER TABLE "product" ADD "description" character varying`
    );

    // Add inStock column
    await queryRunner.query(
      `ALTER TABLE "product" ADD "inStock" boolean NOT NULL DEFAULT true`
    );

    // Add createdAt column
    await queryRunner.query(
      `ALTER TABLE "product" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "inStock"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" TYPE integer`
    );
  }
}
```

### Relation Changes

```typescript
// Add relationship
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;  // NEW!
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];  // NEW!
}
```

**Generated migration:**

```typescript
export class AddUserOrderRelation implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key column
    await queryRunner.query(
      `ALTER TABLE "order" ADD "userId" integer`
    );

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD CONSTRAINT "FK_order_user"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "userId"`
    );
  }
}
```

### When to Use Auto-Generation vs Manual

**Use Auto-Generation for:**
- Adding/removing columns
- Changing column types
- Adding/removing relations
- Simple index additions
- Most schema changes

**Use Manual for:**
- Data migrations
- Complex transformations
- Database-specific optimizations
- Custom SQL logic
- Performance-critical changes

**Example: Combining Both**

```bash
# 1. Generate migration from entity changes
npx typeorm migration:generate -n AddUserFields -d src/data-source.ts

# 2. Edit generated migration to add data logic
```

```typescript
// Auto-generated (then manually enhanced):
export class AddUserFields implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // AUTO-GENERATED: Add columns
    await queryRunner.query(
      `ALTER TABLE "user" ADD "firstName" varchar`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastName" varchar`
    );

    // MANUALLY ADDED: Migrate data
    await queryRunner.query(`
      UPDATE "user"
      SET
        "firstName" = SUBSTRING_INDEX(fullName, ' ', 1),
        "lastName" = SUBSTRING_INDEX(fullName, ' ', -1)
      WHERE fullName IS NOT NULL
    `);

    // AUTO-GENERATED: Drop old column
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "fullName"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "fullName" varchar`
    );

    // MANUALLY ADDED: Restore data
    await queryRunner.query(`
      UPDATE "user"
      SET fullName = CONCAT(firstName, ' ', lastName)
      WHERE firstName IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
  }
}
```

---

## Migration Best Practices

### 1. Always Review Generated Migrations

```typescript
// Auto-generated migrations may not be optimal

// ❌ Generated (inefficient):
export class UpdateEmail implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "email" varchar UNIQUE`);
    // Data is lost!
  }
}

// ✅ Manually corrected (preserves data):
export class UpdateEmail implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint to existing column
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "UQ_USER_EMAIL" UNIQUE ("email")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP CONSTRAINT "UQ_USER_EMAIL"
    `);
  }
}
```

### 2. Make Migrations Idempotent

```typescript
// ❌ BAD: Fails if run twice
export class AddIndex implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_USER_EMAIL" ON "user" ("email")
    `);
    // Fails if index already exists!
  }
}

// ✅ GOOD: Idempotent
export class AddIndex implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USER_EMAIL" ON "user" ("email")
    `);
    // Safe to run multiple times
  }
}

// ✅ BETTER: Check before creating
export class AddIndex implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user');
    const hasIndex = table.indices.some(
      index => index.name === 'IDX_USER_EMAIL'
    );

    if (!hasIndex) {
      await queryRunner.createIndex('user', new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email']
      }));
    }
  }
}
```

### 3. Use Descriptive Names

```typescript
// ❌ BAD: Vague names
export class UpdateUser implements MigrationInterface {}
export class ChangeTable implements MigrationInterface {}
export class Fix implements MigrationInterface {}

// ✅ GOOD: Descriptive names
export class AddEmailUniqueConstraintToUser implements MigrationInterface {}
export class RenameFullNameToFirstLastInUser implements MigrationInterface {}
export class FixUserEmailNullValues implements MigrationInterface {}
```

### 4. Keep Migrations Small and Focused

```typescript
// ❌ BAD: Monolithic migration (hard to debug)
export class BigUpdate implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add 10 columns
    // Migrate 5 tables
    // Create 3 indexes
    // Modify relationships
    // ... 200 lines of code
  }
}

// ✅ GOOD: Separate migrations
export class AddUserFields implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', /* ... */);
    await queryRunner.addColumn('users', /* ... */);
  }
}

export class AddUserIndexes implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex('users', /* ... */);
  }
}

export class MigrateUserData implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* data migration */);
  }
}
```

### 5. Test Migrations Locally First

```bash
# Testing workflow:

# 1. Create migration
npx typeorm migration:generate -n MyMigration -d src/data-source.ts

# 2. Review generated file
cat migrations/1703553000000-MyMigration.ts

# 3. Run migration
npx typeorm migration:run -d src/data-source.ts

# 4. Verify database state
# (check tables, data, constraints)

# 5. Test revert
npx typeorm migration:revert -d src/data-source.ts

# 6. Verify database restored
# (should be back to original state)

# 7. Run again (test idempotency)
npx typeorm migration:run -d src/data-source.ts
npx typeorm migration:run -d src/data-source.ts  # Should be no-op

# 8. Commit to version control
git add migrations/
git commit -m "Add MyMigration"
```

### 6. Handle NULL Values Carefully

```typescript
// ❌ BAD: Fails if existing rows exist
export class AddRequiredField implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'country',
      type: 'varchar',
      isNullable: false  // ERROR: existing rows have NULL!
    }));
  }
}

// ✅ GOOD: Two-step approach
export class AddRequiredFieldSafe implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add as nullable with default
    await queryRunner.addColumn('users', new TableColumn({
      name: 'country',
      type: 'varchar',
      isNullable: true,
      default: "'Unknown'"
    }));

    // Step 2: Populate existing rows
    await queryRunner.query(`
      UPDATE users SET country = 'Unknown' WHERE country IS NULL
    `);

    // Step 3: Make NOT NULL
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN country SET NOT NULL
    `);
  }
}
```

### 7. Use Transactions Appropriately

```typescript
// Long-running data migration
export class MigrateMillionRecords implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // ❌ BAD: All in one transaction (locks table for hours)
    await queryRunner.query(`
      UPDATE users SET status = 'active' WHERE status IS NULL
    `);
    // Locks entire table!

    // ✅ GOOD: Batch processing
    const batchSize = 1000;
    let offset = 0;

    while (true) {
      const result = await queryRunner.query(`
        UPDATE users
        SET status = 'active'
        WHERE id IN (
          SELECT id FROM users
          WHERE status IS NULL
          LIMIT ${batchSize}
        )
      `);

      if (result.affectedRows === 0) break;

      offset += batchSize;
      console.log(`Processed ${offset} records...`);
    }
  }
}
```

### 8. Document Complex Migrations

```typescript
/**
 * Migration: Split full_name into first_name and last_name
 *
 * Context:
 * - Users currently have a single 'full_name' field
 * - Need separate fields for better querying and sorting
 * - Existing data format: "FirstName LastName"
 *
 * Risk Level: MEDIUM
 * - Data transformation required
 * - Revert possible but data format may be lossy
 *
 * Rollback Strategy:
 * - Concatenate first_name and last_name back to full_name
 * - May lose middle names or complex name structures
 *
 * Tested on: 2024-01-15
 * - Development: ✓ Passed
 * - Staging: ✓ Passed (10k records migrated)
 * - Expected production runtime: ~5 minutes (100k records)
 */
export class SplitUserFullName implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // ... implementation
  }
}
```

### 9. Avoid Breaking Changes in Production

```typescript
// ❌ DANGEROUS: Immediate column removal
export class RemoveDeprecatedColumn implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'old_field');
    // Old app code still using old_field → CRASH!
  }
}

// ✅ SAFE: Gradual deprecation (3-step process)

// Migration 1 (deploy with new code that uses both columns)
export class AddNewField implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'new_field',
      type: 'varchar',
      isNullable: true
    }));

    // Backfill data
    await queryRunner.query(`
      UPDATE users SET new_field = old_field WHERE old_field IS NOT NULL
    `);
  }
}

// Migration 2 (after all instances use new_field, stop writing to old_field)
export class DeprecateOldField implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add comment to indicate deprecated
    await queryRunner.query(`
      COMMENT ON COLUMN users.old_field IS 'DEPRECATED: Use new_field instead'
    `);
  }
}

// Migration 3 (after monitoring period, remove old_field)
export class RemoveOldField implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'old_field');
  }
}
```

### 10. Version Control Best Practices

```bash
# ✅ DO: Commit migrations immediately after creation
git add migrations/1703553000000-AddUserField.ts
git commit -m "Add migration: AddUserField"

# ✅ DO: Include migration status in PR description
# PR Description:
# - Added migration AddUserField
# - Migration tested locally and on staging
# - Expected runtime: < 1 second
# - Reversible: Yes

# ❌ DON'T: Modify migrations after they've been run in production
# This breaks migration history!

# ❌ DON'T: Delete migrations that have been executed
# Causes migrations table to be out of sync

# ✅ DO: If migration is wrong, create a new migration to fix it
# migrations/1703553000000-AddUserField.ts  (already run in prod)
# migrations/1703553100000-FixUserField.ts  (fixes the issue)
```

---

## Framework Comparison

### Sequelize vs TypeORM vs Laravel Migrations

```
┌──────────────────────────────────────────────────────────────────────┐
│                   MIGRATION SYSTEM COMPARISON                        │
├────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  Feature   │   Sequelize     │    TypeORM      │   Laravel (PHP)     │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Language   │ JavaScript/TS   │ TypeScript      │ PHP                 │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Primary    │ Migration-first │ Entity-first    │ Migration-first     │
│ Approach   │                 │                 │                     │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Auto-      │ ❌ No           │ ✅ Yes          │ ❌ No               │
│ Generate   │                 │                 │                     │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ API Style  │ queryInterface  │ QueryRunner     │ Blueprint/Schema    │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Type       │ Weak (runtime)  │ Strong          │ N/A (PHP)           │
│ Safety     │                 │ (compile-time)  │                     │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Transaction│ Manual          │ Automatic       │ Automatic           │
│ Wrapping   │                 │                 │                     │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Rollback   │ ✅ Yes          │ ✅ Yes          │ ✅ Yes              │
├────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Batch      │ ❌ No           │ ❌ No           │ ✅ Yes (batches)    │
│ Management │                 │                 │                     │
└────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

### Code Comparison: Creating a Table

**Sequelize:**

```javascript
// migrations/20241225120000-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      age: {
        type: Sequelize.INTEGER,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

// Separate model definition required:
// models/User.js
const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      age: DataTypes.INTEGER
    }, { sequelize });
  }
}

// PROBLEM: Schema defined in TWO places!
```

**TypeORM:**

```typescript
// entities/User.ts (SINGLE SOURCE OF TRUTH)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Generate migration automatically:
// $ typeorm migration:generate -n CreateUsers

// migrations/1703553000000-CreateUsers.ts (AUTO-GENERATED)
export class CreateUsers1703553000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'user',
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
          length: '100',
          isUnique: true,
          isNullable: false
        },
        {
          name: 'age',
          type: 'int',
          isNullable: true
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
```

**Laravel (PHP):**

```php
// database/migrations/2024_12_25_120000_create_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email', 100)->unique();
            $table->integer('age')->nullable();
            $table->timestamps();  // Creates created_at and updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}

// Separate model definition required:
// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['email', 'age'];

    protected $casts = [
        'age' => 'integer',
    ];
}

// PROBLEM: Schema defined in TWO places (like Sequelize)
```

### Philosophy Differences

**Sequelize Philosophy:**
```
Database is the source of truth
↓
Write migrations manually
↓
Update models to match
↓
Manual synchronization required
```

**TypeORM Philosophy:**
```
Entities (code) are the source of truth
↓
Update entities
↓
Generate migrations from diff
↓
Automatic synchronization
```

**Laravel Philosophy:**
```
Migrations are the source of truth
↓
Eloquent models infer schema at runtime
↓
No strict schema enforcement in models
↓
Flexible but less type-safe
```

### Performance Comparison

| Operation | Sequelize | TypeORM | Laravel |
|-----------|-----------|---------|---------|
| Migration generation | Manual (N/A) | Auto (2-5s) | Manual (N/A) |
| Migration execution (10 migrations) | 500ms | 600ms | 400ms |
| Schema introspection | Every sync (~1s) | On generate (~2s) | On migrate (~500ms) |
| Memory overhead | ~2MB | ~3MB | ~1MB |
| Type checking | Runtime | Compile-time | N/A (PHP) |

### When to Use Each

**Use Sequelize if:**
- Working with JavaScript (not TypeScript)
- Need fine-grained control over migrations
- Prefer explicit migration writing
- Team is familiar with Sequelize patterns

**Use TypeORM if:**
- Working with TypeScript
- Want entity-driven development
- Appreciate auto-generation
- Need strong type safety

**Use Laravel if:**
- Working with PHP
- Want elegant, fluent syntax
- Need Laravel ecosystem integration
- Benefit from Artisan CLI tools

### Migration Workflow Comparison

**Sequelize Workflow:**
```bash
# 1. Generate empty migration file
npx sequelize migration:generate --name add-user-field

# 2. Manually write up() and down()
# ... edit migration file ...

# 3. Update model separately
# ... edit model file ...

# 4. Run migration
npx sequelize db:migrate

# 5. Verify model and migration are in sync (manual)
```

**TypeORM Workflow:**
```bash
# 1. Update entity
# ... edit User.ts ...

# 2. Generate migration from entity changes
npx typeorm migration:generate -n AddUserField

# 3. Review generated migration (optional edits)
# ... review migration file ...

# 4. Run migration
npx typeorm migration:run

# Entity and migration are automatically in sync!
```

**Laravel Workflow:**
```bash
# 1. Generate empty migration file
php artisan make:migration add_user_field

# 2. Manually write up() and down()
# ... edit migration file ...

# 3. Update model separately (if needed)
# ... edit User.php ...

# 4. Run migration
php artisan migrate

# 5. Rollback if needed
php artisan migrate:rollback
```

---

## Summary

### Key Takeaways

1. **Migrations vs synchronize**:
   - synchronize: Fast for development, DANGEROUS for production
   - Migrations: Safe, version-controlled, reversible schema changes

2. **TypeORM Advantages**:
   - Entity-first approach (single source of truth)
   - Auto-generation from entity changes
   - Strong TypeScript support
   - QueryRunner abstraction (database-agnostic)

3. **Migration Lifecycle**:
   ```
   Create → Review → Test → Run → Commit → Deploy
   ```

4. **Best Practices**:
   - Keep migrations small and focused
   - Always test locally before production
   - Write reversible migrations when possible
   - Document complex migrations
   - Never modify migrations after production deployment

5. **Production Safety**:
   - Use transactions (`transaction: 'all'`)
   - Create database backups before migrations
   - Monitor migration execution time
   - Plan for gradual rollouts (avoid breaking changes)

6. **Performance Considerations**:
   - Batch large data migrations
   - Add indexes in separate migrations
   - Be mindful of table locks
   - Test on staging with production-like data

TypeORM migrations provide a robust, type-safe system for managing database schema evolution in production environments, with the key advantage of entity-driven development that reduces duplication and improves maintainability.
