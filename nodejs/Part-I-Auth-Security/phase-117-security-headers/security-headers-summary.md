# Phase 117: Helmet Configuration Summary

## 🛠️ The "Produсtion-Ready" Setup

```typescript
import helmet from 'helmet';

app.use(helmet({
    // 1. CSP: The most important but hardest
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "example.com"],
            "object-src": ["'none'"],
            "upgrade-insecure-requests": [],
        },
    },
    // 2. HSTS: Enforce HTTPS for 1 year
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    // 3. Frameguard: Prevent Clickjacking
    frameguard: {
        action: "deny",
    },
    // 4. Referrer-Policy
    referrerPolicy: {
        policy: "no-referrer",
    },
}));
```

## Security Header Reference

| Header | Helmet Method | Default Value |
| :--- | :--- | :--- |
| **CSP** | `contentSecurityPolicy` | Restrictive |
| **X-Frame-Options** | `frameguard` | `SAMEORIGIN` |
| **X-XSS-Protection** | `xssFilter` | `0` (Disabled in modern) |
| **X-Content-Type** | `noSniff` | `nosniff` |
| **Strict-Transport** | `hsts` | 6 Months |
| **Referrer-Policy** | `referrerPolicy` | `no-referrer` |

## Verification Checklist
- [ ] Install helmet: `npm install helmet`.
- [ ] Add `app.use(helmet())` before routes.
- [ ] Test on `securityheaders.com`.
- [ ] Check console for CSP errors (common when using CDNs).
- [ ] Ensure `trust proxy` is set if behind a load balancer.

## 🤝 Relationship with Laravel
Laravel developers typically use Middleware to set these headers. Helmet simplifies this by providing 15 pre-configured middleware functions in a single package.
