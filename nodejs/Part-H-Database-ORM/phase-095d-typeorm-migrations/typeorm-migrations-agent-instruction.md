# Phase 095d: TypeORM Migrations
## Agent Instructions

**Phase**: 095d | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Migration CLI setup
2. Generating migrations from entities
3. Creating migrations manually
4. Migration file structure
5. Running migrations: `migration:run`
6. Reverting: `migration:revert`
7. Showing status: `migration:show`
8. DataSource configuration for CLI
9. Production migration strategies
10. TypeORM vs Prisma migrations

## Example
```typescript
// migrations/1703548800000-CreateUsers.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1703548800000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true },
                { name: 'email', type: 'varchar', isUnique: true },
                { name: 'created_at', type: 'timestamp', default: 'now()' }
            ]
        }));
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
```

## Content Instructions
**Notes**: TypeORM migrations workflow
**Summary**: Migration commands cheatsheet
