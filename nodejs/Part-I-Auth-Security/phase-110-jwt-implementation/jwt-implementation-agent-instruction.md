# Phase 110: JWT Implementation
## Agent Instructions

**Phase**: 110 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. `jsonwebtoken` package
2. Signing tokens: `jwt.sign()`
3. Verifying tokens: `jwt.verify()`
4. Token payload typing
5. Access token generation
6. Token expiration
7. JWT middleware for Express
8. Extracting token from Authorization header
9. Handling expired tokens
10. Laravel comparison: Laravel Sanctum/Passport

## Example
```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

const generateToken = (user: User): string => {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
};

const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
};

// Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
        req.user = verifyToken(token);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

## Content Instructions
**Notes**: Complete JWT implementation guide
**Summary**: JWT patterns reference
