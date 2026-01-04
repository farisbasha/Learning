# Phase 110: JWT Implementation Checksheet

## 1. Quick Installation
```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

## 2. Implementation Checklist
- [ ] Define `JWT_SECRET` in `.env`.
- [ ] Create a `JwtService` wrapper.
- [ ] Extend Express `Request` type to include `user`.
- [ ] Implement `authMiddleware`.
- [ ] Implement Login route that returns the token.
- [ ] Use `authMiddleware` on protected routes.

## 3. Common Code Patterns

### Signing a Token
```typescript
const token = jwt.sign(
    { userId: user.id, role: user.role }, 
    SECRET, 
    { expiresIn: '1h' }
);
```

### Authorization Header Extraction
```typescript
const token = req.headers.authorization?.split(' ')[1];
```

### Protecting a Route
```typescript
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});
```

## 4. Token Expiration Strategy

| Duration | Use Case | Security Level |
| :--- | :--- | :--- |
| **15 Minutes** | High-security APIs, sensitive data. | High |
| **1 Hour** | Standard web apps, low risk. | Moderate |
| **24 Hours** | Internal tools, corporate networks. | Low |
| **7 Days+** | Refresh Tokens ONLY. | Critical (needs storage) |

## 5. PHP vs Node JWT Comparison

| Feature | Laravel (Passport/Sanctum) | Node (jsonwebtoken) |
| :--- | :--- | :--- |
| **Library** | Built-in / First-party | `jsonwebtoken` (community standard)|
| **Generation** | `$user->createToken(...)` | `jwt.sign(payload, secret)` |
| **Middleware** | `auth:api` or `auth:sanctum` | Custom `authMiddleware` |
| **Verification** | DB check (Sanctum) or Public Key (Passport) | Local Secret Verification (Standard) |
