# Phase 120: Multi-tenancy Strategy Summary

## 🏗️ Architecture Comparison

| Model | Isolation | Scalability | Complexity | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Single DB / Tenant Column** | Low | High | Low | $ |
| **Single DB / Multiple Schemas**| Medium | Medium | Medium | $$ |
| **Multiple Databases** | High | High | High | $$$ |

## 🛠️ Tenant Identification Logic

| Mode | Source | Difficulty | Professionalism |
| :--- | :--- | :--- | :--- |
| **Subdomain** | `host.split('.')[0]` | Moderate | ✨ High |
| **Path** | `/t/:tenantId/` | Easy | 📉 Low |
| **Header** | `X-Tenant-ID` | Easy | ⚙️ Technical (Internal) |
| **JWT** | `token.tenantId` | Moderate | 🔒 Secure |

---

## Implementation Checklist

- [ ] **Infrastructure**: Point `*.myapp.com` to your server (Wildcard DNS).
- [ ] **Database**: Add `tenantId` to all shared tables.
- [ ] **Middleware**: Identify the tenant on every request.
- [ ] **Isolation**: Automate `where` filters (Prisma Extensions).
- [ ] **Uploads**: Store files in tenant-specific folders (e.g., `uploads/{tenantId}/...`).
- [ ] **Migrations**: Ensure migrations affect all tenants (easier in shared schema).

## 🤝 Relationship with Laravel
Equivalent to using a global scope (`TenantScope`) in Laravel Eloquent models. In Express, we use middleware to identify the tenant and then either manually pass the ID to services or use a database wrapper to automate the scoping.
