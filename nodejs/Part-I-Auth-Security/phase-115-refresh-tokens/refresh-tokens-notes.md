# Phase 115: Refresh Token Strategy

## Overview

In a JWT-based system, tokens are stateless. This means once a token is issued, it is valid until it expires. If an attacker steals a token that lasts for 7 days, they have 7 days of access. To mitigate this risk, we use **Refresh Tokens**.

This phase covers the architectural strategy of using short-lived **Access Tokens** and long-lived, database-backed **Refresh Tokens** to achieve both security and high availability.

---

## 1. Access vs. Refresh Tokens

| Feature | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Lifetime** | Short (15 min) | Long (7 days) |
| **Storage (Server)** | Stateless (None) | Stateful (Database/Redis) |
| **Storage (Client)** | Memory / Cookie | Secure HttpOnly Cookie |
| **Usage** | Every API request | Only when Access Token expires |
| **Security Risk** | Low (expires fast) | High (needs strict protection) |

---

## 2. The Refresh Token Lifecycle

1. **Login**: Server generates an Access Token AND a Refresh Token.
2. **Storage**: The Refresh Token is stored in the database (hashed or plain) and sent to the user as a **Secure HttpOnly Cookie**.
3. **Usage**: The user makes requests with the Access Token.
4. **Expiry**: After 15 minutes, the Access Token expires. The frontend sees the 401 response.
5. **Renewal**: The frontend sends the Refresh Token to the `/refresh` endpoint.
6. **Validation**: The server checks the DB to see if the Refresh Token is valid and hasn't been revoked.
7. **Issuance**: If valid, the server creates a NEW Access Token.

---

## 3. Token Rotation (Best Practice)

For maximum security, you should implement **Refresh Token Rotation**. Every time a Refresh Token is used to get a new Access Token, the old Refresh Token is deleted/invalidated and a **NEW** Refresh Token is issued.

*Note: This creates a "Token Family" history.*

### Detecting Token Theft
If an attacker steals a Refresh Token and uses it before the user does:
1. Attacker uses `RefreshToken_1` -> gets `AccessToken_A` and `RefreshToken_2`.
2. Real User later tries to use `RefreshToken_1`.
3. Server sees `RefreshToken_1` has already been used!
4. **Action**: Immediately revoke ALL tokens in that user's family (force global logout) because a compromise is detected.

---

## 4. Implementation Snippet (Prisma Example)

### Database Schema
```prisma
model User {
  id           String         @id @default(uuid())
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: id)
  revoked   Boolean  @default(false)
  expiresAt DateTime
}
```

### The Refresh Logic
```typescript
app.post('/auth/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken; // Assuming HttpOnly cookie

    if (!refreshToken) return res.sendStatus(401);

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
    });

    // 1. Check if token exists, is valid, or has been revoked
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        if (storedToken?.revoked) {
            // Re-use detected! Revoke everything for safety.
            await prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { revoked: true }
            });
        }
        return res.sendStatus(403);
    }

    // 2. Revoke the old token (Rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // 3. Generate new pair
    const newAccessToken = JwtService.signAccessToken(storedToken.user);
    const newRefreshToken = await JwtService.generateRefreshToken(storedToken.user);

    // 4. Send back
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken: newAccessToken });
});
```

---

## 5. Storing Access Tokens: The Front-End Dilemma

Where should the frontend store the **Access Token**?
- **LocalStorage**: ❌ Vulnerable to XSS.
- **Js Memory**: ✅ Safe from XSS, but lost on page refresh.
- **HttpOnly Cookie**: ✅ Safe from XSS, but requires CSRF protection.

**The Hybrid Strategy**:
- Store **Access Token** in memory (variable).
- Use **Silent Refresh** (iframe or background fetch with HttpOnly Refresh Token) to keep the app logged in on refresh.

---

## 6. PHP / Laravel Comparison

### Laravel Sanctum
Sanctum's "Airlock" system is closer to sessions (cookie-based). However, if using Sanctum for mobile (Tokens), it stores the tokens in the `personal_access_tokens` table. It doesn't strictly follow the OAuth refresh pattern by default (it just issues long-lived tokens).

In Node.js/Express, we build this more according to the **OpenID Connect / OAuth 2.0** specifications, which involve the explicit separation of Access and Refresh tokens.

---

## Key Takeaways

1. **Access Tokens** should be short-lived (< 1 hour).
2. **Refresh Tokens** should be long-lived and stored in a database.
3. **Rotation** means a Refresh Token can only be used ONCE.
4. Use **HttpOnly cookies** for Refresh Tokens to prevent JS theft.
5. Detection of reused tokens should trigger a **global logout** for that user.
