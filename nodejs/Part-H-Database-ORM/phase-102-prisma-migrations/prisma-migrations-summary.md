# Phase 102: Prisma Migrations - Quick Reference

## Core Concepts

**Schema-Driven Migrations**: Edit schema.prisma → Prisma generates SQL

**Migration Flow**:
1. Edit schema.prisma
2. Run `prisma migrate dev`
3. Prisma generates SQL migration file
4. SQL applied to database
5. Prisma Client regenerated

## Essential Commands

### Development Workflow

```bash
# Create and apply migration
npx prisma migrate dev --name <migration_name>

# Examples
npx prisma migrate dev --name add_user_role
npx prisma migrate dev --name create_post_model

# Interactive (prompts for name)
npx prisma migrate dev
```

### Production Deployment

```bash
# Apply pending migrations (non-interactive)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Database Management

```bash
# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Sync schema without creating migration (prototyping)
npx prisma db push

# Run seed script
npx prisma db seed
```

### Troubleshooting

```bash
# Mark migration as applied (without running)
npx prisma migrate resolve --applied <migration_name>

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# View migration difference
npx prisma migrate diff \
    --from-schema-datamodel prisma/schema.prisma \
    --to-schema-datasource prisma/schema.prisma
```

## Command Comparison

| Command | Environment | Creates Migration | Applies Migration | Regenerates Client |
|---------|------------|-------------------|-------------------|-------------------|
| `migrate dev` | Development | ✅ Yes | ✅ Yes | ✅ Yes |
| `migrate deploy` | Production | ❌ No | ✅ Yes | ❌ No |
| `migrate reset` | Development | ❌ No | ✅ All | ✅ Yes |
| `db push` | Development | ❌ No | ✅ Direct sync | ✅ Yes |

## Migration File Structure

```
prisma/
├── schema.prisma
├── migrations/
│   ├── migration_lock.toml           # Locks database provider
│   ├── 20240115103045_initial/       # Timestamp + name
│   │   └── migration.sql
│   ├── 20240116120000_add_role/
│   │   └── migration.sql
│   └── 20240117093000_add_posts/
│       └── migration.sql
└── seed.ts                           # Seed script
```

### Migration File Example

```sql
-- prisma/migrations/20240115_add_role/migration.sql

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
```

### Prisma-Generated Comments

- `-- CreateTable`: Creating new table
- `-- AlterTable`: Modifying table
- `-- DropTable`: Removing table
- `-- CreateIndex`: Adding index
- `-- AddForeignKey`: Creating foreign key
- `-- DropForeignKey`: Removing foreign key

## Database Seeding

### Setup

**1. Create seed file:**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Upsert for idempotency
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin',
            role: 'ADMIN'
        }
    });

    console.log('Seeded:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
```

**2. Configure package.json:**

```json
{
    "prisma": {
        "seed": "ts-node prisma/seed.ts"
    },
    "devDependencies": {
        "ts-node": "^10.0.0"
    }
}
```

**3. Run seed:**

```bash
npx prisma db seed

# Or reset (includes seeding)
npx prisma migrate reset
```

### Seeding Patterns

**Bulk Creation:**
```typescript
await prisma.user.createMany({
    data: [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' }
    ],
    skipDuplicates: true
});
```

**Nested Seeding:**
```typescript
await prisma.user.create({
    data: {
        email: 'blogger@example.com',
        posts: {
            create: [
                { title: 'First Post', content: 'Content' },
                { title: 'Second Post', content: 'More content' }
            ]
        }
    }
});
```

**With Faker:**
```typescript
import { faker } from '@faker-js/faker';

for (let i = 0; i < 50; i++) {
    await prisma.user.create({
        data: {
            email: faker.internet.email(),
            name: faker.person.fullName()
        }
    });
}
```

## Production Deployment Workflow

### Typical Deployment Script

```bash
#!/bin/bash
# deploy.sh

export DATABASE_URL=$PROD_DATABASE_URL

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm ci

echo "Running migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "Migrations successful"
    npm run build
    pm2 restart app
else
    echo "Migration failed!"
    exit 1
fi
```

### Pre-Deployment Checklist

1. ✅ Test migration on staging
2. ✅ Backup production database
3. ✅ Review generated SQL
4. ✅ Check for breaking changes
5. ✅ Plan rollback strategy
6. ✅ Schedule maintenance window (if needed)

## Migration Troubleshooting

