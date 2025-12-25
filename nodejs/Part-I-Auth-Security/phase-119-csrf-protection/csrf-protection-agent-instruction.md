# Phase 119: CSRF Protection
## Agent Instructions

**Phase**: 119 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. What is CSRF attack
2. When CSRF matters (session-based auth)
3. CSRF tokens
4. `csurf` package (deprecated)
5. Modern CSRF protection
6. SameSite cookies
7. Double submit cookie pattern
8. CSRF for SPAs
9. CSRF with JWT (usually not needed)
10. Laravel comparison: @csrf

## Example
```typescript
// Modern approach: SameSite cookies
app.use(session({
    cookie: {
        sameSite: 'strict', // or 'lax'
        secure: true,
        httpOnly: true
    }
}));

// Double submit pattern
const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];
    
    if (req.method !== 'GET' && cookieToken !== headerToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
};
```

## Content Instructions
**Notes**: CSRF protection patterns
**Summary**: CSRF prevention checklist
