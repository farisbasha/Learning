# Phase 115: Token Rotation Summary

## 🔄 The Rotation Flow

```text
1. [User] Login -> Returns [Access_1, Refresh_1]
2. [User] API Request(Access_1) -> OK
3. [User] Access_1 Expired -> Returns 401
4. [User] POST /refresh(Refresh_1) -> Returns [Access_2, Refresh_2]
5. [Server] DELETE Refresh_1 from DB
```

## Security Comparison

| Strategy | Security | Complexity | UX |
| :--- | :--- | :--- | :--- |
| **Long-lived JWT** | ❌ Poor | Low | Excellent |
| **Short-lived JWT** | ✅ Better | Low | ❌ Poor (frequent logins) |
| **Access + Refresh** | ✅ High | Moderate | ✅ Good |
| **Access + Rotation**| ✨ Best | High | ✅ Good |

## Critical Implementation Checklist

- [ ] **HttpOnly**: Refresh token MUST stay in an HttpOnly cookie.
- [ ] **SameSite**: Set `lax` or `strict` to prevent CSRF.
- [ ] **Revocation**: Ability to delete tokens from DB (Global Logout).
- [ ] **Reuse Detection**: Track if a token is used multiple times.
- [ ] **Expiration**: Handle the case where the Refresh token itself expires (force re-login).

## When to Revoke All Tokens?
1. User changes password.
2. User requests "Log out from all devices."
3. Detection of an old Refresh Token being reused (Token Theft indicator).
4. Account suspension.

## 🤝 Relationship with Laravel

If you are thinking of Laravel **Passport** (not Sanctum), Passport implements this standard flow using the `oauth_refresh_tokens` table automatically. In Express, we manually manage this logic using Prisma/TypeORM and `jsonwebtoken`.