### Common Issues

**Issue: Migration Failed Mid-Execution**
```bash
# Mark as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Fix and retry
npx prisma migrate dev --name retry_migration
```

**Issue: Schema and Database Out of Sync**
```bash
# Development: reset
npx prisma migrate reset

# Production: create baseline
npx prisma migrate dev --create-only --name baseline
```

**Issue: Checksum Mismatch**
```
Error: Checksum mismatch for migration
```
**Cause:** Migration file edited after applying

**Solution:**
```bash
# Revert edit from Git
git checkout prisma/migrations/<migration_name>/migration.sql

# Or force resolve (DANGER)
npx prisma migrate resolve --applied <migration_name>
```

**Issue: Can't Drop Column with Data**

**Two-step migration:**
```prisma
// Step 1: Make nullable
model User {
    email String?
}
```
```bash
npx prisma migrate dev --name make_email_nullable
```

```prisma
// Step 2: Remove
model User {
    // email removed
}
```
```bash
npx prisma migrate dev --name remove_email
```

## Migration Naming Conventions

### Good Names

```bash
add_user_role
create_post_model
add_email_verification
update_user_indexes
remove_legacy_fields
```

### Bad Names

```bash
migration1
update
fix
test
```

**Pattern**: `<verb>_<what>_<where>`
- add_role_to_user
- create_payment_table
- remove_deprecated_column

## Data Migration Strategy

**Scenario:** Rename column preserving data

**Step 1: Add new column**
```prisma
model User {
    email        String @unique  // Old
    emailAddress String?         // New (optional)
}
```
```bash
npx prisma migrate dev --name add_email_address
```

**Step 2: Copy data**
```sql
UPDATE "User" SET "emailAddress" = email;
```

**Step 3: Make required and remove old**
```prisma
model User {
    emailAddress String @unique  // Now required, old removed
}
```
```bash
npx prisma migrate dev --name finalize_email_rename
```

## Migration Metadata Table

Prisma tracks migrations in `_prisma_migrations` table:

```sql
SELECT * FROM _prisma_migrations;
```

**Columns:**
- `id`: Unique migration ID
- `checksum`: File hash (detects tampering)
- `finished_at`: Completion timestamp
- `migration_name`: Directory name
- `logs`: Error logs
- `rolled_back_at`: Rollback timestamp
- `started_at`: Start timestamp
- `applied_steps_count`: Number of SQL statements

## Prisma Migrate vs Other ORMs

### vs Laravel Migrations

| Feature | Laravel | Prisma |
|---------|---------|--------|
| Schema Definition | PHP migration classes | Declarative schema.prisma |
| Migration Generation | Manual | Auto from schema |
| Rollback | Built-in `down()` | Manual reverse migration |
| Type Safety | No | Yes (TypeScript) |

**Laravel:**
```php
php artisan migrate
php artisan migrate:rollback
php artisan db:seed
```

**Prisma:**
```bash
npx prisma migrate dev
# No built-in rollback
npx prisma db seed
```

### vs TypeORM Migrations

| Feature | TypeORM | Prisma |
|---------|---------|--------|
| Migration Style | TypeScript classes | SQL files |
| Generation | From entities or manual | From schema |
| Rollback | `down()` method | Manual |

### vs Knex Migrations

| Feature | Knex | Prisma |
|---------|------|--------|
| Abstraction Level | Low (SQL-like) | High (schema-first) |
| Migration Files | JavaScript | SQL |
| Rollback | Built-in | Manual |

## Best Practices

### 1. Development vs Production

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy  # Never use 'dev' in prod
```

### 2. Always Backup Before Production Migrations

```bash
# PostgreSQL
pg_dump myapp_prod > backup_$(date +%Y%m%d).sql

# MySQL
mysqldump myapp_prod > backup_$(date +%Y%m%d).sql

# Then migrate
npx prisma migrate deploy
```

### 3. Test on Staging First

```bash
# Staging
DATABASE_URL=$STAGING_URL npx prisma migrate deploy

# Verify, test, monitor

# Production
DATABASE_URL=$PROD_URL npx prisma migrate deploy
```

### 4. Keep Migrations Small

```bash
# ✅ Good: Focused migrations
npx prisma migrate dev --name add_user_role
npx prisma migrate dev --name add_post_index

