# Phase 089-098: Authentication & Security
## Agent Instructions

## Phases Overview

| Phase | Topic |
|-------|-------|
| 089 | Sessions & Cookies |
| 090 | JWT Concept |
| 091 | JWT Implementation |
| 092 | Password Security (bcrypt) |
| 093 | Passport.js |
| 094 | Authorization & RBAC |
| 095 | Security Best Practices |
| 096 | API Keys & OAuth |
| 097 | Refresh Token Strategy |
| 098 | Multi-tenancy Basics |

## Key Topics

### Sessions & Cookies (089)
- express-session, cookie-parser
- Session stores (Redis)
- Security flags: httpOnly, secure, sameSite

### JWT (090-091)
- JWT structure and claims
- jsonwebtoken package with TypeScript
- Signing and verifying
- Typed auth middleware

### Password Security (092)
- bcrypt hashing and comparing
- Salt rounds configuration

### Passport.js (093)
- Local and JWT strategies
- OAuth strategies (Google, GitHub)

### Authorization (094)
- Role-based access control
- Typed roles and permissions

### Security (095)
- OWASP Top 10
- helmet.js, rate limiting
- Input validation with Zod
