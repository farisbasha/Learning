# Phase 072: Third-Party Middleware
## Agent Instructions

**Phase**: 072 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. `cors` — Cross-Origin Resource Sharing
2. `helmet` — security headers
3. `morgan` — HTTP request logging
4. `compression` — gzip compression
5. `cookie-parser` — parsing cookies
6. `express-rate-limit` — rate limiting
7. `hpp` — HTTP parameter pollution protection
8. Installing types: `@types/cors`, etc.
9. Configuration patterns for each
10. Security middleware stack

## Example
```typescript
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(helmet());
app.use(morgan('dev'));
```

## Content Instructions
**Notes**: Essential third-party middleware with configs
**Summary**: Third-party middleware checklist