# ❌ Bad: Too much in one migration
npx prisma migrate dev --name massive_schema_refactor
```

### 5. Version Control Migrations

```bash
git add prisma/migrations
git commit -m "Add user role migration"
git push
```

**Never add to .gitignore:**
```
# ❌ Don't ignore
# prisma/migrations/
```

### 6. Use Meaningful Comments

```sql
-- Migration: 20240115_remove_legacy_api
-- BREAKING CHANGE: Removes old API fields
-- Action Required: Update API consumers before deploying

ALTER TABLE "User" DROP COLUMN "legacy_token";
```

### 7. Handle Breaking Changes Carefully

**Breaking changes:**
- Removing columns
- Changing column types
- Removing tables
- Changing required/optional

**Strategy:**
1. Announce to team
2. Update application code first
3. Deploy code
4. Run migration
5. Monitor for issues

### 8. Use db push for Prototyping Only

```bash
# Early development/experiments
npx prisma db push

# Once stable, create proper migration
npx prisma migrate dev --name stable_schema
```

### 9. Monitor Long-Running Migrations

```bash
# Check execution time
time npx prisma migrate deploy

# For long migrations, plan maintenance window
```

### 10. Document Data Migrations

```typescript
// prisma/data-migrations/rename-email-field.ts
// Run after migration 20240115_add_email_address
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRaw`
        UPDATE "User" SET "emailAddress" = email WHERE "emailAddress" IS NULL
    `;
}
```

## Quick Decision Guide

### migrate dev vs migrate deploy?

- **dev**: Development environment, creates migrations
- **deploy**: Production environment, applies existing migrations

### migrate dev vs db push?

- **dev**: Ready to commit, create migration files
- **push**: Experimenting, prototyping, don't need history

### migrate reset vs migrate deploy?

- **reset**: Development, start fresh, wipe all data
- **deploy**: Production, apply new migrations only

### Should I commit migrations?

**YES!** Always version control migration files.

### Can I edit migration files?

**Before applying**: Yes, safe to edit
**After applying**: NO! Will break checksum

### How to rollback?

**Prisma has no automatic rollback.** Create new migration to undo:

```bash
# Undo by creating reverse migration
# Edit schema to revert changes
npx prisma migrate dev --name revert_user_role
```

## Environment Variables

```env
# Development
DATABASE_URL="postgresql://user:pass@localhost:5432/myapp_dev"

# Staging
DATABASE_URL="postgresql://user:pass@staging-db:5432/myapp_staging"

# Production
DATABASE_URL="postgresql://user:pass@prod-db:5432/myapp_prod"
```

**Switch environments:**
```bash
DATABASE_URL=$STAGING_URL npx prisma migrate deploy
DATABASE_URL=$PROD_URL npx prisma migrate deploy
```

## Debugging

```bash
# Enable debug logging
DEBUG="prisma:*" npx prisma migrate dev --name test

# Check migration table directly
psql myapp_dev -c "SELECT * FROM _prisma_migrations"
```

## Migration Rollback Strategy

Since Prisma has no built-in rollback:

**Option 1: Forward Migration (Recommended)**
```bash
# Create new migration to undo
npx prisma migrate dev --name revert_feature_x
```

**Option 2: Database Restore**
```bash
# Restore from backup
psql myapp_prod < backup_before_migration.sql
```

**Option 3: Manual Intervention**
```sql
-- Manually undo changes
ALTER TABLE "User" DROP COLUMN "role";
DELETE FROM "_prisma_migrations" WHERE migration_name = '20240115_add_role';
```

## Common Workflow Examples

### Adding a New Model

```prisma
// schema.prisma
model Comment {
    id        Int      @id @default(autoincrement())
    content   String
    postId    Int
    post      Post     @relation(fields: [postId], references: [id])
    createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name add_comment_model
```

### Adding a Field

```prisma
model User {
    id       Int     @id
    email    String  @unique
    verified Boolean @default(false)  // NEW
}
```

```bash
npx prisma migrate dev --name add_user_verified
```

### Adding an Index

```prisma
model Post {
    id        Int      @id
    title     String
    createdAt DateTime @default(now())

    @@index([createdAt])  // NEW
}
```

```bash
npx prisma migrate dev --name add_post_created_at_index
```

### Changing Relation

```prisma
model Post {
    userId Int
    user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
    //                                                        ^^^^^^^^^^^^^^^^ NEW
}
```

```bash
npx prisma migrate dev --name update_post_cascade_delete
```
