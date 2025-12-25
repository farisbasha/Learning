# Phase 103: Prisma Migrations
## Agent Instructions

**Phase**: 103 | **Part**: H - Database & ORM | **Language**: TypeScript

## Topics
1. Schema-driven migrations
2. `prisma migrate dev` — development workflow
3. Migration naming
4. Migration files
5. `prisma migrate deploy` — production
6. `prisma migrate reset` — reset database
7. `prisma db push` — prototyping
8. Seeding with TypeScript
9. `prisma/seed.ts`
10. Migration troubleshooting
11. Laravel comparison: `artisan migrate`

## Example
```bash
# Development workflow
npx prisma migrate dev --name add_user_role

# Production deployment
npx prisma migrate deploy

# Seeding
npx prisma db seed
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin',
            role: 'ADMIN'
        }
    });
}

main()
    .finally(() => prisma.$disconnect());
```

## Content Instructions
**Notes**: Prisma migration workflow guide
**Summary**: Prisma migration commands reference
