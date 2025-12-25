# Phase 120: Multi-tenancy Basics
## Agent Instructions

**Phase**: 120 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. What is multi-tenancy
2. Single database vs separate databases
3. Shared schema with tenant_id
4. Tenant identification: subdomain, header, path
5. Tenant middleware
6. Data isolation
7. Prisma with multi-tenancy
8. Row-level security (Postgres)
9. Testing multi-tenant apps
10. Laravel comparison: Tenancy packages

## Example
```typescript
// Tenant middleware
const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // From subdomain: tenant1.app.com
    const subdomain = req.hostname.split('.')[0];
    
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain }
    });
    
    if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    
    req.tenant = tenant;
    next();
};

// All queries include tenant filter
const users = await prisma.user.findMany({
    where: { tenantId: req.tenant.id }
});
```

## Content Instructions
**Notes**: Multi-tenancy architecture patterns
**Summary**: Multi-tenant strategies comparison
