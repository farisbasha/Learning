# Phase 110: JWT Implementation in Express.js

## Overview

In this phase, we move from theory to implementation. We will use the industry-standard `jsonwebtoken` library to sign and verify tokens, create an authentication middleware to protect routes, and handle token expiration gracefully.

---

## 1. Setup & Installation

### Packages
```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

### Environment Variables
**CRITICAL**: Your `JWT_SECRET` is the keys to the kingdom. Never hardcode it.
```env
# .env
JWT_SECRET=f366e6c19f5e6a8e3d8f99...  # Use a long random string
JWT_EXPIRES_IN=15m
```

---

## 2. Token Utility Service

It is best practice to wrap JWT operations in a utility or service layer.

```typescript
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
    role: string;
}

export class JwtService {
    private static readonly SECRET = process.env.JWT_SECRET!;

    static sign(payload: UserPayload, expiresIn: string = process.env.JWT_EXPIRES_IN!): string {
        return jwt.sign(payload, this.SECRET, { expiresIn });
    }

    static verify(token: string): UserPayload {
        try {
            // This returns the payload if valid, or throws an error if invalid/expired
            return jwt.verify(token, this.SECRET) as UserPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
```

---

## 3. Implementation Flow

### Step 1: Login & Token Issuance
```typescript
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await AuthService.verifyCredentials(email, password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = JwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role
    });

    res.json({
        success: true,
        accessToken: token
    });
});
```

### Step 2: Authentication Middleware
This middleware intercepts requests, extracts the JWT from the `Authorization` header, and verifies it.

```typescript
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get header: Authorization: Bearer <TOKEN>
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify token
        const decoded = JwtService.verify(token);
        
        // 3. Attach user data to request object
        req.user = decoded;
        
        next();
    } catch (error) {
        // 4. Handle expired or malformed token
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
```

---

## 4. Scaling the System: Access vs. Refresh Tokens

In production, using a single long-lived token is a security risk (if stolen, the attacker has access until it expires).

**The Standard Pattern**:
1. **Access Token**: Short-lived (15 mins). Used for API requests.
2. **Refresh Token**: Long-lived (7 days). Used only to get a new Access Token. Stored in a database (revocable).

*Note: Refresh Tokens are covered in detail in Phase 115.*

---

## 5. Typing `req.user` in TypeScript

Express's type definitions don't include a `user` property on the `Request` object. You must extend it.

```typescript
// types/express/index.d.ts
export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
```

---

## 6. Error Handling during Verification

The `jwt.verify()` method throws specific errors:
- `TokenExpiredError`: Successful match, but too old.
- `JsonWebTokenError`: Malformed token or invalid signature.
- `NotBeforeError`: Token not active yet.

You should handle these to provide better frontend UX.

---

## 7. PHP / Laravel Comparison

### Laravel Sanctum
If you've used **Laravel Sanctum**, the logic is extremely similar. Sanctum issues plain-text tokens or mobile cookies.
```php
$user->createToken('token-name')->plainTextToken;
```
In Express, we generate the string ourselves using the `jsonwebtoken` library and a private secret. The validation in Express happens via the `authMiddleware`, whereas Laravel uses the `auth:sanctum` guard.

---

## Key Takeaways

1. **`jsonwebtoken`** is the standard library for signing (`sign`) and validating (`verify`) tokens.
2. Use **Authorization Header**: Standard format is `Bearer <token>`.
3. **Middleware Architecture**: Protect routes by inserting the auth middleware before the controller.
4. **Secret Management**: Always use environment variables for `JWT_SECRET`.
5. **Short Lifespans**: Keep access tokens short-lived (5-60 mins) to limit risk.
