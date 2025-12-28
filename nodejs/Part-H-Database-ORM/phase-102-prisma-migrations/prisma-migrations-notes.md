# Phase 102: Prisma Migrations - Comprehensive Notes

**Phase**: 102 | **Part**: H - Database & ORM | **Language**: TypeScript
**Focus**: Deep understanding of Prisma's schema-driven migration system and database evolution workflow

---

## Table of Contents
1. [Introduction to Prisma Migrations](#introduction)
2. [Schema-Driven Migrations](#schema-driven)
3. [Migration Development Workflow](#dev-workflow)
4. [Migration Files Structure](#migration-files)
5. [Production Deployment](#production)
6. [Database Reset and Prototyping](#reset-prototype)
7. [Database Seeding](#seeding)
8. [Migration Troubleshooting](#troubleshooting)
9. [Migration History and State](#migration-history)
10. [Comparison with Other Tools](#comparison)
11. [Best Practices](#best-practices)

---

## Introduction to Prisma Migrations {#introduction}

### What Are Database Migrations?

Database migrations are **version-controlled changes** to your database schema. They track the evolution of your database structure over time, allowing you to:

1. **Version Control**: Track schema changes in Git
2. **Reproducibility**: Apply same changes across environments
3. **Rollback**: Revert to previous schema states
4. **Collaboration**: Share schema changes with team
5. **Documentation**: Auto-generated history of schema evolution

### Traditional Migrations vs Prisma Migrations

**Traditional SQL Migrations (e.g., Knex, TypeORM):**

```sql
-- migrations/20240101_create_users.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255)
);

-- migrations/20240102_add_role_to_users.sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'USER';
```

You write SQL manually for each change.

**Prisma Migrations (Schema-First):**

```prisma
// schema.prisma - Single source of truth
model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    name  String?
    role  String @default("USER")
}
```

Then run:
```bash
npx prisma migrate dev --name add_user_role
```

Prisma **automatically generates SQL** by comparing your schema to the current database state.

### WHY Prisma's Approach is Different

```
Traditional Migrations          Prisma Migrations
──────────────────────         ─────────────────
Write SQL manually       →      Edit schema.prisma
Track migration files    →      Prisma auto-generates SQL
Apply migrations         →      prisma migrate dev/deploy
```

**Key Philosophy:**

1. **Schema is Source of Truth**: Edit schema.prisma, not SQL files
2. **Auto-Generation**: Prisma creates migration SQL for you
3. **Type Safety**: Schema changes automatically update TypeScript types
4. **Development-First**: Different workflows for dev vs production

---

## Schema-Driven Migrations {#schema-driven}

### How Schema-Driven Migrations Work

**Step-by-step Process:**

1. **Edit Schema**: Modify `schema.prisma`
2. **Run Command**: Execute `prisma migrate dev`
3. **Prisma Compares**: Current database state vs new schema
4. **Generate SQL**: Prisma creates migration SQL
5. **Apply Migration**: SQL executed on database
6. **Update Client**: Prisma Client regenerated with new types

**Visual Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│              Prisma Migration Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Developer edits schema.prisma                           │
│     ───────────────────────────                             │
│     model User {                                            │
│         id    Int    @id                                    │
│         email String @unique                                │
│         role  String @default("USER")  ← NEW FIELD          │
│     }                                                       │
│                                                             │
│                      ↓                                      │
│                                                             │
│  2. Run: prisma migrate dev --name add_role                 │
│     ──────────────────────────────────────                  │
│                                                             │
│                      ↓                                      │
│                                                             │
│  3. Prisma Engine:                                          │
│     - Reads current database schema                         │
│     - Compares with schema.prisma                           │
│     - Generates ALTER TABLE SQL                             │
│                                                             │
│                      ↓                                      │
│                                                             │
│  4. Creates migration file:                                 │
│     prisma/migrations/20240115_add_role/migration.sql       │
│     ────────────────────────────────────────────────        │
│     ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'USER'│
│                                                             │
│                      ↓                                      │
│                                                             │
│  5. Executes SQL on database                                │
│                                                             │
│                      ↓                                      │
│                                                             │
│  6. Regenerates Prisma Client                               │
│     (TypeScript types now include 'role' field)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example: Adding a New Field

**Before:**
```prisma
model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    name  String?
}
```

**After (edit schema.prisma):**
```prisma
model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    role      String   @default("USER")
    createdAt DateTime @default(now())
}
```

**Run Migration:**
```bash
npx prisma migrate dev --name add_role_and_timestamps
```

**Generated SQL (automatic):**
```sql
-- Migration: 20240115103045_add_role_and_timestamps

ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

**WHY This is Powerful:**

1. **No SQL Writing**: Prisma generates correct SQL for your database
2. **Database-Agnostic**: Works across PostgreSQL, MySQL, SQLite, SQL Server
3. **Type Safety**: TypeScript types automatically updated
4. **Version Control**: Migration files tracked in Git

---

## Migration Development Workflow {#dev-workflow}

### The `prisma migrate dev` Command

**Purpose:** Development workflow for creating and applying migrations

**Full Command:**
```bash
npx prisma migrate dev --name <migration_name>
```

**What It Does:**

1. Detects schema changes
2. Creates a new migration directory
3. Generates SQL migration file
4. Applies migration to development database
5. Regenerates Prisma Client
6. Optionally runs seed script

### Workflow Example

**Scenario:** Adding a Post model

**Step 1: Edit Schema**
```prisma
// schema.prisma

model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    posts Post[]
}

model Post {
    id        Int      @id @default(autoincrement())
    title     String
    content   String?
    published Boolean  @default(false)
    userId    Int
    user      User     @relation(fields: [userId], references: [id])
    createdAt DateTime @default(now())
}
```

**Step 2: Create Migration**
```bash
npx prisma migrate dev --name add_post_model
```

**Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "mydb", schema "public" at "localhost:5432"

Applying migration `20240115103045_add_post_model`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240115103045_add_post_model/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.0.0) to ./node_modules/@prisma/client
```

**Generated Migration File:**
```sql
-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Migration Naming Best Practices

**Good Names:**
```bash
npx prisma migrate dev --name add_user_role
npx prisma migrate dev --name create_post_model
npx prisma migrate dev --name add_email_verification
npx prisma migrate dev --name update_user_indexes
```

**Bad Names:**
```bash
npx prisma migrate dev --name migration1
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

**Naming Convention:**
- Use **snake_case** or **kebab-case**
- Start with verb: `add_`, `create_`, `update_`, `remove_`
- Be descriptive about what changed
- Keep it concise but meaningful

### Interactive Mode

When you run `prisma migrate dev` without a name, Prisma prompts you:

```bash
npx prisma migrate dev
```

```
? Enter a name for the new migration: › add_user_role
```

---

## Migration Files Structure {#migration-files}

### Directory Structure

```
project/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   ├── 20240115103045_initial_setup/
│   │   │   └── migration.sql
│   │   ├── 20240116120000_add_user_role/
│   │   │   └── migration.sql
│   │   └── 20240117093000_add_post_model/
│   │       └── migration.sql
│   └── seed.ts
```

### Migration File Anatomy

**File Path:**
```
prisma/migrations/20240115103045_add_user_role/migration.sql
                  └──timestamp───┘ └─name──┘
```

**migration.sql Content:**
```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
```

**Prisma-Generated Comments:**
- `-- CreateTable`: Creating a new table
- `-- AlterTable`: Modifying existing table
- `-- DropTable`: Removing a table
- `-- CreateIndex`: Adding index
- `-- AddForeignKey`: Creating foreign key constraint

### migration_lock.toml

**Purpose:** Locks the database provider to prevent accidental changes

```toml
# Please do not edit this file manually
# It should be added in your version-control system (i.e. Git)
provider = "postgresql"
```

**WHY This Exists:**

Prevents you from accidentally switching databases (e.g., PostgreSQL → MySQL), which could cause migration incompatibilities.

### Migration Metadata

Prisma tracks applied migrations in a special table:

**Table: `_prisma_migrations`**

```sql
SELECT * FROM _prisma_migrations;
```

**Columns:**
- `id`: Migration unique ID
- `checksum`: File content hash (detects tampering)
- `finished_at`: When migration completed
- `migration_name`: Migration directory name
- `logs`: Error logs (if failed)
- `rolled_back_at`: Rollback timestamp
- `started_at`: When migration started
- `applied_steps_count`: Number of SQL statements executed

**Example Row:**
```
id: 550e8400-e29b-41d4-a716-446655440000
migration_name: 20240115103045_add_user_role
checksum: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
started_at: 2024-01-15 10:30:45
finished_at: 2024-01-15 10:30:45
applied_steps_count: 1
```

**WHY This Matters:**

1. **Prevents Re-Running**: Prisma knows which migrations already applied
2. **Detects Tampering**: Checksum validation ensures files weren't modified
3. **Audit Trail**: Track when migrations ran
4. **Troubleshooting**: See which migrations failed

---

## Production Deployment {#production}

### The `prisma migrate deploy` Command

**Purpose:** Apply pending migrations in production (non-interactive)

```bash
npx prisma migrate deploy
```

**What It Does:**

1. Checks `_prisma_migrations` table
2. Applies only **pending** migrations (not yet applied)
3. Does **NOT** create new migrations
4. Does **NOT** regenerate Prisma Client
5. Exits with error code if migration fails

**WHY Different from `migrate dev`?**

| Feature | `migrate dev` | `migrate deploy` |
|---------|---------------|------------------|
| Environment | Development | Production |
| Creates migrations | ✅ Yes | ❌ No |
| Applies migrations | ✅ Yes | ✅ Yes |
| Interactive | ✅ Prompts user | ❌ Silent |
| Regenerates client | ✅ Yes | ❌ No |
| Database reset | ✅ Can reset | ❌ Never resets |
| Runs seed | ✅ Optional | ❌ No |

### Production Deployment Workflow

**Step 1: Development**
```bash
# On dev machine
npx prisma migrate dev --name add_feature_x
git add prisma/migrations
git commit -m "Add feature X migration"
git push
```

**Step 2: CI/CD Pipeline**
```bash
# In production deploy script
git pull
npm ci  # Install dependencies
npx prisma migrate deploy  # Apply pending migrations
npm run build
pm2 restart app
```

**Step 3: Verification**
```bash
# Check migration status
npx prisma migrate status
```

### Production Example with Environment Variables

**Production Database URL:**
```env
# .env.production
DATABASE_URL="postgresql://prod_user:prod_pass@prod-db.example.com:5432/myapp_prod"
```

**Deployment Script:**
```bash
#!/bin/bash
# deploy.sh

export NODE_ENV=production
export DATABASE_URL=$PROD_DATABASE_URL

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm ci

echo "Running migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "Migrations applied successfully"
    echo "Building application..."
    npm run build

    echo "Restarting application..."
    pm2 restart myapp
else
    echo "Migration failed! Aborting deployment."
    exit 1
fi
```

### Migration Rollback Strategy

**Prisma does NOT have automatic rollback.** You must handle rollbacks manually.

**Option 1: Forward Migration (Recommended)**
```bash
# Create a new migration that undoes the change
# Edit schema.prisma to remove/revert changes
npx prisma migrate dev --name revert_feature_x
```

**Option 2: Database Restore (Danger)**
```bash
# Restore from backup taken before migration
psql myapp_prod < backup_before_migration.sql
```

**Option 3: Manual SQL**
```sql
-- Run SQL to revert changes
ALTER TABLE "User" DROP COLUMN "role";
DELETE FROM "_prisma_migrations" WHERE migration_name = '20240115_add_role';
```

**Best Practice:**

1. **Always backup** before production migrations
2. **Test migrations** on staging environment first
3. **Create revert migrations** for critical changes
4. **Monitor migration execution** with logging

---

## Database Reset and Prototyping {#reset-prototype}

### The `prisma migrate reset` Command

**Purpose:** Wipe database and re-apply all migrations from scratch

```bash
npx prisma migrate reset
```

**What It Does:**

1. **Drops database** (or deletes all tables)
2. **Creates database** again
3. **Applies all migrations** in order
4. **Runs seed script** (if configured)
5. **Regenerates Prisma Client**

**WHY Use Reset?**

- **Clean Slate**: Start fresh during development
- **Testing**: Reset between test runs
- **Prototyping**: Quickly iterate on schema
- **Fix Corruption**: Recover from migration issues

**⚠️ DANGER:** **NEVER** run this in production! It deletes all data.

### Reset Example

```bash
npx prisma migrate reset
```

**Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

⚠️  This will:
  • Drop the database
  • Create a new database
  • Apply all migrations
  • Run seed script

Do you want to continue? › (y/N)
```

After confirming:
```
Database reset successful

The following migration(s) have been applied:

migrations/
  └─ 20240115103045_initial_setup/
    └─ migration.sql
  └─ 20240116120000_add_user_role/
    └─ migration.sql

✔ Generated Prisma Client (v5.0.0)
✔ Seeded database
```

### The `prisma db push` Command

**Purpose:** Sync schema to database **without creating migration files**

```bash
npx prisma db push
```

**What It Does:**

1. Compares schema.prisma to database
2. Generates SQL to sync them
3. Applies SQL directly
4. **Does NOT** create migration files
5. Regenerates Prisma Client

**WHY Use `db push`?**

- **Prototyping**: Rapid schema iteration
- **Experimentation**: Try schema changes without committing
- **Local Development**: Quick testing
- **Schema Sync**: Force schema to match database

**When NOT to Use:**

- **Production**: Never use in production
- **Team Projects**: Others won't get your schema changes
- **Version Control**: No migration history

### Push vs Migrate Comparison

```
┌──────────────────────────────────────────────────────────┐
│         prisma db push vs prisma migrate dev             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  db push                                                 │
│  ───────                                                 │
│  • No migration files created                            │
│  • Fast prototyping                                      │
│  • Can't roll back                                       │
│  • No version history                                    │
│  • Use: Early development, experiments                   │
│                                                          │
│  migrate dev                                             │
│  ───────────                                             │
│  • Creates migration files                               │
│  • Trackable in Git                                      │
│  • Can roll back (via new migration)                     │
│  • Full version history                                  │
│  • Use: Production-ready features, team work             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Example Workflow: Prototyping to Migration

**Phase 1: Prototype with db push**
```bash
# Edit schema.prisma
npx prisma db push  # Quick test

# Edit schema.prisma again
npx prisma db push  # Another test

# Happy with schema? Move to migrations...
```

**Phase 2: Create Migration**
```bash
# Reset to clean state
npx prisma migrate reset

# Create proper migration
npx prisma migrate dev --name final_schema

# Now commit to Git
git add prisma/
git commit -m "Add final schema migration"
```

---

## Database Seeding {#seeding}

### What is Database Seeding?

**Seeding** = Populating database with initial/test data

**Use Cases:**

1. **Development**: Create sample users, posts for testing
2. **Testing**: Consistent test data
3. **Production**: Initial admin users, default categories
4. **Demo**: Realistic demo data

### Prisma Seed Script Setup

**Step 1: Create Seed File**

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},  // If exists, don't change
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    console.log('Created admin user:', admin);

    // Create sample posts
    const post1 = await prisma.post.create({
        data: {
            title: 'Welcome to My Blog',
            content: 'This is the first post!',
            published: true,
            userId: admin.id
        }
    });

    console.log('Created post:', post1);

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

**Step 2: Configure package.json**

```json
{
    "name": "myapp",
    "prisma": {
        "seed": "ts-node prisma/seed.ts"
    },
    "devDependencies": {
        "ts-node": "^10.0.0",
        "@types/node": "^18.0.0",
        "typescript": "^5.0.0"
    }
}
```

**Step 3: Run Seed**

```bash
# Run seed manually
npx prisma db seed

# Or reset database (includes seeding)
npx prisma migrate reset
```

### Advanced Seeding Patterns

**Upsert for Idempotency:**

```typescript
// Safe to run multiple times
await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Admin' },  // Update if exists
    create: {  // Create if doesn't exist
        email: 'admin@example.com',
        name: 'Admin'
    }
});
```

**Bulk Creation:**

```typescript
// Create multiple records efficiently
await prisma.user.createMany({
    data: [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
        { email: 'user3@example.com', name: 'User 3' }
    ],
    skipDuplicates: true  // Ignore if email already exists
});
```

**Nested Seeding:**

```typescript
// Create user with related data
await prisma.user.create({
    data: {
        email: 'blogger@example.com',
        name: 'Blogger',
        posts: {
            create: [
                {
                    title: 'First Post',
                    content: 'Content here',
                    published: true
                },
                {
                    title: 'Draft Post',
                    content: 'Draft content',
                    published: false
                }
            ]
        },
        profile: {
            create: {
                bio: 'Passionate blogger'
            }
        }
    }
});
```

**Environment-Based Seeding:**

```typescript
// Different data for dev vs production
const seedData = process.env.NODE_ENV === 'production'
    ? productionSeedData
    : developmentSeedData;

for (const user of seedData.users) {
    await prisma.user.create({ data: user });
}
```

### Seeding with Faker (Realistic Test Data)

```typescript
// prisma/seed.ts
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create 50 random users
    for (let i = 0; i < 50; i++) {
        await prisma.user.create({
            data: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                posts: {
                    create: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
                        title: faker.lorem.sentence(),
                        content: faker.lorem.paragraphs(3),
                        published: faker.datatype.boolean()
                    }))
                }
            }
        });
    }
}

main()
    .finally(() => prisma.$disconnect());
```

---

## Migration Troubleshooting {#troubleshooting}

### Common Issues and Solutions

#### Issue 1: Migration Failed Mid-Execution

**Symptom:**
```
Error: Migration failed:
  Relation "old_table" does not exist
```

**Solution:**
```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20240115_failed_migration

# Fix schema and try again
npx prisma migrate dev --name retry_migration
```

#### Issue 2: Schema and Database Out of Sync

**Symptom:**
```
Your database schema is not in sync with your migration history.
```

**Solution:**
```bash
# Option 1: Force reset (dev only)
npx prisma migrate reset

# Option 2: Create baseline migration
npx prisma migrate dev --create-only --name baseline
# Edit generated SQL if needed
npx prisma migrate deploy
```

#### Issue 3: Edited Migration File

**Symptom:**
```
Error: Checksum mismatch for migration `20240115_add_role`
```

**Cause:** You manually edited migration.sql after it was applied

**Solution:**
```bash
# Option 1: Revert manual edit
git checkout prisma/migrations/20240115_add_role/migration.sql

# Option 2: Force recalculate checksum (DANGER)
npx prisma migrate resolve --applied 20240115_add_role
```

#### Issue 4: Migration Conflicts in Team

**Symptom:**
```
Migration `20240115_add_role` not found
```

**Cause:** Teammate created migration you don't have

**Solution:**
```bash
git pull  # Get their migrations
npx prisma migrate dev  # Apply pending migrations
```

#### Issue 5: Can't Drop Column with Data

**Symptom:**
```
Error: Cannot drop column "email" because it contains data
```

**Solution: Two-Step Migration**

**Migration 1: Make nullable**
```prisma
model User {
    email String?  // Make optional
}
```
```bash
npx prisma migrate dev --name make_email_nullable
```

**Migration 2: Remove column**
```prisma
model User {
    // Remove email field completely
}
```
```bash
npx prisma migrate dev --name remove_email
```

### Migration Status Commands

```bash
# Check migration status
npx prisma migrate status

# Output example:
# Database schema is up to date!
#
# Applied migrations:
#   20240115103045_initial_setup
#   20240116120000_add_user_role
#   20240117093000_add_post_model
```

```bash
# Mark migration as applied (without running)
npx prisma migrate resolve --applied 20240115_migration_name

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20240115_migration_name
```

### Debugging Migrations

**Enable Debug Logging:**
```bash
DEBUG="prisma:*" npx prisma migrate dev --name test_migration
```

**Check Database Directly:**
```sql
-- See applied migrations
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;

-- See current schema
\dt  -- PostgreSQL: list tables
DESCRIBE users;  -- MySQL
.schema users  -- SQLite
```

---

## Migration History and State {#migration-history}

### Understanding Migration State

Prisma tracks migration state in the `_prisma_migrations` table:

**Migration States:**

1. **Applied**: Successfully executed
2. **Failed**: Encountered error during execution
3. **Rolled Back**: Marked as undone (manual)
4. **Pending**: Exists in files but not applied

### Viewing Migration History

```bash
npx prisma migrate status
```

**Output:**
```
Status: 2 migration(s) applied, 1 pending

Applied:
  20240115103045_initial_setup
  20240116120000_add_user_role

Pending:
  20240117093000_add_post_model

Run `prisma migrate deploy` to apply pending migrations.
```

### Migration Drift Detection

**Drift** = When database schema differs from migration files

**Causes:**
- Manual database changes
- Edited migration files after applying
- Database restored from backup

**Detection:**
```bash
npx prisma migrate diff \
    --from-schema-datamodel prisma/schema.prisma \
    --to-schema-datasource prisma/schema.prisma
```

**Output:**
```sql
-- Drift detected:
ALTER TABLE "User" ADD COLUMN "mystery_field" TEXT;
-- This column exists in DB but not in schema
```

### Migration Baselining (Existing Databases)

**Scenario:** You have existing database, want to start using Prisma Migrate

**Step 1: Introspect Existing Database**
```bash
npx prisma db pull
```

**Step 2: Create Baseline Migration**
```bash
npx prisma migrate dev --create-only --name initial_baseline
```

**Step 3: Edit Migration SQL**
```sql
-- Empty this file since database already has schema
-- Or keep it for documentation
```

**Step 4: Mark as Applied**
```bash
npx prisma migrate resolve --applied initial_baseline
```

Now future migrations will build on this baseline.

---

## Comparison with Other Tools {#comparison}

### Prisma vs Laravel Migrations

**Laravel (PHP):**

```php
// database/migrations/2024_01_15_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
```

**Commands:**
```bash
php artisan migrate            # Apply migrations
php artisan migrate:rollback   # Rollback last batch
php artisan migrate:reset      # Rollback all
php artisan migrate:fresh      # Drop all + re-run
php artisan db:seed            # Run seeders
```

**Prisma Equivalent:**

```prisma
// schema.prisma
model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

```bash
npx prisma migrate dev         # Create + apply migration
# No built-in rollback, create reverse migration
npx prisma migrate reset       # Drop + re-run all
npx prisma db seed             # Run seed script
```

**Key Differences:**

| Feature | Laravel | Prisma |
|---------|---------|--------|
| Schema Definition | PHP code (migrations) | Declarative schema file |
| Rollback | Built-in `down()` method | Manual reverse migration |
| Auto-Generation | No (manual) | Yes (from schema) |
| Type Safety | No | Yes (TypeScript) |
| Seeding | Dedicated seeder classes | TypeScript script |

### Prisma vs TypeORM Migrations

**TypeORM:**

```typescript
// migrations/1705303845123-CreateUser.ts

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUser1705303845123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'user',
            columns: [
                { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
                { name: 'email', type: 'varchar', isUnique: true },
                { name: 'name', type: 'varchar', isNullable: true }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user');
    }
}
```

**Commands:**
```bash
npm run typeorm migration:generate -- -n CreateUser
npm run typeorm migration:run
npm run typeorm migration:revert
```

**Comparison:**

- **TypeORM**: Write migrations in TypeScript (manual or auto-generated from entities)
- **Prisma**: Schema-first, migrations auto-generated
- **TypeORM**: Built-in rollback via `down()` method
- **Prisma**: No automatic rollback

### Prisma vs Knex Migrations

**Knex (Raw SQL/Query Builder):**

```javascript
// migrations/20240115_create_users.js

exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('name');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
```

**Commands:**
```bash
knex migrate:make create_users
knex migrate:latest
knex migrate:rollback
knex seed:run
```

**Comparison:**

- **Knex**: More manual, flexible, closer to SQL
- **Prisma**: Higher-level, auto-generated
- **Knex**: Built-in rollback
- **Prisma**: Better type safety

---

## Best Practices {#best-practices}

### 1. Always Name Migrations Descriptively

```bash
# ✅ Good
npx prisma migrate dev --name add_user_email_verification
npx prisma migrate dev --name create_order_payment_table
npx prisma migrate dev --name add_index_on_user_email

# ❌ Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name migration2
npx prisma migrate dev --name fix
```

### 2. Test Migrations on Staging First

```bash
# Staging environment
DATABASE_URL=$STAGING_DB_URL npx prisma migrate deploy

# Monitor, test, verify

# Production environment
DATABASE_URL=$PROD_DB_URL npx prisma migrate deploy
```

### 3. Backup Before Production Migrations

```bash
# PostgreSQL backup
pg_dump -h prod-db.example.com -U user -d myapp_prod > backup_$(date +%Y%m%d).sql

# Then run migration
npx prisma migrate deploy
```

### 4. Use `migrate dev` in Development Only

```bash
# Development
npx prisma migrate dev --name add_feature

# Production
npx prisma migrate deploy  # Never use 'dev' in production
```

### 5. Keep Migrations Small and Focused

```bash
# ✅ Good: One concern per migration
npx prisma migrate dev --name add_user_role
npx prisma migrate dev --name add_post_published_index

# ❌ Bad: Too many changes at once
# (One migration adding 5 models, 10 fields, 3 indexes)
```

### 6. Handle Data Migrations Carefully

**Scenario:** Renaming field with data

**Step 1: Add new field**
```prisma
model User {
    email        String @unique
    emailAddress String?  // New field
}
```
```bash
npx prisma migrate dev --name add_email_address
```

**Step 2: Copy data (manual SQL or script)**
```sql
UPDATE "User" SET "emailAddress" = email;
```

**Step 3: Make new field required**
```prisma
model User {
    emailAddress String @unique
}
```
```bash
npx prisma migrate dev --name remove_old_email
```

### 7. Version Control Migration Files

```bash
# Always commit migrations
git add prisma/migrations
git commit -m "Add user role migration"
git push
```

**`.gitignore` should NOT include:**
```
# ❌ Don't ignore migrations
# prisma/migrations/
```

### 8. Document Breaking Migrations

```sql
-- Migration: 20240115_remove_old_api
-- BREAKING CHANGE: Removes legacy API fields
-- Action Required: Update API consumers before deploying

ALTER TABLE "User" DROP COLUMN "legacy_token";
```

### 9. Use Seed Scripts for Test Data

```typescript
// Don't seed in migrations
// Use prisma/seed.ts instead

// ❌ Bad: Migration file
INSERT INTO users (email) VALUES ('test@example.com');

// ✅ Good: Seed script
await prisma.user.create({
    data: { email: 'test@example.com' }
});
```

### 10. Monitor Migration Execution Time

```bash
# Time migration execution
time npx prisma migrate deploy

# For long-running migrations, consider maintenance windows
```

---

## Summary

Prisma Migrate provides a **schema-driven migration system** that:

1. **Auto-generates migrations** from schema.prisma changes
2. **Tracks migration history** in version control
3. **Separates dev and prod workflows** (migrate dev vs deploy)
4. **Ensures type safety** via regenerated Prisma Client
5. **Supports seeding** for initial data

**Key Commands:**

- `prisma migrate dev`: Create + apply migrations (development)
- `prisma migrate deploy`: Apply pending migrations (production)
- `prisma migrate reset`: Wipe database and re-apply all
- `prisma db push`: Sync schema without creating migration files
- `prisma db seed`: Run seed script
- `prisma migrate status`: Check migration state

**Best Practices:**

- Name migrations descriptively
- Test on staging before production
- Always backup before prod migrations
- Keep migrations small and focused
- Version control all migration files
- Use seed scripts for test data
- Never run `migrate dev` or `migrate reset` in production

Prisma Migrate strikes a balance between automation and control, making database evolution trackable, reproducible, and type-safe.
