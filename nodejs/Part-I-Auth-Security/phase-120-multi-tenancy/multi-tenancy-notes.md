# Phase 120: Multi-tenancy Basics

## Overview

**Multi-tenancy** is an architecture where a single instance of a software application serves multiple customers (Tenants). Each tenant's data is isolated and invisible to other tenants, even though they share the same hardware/software infrastructure. 

This phase covers the primary multi-tenancy strategies and how to implement a shared-schema model—the most common approach for SaaS applications.

---

## 1. Multi-tenancy Models

| Model | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Separate DB** | Each tenant gets their own physical database. | Maximum isolation, easy scaling for big clients. | High infrastructure overhead, hard to run migrations. |
| **Separate Schema** | One DB, but each tenant gets a specific schema (Postgres). | Good isolation, consolidated infrastructure. | Some DBs don't support it well; migrations still complex. |
| **Shared Schema** | One DB, One Schema. All data has a `tenant_id` column. | **Simplest**, lowest cost, easy to maintain. | Highest risk of data leakage (if developer forgets a `where`). |

---

## 2. Shared Schema: Implementation Strategy

This is the standard approach for 90% of SaaS startups.

### Step 1: Database Schema
Every tenant-specific table must have a reference to the tenant.
```prisma
model Tenant {
  id    String @id @default(uuid())
  name  String
  slug  String @unique // e.g., 'company-name'
  users User[]
}

model User {
  id       String @id @default(uuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
}
```

---

## 3. Identifying the Tenant

How does our Express server know which tenant is making a request?

1. **Subdomain**: `acme.my-app.com` -> tenant is "acme".
2. **Custom Header**: `X-TENANT-ID: 123`.
3. **URL Path**: `my-app.com/tenant1/dashboard`.
4. **JWT Claim**: Storing the `tenantId` inside the user's authentication token.

### Tenant Identification Middleware
```typescript
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Strategy: Identify by Subdomain
    const host = req.get('host'); // e.g. "acme.myapp.com"
    const slug = host.split('.')[0];

    const tenant = await prisma.tenant.findUnique({ where: { slug } });

    if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found.' });
    }

    // Attach to request
    req.tenant = tenant;
    next();
};
```

---

## 4. Enforcing Data Isolation

The biggest danger in multi-tenancy is "Cross-Tenant Data Leakage" (User A seeing User B's data).

### The Manual Way (Riskier)
```typescript
const posts = await prisma.post.findMany({
    where: {
        tenantId: req.tenant.id // Easy to forget!
    }
});
```

### The Automated Way (Prisma Middleware/Extensions)
You can use Prisma Extensions to automatically inject the `tenantId` into every query.

```typescript
const tenantClient = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Automatically inject tenantId into every search
        if (req.tenant?.id) {
          args.where = { ...args.where, tenantId: req.tenant.id };
        }
        return query(args);
      },
    },
  },
});
```

---

## 5. Security: PostgreS Row-Level Security (RLS)

In high-security environments, you can use **PostgreSQL RLS**. 
- You define policies directly in the database.
- Even if a developer writes `SELECT * FROM users`, Postgres will only return rows where the `tenant_id` matches the current session variable.

---

## 6. PHP / Laravel Comparison

### Laravel Multi-tenancy
If you've used packages like `stancl/tenancy` in Laravel:
- **Tenant Identification**: Handled by automatic identification middleware.
- **Scoping**: Handled via "Global Scopes" on your Models.

In Node.js, we follow a similar pattern: Middleware to identify, and Extensions/Wrappers to scope. Laravel's ecosystem for multi-tenancy is more mature with dedicated packages, but Node.js allows for a more "lightweight" implementation if you only need a single-database shared-schema model.

---

## Key Takeaways

1. **Shared Schema** is the easiest to start and maintain.
2. **Identity** can be via subdomain, header, or JWT.
3. **Isolation** is the #1 priority—automate it so you can't forget a `where` clause.
4. Use **Subdomains** for a "Professional" SaaS feel.
5. Consider **Postgres RLS** for robust, database-level security.
6. **Testing** must include scenarios where one tenant tries to access another tenant's URL with their own credentials.
No content should be leaked between tenants.
