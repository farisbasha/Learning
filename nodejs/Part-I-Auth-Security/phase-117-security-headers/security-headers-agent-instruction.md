# Phase 117: Security Headers
## Agent Instructions

**Phase**: 117 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. Why security headers matter
2. `helmet` package
3. Content-Security-Policy (CSP)
4. X-Frame-Options (clickjacking)
5. X-Content-Type-Options
6. Strict-Transport-Security (HSTS)
7. X-XSS-Protection
8. Referrer-Policy
9. Custom CSP configuration
10. Testing security headers

## Example
```typescript
import helmet from 'helmet';

app.use(helmet());

// Custom configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', '*.amazonaws.com'],
            connectSrc: ["'self'", 'api.example.com']
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' }
}));
```

## Content Instructions
**Notes**: Security headers configuration guide
**Summary**: Helmet options reference
