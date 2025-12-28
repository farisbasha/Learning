# Prisma Quick Start Checklist

## Installation

```bash
# 1. Install Prisma CLI (dev dependency)
npm install -D prisma

# 2. Install Prisma Client (runtime)
npm install @prisma/client

# 3. Initialize Prisma
npx prisma init --datasource-provider postgresql
# Options: postgresql, mysql, sqlite, sqlserver, mongodb, cockroachdb
```

---

## Quick Setup Steps

### Step 1: Configure Environment

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### Step 2: Define Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Step 3: Create Migration

```bash
npx prisma migrate dev --name init
```

### Step 4: Generate Client

```bash
npx prisma generate
```

### Step 5: Use Prisma Client

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

```typescript
// src/index.ts
import { prisma } from './lib/prisma';

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
    },
  });
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npx prisma init` | Initialize Prisma in project |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma db push` | Push schema without migration |
| `npx prisma db pull` | Pull schema from database |
| `npx prisma studio` | Open visual database editor |
| `npx prisma format` | Format schema file |
| `npx prisma validate` | Validate schema syntax |

---

## Project Structure

```
my-project/
├── prisma/
│   ├── schema.prisma      # Schema file (version controlled)
│   ├── migrations/        # Migration files (version controlled)
│   │   └── 20240101_init/ # Migration folder
│   │       └── migration.sql
│   └── seed.ts            # Seed script (optional)
├── src/
│   ├── lib/
│   │   └── prisma.ts      # Prisma client singleton
│   └── index.ts
├── .env                   # Environment variables (NOT versioned)
├── .env.example           # Example env (versioned)
└── package.json
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "postinstall": "prisma generate"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Database URLs

### PostgreSQL
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
```

### MySQL
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
DATABASE_URL="mysql://root:password@localhost:3306/mydb"
```

### SQLite
```env
DATABASE_URL="file:./dev.db"
```

### SQL Server
```env
DATABASE_URL="sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD"
```

### MongoDB
```env
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/DATABASE"
```

---

## Prisma Components

| Component | Package | Purpose |
|-----------|---------|---------|
| **Prisma CLI** | `prisma` (dev) | Commands, migrations, generate |
| **Prisma Client** | `@prisma/client` | Runtime query builder |
| **Prisma Studio** | (included) | Visual database GUI |
| **Prisma Migrate** | (included) | Schema migrations |

---

## Verification Checklist

```bash
# Check schema is valid
npx prisma validate

# Check database connection
npx prisma db pull

# Generate client and verify types
npx prisma generate

# Test connection in code
import { prisma } from './lib/prisma';
await prisma.$queryRaw`SELECT 1`;
```

---

## Common Issues

### Issue: "Can't reach database server"
```bash
# Check connection string
# Ensure database is running
# Check firewall/network
```

### Issue: "Client not generated"
```bash
npx prisma generate
```

### Issue: "Type errors after schema change"
```bash
npx prisma generate
# Restart TypeScript server in IDE
```

### Issue: "Migration failed"
```bash
# Check migration.sql for errors
# Use prisma migrate reset to start fresh (dev only!)
npx prisma migrate reset
```

---

## Next Steps

1. **Phase 099**: Learn Prisma Schema Design (models, relations, enums)
2. **Phase 100**: Master CRUD Operations
3. **Phase 101**: Advanced Queries (filtering, pagination)
4. **Phase 102**: Relations Deep Dive
5. **Phase 103**: Migrations Workflow
6. **Phase 104**: Transactions & Production
